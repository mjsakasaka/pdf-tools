import { Badge, ActionIcon, Group, rem } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

interface FileBadgeProps {
  file: File;
  onRemove: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FileBadge({ file, onRemove }: FileBadgeProps) {
  return (
    <Badge
      size="lg"
      variant="light"
      color="blue"
      rightSection={
        <ActionIcon
          size="xs"
          variant="transparent"
          color="blue"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <IconX style={{ width: rem(14), height: rem(14) }} />
        </ActionIcon>
      }
      style={{ textTransform: 'none', paddingRight: 'var(--mantine-spacing-xs)' }}
    >
      <Group gap={rem(4)} wrap="nowrap">
        <span>{file.name}</span>
        <span style={{ opacity: 0.7 }}>({formatSize(file.size)})</span>
      </Group>
    </Badge>
  );
}
