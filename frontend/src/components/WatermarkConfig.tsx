import { useState } from 'react';
import {
  Drawer,
  TextInput,
  Slider,
  Stack,
  Group,
  Button,
  Text,
  ColorPicker,
  Select,
  rem,
} from '@mantine/core';
import { IconDroplet } from '@tabler/icons-react';
import type { WatermarkOptions } from '../pdf/operations';

interface WatermarkConfigProps {
  opened: boolean;
  onClose: () => void;
  onApply: (options: WatermarkOptions) => void;
}

const POSITIONS = [
  { value: 'center', label: '居中' },
  { value: 'tile', label: '平铺' },
];

export default function WatermarkConfig({
  opened,
  onClose,
  onApply,
}: WatermarkConfigProps) {
  const [text, setText] = useState('机密文件');
  const [opacity, setOpacity] = useState(0.15);
  const [rotation, setRotation] = useState(45);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#808080');
  const [position, setPosition] = useState<string>('center');

  const handleApply = () => {
    if (!text.trim()) return;
    onApply({
      text: text.trim(),
      opacity,
      rotation,
      fontSize,
      color,
      position: position as WatermarkOptions['position'],
    });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconDroplet style={{ width: rem(20), height: rem(20) }} />
          <Text fw={600}>水印设置</Text>
        </Group>
      }
      position="right"
      size="sm"
      offset={8}
      radius="md"
    >
      <Stack gap="lg">
        <TextInput
          label="水印文字"
          placeholder="输入水印文字..."
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          required
        />

        <Select
          label="排列方式"
          data={POSITIONS}
          value={position}
          onChange={(v) => v && setPosition(v)}
        />

        <div>
          <Group justify="space-between" mb={4}>
            <Text size="sm" fw={500}>
              透明度
            </Text>
            <Text size="xs" c="dimmed">
              {Math.round(opacity * 100)}%
            </Text>
          </Group>
          <Slider
            value={opacity}
            onChange={setOpacity}
            min={0.05}
            max={0.5}
            step={0.01}
            marks={[
              { value: 0.1, label: '10%' },
              { value: 0.3, label: '30%' },
              { value: 0.5, label: '50%' },
            ]}
          />
        </div>

        <div>
          <Group justify="space-between" mb={4}>
            <Text size="sm" fw={500}>
              旋转角度
            </Text>
            <Text size="xs" c="dimmed">
              {rotation}°
            </Text>
          </Group>
          <Slider
            value={rotation}
            onChange={setRotation}
            min={0}
            max={90}
            step={1}
            marks={[
              { value: 0, label: '0°' },
              { value: 45, label: '45°' },
              { value: 90, label: '90°' },
            ]}
          />
        </div>

        <div>
          <Group justify="space-between" mb={4}>
            <Text size="sm" fw={500}>
              字号
            </Text>
            <Text size="xs" c="dimmed">
              {fontSize}px
            </Text>
          </Group>
          <Slider
            value={fontSize}
            onChange={setFontSize}
            min={12}
            max={120}
            step={2}
            marks={[
              { value: 24, label: '小' },
              { value: 60, label: '中' },
              { value: 120, label: '大' },
            ]}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb={4}>
            水印颜色
          </Text>
          <ColorPicker
            format="hex"
            value={color}
            onChange={(c) => setColor(c)}
            fullWidth
          />
        </div>

        <Button
          onClick={handleApply}
          disabled={!text.trim()}
          color="violet"
          fullWidth
          mt="md"
        >
          确认添加水印
        </Button>
      </Stack>
    </Drawer>
  );
}
