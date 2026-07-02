# PDF 测试样本

> 以下样本需要手工收集/制作，用于各节点的手工测试。

| 文件名 | 用途 | 获取方式 |
|---|---|---|
| `single-page.pdf` | 基础功能测试 | 任意 PDF 导出一页 |
| `multi-page.pdf` | 翻页/合并测试 | 10-20 页文档 |
| `large-file.pdf` | 大文件上传限制 | > 50MB 的 PDF（扫描件/画册） |
| `encrypted.pdf` | 加密异常处理 | 任意 PDF → 设置密码保护 |
| `blank.pdf` | 边界值：0 页 | 创建空白 PDF |
| `chinese-text.pdf` | 中文渲染 | 中文文档导出 PDF |
| `scanned.pdf` | 纯图片型 PDF | 扫描仪扫描 |
| `mixed-orientation.pdf` | 横竖混合 | 合并横版+竖版 PDF |
| `corrupted.pdf` | 损坏文件 | 用记事本编辑 PDF 头部破坏 |
| `not-a-pdf.txt` | 非 PDF | 任意文本文件 |

> 注意：大于 10MB 的 PDF 文件建议用 Git LFS 管理，否则会显著增加仓库体积。
