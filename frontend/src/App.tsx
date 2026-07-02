import { useState, useCallback } from 'react';
import {
  Container,
  Stack,
  Title,
  Text,
  Paper,
  Notification,
  rem,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import ToolPanel from './components/ToolPanel';
import WatermarkConfig from './components/WatermarkConfig';
import ResultPanel from './components/ResultPanel';
import {
  mergePDFs,
  compressPDF,
  watermarkPDF,
  pdfToImages,
  type WatermarkOptions,
} from './pdf/operations';

export interface ProcessResult {
  blob: Blob;
  filename: string;
  originalSize?: number;
  compressedSize?: number;
}

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watermarkOpen, setWatermarkOpen] = useState(false);
  const [pendingTool, setPendingTool] = useState<string | null>(null);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearFiles = useCallback(() => {
    setFiles([]);
    setResult(null);
    setError(null);
  }, []);

  const handleAction = useCallback(
    async (tool: string) => {
      if (files.length === 0) return;

      if (tool === 'watermark') {
        setPendingTool('watermark');
        setWatermarkOpen(true);
        return;
      }

      await runTool(tool);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files]
  );

  const handleWatermarkApply = useCallback(
    async (options: WatermarkOptions) => {
      setWatermarkOpen(false);
      setPendingTool(null);
      await runTool('watermark', options);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files]
  );

  const runTool = useCallback(
    async (tool: string, options?: WatermarkOptions) => {
      if (files.length === 0) return;

      setLoading(tool);
      setError(null);
      setResult(null);

      try {
        let res: ProcessResult;

        switch (tool) {
          case 'merge': {
            const pdfBytes = await mergePDFs(files);
            res = {
              blob: new Blob([pdfBytes], { type: 'application/pdf' }),
              filename: `merged_${Date.now()}.pdf`,
            };
            break;
          }
          case 'compress': {
            const { pdfBytes, originalSize, compressedSize } =
              await compressPDF(files[0]);
            res = {
              blob: new Blob([pdfBytes], { type: 'application/pdf' }),
              filename: `compressed_${files[0].name}`,
              originalSize,
              compressedSize,
            };
            break;
          }
          case 'watermark': {
            if (!options) return;
            const pdfBytes = await watermarkPDF(files[0], options);
            res = {
              blob: new Blob([pdfBytes], { type: 'application/pdf' }),
              filename: `watermarked_${files[0].name}`,
            };
            break;
          }
          case 'toImage': {
            const { blob, filename } = await pdfToImages(files[0]);
            res = { blob, filename };
            break;
          }
          default:
            return;
        }

        setResult(res);
        // Auto-download
        downloadBlob(res.blob, res.filename);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : '处理失败，请重试';
        setError(msg);
      } finally {
        setLoading(null);
      }
    },
    [files]
  );

  const handleDownload = useCallback(() => {
    if (result) {
      downloadBlob(result.blob, result.filename);
    }
  }, [result]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mantine-color-gray-0)' }}>
      <Header />
      <Container size="md" py="xl">
        <Stack gap="lg">
          <Paper
            shadow="sm"
            p="xl"
            radius="md"
            withBorder
            style={{ background: 'white' }}
          >
            <Title order={3} mb="xs">
              📄 PDF 工具箱
            </Title>
            <Text c="dimmed" size="sm" mb="lg">
              上传 PDF 文件，使用合并、压缩、水印或转图片功能。所有处理在浏览器端完成，文件不会上传到服务器。
            </Text>

            <UploadZone
              files={files}
              onFilesAdded={handleFilesAdded}
              onRemoveFile={handleRemoveFile}
              onClearFiles={handleClearFiles}
            />

            <ToolPanel
              files={files}
              loading={loading}
              onAction={handleAction}
            />
          </Paper>

          {error && (
            <Notification
              icon={<IconX style={{ width: rem(20), height: rem(20) }} />}
              color="red"
              title="处理失败"
              onClose={() => setError(null)}
              withCloseButton
            >
              {error}
            </Notification>
          )}

          {result && (
            <ResultPanel
              result={result}
              loading={loading}
              onDownload={handleDownload}
            />
          )}
        </Stack>
      </Container>

      <WatermarkConfig
        opened={watermarkOpen}
        onClose={() => {
          setWatermarkOpen(false);
          setPendingTool(null);
        }}
        onApply={handleWatermarkApply}
      />
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default App;
