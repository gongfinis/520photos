# ❤️ 本地拍立得爱心相册 (Heart Collage)

一个将本地照片自动排列成爱心形状的网页应用，支持实时协作和一键导出。

![爱心相册预览](https://via.placeholder.com/800x400?text=Heart+Collage+Preview)

**[English](README.en.md)** | 简体中文

[![Star History Chart](https://api.star-history.com/svg?repos=gongfinis/520photos&type=Date)](https://star-history.com/#gongfinis/520photos&Date)

## ✨ 功能特点

- 📸 **自动读取照片**：自动加载 `photos/` 文件夹中的所有图片
- ❤️ **心形布局**：智能算法将照片排列成浪漫的心形图案
- 🎨 **低遮挡设计**：优化布局算法，减少照片重叠，展示更清晰
- 🔀 **随机重排**：一键重新排列，每次都有不同的惊喜效果
- 🖱️ **自由调整**：
  - 滚轮缩放视图
  - 中键拖拽平移
  - 单张照片可拖动微调位置和旋转角度
- 💾 **导出 PNG**：一键导出高清爱心拼贴图（2x 分辨率）
- 🌐 **双模式部署**：
  - 本地 Node.js 服务器（支持 WebSocket 实时协作）
  - Netlify/Vercel 静态部署（无需服务器）

## 📸 支持的照片格式

| 格式 | 扩展名 | 状态 |
|------|--------|------|
| JPEG | `.jpg`, `.jpeg` | ✅ 支持 |
| PNG | `.png` | ✅ 支持 |
| WebP | `.webp` | ✅ 支持 |
| GIF | `.gif` | ✅ 支持 |
| HEIC | `.heic` | ❌ 不支持（请转换为 JPG） |

## 🚀 快速开始

### 方式一：本地开发（完整功能）

#### 前置要求

- **Node.js** >= 14.x
- **npm** >= 6.x

#### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/gongfinis/520photos.git
cd 520photos

# 2. 安装依赖
npm install

# 3. 将你的照片放入 photos/ 文件夹
#    支持格式：.jpg, .png, .webp, .gif

# 4. 启动服务器
npm start

# 5. 打开浏览器访问
# http://localhost:3000
```

#### 可用命令

```bash
# 启动开发服务器（含 WebSocket 协作）
npm start
# 或
npm run start:local

# 构建静态文件（用于部署）
npm run build

# 本地预览构建结果（模拟 Netlify 效果）
npm run preview
```

---

### 方式二：Netlify 一键部署（推荐）

#### 方法 A：通过 GitHub 自动部署 ⭐

**第 1 步：Fork 或推送代码**

```bash
# Fork 此仓库到你的 GitHub 账号
# 然后克隆你的 fork
git clone https://github.com/gongfinis/520photos.git
cd 520photos

# 添加你的照片到 photos/ 文件夹
# 提交并推送
git add .
git commit -m "添加我的照片"
git push origin main
```

**第 2 步：配置 Netlify**

1. 访问 [netlify.com](https://www.netlify.com/) 并登录/注册
2. 点击 **"Add new site" → "Import an existing project"**
3. 选择 **GitHub** 作为提供商
4. 选择你刚才 fork 的仓库 `gongfinis/520photos`
5. 配置构建设置：

   | 设置项 | 值 |
   |--------|-----|
   | **Build command** | `npm run build` |
   | **Publish directory** | `public` |
   | **Node version** | `18` 或更高 |

6. 点击 **"Deploy site"** 🚀

**等待 1-2 分钟，你的网站就上线了！**

#### 方法 B：手动拖拽部署

```bash
# 1. 克隆项目
git clone https://github.com/gongfinis/520photos.git
cd 520photos

# 2. 安装依赖并构建
npm install
npm run build

# 3. 将 public 文件夹整个拖拽到：
#    https://app.netlify.com/drop
```

---

### 方式三：Vercel 部署

```bash
# 1. 安装 Vercel CLI（可选）
npm i -g vercel

# 2. 在项目目录运行
vercel

# 3. 按提示配置：
#    - Build Command: npm run build
#    - Output Directory: public
#    - Framework Preset: Other
```

或直接在 [vercel.com](https://vercel.com) 导入 GitHub 仓库 `gongfinis/520photos`。

---

## 📁 项目结构

```
520photos/
├── photos/                  # 👈 放置你的照片（会被构建脚本处理）
│   ├── IMG_0001.jpg
│   ├── IMG_0002.png
│   └── ...
├── public/                  # 🔨 构建输出（自动生成，不要手动修改）
│   ├── index.html
│   ├── photos.json          # 照片列表数据
│   └── photos/              # 复制的照片文件
├── index.html               # 主页面（前端代码）
├── server.js                # Node.js 后端服务器（本地开发用）
├── build.js                 # Node.js 构建脚本
├── build.py                 # Python 构建脚本（备用）
├── netlify.toml             # Netlify 部署配置
├── package.json             # Node.js 项目配置
├── package-lock.json        # 依赖锁定文件
├── README.md                # 中文文档（本文件）
├── README.en.md             # 英文文档
```

## 🎮 使用指南

### 基础操作

1. **添加照片**：将 `.jpg/.png/.webp/.gif` 格式的照片放入 `photos/` 文件夹
2. **刷新照片**：点击工具栏 **"刷新照片"** 按钮（或按 F5）
3. **查看爱心**：照片会自动排列成心形图案

### 高级操作

| 操作 | 方式 | 说明 |
|------|------|------|
| 缩放视图 | 鼠标滚轮 | 放大/缩小整体视图 |
| 平移视图 | 鼠标中键拖拽 | 移动视图位置 |
| 调整单张照片 | 左键拖拽照片 | 微调位置和角度 |
| 随机重排 | 点击 **"随机重排"** | 重新生成布局 |
| 重置视图 | 点击 **"重置视图"** | 回到初始状态 |
| 导出图片 | 点击 **"导出 PNG"** | 保存为高清图片 |

### 更新照片（Netlify 用户）

如果你使用 Netlify 部署，更新照片需要重新构建：

```bash
# 1. 在本地添加/修改 photos/ 中的照片

# 2. 重新提交
git add photos/
git commit -m "更新照片"
git push origin main

# 3. Netlify 会自动重新部署（约 1-2 分钟）
```

或在本地测试新照片：

```bash
npm run preview
# 访问 http://localhost:3000 查看
```

## ⚙️ 自定义配置

### 修改心形大小和间距

编辑 [index.html](index.html) 中的 `createHeartPoints` 函数：

```javascript
function createHeartPoints(n) {
  // 心形整体大小（值越小，心形越大）
  const scale = Math.min(w, h) / 26;  // 尝试改为 /20 或 /30
  
  // 照片随机偏移范围（值越小越整齐）
  x: cx + heartX(t) * scale + rand(-8, 8),  // X轴偏移
  y: cy - heartY(t) * scale + rand(-7, 7),  // Y轴偏移
  
  // 最小间距（值越大，照片越分散）
  const minGap = Math.max(35, CARD_W * 0.58);  // 尝试改为 40 或 50
  
  // 碰撞检测轮数（值越大，分离越彻底）
  for (let round = 0; round < 6; round++) { ... }  // 尝试改为 8 或 10
}
```

### 修改卡片尺寸

在 [index.html](index.html) 顶部的 CSS 变量中修改：

```css
:root {
  --card-w: 92px;    /* 卡片宽度 */
  --card-h: 114px;   /* 卡片高度 */
  --photo-w: 78px;   /* 照片显示宽度 */
  --photo-h: 78px;   /* 照片显示高度 */
}
```

## 🐛 常见问题

### Q1: 网页显示"读取 photos 文件夹失败"

**原因**：未启动本地服务器或 API 不可用

**解决方案**：
- 本地运行：确保执行了 `npm start`
- Netlify 部署：确认已运行 `npm run build` 并正确配置

### Q2: 照片没有显示出来

**可能原因及解决方法**：
1. **格式不支持**：检查是否为 `.jpg/.png/.webp/.gif` 格式
2. **HEIC 格式**：需先转换为 JPG（可用 macOS 预览"导出"功能）
3. **文件名特殊字符**：避免使用中文、空格等特殊字符
4. **未重新构建**：Netlify 用户需重新提交代码触发构建

### Q3: 照片重叠太多

**解决方案**：
1. 点击 **"随机重排"** 多次尝试不同布局
2. 编辑 `createHeartParams()` 函数中的参数（见上方自定义配置）
3. 减少照片数量（建议 < 100 张）

### Q4: 导出的图片是空白的

**原因**：浏览器跨域安全限制

**解决方案**：
- 确保通过 HTTP 访问（非 file:// 协议）
- 使用 `http://localhost:3000` 或线上 URL

### Q5: 如何更改端口？

修改 `server.js` 最后一行或设置环境变量：

```bash
PORT=8080 npm start
```

## 🛠️ 技术栈

- **前端**：原生 HTML/CSS/JavaScript（无框架依赖）
- **后端**：Node.js + Express
- **实时通信**：WebSocket (ws)
- **部署**：Netlify / Vercel / 任意静态托管服务
- **构建**：Node.js / Python 双构建脚本

## 📊 性能参数

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| 照片数量 | 20-100 张 | 过多会影响性能 |
| 单张大小 | < 2MB | 建议压缩后上传 |
| 总大小 | < 50MB | 免费版 Netlify 限制 |
| 浏览器 | Chrome/Firefox/Safari/Edge | 现代浏览器 |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库 [https://github.com/gongfinis/520photos](https://github.com/gongfinis/520photos)
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加某个很棒的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 自由使用、修改和分发

## ❤️ 致谢

感谢所有为这个项目贡献灵感和代码的开发者！

---

**享受创建属于你的爱心相册吧！** 💕

如果觉得有用，欢迎给个 ⭐ Star 支持一下！

🔗 **GitHub**: [https://github.com/gongfinis/520photos](https://github.com/gongfinis/520photos)
