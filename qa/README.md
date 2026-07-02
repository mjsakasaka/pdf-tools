# QA — 测试工程文件

> 本目录存放测试工程师相关的手工文件，区别于 `tests/`（自动化测试代码）。

## 目录结构

```
qa/
├── README.md                     ← 本文件
├── test-intervention-guide.md    ← 测试工程师介入节点指南
├── test-data/                    ← PDF 测试样本（手工收集）
│   ├── README.md
│   ├── single-page.pdf
│   ├── multi-page.pdf
│   ├── large-file.pdf
│   ├── chinese-text.pdf
│   ├── scanned.pdf
│   └── corrupted.pdf
├── test-cases/                   ← 手工测试用例
│   └── manual-test-cases.xlsx
├── screenshots/                  ← 兼容性截图 / 缺陷截图
└── reports/                      ← 测试报告存档
    └── 2026-07-XX-api-test.md
```

## 与 tests/ 的区别

| 维度 | `qa/` | `tests/` |
|---|---|---|
| 内容 | 手工测试文件、文档、数据 | 自动化测试代码 |
| 格式 | .md .pdf .xlsx .png | .ts .tsx .spec.ts |
| 执行方式 | 人工手动 | CI / npm test |
| 版本控制 | ✅ 纳入 git | ✅ 纳入 git |
| 大文件 | test-data/*.pdf 考虑用 Git LFS | 不适用 |
