import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

type ChipProps = {
  label: string;
  /** Filled chips carry the accent colour; use for the one thing that matters most. */
  tone?: 'neutral' | 'accent';
};

export function Chip({ label, tone = 'neutral' }: ChipProps) {
  const theme = useTheme();
  const accent = tone === 'accent';

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: accent ? theme.accentSoft : theme.surfaceAlt,
          borderColor: accent ? theme.accent : theme.border,
        },
      ]}>
      <ThemedText type="small" style={styles.label} themeColor={accent ? 'accent' : 'textSecondary'}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
});
