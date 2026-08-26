import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';
import { DAY_SHORT_KEY } from '@/i18n/keys';
import { isSameDay, toDateId } from '@/lib/week';

type DayStripProps = {
  dates: Date[];
  /** The day currently in view. */
  selectedId: string;
  onSelect: (date: Date) => void;
};

/**
 * The week as a row of day chips, with the selected day inverted to near-black.
 *
 * It jumps the list rather than filtering it. A weekly planner that shows one
 * day at a time has stopped being a weekly planner, so every day stays on the
 * page and this is a way to get to one quickly — which also means the strip can
 * never leave the user somewhere they cannot see the rest of the week.
 *
 * Today gets a ring even when it is not selected, so "where am I in the week"
 * is answerable without reading any dates.
 */
export function DayStrip({ dates, selectedId, onSelect }: DayStripProps) {
  const theme = useTheme();
  const { t, isRTL } = useTranslation();
  const today = new Date();

  /**
   * A horizontal ScrollView keeps its children in source order even under
   * `dir="rtl"`, so in Arabic the week would run Saturday-on-the-left while
   * every other row on the screen mirrors. Reversing the data is the fix that
   * works on both web and native, where the two flip for different reasons.
   */
  const ordered = isRTL ? [...dates].reverse() : dates;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {ordered.map((date) => {
        const selected = toDateId(date) === selectedId;
        const isToday = isSameDay(date, today);

        return (
          <Pressable
            key={toDateId(date)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${t(DAY_SHORT_KEY[date.getDay()])} ${date.getDate()}`}
            onPress={() => onSelect(date)}
            style={({ pressed }) => [
              styles.day,
              selected && { backgroundColor: theme.inverseSurface },
              !selected && isToday && { borderColor: theme.accent, borderWidth: 2 },
              pressed && !selected && styles.pressed,
            ]}>
            <Text style={[styles.weekday, { color: selected ? theme.inverseTextMuted : theme.textMuted }]}>
              {t(DAY_SHORT_KEY[date.getDay()]).slice(0, 2).toUpperCase()}
            </Text>
            <Text style={[styles.date, { color: selected ? theme.inverseText : theme.text }]}>
              {date.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  day: {
    width: 46,
    paddingVertical: Spacing.two,
    borderRadius: Radius.large,
    alignItems: 'center',
    gap: 1,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pressed: { opacity: 0.6 },
  weekday: { fontSize: 10, lineHeight: 13, fontWeight: '800', letterSpacing: 0.6 },
  date: { fontSize: 16, lineHeight: 21, fontWeight: '800' },
});
