import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import fs from 'node:fs/promises';

// ============================================================
// 类型定义
// ============================================================
export interface WatermarkOptions {
  text: string;
  opacity: number;
  rotation: number;
  fontSize: number;
  color: string;
  position: 'center' | 'tile';
}

// ============================================================
// hex → rgb
// ============================================================
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

// ============================================================
// 1. 合并 PDF
// ============================================================
export async function mergePDFs(filePaths: string[]): Promise<Uint8Array> {
  if (filePaths.length < 2) {
    throw new Error('至少需要 2 个 PDF 文件才能合并');
  }

  const mergedDoc = await PDFDocument.create();

  for (const filePath of filePaths) {
    const buffer = await fs.readFile(filePath);
    let sourceDoc: PDFDocument;
    try {
      sourceDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    } catch {
      const name = filePath.split(/[/\\]/).pop() || filePath;
      throw new Error(`文件 "${name}" 不是有效的 PDF 或已损坏`);
    }

    if (sourceDoc.getPageCount() === 0) continue;

    const pageIndices = sourceDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(sourceDoc, pageIndices);
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  if (mergedDoc.getPageCount() === 0) {
    throw new Error('所有 PDF 文件都没有页面');
  }

  return mergedDoc.save();
}

// ============================================================
// 2. 压缩 PDF
// ============================================================
export async function compressPDF(filePath: string): Promise<{
  pdfBytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
}> {
  const stat = await fs.stat(filePath);
  const originalSize = stat.size;
  const buffer = await fs.readFile(filePath);

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  } catch {
    const name = filePath.split(/[/\\]/).pop() || filePath;
    throw new Error(`文件 "${name}" 不是有效的 PDF 或已损坏`);
  }

  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('PDF Tools');
  doc.setCreator('');

  const pdfBytes = await doc.save({ useObjectStreams: true });

  return {
    pdfBytes,
    originalSize,
    compressedSize: pdfBytes.byteLength,
  };
}

// ============================================================
// 3. 添加水印
// ============================================================
export async function watermarkPDF(
  filePath: string,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const buffer = await fs.readFile(filePath);

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  } catch {
    const name = filePath.split(/[/\\]/).pop() || filePath;
    throw new Error(`文件 "${name}" 不是有效的 PDF 或已损坏`);
  }

  const pages = doc.getPages();
  if (pages.length === 0) {
    throw new Error('PDF 文件中没有页面');
  }

  const helveticaFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const color = hexToRgb(options.color);

  for (const page of pages) {
    const { width, height } = page.getSize();

    if (options.position === 'center') {
      const textWidth = helveticaFont.widthOfTextAtSize(options.text, options.fontSize);
      const textHeight = helveticaFont.heightAtSize(options.fontSize);
      const x = (width - textWidth) / 2;
      const y = (height - textHeight) / 2;

      page.drawText(options.text, {
        x,
        y,
        size: options.fontSize,
        font: helveticaFont,
        color: rgb(color.r, color.g, color.b),
        opacity: options.opacity,
        rotate: degrees(options.rotation),
      });
    } else if (options.position === 'tile') {
      const spacingX = width / 2;
      const spacingY = height / 2;

      for (let col = 0; col < 2; col++) {
        for (let row = 0; row < 2; row++) {
          const cx = spacingX * col + spacingX / 2;
          const cy = spacingY * row + spacingY / 2;
          const textWidth = helveticaFont.widthOfTextAtSize(options.text, options.fontSize);
          const textHeight = helveticaFont.heightAtSize(options.fontSize);

          page.drawText(options.text, {
            x: cx - textWidth / 2,
            y: cy - textHeight / 2,
            size: options.fontSize,
            font: helveticaFont,
            color: rgb(color.r, color.g, color.b),
            opacity: options.opacity,
            rotate: degrees(options.rotation),
          });
        }
      }
    }
  }

  return doc.save({ useObjectStreams: true });
}
