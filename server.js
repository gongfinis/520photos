const fs = require("fs");
const path = require("path");
const http = require("http");
const express = require("express");
const { WebSocketServer } = require("ws");
const { randomUUID } = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(ROOT, "data");
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(ROOT, "uploads");
const PHOTOS_DIR = process.env.PHOTOS_DIR
  ? path.resolve(process.env.PHOTOS_DIR)
  : path.join(ROOT, "photos");

ensureDir(DATA_DIR);
ensureDir(UPLOADS_DIR);
ensureDir(PHOTOS_DIR);

const app = express();
app.use(express.static(PUBLIC_DIR));
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/photos", express.static(PHOTOS_DIR));

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.get("/api/photos", (_req, res) => {
  const allowExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
  const files = fs
    .readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => allowExt.has(path.extname(name).toLowerCase()))
    .map((name) => {
      const full = path.join(PHOTOS_DIR, name);
      const st = fs.statSync(full);
      return {
        name,
        url: `/photos/${encodeURIComponent(name)}`,
        mtimeMs: st.mtimeMs
      };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  res.json({ files });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// roomId -> { state, clients:Set<ws>, saveTimer }
const rooms = new Map();

wss.on("connection", (ws) => {
  ws.roomId = null;
  ws.clientId = null;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return safeSend(ws, { type: "error", message: "无效消息格式" });
    }

    const type = msg && msg.type;
    if (!type) return;

    if (type === "join") {
      const roomId = normalizeRoomId(msg.roomId);
      if (!roomId) return safeSend(ws, { type: "error", message: "roomId 无效" });

      const clientId = typeof msg.clientId === "string" && msg.clientId ? msg.clientId : randomUUID();
      ws.clientId = clientId;

      if (ws.roomId && ws.roomId !== roomId) {
        leaveRoom(ws);
      }

      const room = getOrCreateRoom(roomId);
      room.clients.add(ws);
      ws.roomId = roomId;

      safeSend(ws, {
        type: "room:state",
        roomId,
        photos: room.state.photos.map((p) => ({
          id: p.id,
          url: `/uploads/${roomId}/${p.filename}`,
          name: p.name || ""
        })),
        cards: room.state.cards
      });

      broadcastUserCount(roomId);
      return;
    }

    if (!ws.roomId) {
      return safeSend(ws, { type: "error", message: "请先 join 房间" });
    }

    const roomId = ws.roomId;
    const room = getOrCreateRoom(roomId);

    if (type === "photo:add") {
      handlePhotoAdd(ws, roomId, room, msg);
      return;
    }

    if (type === "card:move") {
      const { id, x, y, rot, z } = msg;
      if (!id) return;
      const card = room.state.cards.find((c) => c.id === id);
      if (!card) return;

      card.x = sanitizeNum(x, card.x);
      card.y = sanitizeNum(y, card.y);
      card.rot = sanitizeNum(rot, card.rot);
      card.z = sanitizeNum(z, card.z);

      scheduleSave(roomId);
      broadcast(roomId, {
        type: "card:moved",
        id: card.id,
        x: card.x,
        y: card.y,
        rot: card.rot,
        z: card.z,
        actorId: ws.clientId
      });
      return;
    }

    if (type === "card:batch") {
      const cards = Array.isArray(msg.cards) ? msg.cards : [];
      for (const patch of cards) {
        const card = room.state.cards.find((c) => c.id === patch.id);
        if (!card) continue;
        card.x = sanitizeNum(patch.x, card.x);
        card.y = sanitizeNum(patch.y, card.y);
        card.rot = sanitizeNum(patch.rot, card.rot);
        card.z = sanitizeNum(patch.z, card.z);
      }

      scheduleSave(roomId);
      broadcast(roomId, {
        type: "card:batched",
        cards: room.state.cards,
        actorId: ws.clientId
      });
      return;
    }

    if (type === "clear") {
      room.state.photos = [];
      room.state.cards = [];
      cleanRoomUploadFiles(roomId);
      scheduleSave(roomId);
      broadcast(roomId, {
        type: "cleared",
        actorId: ws.clientId
      });
      return;
    }
  });

  ws.on("close", () => {
    leaveRoom(ws);
  });
});

