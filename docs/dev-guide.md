# 开发指南

## 环境要求

| 工具 | 版本 | 检查命令 |
|---|---|---|
| Node.js | ≥ 18 | `node -v` |
| npm | ≥ 9 | `npm -v` |
| Git | 任意 | `git --version` |

## 快速开始

### 1. 安装前端依赖

```bash
cd frontend
npm install
```

### 2. 安装后端依赖

```bash
cd backend
npm install
```

### 3. 启动开发服务器

终端 1 — 启动后端：
```bash
cd backend
npm run dev
# → http://localhost:3001
# → 健康检查: http://localhost:3001/api/health
```

终端 2 — 启动前端：
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

## 命令速查

### 前端

| 命令 | 用途 |
|---|---|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | TypeScript 检查 + 生产构建 |
| `npx tsc --noEmit` | 仅类型检查 |

### 后端

| 命令 | 用途 |
|---|---|
| `npm run dev` | tsx watch 热重载开发 |
| `npm run build` | TypeScript 编译到 dist/ |
| `npx tsc --noEmit` | 仅类型检查 |

## 编码规范

### TypeScript
- 严格模式 (`strict: true`)
- 优先使用 `interface` 而非 `type`（对象类型）
- 导出函数使用显式返回类型
- 避免 `any`，使用 `unknown` + 类型守卫

### React
- 函数组件 + Hooks，不使用 class 组件
- `useCallback` 包裹传递给子组件的回调
- 组件文件：`PascalCase.tsx`
- Hook 文件：`camelCase.ts` (useXxx)
- 一个组件一个文件

### 命名约定
- 文件/目录：kebab-case
- 组件：PascalCase
- 函数/变量：camelCase
- 常量：UPPER_SNAKE_CASE

## Git 约定

- 分支：从 main 创建 `feature/xxx` 或 `fix/xxx`
- 提交信息：中文，格式 `类型: 描述`（feat / fix / docs / refactor / style）
- 每次提交前确保 `npm run build` 通过

## 目录约定

- 前端入口：`frontend/`（独立 npm 项目）
- 后端入口：`backend/`（独立 npm 项目）
- 测试：`tests/` 按类型分 unit / api / e2e
- 文档：`docs/`
- 日志：`dev_logs/YYYY-MM-DD.md`
