import { Router, type Request, type Response } from 'express';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';
import { mergePDFs, compressPDF, watermarkPDF } from '../services/pdfOperations.js';
import type { WatermarkOptions } from '../services/pdfOperations.js';
import fs from 'node:fs/promises';

const router = Router();

// ============================================================
// POST /api/pdf/merge — 合并多个 PDF
// ============================================================
router.post('/merge', (req: Request, res: Response) => {
  uploadMultiple(req, res, async (err) => {
    try {
      if (err) throw err;

      const files = req.files as Express.Multer.File[];
      if (!files || files.length < 2) {
        res.status(400).json({ error: '至少需要 2 个 PDF 文件' });
        return;
      }

      const filePaths = files.map((f) => f.path);
      const pdfBytes = await mergePDFs(filePaths);

      // 清理临时文件
      const cleanups = filePaths.map((p) => fs.unlink(p).catch(() => {}));

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="merged_${Date.now()}.pdf"`
      );
      res.send(Buffer.from(pdfBytes));

      await Promise.all(cleanups);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '合并失败';
      res.status(500).json({ error: msg });
    }
  });
});

// ============================================================
// POST /api/pdf/compress — 压缩单个 PDF
// ============================================================
router.post('/compress', (req: Request, res: Response) => {
  uploadSingle(req, res, async (err) => {
    try {
      if (err) throw err;

      const file = req.file as Express.Multer.File;
      if (!file) {
        res.status(400).json({ error: '请上传一个 PDF 文件' });
        return;
      }

      const { pdfBytes, originalSize, compressedSize } = await compressPDF(file.path);

      await fs.unlink(file.path).catch(() => {});

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="compressed_${file.originalname}"`
      );
      res.setHeader('X-Original-Size', String(originalSize));
      res.setHeader('X-Compressed-Size', String(compressedSize));
      res.send(Buffer.from(pdfBytes));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '压缩失败';
      res.status(500).json({ error: msg });
    }
  });
});

// ============================================================
// POST /api/pdf/watermark — 添加水印
// ============================================================
router.post('/watermark', (req: Request, res: Response) => {
  uploadSingle(req, res, async (err) => {
    try {
      if (err) throw err;

      const file = req.file as Express.Multer.File;
      if (!file) {
        res.status(400).json({ error: '请上传一个 PDF 文件' });
        return;
      }

      // 从 body 中解析水印配置 (stringified JSON)
      const options: WatermarkOptions = JSON.parse(req.body.config || '{}');
      if (!options.text) {
        res.status(400).json({ error: '请提供水印文字' });
        return;
      }

      const pdfBytes = await watermarkPDF(file.path, options);
      await fs.unlink(file.path).catch(() => {});

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="watermarked_${file.originalname}"`
      );
      res.send(Buffer.from(pdfBytes));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '添加水印失败';
      res.status(500).json({ error: msg });
    }
  });
});

export default router;
