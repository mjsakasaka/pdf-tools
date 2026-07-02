import { Group, Text, rem } from '@mantine/core';
import { Dropzone, type FileWithPath } from '@mantine/dropzone';
import { IconUpload, IconFileTypePdf, IconX } from '@tabler/icons-react';
import FileBadge from './FileBadge';

interface UploadZoneProps {
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onClearFiles: () => void;
}

export default function UploadZone({
  files,
  onFilesAdded,
  onRemoveFile,
  onClearFiles,
}: UploadZoneProps) {
  const handleDrop = (accepted: FileWithPath[]) => {
    const pdfs = accepted.filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    onFilesAdded(pdfs);
  };

  return (
    <div>
      <Dropzone
        onDrop={handleDrop}
        accept={['application/pdf']}
        maxSize={100 * 1024 * 1024}
        style={{
          border: '2px dashed var(--mantine-color-gray-4)',
          borderRadius: 'var(--mantine-radius-md)',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Group justify="center" gap="sm" style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload
              style={{ width: rem(36), height: rem(36) }}
              stroke={1.5}
              color="var(--mantine-color-blue-6)"
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{ width: rem(36), height: rem(36) }}
              stroke={1.5}
              color="var(--mantine-color-red-6)"
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFileTypePdf
              style={{ width: rem(36), height: rem(36) }}
              stroke={1.5}
              color="var(--mantine-color-gray-5)"
            />
          </Dropzone.Idle>
          <div>
            <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
              拖拽 PDF 文件到此处，或点击选择
            </Text>
            <Text size="xs" c="dimmed" opacity={0.6}>
              支持单个文件最大 100MB
            </Text>
          </div>
        </Group>
      </Dropzone>

      {files.length > 0 && (
        <div style={{ marginTop: 'var(--mantine-spacing-md)' }}>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              已上传 {files.length} 个文件
            </Text>
            <Text
              size="xs"
              c="red"
              style={{ cursor: 'pointer' }}
              onClick={onClearFiles}
            >
              清空全部
            </Text>
          </Group>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--mantine-spacing-xs)' }}>
            {files.map((file, index) => (
              <FileBadge
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => onRemoveFile(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
