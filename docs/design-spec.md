# UI 设计规范

## 配色方案

| 用途 | 颜色 | Mantine Token |
|---|---|---|
| 主色调 | #228be6 | `blue.6` |
| 选中高亮背景 | #e7f5ff | `blue.0` |
| 选中高亮边框 | #228be6 | `blue.6` |
| 主背景 | #f8f9fa | `gray.0` |
| 查看器背景 | #f1f3f5 | `gray.1` |
| 卡片/面板背景 | #ffffff | `white` |
| 常规文字 | #495057 | `gray.7` |
| 次要文字 | #868e96 | `gray.6` |
| 分割线 | #dee2e6 | `gray.3` |
| 成功/正向 | #40c057 | `green.6` |
| 错误 | #fa5252 | `red.6` |
| 警告 | #fd7e14 | `orange.6` |

## 布局尺寸

| 区域 | 宽度 | 说明 |
|---|---|---|
| 左侧边栏 | 280px fixed | 不可拖动调整 |
| 中间查看器 | flex-1 | 自动填充剩余空间 |
| 右侧工具栏 | 320px fixed | 不可拖动调整 |
| 最小窗口宽度 | 1024px | 低于此宽度显示提示 |

## 组件样式规范

### 文件卡片 (FileCard)

```
┌──────────────────────────────┐
│ ☐ 📄 report.pdf         ✕  │  ← hover 显示 ✕
│      2.4 MB · 12 pages      │
└──────────────────────────────┘

- 选中态：blue.0 背景 + blue.6 3px 左边框
- 悬停态：gray.0 背景
- 圆角：md (8px)
- 内边距：sm (12px)
- 文件名截断：max-width 200px + text-overflow: ellipsis
```

### 工具卡片 (ToolCard)

```
┌──────────────────────────────┐
│ 🔗  合并 PDF                 │
│     将多个 PDF 合并为一个文件  │
└──────────────────────────────┘

- 禁用态：opacity 0.5 + cursor not-allowed
- 悬停态：blue.0 背景 + 轻微上浮 (translateY -1px)
- 点击：切换到配置面板
- 圆角：md (8px)
```

### 查看器工具栏

- 顶部工具栏：绝对定位，半透明白色背景 `rgba(255,255,255,0.9)`
- 底部工具栏：固定在查看器底部，半透明背景
- 按钮：Mantine ActionIcon variant="subtle"，hover 时 gray.1 背景
- 按钮间距：8px

### 搜索框

```
┌──────────────────────────────┐
│ 🔍  搜索文件...               │
└──────────────────────────────┘

- Mantine TextInput + IconSearch
- 圆角：md
- 实时过滤，无搜索按钮
```

## 图标规范

| 功能 | 图标 |
|---|---|
| PDF 文件 | IconFileTypePdf |
| 打开文件 | IconFolderOpen |
| 搜索 | IconSearch |
| 设置 | IconSettings |
| 合并 | IconFolders |
| 压缩 | IconZip |
| 水印 | IconDroplet |
| 转图片 | IconPhoto |
| 旋转 | IconRotateClockwise / IconRotate |
| 保存 | IconDeviceFloppy |
| 上一页 | IconChevronLeft |
| 下一页 | IconChevronRight |
| 缩小 | IconZoomOut |
| 放大 | IconZoomIn |
| 移除 | IconX |
| 返回 | IconArrowLeft |
| 下载 | IconDownload |

## 过渡动画

- 文件卡片选中：背景色 transition 150ms ease
- 工具面板切换：opacity + translateX transition 200ms ease
- 按钮 hover：background-color transition 150ms ease
- Canvas 旋转/缩放：即时（无动画，避免渲染压力）
