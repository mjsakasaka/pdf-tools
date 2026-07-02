import { Group, Title, Text, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon, IconFileTypePdf } from '@tabler/icons-react';

export default function Header() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <div
      style={{
        background: 'var(--mantine-color-blue-6)',
        padding: '0 var(--mantine-spacing-xl)',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Group gap="sm">
        <IconFileTypePdf size={28} color="white" />
        <Title order={4} c="white" style={{ letterSpacing: '-0.5px' }}>
          PDF 工具箱
        </Title>
      </Group>

      <Group gap="xs">
        <Text size="xs" c="white" opacity={0.8}>
          浏览器端处理 · 文件不上传
        </Text>
        <ActionIcon
          variant="subtle"
          color="white"
          onClick={toggleColorScheme}
          aria-label="切换主题"
        >
          {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>
      </Group>
    </div>
  );
}
