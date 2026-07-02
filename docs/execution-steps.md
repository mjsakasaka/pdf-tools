# 执行步骤

> 对应计划文件：[frolicking-splashing-crayon.md](../.claude/plans/frolicking-splashing-crayon.md)

## 阶段 0：项目重构（目录 + 文档）

| Step | 内容 | 状态 | 验收标准 |
|---|---|---|---|
| 0.1 | 创建目录结构 | ☐ | frontend/backend/tests/docs/dev_logs 目录就位 |
| 0.2 | 迁移代码 → frontend/ | ☐ | `cd frontend && npm run build` 通过 |
| 0.3 | 初始化 backend/ | ☐ | `cd backend && npm install && npm run dev` 启动成功 |
| 0.4 | 创建 5 份标准文档 | ☐ | docs/ 下有 5 个文件 |
| 0.5 | 创建开发日志 | ☐ | dev_logs/2026-07-02.md 或 2026-07-03.md 存在 |

## 阶段 1：后端 PDF API

| Step | 内容 | 状态 | 验收标准 |
|---|---|---|---|
| 1.1 | POST /api/pdf/merge | ☐ | curl 上传 2 个 PDF，返回合并文件 |
| 1.2 | POST /api/pdf/compress | ☐ | curl 上传 1 个 PDF，返回压缩文件 + headers 含大小对比 |
| 1.3 | POST /api/pdf/watermark | ☐ | curl 上传 PDF + config，返回水印文件 |
| 1.4 | 确认转图片方案 | ☐ | 决策：保留前端方案 |
| 1.5 | backend tsc 通过 | ☐ | `cd backend && npx tsc --noEmit` 无错误 |

## 阶段 2：三栏布局骨架

| Step | 内容 | 状态 | 验收标准 |
|---|---|---|---|
| 2.1 | App.tsx 三栏 Flex 布局 | ☐ | 浏览器可见三栏（占位色块） |
| 2.2 | LeftSidebar 骨架 | ☐ | 搜索框 + 打开按钮 + 空列表 + 设置按钮可见 |
| 2.3 | CenterViewer 骨架 | ☐ | 灰色背景 + 顶部/底部工具栏占位 |
| 2.4 | RightToolbar 骨架 | ☐ | 搜索框 + 四个工具卡片（静态） |
| 2.5 | frontend build 通过 | ☐ | `cd frontend && npm run build` 无错误 |

## 阶段 3：左侧文件管理

| Step | 内容 | 状态 | 验收标准 |
|---|---|---|---|
| 3.1 | 文件打开功能 | ☐ | 点击打开 → 选择 PDF → 文件出现在列表中 |
| 3.2 | FileCard 组件 | ☐ | 显示文件名 + 大小 + 页数 + 复选框 + 移除 |
| 3.3 | 搜索过滤 + 选中高亮 + 多选 | ☐ | 输入过滤 → 高亮正确 → 多选可用 |
| 3.4 | frontend build 通过 | ☐ | 无编译错误 |

## 阶段 4：中间 PDF 查看器

| Step | 内容 | 状态 | 验收标准 |
|---|---|---|---|
| 4.1 | usePdfViewer hook | ☐ | 选中文件 → Canvas 显示第一页 |
| 4.2 | 翻页 + 缩放 | ☐ | 翻页正常 + 缩放按钮生效 |
| 4.3 | 旋转 + 保存 | ☐ | 旋转后 Canvas 更新 + 保存下载 |
| 4.4 | frontend build 通过 | ☐ | 无编译错误 |

## 阶段 5：右边工具集成

| Step | 内容 | 状态 | 验收标准 |
|---|---|---|---|
| 5.1 | pdfApi.ts | ☐ | 四个 API 函数封装完成 |
| 5.2 | ToolList + ToolConfigPanel 切换 | ☐ | 点击工具 → 切到配置 → 点返回 → 回到列表 |
| 5.3 | 四个工具配置 + 调用 | ☐ | 端到端：配置 → 执行 → 下载 |
| 5.4 | 联调 + build | ☐ | 前后端联调通过 |

## 阶段 6：样式打磨

| Step | 内容 | 状态 | 验收标准 |
|---|---|---|---|
| 6.1 | 配色 + 圆角阴影 + hover | ☐ | 视觉效果和设计规范一致 |
| 6.2 | 响应式 | ☐ | < 1024px 显示提示 |
| 6.3 | 最终测试 | ☐ | 四个功能全流程通过 |

---

> 状态图例：☐ 待开始 | ◐ 进行中 | ☑ 已完成 | ✕ 跳过
