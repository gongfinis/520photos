# ❤️ Heart Collage - Local Photo Album

A web application that automatically arranges your local photos into a heart shape, with real-time collaboration and one-click export.

![Heart Collage Preview](https://via.placeholder.com/800x400?text=Heart+Collage+Preview)

## ✨ Features

- 📸 **Auto Photo Loading**: Automatically loads all images from the `photos/` folder
- ❤️ **Heart Layout**: Smart algorithm arranges photos into a romantic heart pattern
- 🎨 **Low Overlap Design**: Optimized layout algorithm reduces photo overlap for clearer display
- 🔀 **Random Shuffle**: One-click rearrangement with different surprise effects every time
- 🖱️ **Free Adjustment**:
  - Mouse wheel to zoom in/out
  - Middle-click drag to pan
  - Drag individual photos to fine-tune position and rotation
- 💾 **Export PNG**: One-click export of high-definition heart collage (2x resolution)
- 🌐 **Dual Deployment Mode**:
  - Local Node.js server (with WebSocket real-time collaboration)
  - Netlify/Vercel static deployment (no server required)

## 📸 Supported Photo Formats

| Format | Extension | Status |
|--------|-----------|--------|
| JPEG | `.jpg`, `.jpeg` | ✅ Supported |
| PNG | `.png` | ✅ Supported |
| WebP | `.webp` | ✅ Supported |
| GIF | `.gif` | ✅ Supported |
| HEIC | `.heic` | ❌ Not supported (please convert to JPG) |

## 🚀 Quick Start

### Option 1: Local Development (Full Features)

#### Prerequisites

- **Node.js** >= 14.x
- **npm** >= 6.x

#### Installation & Run

```bash
# 1. Clone the project
git clone https://github.com/your-username/heart-local-share.git
cd heart-local-share

# 2. Install dependencies
npm install

# 3. Place your photos in the photos/ folder
#    Supported formats: .jpg, .png, .webp, .gif

# 4. Start the server
npm start

# 5. Open your browser and visit
# http://localhost:3000
```

#### Available Commands

```bash
# Start development server (with WebSocket collaboration)
npm start
# or
npm run start:local

# Build static files (for deployment)
npm run build

# Preview build result locally (simulates Netlify effect)
npm run preview
```

---

### Option 2: Netlify One-Click Deployment (Recommended)

#### Method A: GitHub Auto Deployment ⭐

**Step 1: Fork or Push Code**

```bash
# Fork this repository to your GitHub account
# Then clone your fork
git clone https://github.com/YOUR-USERNAME/heart-local-share.git
cd heart-local-share

# Add your photos to the photos/ folder
# Commit and push
git add .
git commit -m "Add my photos"
git push origin main
```

**Step 2: Configure Netlify**

1. Visit [netlify.com](https://www.netlify.com/) and sign up/log in
2. Click **"Add new site" → "Import an existing project"**
3. Select **GitHub** as the provider
4. Choose the repository you just forked
5. Configure build settings:

   | Setting | Value |
   |---------|-------|
   | **Build command** | `npm run build` |
   | **Publish directory** | `public` |
   | **Node version** | `18` or higher |

6. Click **"Deploy site"** 🚀

**Wait 1-2 minutes, and your website will be live!**

#### Method B: Manual Drag & Drop Deployment

```bash
# 1. Clone the project
git clone https://github.com/your-username/heart-local-share.git
cd heart-local-share

# 2. Install dependencies and build
npm install
npm run build

# 3. Drag the entire public folder to:
#    https://app.netlify.com/drop
```

---

### Option 3: Vercel Deployment

```bash
# 1. Install Vercel CLI (optional)
npm i -g vercel

# 2. Run in project directory
vercel

# 3. Follow prompts to configure:
#    - Build Command: npm run build
#    - Output Directory: public
#    - Framework Preset: Other
```

Or directly import your GitHub repository on [vercel.com](https://vercel.com).

---

## 📁 Project Structure

```
heart-local-share/
├── photos/                  # 👈 Place your photos here (processed by build script)
│   ├── IMG_0001.jpg
│   ├── IMG_0002.png
│   └── ...
├── public/                  # 🔨 Build output (auto-generated, do not modify manually)
│   ├── index.html
│   ├── photos.json          # Photo list data
│   └── photos/              # Copied photo files
├── index.html               # Main page (frontend code)
├── server.js                # Node.js backend server (for local development)
├── build.js                 # Node.js build script
├── build.py                 # Python build script (alternative)
├── netlify.toml             # Netlify deployment configuration
├── package.json             # Node.js project configuration
├── package-lock.json        # Dependency lock file
└── README.md                # This documentation
```

## 🎮 User Guide

### Basic Operations

1. **Add Photos**: Place `.jpg/.png/.webp/.gif` format photos in the `photos/` folder
2. **Refresh Photos**: Click the **"Refresh Photos"** button in the toolbar (or press F5)
3. **View Heart**: Photos will automatically arrange into a heart shape

### Advanced Operations

| Operation | Method | Description |
|-----------|--------|-------------|
| Zoom View | Mouse wheel | Zoom in/out of overall view |
| Pan View | Middle-click drag | Move view position |
| Adjust Single Photo | Left-click drag photo | Fine-tune position and angle |
| Random Shuffle | Click **"Shuffle"** | Regenerate layout |
| Reset View | Click **"Reset View"** | Return to initial state |
| Export Image | Click **"Export PNG"** | Save as high-definition image |

### Updating Photos (For Netlify Users)

If you're using Netlify deployment, updating photos requires rebuilding:

```bash
# 1. Add/modify photos in the local photos/ folder

# 2. Re-commit
git add photos/
git commit -m "Update photos"
git push origin main

# 3. Netlify will automatically redeploy (about 1-2 minutes)
```

Or test new photos locally:

```bash
npm run preview
# Visit http://localhost:3000 to view
```

## ⚙️ Customization

### Modify Heart Size and Spacing

Edit the `createHeartPoints` function in [index.html](index.html):

```javascript
function createHeartPoints(n) {
  // Overall heart size (smaller value = larger heart)
  const scale = Math.min(w, h) / 26;  // Try /20 or /30
  
  // Random offset range for photos (smaller value = neater)
  x: cx + heartX(t) * scale + rand(-8, 8),  // X-axis offset
  y: cy - heartY(t) * scale + rand(-7, 7),  // Y-axis offset
  
  // Minimum gap (larger value = more spread out photos)
  const minGap = Math.max(35, CARD_W * 0.58);  // Try 40 or 50
  
  // Collision detection rounds (larger value = more thorough separation)
  for (let round = 0; round < 6; round++) { ... }  // Try 8 or 10
}
```

### Modify Card Dimensions

Modify the CSS variables at the top of [index.html](index.html):

```css
:root {
  --card-w: 92px;    /* Card width */
  --card-h: 114px;   /* Card height */
  --photo-w: 78px;   /* Photo display width */
  --photo-h: 78px;   /* Photo display height */
}
```

## 🐛 FAQ

### Q1: Page shows "Failed to read photos folder"

**Cause**: Local server not started or API unavailable

**Solutions**:
- Local run: Make sure you've executed `npm start`
- Netlify deployment: Confirm you've run `npm run build` and configured correctly

### Q2: Photos are not displaying

**Possible causes and solutions**:
1. **Unsupported format**: Check if it's `.jpg/.png/.webp/.gif` format
2. **HEIC format**: Need to convert to JPG first (use macOS Preview "Export" function)
3. **Special characters in filename**: Avoid Chinese characters, spaces, etc.
4. **Not rebuilt**: Netlify users need to re-commit code to trigger rebuild

### Q3: Too much photo overlap

**Solutions**:
1. Click **"Shuffle"** multiple times to try different layouts
2. Edit parameters in `createHeartParams()` function (see customization section above)
3. Reduce number of photos (recommended < 100)

### Q4: Exported image is blank

**Cause**: Browser cross-origin security restrictions

**Solutions**:
- Ensure access via HTTP (not file:// protocol)
- Use `http://localhost:3000` or a live URL

### Q5: How to change port?

Modify the last line of `server.js` or set environment variable:

```bash
PORT=8080 npm start
```

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework dependencies)
- **Backend**: Node.js + Express
- **Real-time Communication**: WebSocket (ws)
- **Deployment**: Netlify / Vercel / Any static hosting service
- **Build**: Node.js / Python dual build scripts

## 📊 Performance Parameters

| Parameter | Recommended Value | Description |
|-----------|-------------------|-------------|
| Number of photos | 20-100 | Too many may affect performance |
| Single photo size | < 2MB | Recommended to compress before upload |
| Total size | < 50MB | Free tier Netlify limit |
| Browser | Chrome/Firefox/Safari/Edge | Modern browsers |

## 🤝 Contributing Guide

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - Free to use, modify, and distribute

## ❤️ Acknowledgments

Thanks to all developers who contributed inspiration and code to this project!

---

**Enjoy creating your own heart collage!** 💕

If you find it useful, please give it a ⭐ Star!
