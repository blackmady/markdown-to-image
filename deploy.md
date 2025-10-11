# 生产环境部署指南

## 问题解决方案

### 1. MIME类型错误修复

已创建 `_headers` 文件来配置正确的MIME类型：
- JavaScript文件 (`.js`) 设置为 `application/javascript`
- CSS文件 (`.css`) 设置为 `text/css`
- SVG文件 (`.svg`) 设置为 `image/svg+xml`

### 2. 图标加载问题修复

已将所有资源路径从绝对路径 (`/`) 改为相对路径 (`./`)：
- `index.html` 中的图标链接
- `site.webmanifest` 中的图标路径
- CSS和JS文件引用

### 3. 部署配置文件

创建了以下配置文件：
- `_headers`: 配置MIME类型和缓存策略
- `_redirects`: 处理SPA路由和静态资源

## Cloudflare Pages 部署步骤

1. **上传文件**
   确保以下文件都在项目根目录：
   ```
   index.html
   style.css
   main.js
   i18n.js
   favicon.svg
   favicon.ico
   favicon-16x16.png
   favicon-32x32.png
   apple-touch-icon.png
   site.webmanifest
   _headers
   _redirects
   ```

2. **部署设置**
   - 构建命令：留空或 `echo "Static site"`
   - 构建输出目录：`/` (根目录)
   - 环境变量：无需设置

3. **验证部署**
   部署后检查：
   - JavaScript文件是否正确加载
   - 图标是否显示正常
   - 国际化功能是否工作

## 常见问题排查

### MIME类型问题
如果仍然出现MIME类型错误：
1. 检查 `_headers` 文件是否正确上传
2. 清除浏览器缓存
3. 等待CDN缓存更新（通常5-10分钟）

### 图标加载问题
如果图标仍然无法加载：
1. 检查文件是否存在于根目录
2. 验证文件大小和格式
3. 检查浏览器开发者工具的网络面板

### 国际化功能问题
如果语言切换不工作：
1. 检查 `i18n.js` 是否正确加载
2. 查看浏览器控制台是否有JavaScript错误
3. 验证localStorage是否可用

## 性能优化建议

1. **启用压缩**
   Cloudflare Pages 自动启用Gzip/Brotli压缩

2. **缓存策略**
   `_headers` 文件已配置适当的缓存策略：
   - 静态资源：1年缓存
   - Manifest文件：1天缓存

3. **CDN优化**
   利用Cloudflare的全球CDN网络加速访问