# Cloudflare Pages 环境变量配置指南

## 统计代码环境变量配置

为了在 Cloudflare Pages 部署时正确注入统计代码，需要在 Cloudflare Pages 控制台中手动配置以下环境变量：

### 必需的环境变量

1. **VITE_ENABLE_ANALYTICS**
   - 值：`true` 或 `false`
   - 说明：控制是否在生产构建中注入统计代码

2. **VITE_CLARITY_PROJECT_ID**
   - 值：你的 Microsoft Clarity 项目ID
   - 说明：用于 Clarity 统计代码的项目标识符

### 配置步骤

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入你的 Pages 项目
3. 点击 **Settings** 标签
4. 找到 **Environment variables** 部分
5. 点击 **Add variable** 添加上述环境变量
6. 选择 **Production** 环境
7. 保存配置

### 验证配置

配置完成后，下次部署时统计代码会自动注入到生产版本中。你可以通过查看页面源代码确认 Clarity 统计脚本是否正确加载。

### 注意事项

- 环境变量配置后需要重新部署才能生效
- 如果不配置 `VITE_ENABLE_ANALYTICS` 或设置为 `false`，统计代码不会被注入
- `VITE_CLARITY_PROJECT_ID` 如果未配置，会使用默认值 `to0gxOtnk7`