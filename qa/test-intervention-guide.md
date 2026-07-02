# 测试工程师介入指南

> 本文档描述测试工程师在 PDF 工具箱项目各阶段的工作内容、介入时机和产出物。
> 对应计划文件：[frolicking-splashing-crayon.md](../.claude/plans/frolicking-splashing-crayon.md)

---

## 总览

```
节点 1 (需求)    ██ 用例设计 + 数据准备
节点 2 (后端)    ████ API 测试 (curl/Postman)
节点 3 (前端UI)  ███ 组件测试 + 兼容性
节点 4 (查看器)  ████ 渲染测试 + 性能测试
节点 5 (联调)    ██████ E2E 测试 + 异常测试
节点 6 (发布)    ███ 回归 + 生产验证
```

---

## 节点 1：需求评审期

**介入时机**：需求文档定稿后、开发开始前（当前阶段）

### 工作内容

| 项 | 说明 |
|---|---|
| 需求可测性审查 | 逐条检查 [docs/requirements.md](../docs/requirements.md) 的功能需求是否有可量化的验收标准 |
| 测试策略制定 | 确定单元测试/API测试/组件测试/E2E 测试的覆盖范围分配 |
| 测试用例设计 | 覆盖正常路径、异常路径、边界值 |
| 测试数据准备 | 收集/制作不同特征的 PDF 样本文件 |

### 测试数据清单

| 类型 | 用途 | 特征 |
|---|---|---|
| 单页 PDF | 基础功能 | 纯文字，< 100KB |
| 多页 PDF | 翻页/合并 | 10-20 页，含图片 |
| 大文件 PDF | 上传限制 | > 50MB |
| 加密 PDF | 异常处理 | 有密码保护 |
| 空白 PDF | 边界 | 0 页 |
| 中文 PDF | 渲染 | 含中文字体 |
| 扫描型 PDF | 转图片 | 每页是一张图片 |
| 混合 PDF | 水印 | 横版 + 竖版混合 |
| 损坏 PDF | 异常 | 文件头损坏 |

### 产出物
- 测试计划文档
- 测试用例清单
- PDF 样本文件库（`qa/test-data/`）

---

## 节点 2：阶段 1 完成 — 后端 API 交付

**介入时机**：`npm run dev` 后端启动成功、API 端点可用

### 测试端点

| 端点 | 方法 | 测试重点 |
|---|---|---|
| `/api/health` | GET | 返回 `{"status":"ok"}` |
| `/api/pdf/merge` | POST | 合并多文件、结果 PDF 可打开 |
| `/api/pdf/compress` | POST | 压缩后体积≤原始、页数不变 |
| `/api/pdf/watermark` | POST | 水印位置/透明度/颜色正确 |

### 测试用例（curl 脚本）

```bash
# === /api/health ===
curl http://localhost:3001/api/health
# 预期: {"status":"ok","timestamp":"..."}

# === merge — 正常 ===
curl -X POST http://localhost:3001/api/pdf/merge \
  -F "files=@qa/test-data/sample-1.pdf" \
  -F "files=@qa/test-data/sample-2.pdf" \
  -o merged_result.pdf
# 预期: 200, Content-Type: application/pdf

# === merge — 异常：传 1 个文件 ===
curl -X POST http://localhost:3001/api/pdf/merge \
  -F "files=@qa/test-data/sample-1.pdf"
# 预期: 400, {"error":"至少需要 2 个 PDF 文件"}

# === merge — 异常：传非 PDF ===
curl -X POST http://localhost:3001/api/pdf/merge \
  -F "files=@qa/test-data/not-a-pdf.txt" \
  -F "files=@qa/test-data/sample-1.pdf"
# 预期: 500, {"error":"..."} (非 PDF 被拒绝)

# === compress — 正常 ===
curl -X POST http://localhost:3001/api/pdf/compress \
  -F "file=@qa/test-data/sample-1.pdf" \
  -o compressed_result.pdf \
  -v
# 预期: 200, X-Original-Size / X-Compressed-Size 头存在

# === watermark — 正常 ===
curl -X POST http://localhost:3001/api/pdf/watermark \
  -F "file=@qa/test-data/sample-1.pdf" \
  -F 'config={"text":"机密","opacity":0.15,"rotation":45,"fontSize":48,"color":"#808080","position":"center"}' \
  -o watermarked_result.pdf
# 预期: 200, Content-Type: application/pdf

# === watermark — 异常：空水印文字 ===
curl -X POST http://localhost:3001/api/pdf/watermark \
  -F "file=@qa/test-data/sample-1.pdf" \
  -F 'config={"text":"","opacity":0.15,"rotation":45,"fontSize":48,"color":"#808080","position":"center"}'
# 预期: 400, {"error":"请提供水印文字"}
```

