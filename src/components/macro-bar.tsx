import { StyleSheet, View } from 'react-native';

import type { Macros } from '@/data/types';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

import { ThemedText } from './themed-text';

/**
 * Macros drawn by their share of *calories*, not grams. Fat carries 9 kcal/g
 * against 4 for protein and carbs, so a gram-weighted bar badly understates how
 * fat-dominant a keto day actually is.
 */
function caloricSplit(macros: Macros) {
  const fat = macros.fat * 9;
  const protein = macros.protein * 4;
  const carbs = macros.netCarbs * 4;
  const total = fat + protein + carbs;

  if (total === 0) return { fat: 0, protein: 0, carbs: 0 };

  return { fat: fat / total, protein: protein / total, carbs: carbs / total };
}

export function MacroBar({ macros, showLegend = true }: { macros: Macros; showLegend?: boolean }) {
  const theme = useTheme();
  const t = useT();
  const split = caloricSplit(macros);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
        <View style={{ flex: split.fat, backgroundColor: theme.fat }} />
        <View style={{ flex: split.protein, backgroundColor: theme.protein }} />
        <View style={{ flex: split.carbs, backgroundColor: theme.carb }} />
      </View>

      {showLegend && (
        <View style={styles.legend}>
          <LegendDot color={theme.fat} label={t('macro.fat', { count: Math.round(macros.fat) })} />
          <LegendDot
            color={theme.protein}
            label={t('macro.protein', { count: Math.round(macros.protein) })}
          />
          <LegendDot
            color={theme.carb}
            label={t('macro.netCarbs', { count: Math.round(macros.netCarbs) })}
          />
        </View>
      )}
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.legendLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.two },
  track: {
    flexDirection: 'row',
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one + 2 },
  dot: { width: 8, height: 8, borderRadius: Radius.pill },
  legendLabel: { fontSize: 12, lineHeight: 16 },
});