function handlePhotoAdd(ws, roomId, room, msg) {
  const { dataUrl, card, name } = msg;
  if (typeof dataUrl !== "string") {
    return safeSend(ws, { type: "error", message: "图片数据缺失" });
  }

  const m = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
  if (!m) {
    return safeSend(ws, { type: "error", message: "仅支持 png/jpg/webp" });
  }

  const extRaw = m[1].toLowerCase();
  const ext = extRaw === "jpeg" ? "jpg" : extRaw;
  const base64 = m[2];

  let buf;
  try {
    buf = Buffer.from(base64, "base64");
  } catch {
    return safeSend(ws, { type: "error", message: "图片解码失败" });
  }

  if (buf.length > 2 * 1024 * 1024) {
    return safeSend(ws, { type: "error", message: "单张图片超过 2MB" });
  }

  const roomDir = path.join(UPLOADS_DIR, roomId);
  ensureDir(roomDir);

  const photoId = randomUUID();
  const filename = `${photoId}.${ext}`;
  const filePath = path.join(roomDir, filename);

  fs.writeFileSync(filePath, buf);

  const photo = {
    id: photoId,
    filename,
    name: typeof name === "string" ? name.slice(0, 120) : "",
    uploadedBy: ws.clientId,
    uploadedAt: new Date().toISOString()
  };

  const cardPayload = {
    id: photoId,
    x: sanitizeNum(card && card.x, 0),
    y: sanitizeNum(card && card.y, 0),
    rot: sanitizeNum(card && card.rot, 0),
    z: sanitizeNum(card && card.z, room.state.cards.length + 1)
  };

  room.state.photos.push(photo);
  room.state.cards.push(cardPayload);

  scheduleSave(roomId);
  broadcast(roomId, {
    type: "photo:added",
    photo: {
      id: photoId,
      url: `/uploads/${roomId}/${filename}`,
      name: photo.name
    },
    card: cardPayload,
    actorId: ws.clientId
  });
}

function getOrCreateRoom(roomId) {
  if (rooms.has(roomId)) return rooms.get(roomId);

  const roomFile = path.join(DATA_DIR, `${roomId}.json`);
  let state;

  if (fs.existsSync(roomFile)) {
    try {
      state = JSON.parse(fs.readFileSync(roomFile, "utf8"));
      if (!Array.isArray(state.photos)) state.photos = [];
      if (!Array.isArray(state.cards)) state.cards = [];
    } catch {
      state = makeEmptyRoomState(roomId);
    }
  } else {
    state = makeEmptyRoomState(roomId);
  }

  const room = {
    state,
    clients: new Set(),
    saveTimer: null
  };

  rooms.set(roomId, room);
  return room;
}

function makeEmptyRoomState(roomId) {
  return {
    roomId,
    createdAt: new Date().toISOString(),
    photos: [],
    cards: []
  };
}

function scheduleSave(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.saveTimer) clearTimeout(room.saveTimer);

  room.saveTimer = setTimeout(() => {
    room.saveTimer = null;
    const roomFile = path.join(DATA_DIR, `${roomId}.json`);
    fs.writeFile(roomFile, JSON.stringify(room.state, null, 2), () => {});
  }, 500);
}

function leaveRoom(ws) {
  const roomId = ws.roomId;
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  room.clients.delete(ws);
  ws.roomId = null;

  broadcastUserCount(roomId);
}

function broadcastUserCount(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const count = room.clients.size;
  broadcast(roomId, { type: "user:count", count });
}

function broadcast(roomId, payload) {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(payload);

  for (const client of room.clients) {
    if (client.readyState === 1) {
      client.send(data);
    }
  }
}

function safeSend(ws, payload) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(payload));
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalizeRoomId(roomId) {
  if (typeof roomId !== "string") return "";
  const clean = roomId.trim().slice(0, 64);
  if (!/^[a-zA-Z0-9_-]+$/.test(clean)) return "";
  return clean;
}

function sanitizeNum(val, fallback) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function cleanRoomUploadFiles(roomId) {
  const roomDir = path.join(UPLOADS_DIR, roomId);
  if (!fs.existsSync(roomDir)) return;

  for (const file of fs.readdirSync(roomDir)) {
    const p = path.join(roomDir, file);
    try {
      if (fs.statSync(p).isFile()) fs.unlinkSync(p);
    } catch {}
  }
}

server.listen(PORT, () => {
  console.log(`Heart collage server running at http://localhost:${PORT}`);
});