### 异常边界矩阵

| 场景 | 端点 | 预期 HTTP 状态 | 预期响应 |
|---|---|---|---|
| 不传文件 | merge | 400 | error 信息 |
| 仅 1 个文件 | merge | 400 | "至少需要 2 个 PDF 文件" |
| 传 50 个文件 | merge | 200 | 合并成功 |
| 传空白 PDF (0 页) | merge | 200 | 跳过空白页，正常合并 |
| 传损坏 PDF | merge | 500 | error 含文件名 |
| 不传文件 | compress | 400 | "请上传一个 PDF 文件" |
| 传 100MB 文件 | compress | 200 | 正常处理 |
| 传 101MB 文件 | compress | 500 | multer 拒绝 |
| 缺 config 字段 | watermark | 400 | "请提供水印文字" |

### 产出物
- API 测试报告
- 缺陷记录

---

## 节点 3：阶段 2-3 完成 — 前端 UI + 文件管理

**介入时机**：前端三栏布局可见、文件上传/管理功能可用

### 检查项

| 功能 | 测试点 |
|---|---|
| **打开文件** | 点击按钮 → 文件选择器弹出；选择 3 个 PDF → 全部出现在列表 |
| **拖拽上传** | 拖拽 PDF 到 Dropzone → 文件被添加 |
| **拒绝非 PDF** | 拖拽 .txt/.png → 不被接受 |
| **FileCard 渲染** | 文件名/大小/页数正确显示；长文件名截断 |
| **复选框** | 逐个勾选/取消 → 状态独立；合并按钮状态随勾选数量变化 |
| **搜索过滤** | 输入关键字 → 仅匹配的文件卡片可见；清空搜索 → 全部恢复 |
| **选中高亮** | 点击文件名 → 卡片高亮（蓝色背景+左边框）；点击另一个 → 切换 |
| **移除文件** | hover FileCard → ✕ 按钮出现；点击 → 文件从列表移除 |
| **清空全部** | 点击清空 → 所有文件移除；搜索框重置 |
| **设置按钮** | 点击 → 设置面板打开 |

### 兼容性

| 浏览器 | 版本 | 布局 | 上传 | 文件列表 |
|---|---|---|---|---|
| Chrome | 最新 | ✅/❌ | | |
| Edge | 最新 | | | |
| Firefox | 最新 | | | |

### 产出物
- UI 测试 checklist（本节点检查项表格）
- 兼容性截图（`qa/screenshots/`）

---

## 节点 4：阶段 4 完成 — PDF 查看器

**介入时机**：usePdfViewer hook 完成、Canvas 渲染可用

### 检查项

| 功能 | 测试点 |
|---|---|
| **基础渲染** | 选中文件 → Canvas 显示第一页；文字清晰可读、图片不丢失 |
| **中文 PDF** | 中文字符不乱码 |
| **翻页** | 下一页 → Canvas 更新；末页 → 下一页按钮禁用 |
| **首页** | 翻到中间页 → 首页按钮 → 回到第 1 页 |
| **跳页** | 输入页码 → 跳转到对应页；输入非法值 → 不跳转或回弹 |
| **放大** | 点击放大 → Canvas 尺寸增大；百分比显示正确 |
| **缩小** | 点击缩小 → Canvas 尺寸减小；不低于 50% |
| **预设缩放** | 点击 100% → 恢复原始大小 |
| **左旋转** | 点击左旋转 → Canvas 逆时针 90°；连续 4 次 → 恢复 |
| **右旋转** | 点击右旋转 → Canvas 顺时针 90° |
| **保存** | 点击保存 → 下载文件；用 PDF 阅读器打开 → 内容正确且包含旋转 |

### 性能

| 场景 | 指标 | 目标 |
|---|---|---|
| 10 页 PDF | 首次渲染 | < 1s |
| 100 页 PDF | 翻页响应 | < 500ms |
| 连续翻页 20 次 | 内存增长 | < 50MB |
| 缩放 3 档 | 重绘 | < 300ms |

### 产出物
- 查看器测试报告
- 性能数据

---

## 节点 5：阶段 5 完成 — 前后端联调

**介入时机**：四个工具通过 API 调用、下载流程通畅

### 端到端场景测试

#### 场景 A：合并 PDF

