import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { allPlanRecipes } from '@/lib/plan';
import { buildShoppingList, countItems, formatAmount, type ShoppingItem } from '@/lib/shopping';
import { useApp } from '@/store/app-provider';
import { addDays, formatWeekRange, startOfWeek } from '@/lib/week';

export default function ShoppingScreen() {
  const theme = useTheme();
  const { preferences, planFor, isChecked, toggleChecked, clearChecked } = useApp();
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0);

  const weekStart = useMemo(
    () => startOfWeek(addDays(new Date(), weekOffset * 7), preferences.weekStartsOn),
    [weekOffset, preferences.weekStartsOn]
  );

  const plan = useMemo(() => planFor(weekStart), [planFor, weekStart]);
  const sections = useMemo(() => buildShoppingList(allPlanRecipes(plan)), [plan]);

  const total = countItems(sections);
  const done = sections.reduce(
    (count, section) =>
      count + section.items.filter((item) => isChecked(plan.weekId, item.key)).length,
    0
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Shopping list</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatWeekRange(weekStart)} · everything for {plan.days.length} days
          </ThemedText>
        </View>

        <View style={[styles.segmented, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <SegmentButton
            label="This week"
            active={weekOffset === 0}
            onPress={() => setWeekOffset(0)}
          />
          <SegmentButton
            label="Next week"
            active={weekOffset === 1}
            onPress={() => setWeekOffset(1)}
          />
        </View>

        <View style={[styles.progress, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.progressRow}>
            <ThemedText type="smallBold">
              {done} of {total} picked up
            </ThemedText>

            {done > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear all ticks"
                hitSlop={8}
                onPress={() => clearChecked(plan.weekId)}>
                <ThemedText type="small" themeColor="accent">
                  Reset
                </ThemedText>
              </Pressable>
            )}
          </View>

          <View style={[styles.progressTrack, { backgroundColor: theme.surfaceAlt }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.accent, width: total === 0 ? '0%' : `${(done / total) * 100}%` },
              ]}
            />
          </View>
        </View>

        {sections.length === 0 ? (
          <EmptyState
            icon="cart-outline"
            title="Nothing to buy"
            body="Turn at least one meal back on in Settings and the list will fill itself in."
          />
        ) : (
          sections.map((section) => (
            <View key={section.aisle} style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
                {section.aisle.toUpperCase()}
              </ThemedText>

              <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {section.items.map((item, index) => (
                  <ShoppingRow
                    key={item.key}
                    item={item}
                    checked={isChecked(plan.weekId, item.key)}
                    onToggle={() => {
                      if (Platform.OS !== 'web') void Haptics.selectionAsync();
                      toggleChecked(plan.weekId, item.key);
                    }}
                    isLast={index === section.items.length - 1}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function ShoppingRow({
  item,
  checked,
  onToggle,
  isLast,
}: {
  item: ShoppingItem;
  checked: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const theme = useTheme();
  const amount = formatAmount(item);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={`${item.name}, ${amount}`}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <Ionicons
        name={checked ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={checked ? theme.accent : theme.textMuted}
      />

      <View style={styles.rowBody}>
        <ThemedText
          type="small"
          style={[styles.itemName, checked && { textDecorationLine: 'line-through', color: theme.textMuted }]}>
          {item.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted" style={styles.usedIn} numberOfLines={1}>
          {item.usedIn.join(' · ')}
        </ThemedText>
      </View>

      <ThemedText type="smallBold" themeColor={checked ? 'textMuted' : 'textSecondary'}>
        {amount}
      </ThemedText>
    </Pressable>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.segment, active && { backgroundColor: theme.surface }]}>
      <ThemedText type="smallBold" themeColor={active ? 'text' : 'textSecondary'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.three,
  },
  header: { gap: 2 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  segmented: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 3,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radius.small + 2,
  },
  progress: {
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTrack: { height: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radius.pill },
  section: { gap: Spacing.two },
  sectionTitle: { letterSpacing: 0.8, fontSize: 11, lineHeight: 14 },
  card: { borderRadius: Radius.large, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
  },
  pressed: { opacity: 0.6 },
  rowBody: { flex: 1, gap: 1 },
  itemName: { fontWeight: '600', textTransform: 'capitalize' },
  usedIn: { fontSize: 11, lineHeight: 15 },
});
