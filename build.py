#!/usr/bin/env python3
import json
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
PHOTOS_DIR = ROOT / "photos"
PUBLIC_DIR = ROOT / "public"
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

def build():
    print("\n📸 开始构建静态照片列表...\n")

    if not PHOTOS_DIR.exists():
        print("❌ photos/ 目录不存在！")
        return False

    files = []
    for f in PHOTOS_DIR.iterdir():
        if f.is_file() and f.suffix.lower() in ALLOWED_EXT:
            stat = f.stat()
            files.append({
                "name": f.name,
                "url": f"/photos/{f.name}",
                "mtimeMs": stat.st_mtime * 1000
            })

    files.sort(key=lambda x: x["mtimeMs"], reverse=True)

    PUBLIC_DIR.mkdir(exist_ok=True)
    (PUBLIC_DIR / "photos").mkdir(exist_ok=True)

    output_path = PUBLIC_DIR / "photos.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({"files": files}, f, indent=2, ensure_ascii=False)

    print(f"✅ 成功生成照片列表: {output_path}")
    print(f"📊 共 {len(files)} 张照片\n")

    for file_info in files:
        src = PHOTOS_DIR / file_info["name"]
        dest = PUBLIC_DIR / "photos" / file_info["name"]
        shutil.copy2(src, dest)

    print(f"📁 已复制 {len(files)} 张照片到 public/photos/\n")
    
    index_src = ROOT / "index.html"
    index_dest = PUBLIC_DIR / "index.html"
    shutil.copy2(index_src, index_dest)
    print(f"📄 已复制 index.html 到 public/\n")
    
    print("🎉 构建完成！现在可以部署到 Netlify 了\n")
    return True

if __name__ == "__main__":
    build()