```
前置：准备 3 个 PDF (各 2 页)
步骤：
  1. 打开文件 → 3 个 PDF 出现在左侧列表
  2. 勾选 2 个 PDF
  3. 右侧点击「合并 PDF」→ 配置面板展开
  4. 确认勾选文件列表正确 → 点击「开始合并」
  5. 等待处理完成 → 浏览器下载 merged_xxx.pdf
  6. 用 PDF 阅读器打开 → 应包含 4 页 (2+2)
验证：
  ✅ 页数 = 原始页数之和
  ✅ 内容顺序 = 勾选文件顺序
  ✅ 无空白页、无内容丢失
```

#### 场景 B：压缩 PDF

```
前置：准备 1 个 PDF (含有图片的 5 页文件，约 5MB)
步骤：
  1. 打开文件 → 选中 → 查看器预览
  2. 右侧点击「压缩 PDF」→ 显示原文件大小
  3. 点击「开始压缩」
  4. 下载 compressed_xxx.pdf
验证：
  ✅ 压缩后文件 < 原始文件
  ✅ 页数不变 (仍为 5 页)
  ✅ 用 PDF 阅读器打开 → 内容完整
```

#### 场景 C：添加水印

```
前置：准备 1 个 PDF (3 页)
步骤：
  1. 打开文件 → 选中
  2. 右侧点击「添加水印」→ 配置面板展开
  3. 设置：文字="CONFIDENTIAL" / 透明度=20% / 旋转=45° / 字号=60 / 颜色=#cc0000 / 居中
  4. 点击「开始添加」
  5. 下载 watermarked_xxx.pdf
验证：
  ✅ 每页都有水印
  ✅ 水印位置 = 页面中央
  ✅ 水印颜色 = 红色半透明
  ✅ 水印文字 = "CONFIDENTIAL"
  ✅ 水印旋转 ≈ 45°
```

#### 场景 D：转图片

```
前置：准备 1 个 PDF (3 页)
步骤：
  1. 打开文件 → 选中
  2. 右侧点击「转为图片」→ 配置面板展开
  3. 选择格式 PNG / 缩放 2x
  4. 点击「开始转换」
  5. 下载 xxx_images.zip
验证：
  ✅ ZIP 包含 3 张 PNG
  ✅ 图片可打开，非全黑/全白
  ✅ 图片分辨率 = PDF 页面尺寸 × 2
  ✅ 图片内容清晰
```

### 异常场景

| 场景 | 预期行为 |
|---|---|
| 后端未启动时点击工具 | 前端显示错误提示（非白屏），告知用户检查后端 |
| 后端处理中途重启 | 前端显示错误提示，可重试 |
| 下载时网络断开 | 浏览器默认处理（下载失败），前端不崩溃 |
| 合并 0 个勾选文件时点合并 | 按钮应为禁用态，不可点击 |

### 产出物
- E2E 测试报告
- 自动化脚本（可选，存入 `tests/e2e/`）

---

## 节点 6：阶段 6 完成 — 发布前终验

**介入时机**：样式打磨完毕、代码冻结

### 检查项

| 项 | 内容 |
|---|---|
| **回归测试** | 重新跑节点 2-5 的全部用例，确保样式改动未破坏功能 |
| **生产构建** | `cd frontend && npm run build` → 用 `npm run preview` 验证和 dev 一致 |
| **响应式** | 窗口调到 < 1024px → 显示友好提示；调整回 > 1024px → 正常显示 |
| **暗色模式** (如已实现) | 切换暗色 → 所有文字可读、对比度足够 |

### 发布 checklist

```
[ ] 全部 4 个功能端到端通过
[ ] 前端 build 无报错
[ ] 后端 tsc --noEmit 无报错
[ ] 异常场景 4 个全部通过
[ ] 回归测试 0 新增缺陷
[ ] Chrome / Edge / Firefox 三浏览器正常
[ ] < 1024px 降级提示正常
```

### 产出物
- 发布验收报告（`qa/release-checklist.md`）

---

## 测试环境要求

| 工具 | 版本/说明 |
|---|---|
| Node.js | ≥ 18 |
| 浏览器 | Chrome 最新、Edge 最新、Firefox 最新 |
| curl | 任意（API 测试） |
| PDF 阅读器 | Adobe Acrobat Reader 或浏览器内置 |
| 截图工具 | 系统自带或浏览器 DevTools |

---

## 缺陷记录模板

每个发现的缺陷记录到 `dev_logs/YYYY-MM-DD.md`，格式：

```markdown
### 🐛 Bug: [简短标题]

- **发现节点**: 节点 X（阶段 Y）
- **严重程度**: P0(阻断) / P1(严重) / P2(一般) / P3(建议)
- **复现步骤**:
  1. ...
  2. ...
- **预期结果**: ...
- **实际结果**: ...
- **环境**: Chrome 1xx / Windows 11
- **截图**: (可选)
```
