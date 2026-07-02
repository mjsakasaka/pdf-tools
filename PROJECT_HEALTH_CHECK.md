# 🔬 Stirling-PDF 项目体检报告

> 体检时间：2026-07-02 | 评估人：Claude Code

---

## 一、项目概况

| 项 | 值 |
|---|---|
| **项目名** | Stirling-PDF |
| **GitHub** | https://github.com/Stirling-Tools/Stirling-PDF |
| **Stars** | 85,700+ |
| **语言** | Java (Spring Boot) + TypeScript (React) |
| **版本** | 2.14.0 |
| **许可证** | 开放核心（Open Core） |
| **核心能力** | PDF 编辑、合并、拆分、签名、OCR、压缩、转换等 50+ 工具 |
| **运行方式** | Docker（推荐）/ 本地构建 / Tauri 桌面应用 |

---

## 二、技术栈分析

### 后端 (Spring Boot)
- **JDK 25** — 注意：这是最新预览版 JDK，非常新，多数机器还没有
- Spring Boot 4.0.6
- PDFBox 3.0.7（PDF 核心操作）
- LibreOffice（文档转换）
- qpdf（PDF 优化）
- 可选：Tesseract（OCR）、WeasyPrint（AI 文档生成）

### 前端 (Stirling 2.0 — 2026 年新版)
- React + TypeScript
- Vite（构建工具）
- Mantine UI（组件库）
- TailwindCSS（样式）
- PDF.js（客户端 PDF 渲染）
- PDF-LIB.js（客户端 PDF 操作）
- IndexedDB（浏览器端文件存储）

### 基础设施
- Docker 容器化
- Gradle 构建管理
- Tauri（桌面应用打包）

---

## 三、本机环境检测

| 依赖 | 需要 | 本机状态 | 判断 |
|---|---|---|---|
| **Docker** | ✅ 推荐方式 | ✅ 29.6.1 已安装 | ✅ 有 |
| **Docker Registry 连通** | ✅ 拉取镜像 | ❌ **network timeout** | ❌ 不通 |
| **Java JDK 25** | ✅ 源码构建 | ❌ 未安装 | ❌ 无 |
| **Node.js** | ✅ 前端开发 | ✅ v24.18.0 | ✅ 有 |
| **npm** | ✅ 前端依赖 | ✅ 11.16.0 | ✅ 有 |
| **磁盘空间** | 建议 > 10GB | ~84GB 可用 | ✅ 充足 |
| **内存** | 建议 > 4GB | 未检测 | ⚠️ 待确认 |

---

## 四、关键卡点分析

### 🔴 硬阻塞（无法绕过的）

| 卡点 | 说明 | 影响 |
|---|---|---|
| **Docker Registry 不通** | `registry-1.docker.io:443` 无法连接（dial tcp timeout） | ❌ 无法拉取 Docker 镜像 |
| **JDK 25 未安装** | 源码构建强制需要 JDK 25 | ❌ 无法从源码构建运行 |

### 🟡 软阻塞（可绕过或不需要的）

| 卡点 | 说明 |
|---|---|
| **无需 API Key** | Stirling-PDF 完全本地运行，0 外部服务依赖 |
| **无需数据库** | 文件存储在浏览器 IndexedDB 或本地文件系统 |
| **无需 GPU/特殊硬件** | 纯 CPU 运行 |
| **无需浏览器权限** | 标准 Web 应用，无特殊权限需求 |

---

## 五、结论

### ❌ 原项目在当前环境跑不通

两个硬阻塞：
1. **Docker Registry 网络不通** → 无法拉取官方镜像
2. **没有 JDK 25** → 无法本地编译运行

### 方案：保真降级 Demo ✅

由于网络 + Java 依赖限制，无法运行原版。按照第 6 条原则，构建**前端降级 demo**：

**保留的核心玩法：**
- 📤 上传区（拖拽 + 点击上传）
- 🔗 PDF 合并（多文件 → 一个 PDF）
- 🗜️ PDF 压缩（减小文件体积）
- 💧 加水印（文字/图片水印）
- 🖼️ PDF 转图片（每页 → PNG/JPG）

**技术选型（对齐 Stirling-PDF 2.0 前端栈）：**
- React + TypeScript + Vite
- Mantine UI 组件库
- TailwindCSS 样式
- **PDF-LIB.js** — 客户端 PDF 合并/加水印
- **PDF.js** — 客户端 PDF 渲染/转图片
- 纯浏览器端处理，零后端依赖，零网络请求

**为什么这样选：**
1. 和 Stirling-PDF 2.0 前端**完全相同的技术栈**
2. 所有操作在浏览器完成，**不依赖 Docker / Java / 外部服务**
3. PDF-LIB.js 和 PDF.js 是 Stirling-PDF 自己在用的库
4. 后续如果网络通了，可以直接对接 Stirling-PDF 后端 API
