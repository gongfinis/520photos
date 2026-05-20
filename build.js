#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PHOTOS_DIR = path.join(ROOT, "photos");
const PUBLIC_DIR = path.join(ROOT, "public");
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function build() {
  console.log("\n📸 开始构建静态照片列表...\n");

  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error("❌ photos/ 目录不存在！");
    process.exit(1);
  }

  const files = fs
    .readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()))
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

  ensureDir(PUBLIC_DIR);

  const outputPath = path.join(PUBLIC_DIR, "photos.json");
  fs.writeFileSync(outputPath, JSON.stringify({ files }, null, 2));

  console.log(`✅ 成功生成照片列表: ${outputPath}`);
  console.log(`📊 共 ${files.length} 张照片\n`);

  ensureDir(path.join(PUBLIC_DIR, "photos"));
  
  for (const file of files) {
    const src = path.join(PHOTOS_DIR, file.name);
    const dest = path.join(PUBLIC_DIR, "photos", file.name);
    fs.copyFileSync(src, dest);
  }

  console.log(`📁 已复制 ${files.length} 张照片到 public/photos/\n`);
  console.log("🎉 构建完成！现在可以部署到 Netlify 了\n");
}

build();