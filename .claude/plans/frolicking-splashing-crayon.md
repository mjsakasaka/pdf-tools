# PDF 工具箱 v2 — 三栏编辑器布局计划

## Context

将现有单列 demo 升级为接近 Stirling-PDF 的专业三栏编辑器布局。同时将 PDF 处理逻辑从前端迁移到 Node.js 后端，实现真正的前后端分离架构。

---

## 0. 项目开发规范（必读）

### 0.1 标准文档索引

所有开发相关的标准文档位于 `docs/` 目录：

| 文档 | 路径 | 用途 |
|---|---|---|
| 需求文档 | [docs/requirements.md](docs/requirements.md) | 功能需求、用户场景、验收标准 |
| 技术架构 | [docs/architecture.md](docs/architecture.md) | 技术栈、模块划分、数据流、组件树 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | UI 配色、布局尺寸、组件样式、图标规范 |
| 开发指南 | [docs/dev-guide.md](docs/dev-guide.md) | 环境准备、命令速查、编码规范、Git 约定 |
| 执行步骤 | [docs/execution-steps.md](docs/execution-steps.md) | 分步执行计划、每步目标、验收条件 |

### 0.2 开发日志规范

- 位置：`dev_logs/YYYY-MM-DD.md`
- 每天开始开发时创建当天的日志文件
- 日志模板：日期、今日计划、完成事项、待办事项、遇到的问题

### 0.3 铁律：三次失败就停止

> ⚠️ **在任何开发步骤中，如果同一个技术问题尝试解决超过 3 次仍未成功，立即停止，不要尝试第 4 次。**
>
> 此时应该：
> 1. 在开发日志中记录：问题现象、已尝试的方案、每次失败的具体错误信息
> 2. 通知用户，说明当前阻塞点和可能的影响范围
> 3. 讨论下一步：更换方案 / 降级功能 / 跳过该步骤先做其他

### 0.4 渐进式开发原则

- 每完成一个步骤，必须通过编译（`npx tsc --noEmit`），才能进入下一步
- 功能可以未完成，但不能让项目处于无法编译的状态
- 优先保证核心流程跑通，再完善细节和样式

### 0.5 🧪 测试门禁规则（必读）

> **每个阶段开发完成后，必须经过测试门禁，由用户确认通过，才能进入下一阶段。**

流程如下：

```
阶段 N 开发完成
    │
    ▼
🧪 测试门禁 N：AI 列出测试任务 → 用户执行测试 → 用户确认
    │
    ├── ❌ 发现问题 → 修复 → 重新测试
    │
    └── ✅ 通过 → 进入阶段 N+1
```

**测试门禁的产出物存入 `qa/reports/`**，命名格式：`gate-N-phase-name.md`

