import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// ============================================================
// PDF.js Worker 初始化
// ============================================================
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

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
// 工具函数：File → ArrayBuffer
// ============================================================
async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`读取文件 "${file.name}" 失败`));
    reader.readAsArrayBuffer(file);
  });
}

// ============================================================
// 工具函数：hex 颜色 → pdf-lib rgb
// ============================================================
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

// ============================================================
// 工具函数：让出主线程给浏览器渲染
// ============================================================
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// ============================================================
// 1. 合并 PDF
// ============================================================
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new Error('至少需要 2 个 PDF 文件才能合并');
  }

  const mergedDoc = await PDFDocument.create();

  for (const file of files) {
    const buffer = await fileToArrayBuffer(file);
    let sourceDoc: PDFDocument;
    try {
      sourceDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    } catch {
      throw new Error(`文件 "${file.name}" 不是有效的 PDF 或已损坏`);
    }

    if (sourceDoc.getPageCount() === 0) {
      continue; // 跳过空 PDF
    }

    const pageIndices = sourceDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(sourceDoc, pageIndices);
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }

    await yieldToMain();
  }

  if (mergedDoc.getPageCount() === 0) {
    throw new Error('所有 PDF 文件都没有页面');
  }

  return mergedDoc.save();
}

// ============================================================
// 2. 压缩 PDF
// ============================================================
export async function compressPDF(file: File): Promise<{
  pdfBytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
}> {
  const buffer = await fileToArrayBuffer(file);
  const originalSize = buffer.byteLength;

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  } catch {
    throw new Error(`文件 "${file.name}" 不是有效的 PDF 或已损坏`);
  }

  // 移除元数据减小体积
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('PDF Tools');
  doc.setCreator('');

  // 使用 object streams 优化
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
  file: File,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const buffer = await fileToArrayBuffer(file);

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  } catch {
    throw new Error(`文件 "${file.name}" 不是有效的 PDF 或已损坏`);
  }

  const pages = doc.getPages();
  if (pages.length === 0) {
    throw new Error('PDF 文件中没有页面');
  }

  // 嵌入标准字体
  const helveticaFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const color = hexToRgb(options.color);

  for (const page of pages) {
    const { width, height } = page.getSize();

    if (options.position === 'center') {
      // 居中水印：文字中心位于页面中心
      const textWidth = helveticaFont.widthOfTextAtSize(
        options.text,
        options.fontSize
      );
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
      // 平铺水印：在页面上多次绘制
      const spacingX = width / 2;
      const spacingY = height / 2;

      for (let col = 0; col < 2; col++) {
        for (let row = 0; row < 2; row++) {
          const cx = spacingX * col + spacingX / 2;
          const cy = spacingY * row + spacingY / 2;
          const textWidth = helveticaFont.widthOfTextAtSize(
            options.text,
            options.fontSize
          );
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

// ============================================================
// 4. PDF 转图片
// ============================================================
export async function pdfToImages(file: File): Promise<{
  blob: Blob;
  filename: string;
}> {
  const buffer = await fileToArrayBuffer(file);

  let pdf: pdfjsLib.PDFDocumentProxy;
  try {
    const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
    pdf = await loadingTask.promise;
  } catch {
    throw new Error(`文件 "${file.name}" 不是有效的 PDF 或已损坏`);
  }

  const totalPages = pdf.numPages;
  if (totalPages === 0) {
    throw new Error('PDF 文件中没有页面');
  }

  const scale = 2; // 2x 渲染获得清晰图片

  if (totalPages === 1) {
    // 单页直接下载 PNG
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('图片生成失败'));
        },
        'image/png'
      );
    });

    return {
      blob,
      filename: file.name.replace(/\.pdf$/i, '.png'),
    };
  }

  // 多页打包为 ZIP
  const zip = new JSZip();

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error(`第 ${i} 页图片生成失败`));
        },
        'image/png'
      );
    });

    zip.file(
      `${file.name.replace(/\.pdf$/i, '')}_page_${String(i).padStart(2, '0')}.png`,
      blob
    );

    await yieldToMain();
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return {
    blob: zipBlob,
    filename: file.name.replace(/\.pdf$/i, '_images.zip'),
  };
}
