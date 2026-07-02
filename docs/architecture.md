# 技术架构

## 整体架构

```
┌──────────────────────┐      ┌──────────────────────┐
│     FRONTEND          │      │      BACKEND          │
│  React 19 + Vite 8   │ HTTP │  Express 4 + Node.js  │
│  Mantine 9 + PDF.js  │─────▶│  pdf-lib + multer     │
│  localhost:5173       │      │  localhost:3001       │
└──────────────────────┘      └──────────────────────┘
```

## 前端技术栈

| 层 | 选型 | 版本 |
|---|---|---|
| UI 框架 | React | 19.x |
| 构建工具 | Vite | 8.x |
| 组件库 | Mantine | 9.4.x |
| 图标 | @tabler/icons-react | 3.44.x |
| PDF 查看 | pdfjs-dist | 6.1.x (仅查看器) |
| 图片打包 | jszip | 3.10.x (转图片功能) |
| 文件下载 | file-saver | 2.0.x |
| 语言 | TypeScript | 5.8.x |

## 后端技术栈

| 层 | 选型 | 版本 |
|---|---|---|
| 框架 | Express | 4.x |
| 文件上传 | multer | 1.4.x |
| 跨域 | cors | 2.8.x |
| PDF 处理 | pdf-lib | 1.17.x |
| 开发服务器 | tsx | 4.x (热重载) |
| 语言 | TypeScript | 5.8.x |

## 模块划分

### 前端模块

```
src/
├── components/     # UI 组件（纯视图，不包含业务逻辑）
├── hooks/          # React Hooks（状态管理 + PDF 查看器逻辑）
├── api/            # 后端 API 调用封装
├── types/          # TypeScript 类型定义
└── App.tsx         # 根组件
```

### 后端模块

```
src/
├── routes/         # Express 路由（请求/响应处理）
├── services/       # 业务逻辑（PDF 操作，纯函数）
├── middleware/      # 中间件（文件上传）
└── index.ts        # 入口
```

## 数据流

### 合并 PDF 流程

```
用户勾选文件 → 点击合并 → api/pdfApi.merge(files[])
  → POST /api/pdf/merge (FormData: files[])
  → multer 保存到 /tmp → pdfOperations.mergePDFs(paths[])
  → 返回合并后的 PDF blob
  → file-saver 触发下载
```

### PDF 查看器流程

```
用户点击文件名 → usePdfViewer.load(file)
  → pdfjsLib.getDocument(file.arrayBuffer())
  → 渲染当前页到 Canvas
  → 翻页/缩放/旋转 → Canvas 重绘
```

## API 设计

| 方法 | 路径 | Content-Type |
|---|---|---|
| GET | /api/health | application/json |
| POST | /api/pdf/merge | multipart/form-data → application/pdf |
| POST | /api/pdf/compress | multipart/form-data → application/pdf |
| POST | /api/pdf/watermark | multipart/form-data → application/pdf |