**测试参考文档：**
- 完整介入指南：[qa/test-intervention-guide.md](qa/test-intervention-guide.md)
- API 测试用例：[qa/test-intervention-guide.md#节点-2](qa/test-intervention-guide.md)
- E2E 场景测试：[qa/test-intervention-guide.md#节点-5](qa/test-intervention-guide.md)

---

## 1. 用户需求确认

| 需求项 | 确定方案 |
|---|---|
| 左侧搜索 | 筛选文件名（列表过滤） |
| 文件多选 | 复选框 + 选中高亮（合并用所有勾选文件） |
| 文件预览 | 单选，点击文件名在查看器预览 |
| 工具配置 | 替换右边栏内容（配置面板 + 返回按钮） |
| PDF 查看器 | Canvas 逐页渲染（PDF.js），支持旋转缩放 |
| 前后端分离 | Node.js + Express 后端，前端通过 REST API 调用 |
| 开发纪律 | 步骤化 + 每步编译通过 + 3 次失败即停止 |

---

## 2. 项目目录结构

```
pdf_tools/
├── frontend/                        # React + Vite 前端
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── postcss.config.mjs
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                  # 三栏布局 + 全局状态
│       ├── vite-env.d.ts
│       ├── components/
│       │   ├── left-sidebar/
│       │   │   ├── LeftSidebar.tsx
│       │   │   └── FileCard.tsx
│       │   ├── center-viewer/
│       │   │   ├── CenterViewer.tsx
│       │   │   ├── ViewerTopToolbar.tsx
│       │   │   └── ViewerBottomToolbar.tsx
│       │   ├── right-toolbar/
│       │   │   ├── RightToolbar.tsx
│       │   │   ├── ToolList.tsx
│       │   │   └── ToolConfigPanel.tsx
│       │   └── shared/
│       │       └── SearchInput.tsx
│       ├── hooks/
│       │   ├── useFileStore.ts
│       │   ├── usePdfViewer.ts
│       │   └── useToolProcessor.ts
│       ├── api/                     # 后端 API 调用层
│       │   └── pdfApi.ts            # fetch 封装：merge/compress/watermark/toImage
│       └── types/
│           └── index.ts
│
├── backend/                         # Node.js + Express 后端
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                 # Express 入口，端口 3001
│   │   ├── routes/
│   │   │   └── pdf.ts               # /api/pdf/* 路由定义
│   │   ├── services/
│   │   │   └── pdfOperations.ts     # 核心：PDF 处理逻辑（从原 operations.ts 迁移）
│   │   └── middleware/
│   │       └── upload.ts            # multer 文件上传配置
│   └── uploads/                     # 临时上传目录（gitignore）
│
├── tests/                           # 测试文件
│   ├── unit/                        # 纯函数单元测试
│   │   └── pdf-operations.test.ts
│   ├── api/                         # API 集成测试
│   │   └── pdf-api.test.ts
│   └── e2e/                         # 端到端测试
│       └── main-flow.spec.ts
│
├── docs/                            # 项目标准文档
│   ├── requirements.md
│   ├── architecture.md
│   ├── design-spec.md
│   ├── dev-guide.md
│   └── execution-steps.md
│
├── dev_logs/                        # 开发日志
│   └── YYYY-MM-DD.md
│
└── README.md
```

---

## 3. 后端 API 设计

| 方法 | 路径 | 说明 | 请求 | 响应 |
|---|---|---|---|---|
| POST | `/api/pdf/merge` | 合并多个 PDF | FormData: files[] | `application/pdf` blob |
| POST | `/api/pdf/compress` | 压缩单个 PDF | FormData: file | JSON: `{originalSize, compressedSize}` + blob |
| POST | `/api/pdf/watermark` | 添加水印 | FormData: file + config JSON | `application/pdf` blob |
| POST | `/api/pdf/to-image` | PDF 转图片 | FormData: file | ZIP 文件流 |

### 后端技术选型

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | Express 4.x | 最成熟稳定的 Node.js 框架 |
| 文件上传 | multer | 处理 multipart/form-data |
| PDF 处理 | pdf-lib 1.17.x | 合并、压缩、水印（纯 JS，零原生依赖） |
| PDF 转图片 | **待评估** ⚠️ | 见下方风险分析 |
| 日志 | 内置 console | 配合 tsx 热重载 |
| 跨域 | cors | 允许前端 localhost:5173 访问 |

### ⚠️ PDF 转图片后端方案风险评估

`pdfjs-dist` 在 Node.js 中渲染需要 Canvas API，而 Node.js 没有原生的 Canvas。需要安装 `canvas`（node-canvas）npm 包，它有原生 C++ 依赖：

- **Windows 上安装 node-canvas 需要**: node-gyp + Visual Studio Build Tools + GTK 库
- **替代方案 A**: `sharp` — 图像处理库，有原生依赖但比 canvas 更易安装
- **替代方案 B**: `puppeteer` — 用无头 Chrome 渲染 PDF → 截图，但需下载 Chromium（~300MB）
- **替代方案 C（推荐）**: **PDF 转图片保留在前端做**，其余三个功能走后端。这是最务实的方案，因为浏览器有原生 Canvas API，零风险

> **建议**：阶段 0 先采用替代方案 C（转图片留前端），等后端骨架稳定后再评估是否迁移。

---

## 4. 布局结构

```
┌────────────┬────────────────────┬─────────────┐
│  LEFT      │     CENTER         │   RIGHT     │
│  SIDEBAR   │     VIEWER         │   TOOLBAR   │
│  (280px)   │     (flex-1)       │   (320px)   │
├────────────┼────────────────────┼─────────────┤
│ 🔍Search   │ ↺ ↻ 💾 Save      │ 🔍Search    │
│ 📂Open     │                    │             │
│────────────│    ┌──────────┐   │─────────────│
│ □ doc1.pdf │    │          │   │ 🔗 合并PDF  │
│ □ doc2.pdf │    │  Canvas  │   │ 🗜️ 压缩PDF  │
│ □ doc3.pdf │    │  (PDF    │   │ 💧 添加水印  │
│            │    │  Render) │   │ 🖼️ 转为图片  │
│            │    │          │   │             │
│────────────│    └──────────┘   │             │
│ ⚙ Settings │ ◀ N/M ▶  🔍±    │             │
└────────────┴────────────────────┴─────────────┘
```

---

## 5. 设计系统速览（详见 docs/design-spec.md）

- **配色**：蓝 `blue.6` / 灰 `gray.0~9` / 白 `white`
- **侧边栏**：280px 固定宽，白色背景，`gray.2` 分割线
- **查看器**：`gray.1` 背景，Canvas 居中带阴影
- **工具栏**：320px 固定宽，白色背景，工具卡片 hover 时 `blue.0` 高亮
- **选中态**：`blue.0` 背景 + `blue.6` 3px 左边框

---

## 6. 开发阶段划分

### 阶段 0：项目重构（目录 + 文档）— 搭骨架

| Step | 内容 | 验收 |
|---|---|---|
| 0.1 | 创建新目录结构（frontend/, backend/, tests/, docs/, dev_logs/） | 目录就位 |
| 0.2 | 迁移现有代码 → `frontend/`，调整 import | `npm run build` 通过 |
| 0.3 | 初始化 `backend/`（Express + TypeScript + multer + cors），空跑 3001 端口 | `curl /api/health` 返回 OK |
| 0.4 | 创建 5 份标准文档 | docs/ 就绪 |
| 0.5 | 创建当天开发日志 | dev_logs/2026-07-02.md |

### 阶段 1：后端 PDF API — 先把处理能力迁移过去

| Step | 内容 | 验收 |
|---|---|---|
| 1.1 | 迁移 pdfOperations.ts → backend，实现 POST /api/pdf/merge | 启动后端，curl 测试通过 |
| 1.2 | 实现 POST /api/pdf/compress | 返回文件 + X-Original-Size / X-Compressed-Size 头 |
| 1.3 | 实现 POST /api/pdf/watermark | 支持文字/配置参数 |
| 1.4 | 确认转图片保留前端方案 | 决策确认 |
| 1.5 | backend TypeScript 编译通过 | `npx tsc --noEmit` 通过 |

#### 🧪 测试门禁 1：后端 API 验收

> **用户确认阶段 1 完成后，AI 将展示以下测试任务。用户执行测试 → 发现问题则修复 → 全部通过后确认进入阶段 2。**

| # | 测试任务 | 工具 | 产出 |
|---|---|---|---|
| T1.1 | 启动后端，`/api/health` 返回 ok | curl | 截图或终端输出 |
| T1.2 | 上传 2 个 PDF 合并 → 下载结果，验证页数 = 原页数之和 | curl + PDF 阅读器 | gate-1 报告 |
| T1.3 | 上传 PDF 压缩 → 验证 X-Compressed-Size < X-Original-Size | curl -v | 终端输出 |
| T1.4 | 上传 PDF + 水印配置 → 下载结果，每页有水印 | curl + PDF 阅读器 | gate-1 报告 |
| T1.5 | 异常测试：传 1 个文件合并 / 不传文件 / 传非 PDF | curl | 错误码截图 |
| T1.6 | 边界测试：合并空白 PDF (0 页) / 超 100MB 文件 | curl | gate-1 报告 |

**T1 完整用例参考**：[qa/test-intervention-guide.md#节点-2](qa/test-intervention-guide.md)

**通过标准**：T1.1-T1.4 全部正常 + T1.5 返回正确错误码 + T1.6 不崩溃

### 阶段 2：三栏布局骨架 — 画框架

| Step | 内容 | 验收 |
|---|---|---|
| 2.1 | App.tsx 三栏 Flex 布局（占位色块） | 三栏可见 |
| 2.2 | LeftSidebar 骨架（搜索 + 打开 + 空列表 + 设置） | 左栏结构完整 |
| 2.3 | CenterViewer 骨架（占位区 + 双工具栏占位） | 中栏结构完整 |
| 2.4 | RightToolbar 骨架（搜索 + 四个工具卡片） | 右栏结构完整 |
| 2.5 | frontend TypeScript + Vite build 通过 | 编译无报错 |

#### 🧪 测试门禁 2：三栏布局验收

| # | 测试任务 | 工具 | 产出 |
|---|---|---|---|
| T2.1 | 浏览器打开 → 三栏正确渲染（不重叠、不错位） | Chrome DevTools | 截图 |
| T2.2 | 窗口缩放到 1024px → 布局不崩溃 | Chrome DevTools | 截图 |
| T2.3 | 点击「打开文件」→ 可多选 PDF → 文件出现在左侧列表 | 手动 | gate-2 报告 |
| T2.4 | 四个工具卡片在右侧正确展示 | 手动 | 截图 |

**通过标准**：三栏布局正确 + 文件可上传 + 工具卡片可见

### 阶段 3：左侧文件管理 — 核心交互

| Step | 内容 | 验收 |
|---|---|---|
| 3.1 | 打开文件（隐藏 `<input>` + 页数提取） | 能上传并显示 PDF |
| 3.2 | FileCard 组件（名 + 大小 + 页数 + 复选框 + 移除） | 卡片完整 |
| 3.3 | 文件搜索过滤 + 选中高亮 + 多选 | 交互完整 |
| 3.4 | TypeScript + Vite build 通过 | 编译无报错 |

#### 🧪 测试门禁 3：文件管理验收

| # | 测试任务 | 工具 | 产出 |
|---|---|---|---|
| T3.1 | 上传 3 个 PDF → 文件卡片显示名/大小/页数正确 | 手动 | gate-3 报告 |
| T3.2 | 搜索框输入关键字 → 仅匹配文件显示；清空 → 全部恢复 | 手动 | 截图 |
| T3.3 | 点击文件名 → 卡片高亮；点另一个 → 切换；复选框独立勾选 | 手动 | gate-3 报告 |
| T3.4 | 勾选 2 个文件 → 右侧合并按钮变为可用；取消勾选 → 禁用 | 手动 | 截图 |
| T3.5 | 仅勾选 1 个 → 合并按钮仍禁用（需 ≥2） | 手动 | gate-3 报告 |
| T3.6 | 移除单个文件 / 清空全部 → 列表更新正确 | 手动 | 截图 |

**通过标准**：搜索过滤正确 + 选中高亮 + 多选联动工具按钮状态

### 阶段 4：中间 PDF 查看器 — 核心渲染

| Step | 内容 | 验收 |
|---|---|---|
| 4.1 | usePdfViewer hook（加载 + Canvas 渲染） | PDF 可查看 |
| 4.2 | ViewerBottomToolbar（翻页 + 页码 + 缩放） | 能翻页缩放 |
| 4.3 | ViewerTopToolbar（旋转 + 保存） | 能旋转保存 |
| 4.4 | TypeScript + Vite build 通过 | 编译无报错 |

#### 🧪 测试门禁 4：PDF 查看器验收

| # | 测试任务 | 工具 | 产出 |
|---|---|---|---|
| T4.1 | 选中文件 → Canvas 渲染第一页，内容可读，中文不乱码 | 手动 | gate-4 报告 |
| T4.2 | 翻页：下一页/上一页/输入跳页/末页禁用 | 手动 | 截图 |
| T4.3 | 旋转：左旋转 4 次 → 恢复原始方向 | 手动/目视 | gate-4 报告 |
| T4.4 | 缩放：50%/100%/200% → Canvas 尺寸变化，比例正确 | 手动/目视 | 截图 |
| T4.5 | 旋转后翻页 → 旋转状态保持；缩放后翻页 → 缩放状态保持 | 手动 | gate-4 报告 |
| T4.6 | 保存按钮 → 下载 PDF → 用阅读器打开验证内容正确 | PDF 阅读器 | gate-4 报告 |

**通过标准**：渲染正确 + 翻页/缩放/旋转功能正常 + 保存文件可打开

### 阶段 5：右边工具集成 — 对接后端

| Step | 内容 | 验收 |
|---|---|---|
| 5.1 | pdfApi.ts 封装四个 fetch 调用 | API 调用层就绪 |
| 5.2 | ToolList 动态禁用 + ToolConfigPanel 切换 | 面板切换流畅 |
| 5.3 | 四个工具配置 UI + 调用 API | 四个功能端到端可用 |
| 5.4 | 结果下载 + 通知提示 | 下载流程通畅 |
| 5.5 | 前端 + 后端联调通过 + build | 全栈编译无报错 |

#### 🧪 测试门禁 5：工具联调 E2E 验收

| # | 测试任务 | 工具 | 产出 |
|---|---|---|---|
| T5.1 | 场景 A：勾选 2 个 PDF → 合并 → 下载结果，验证页数正确 | 手动 E2E | gate-5 报告 |
| T5.2 | 场景 B：选中 PDF → 压缩 → 下载结果，对比大小 | 手动 E2E | gate-5 报告 |
| T5.3 | 场景 C：配置水印参数 → 添加 → 下载结果，验证每页水印 | 手动 E2E | gate-5 报告 |
| T5.4 | 场景 D：选中 PDF → 转图片 → 下载 ZIP → 解压验证图片 | 手动 E2E | gate-5 报告 |
| T5.5 | 后端未启动时点工具 → 前端显示错误提示不白屏 | 手动 | 截图 |
| T5.6 | 工具配置面板 ← → 工具列表切换流畅，返回不丢状态 | 手动 | gate-5 报告 |

**通过标准**：4 个场景端到端通过 + 异常处理正确 + 面板切换流畅

### 阶段 6：样式打磨

| Step | 内容 | 验收 |
|---|---|---|
| 6.1 | 蓝灰白配色 + 圆角阴影 + hover/过渡 | 视觉效果达标 |
| 6.2 | 响应式边界处理 | 小屏幕友好提示 |
| 6.3 | 最终全流程手动测试 | 全部通过 |

#### 🧪 测试门禁 6：发布前终验

| # | 测试任务 | 工具 | 产出 |
|---|---|---|---|
| T6.1 | 回归：重跑 T5.1-T5.4 四个 E2E 场景 | 手动 E2E | gate-6 报告 |
| T6.2 | 生产构建验证：`npm run build` + `npm run preview` | CLI | 构建日志 |
| T6.3 | 响应式：< 1024px 降级提示正常 | 手动 | 截图 |
| T6.4 | Chrome / Edge / Firefox 三浏览器功能一致 | 手动 | 截图 |
| T6.5 | 暗色模式可读性（如已实现） | 手动 | 截图 |

**通过标准**：回归 0 新增缺陷 + 三浏览器正常 + 生产构建通过

---

## 7. 每阶段验收

```bash
# 前端验收
cd frontend && npx tsc --noEmit && npm run build

# 后端验收
cd backend && npx tsc --noEmit

# 🧪 测试门禁报告
# 报告模板 → qa/reports/gate-N-phase-name.md
# 更新开发日志 → dev_logs/YYYY-MM-DD.md
```

### 7.1 测试门禁报告模板

每次测试完成后，在 `qa/reports/gate-N-xxx.md` 中记录：

```markdown
# 🧪 测试门禁 N：[阶段名称] — 测试报告

- **日期**：YYYY-MM-DD
- **测试人**：[姓名]
- **阶段**：阶段 N

## 测试结果

| # | 测试项 | 结果 | 备注 |
|---|---|---|---|
| T1 | ... | ✅ / ❌ | ... |

## 发现的问题

| # | 问题 | 严重度 | 状态 |
|---|---|---|---|
| 1 | ... | P0/P1/P2 | 已修复 / 待修复 |

## 结论

- [ ] 全部通过，进入阶段 N+1
- [ ] 有问题需修复，修复后重测
```

