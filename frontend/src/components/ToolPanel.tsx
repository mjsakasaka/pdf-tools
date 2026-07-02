import { Button, Group, Tooltip, rem } from '@mantine/core';
import {
  IconFolders,
  IconZip,
  IconDroplet,
  IconPhoto,
} from '@tabler/icons-react';

interface ToolPanelProps {
  files: File[];
  loading: string | null;
  onAction: (tool: string) => void;
}

const TOOLS = [
  {
    id: 'merge',
    label: '合并 PDF',
    icon: IconFolders,
    color: 'blue',
    desc: '将多个 PDF 合并为一个文件',
    minFiles: 2,
  },
  {
    id: 'compress',
    label: '压缩 PDF',
    icon: IconZip,
    color: 'green',
    desc: '减小 PDF 文件的体积',
    minFiles: 1,
  },
  {
    id: 'watermark',
    label: '添加水印',
    icon: IconDroplet,
    color: 'violet',
    desc: '在 PDF 页面上添加文字水印',
    minFiles: 1,
  },
  {
    id: 'toImage',
    label: '转为图片',
    icon: IconPhoto,
    color: 'orange',
    desc: '将 PDF 每页转为 PNG 图片',
    minFiles: 1,
  },
];

export default function ToolPanel({ files, loading, onAction }: ToolPanelProps) {
  return (
    <div style={{ marginTop: 'var(--mantine-spacing-lg)' }}>
      <Group gap="sm" wrap="wrap">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const disabled = files.length < tool.minFiles;
          const isLoading = loading === tool.id;

          return (
            <Tooltip
              key={tool.id}
              label={
                disabled && tool.minFiles > 1
                  ? '至少需要 2 个 PDF 文件'
                  : disabled
                    ? '请先上传 PDF 文件'
                    : tool.desc
              }
              withArrow
            >
              <Button
                leftSection={<Icon style={{ width: rem(18), height: rem(18) }} />}
                color={tool.color}
                disabled={disabled}
                loading={isLoading}
                onClick={() => onAction(tool.id)}
                size="sm"
                radius="md"
                style={{ minWidth: 130 }}
              >
                {isLoading ? '处理中...' : tool.label}
              </Button>
            </Tooltip>
          );
        })}
      </Group>
    </div>
  );
}
