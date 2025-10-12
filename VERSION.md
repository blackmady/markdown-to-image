# 版本号自动管理

本项目已配置版本号自动管理功能，每次提交代码时会自动增加版本号。

## 当前版本
- **1.0.1**

## 版本号规则
项目使用语义化版本号 (Semantic Versioning)：`主版本号.次版本号.修订号`

- **主版本号 (major)**：不兼容的 API 修改
- **次版本号 (minor)**：向下兼容的功能性新增
- **修订号 (patch)**：向下兼容的问题修正

## 自动版本管理

### Git Hooks
- 每次执行 `git commit` 时，会自动将修订号 +1
- 修改后的 `package.json` 会自动添加到本次提交中

### 手动版本管理
如果需要手动控制版本号，可以使用以下命令：

```bash
# 增加修订号 (1.0.0 -> 1.0.1)
pnpm run version:patch

# 增加次版本号 (1.0.1 -> 1.1.0)
pnpm run version:minor

# 增加主版本号 (1.1.0 -> 2.0.0)
pnpm run version:major
```

## 安装说明
Git hooks 会在以下情况自动安装：
1. 运行 `pnpm install` 时（通过 postinstall 脚本）
2. 手动运行 `pnpm run setup-hooks`

## 文件结构
```
scripts/
├── version-bump.js     # 版本号增加脚本
└── setup-hooks.js      # Git hooks 安装脚本

.githooks/
└── pre-commit          # Git pre-commit hook
```

## 注意事项
- 版本号变更会自动更新 `package.json` 文件
- 每次提交都会增加修订号，请确保提交的是有意义的更改
- 如需跳过版本号自动增加，可以使用 `git commit --no-verify`