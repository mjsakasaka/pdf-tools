import { Paper, Group, Stack, Text, Button, Badge, rem } from '@mantine/core';
import { IconDownload, IconCheck, IconFileTypePdf, IconPhoto } from '@tabler/icons-react';
import type { ProcessResult } from '../App';

interface ResultPanelProps {
  result: ProcessResult;
  loading: string | null;
  onDownload: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ResultPanel({ result, loading, onDownload }: ResultPanelProps) {
  const isProcessing = loading !== null;
  const showCompression =
    result.originalSize !== undefined && result.compressedSize !== undefined;

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder style={{ background: 'white' }}>
      <Group justify="space-between" wrap="wrap">
        <Group gap="sm">
          {result.filename.endsWith('.zip') ||
          result.filename.endsWith('.png') ||
          result.filename.endsWith('.jpg') ? (
            <IconPhoto
              style={{ width: rem(24), height: rem(24) }}
              color="var(--mantine-color-orange-6)"
            />
          ) : (
            <IconFileTypePdf
              style={{ width: rem(24), height: rem(24) }}
              color="var(--mantine-color-blue-6)"
            />
          )}
          <div>
            <Group gap="xs">
              {!isProcessing && (
                <IconCheck style={{ width: rem(16), height: rem(16) }} color="green" />
              )}
              <Text size="sm" fw={500}>
                {isProcessing ? '正在处理...' : '处理完成'}
              </Text>
            </Group>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                {result.filename}
              </Text>
              {showCompression && (
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    原始: {formatSize(result.originalSize!)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    →
                  </Text>
                  <Text size="xs" c="green" fw={500}>
                    压缩后: {formatSize(result.compressedSize!)}
                  </Text>
                  <Badge size="xs" color="green" variant="light">
                    节省{' '}
                    {Math.round(
                      (1 - result.compressedSize! / result.originalSize!) * 100
                    )}
                    %
                  </Badge>
                </Group>
              )}
            </Stack>
          </div>
        </Group>
        <Button
          leftSection={<IconDownload style={{ width: rem(16), height: rem(16) }} />}
          onClick={onDownload}
          color="blue"
          size="sm"
        >
          下载文件
        </Button>
      </Group>
    </Paper>
  );
}
