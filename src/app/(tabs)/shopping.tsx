import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRecipeText, useTranslation, type Translator } from '@/i18n';
import { AISLE_KEY } from '@/i18n/keys';
import { getRecipe } from '@/data/recipes';
import { allPlanRecipes } from '@/lib/plan';
import {
  buildShoppingList,
  capitaliseFirst,
  countItems,
  formatAmount,
  type ShoppingItem,
} from '@/lib/shopping';
import { useApp } from '@/store/app-provider';
import { addDays, formatWeekRange, startOfWeek } from '@/lib/week';

export default function ShoppingScreen() {
  const theme = useTheme();
  const { t, meta } = useTranslation();
  const recipeText = useRecipeText();
  const { preferences, planFor, isChecked, toggleChecked, clearChecked } = useApp();
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0);

  const weekStart = useMemo(
    () => startOfWeek(addDays(new Date(), weekOffset * 7), preferences.weekStartsOn),
    [weekOffset, preferences.weekStartsOn]
  );

  const plan = useMemo(() => planFor(weekStart), [planFor, weekStart]);
  const sections = useMemo(() => {
    // Re-sorted by the translated name so the list still reads alphabetically
    // in the selected language rather than in English order.
    const built = buildShoppingList(allPlanRecipes(plan));
    return built.map((section) => ({
      ...section,
      items: [...section.items].sort((a, b) =>
        recipeText.ingredientName(a.name).localeCompare(recipeText.ingredientName(b.name), meta.tag)
      ),
    }));
  }, [plan, recipeText, meta.tag]);

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
          <ThemedText style={styles.title}>{t('shopping.title')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('shopping.subtitle', {
              range: formatWeekRange(weekStart, t),
              days: plan.days.length,
            })}
          </ThemedText>
        </View>

        <View style={[styles.segmented, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <SegmentButton
            label={t('shopping.thisWeek')}
            active={weekOffset === 0}
            onPress={() => setWeekOffset(0)}
          />
          <SegmentButton
            label={t('shopping.nextWeek')}
            active={weekOffset === 1}
            onPress={() => setWeekOffset(1)}
          />
        </View>

        <View style={[styles.progress, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.progressRow}>
            <ThemedText type="smallBold">{t('shopping.progress', { done, total })}</ThemedText>

            {done > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('shopping.resetLabel')}
                hitSlop={8}
                onPress={() => clearChecked(plan.weekId)}>
                <ThemedText type="small" themeColor="accent">
                  {t('shopping.reset')}
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
            title={t('shopping.emptyTitle')}
            body={t('shopping.emptyBody')}
          />
        ) : (
          sections.map((section) => (
            <View key={section.aisle} style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
                {t(AISLE_KEY[section.aisle]).toUpperCase()}
              </ThemedText>

              <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {section.items.map((item, index) => (
                  <ShoppingRow
                    key={item.key}
                    item={item}
                    t={t}
                    name={capitaliseFirst(recipeText.ingredientName(item.name))}
                    usedIn={item.usedIn
                      .map((id) => {
                        const used = getRecipe(id);
                        return used ? recipeText.title(used) : id;
                      })
                      .join(' · ')}
                    amount={formatAmount(item, recipeText.unit)}
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
  t,
  name,
  usedIn,
  amount,
  checked,
  onToggle,
  isLast,
}: {
  item: ShoppingItem;
  t: Translator;
  name: string;
  usedIn: string;
  amount: string;
  checked: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={`${name}, ${amount}`}
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
          {name}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted" style={styles.usedIn} numberOfLines={1}>
          {usedIn}
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
  itemName: { fontWeight: '600' },
  usedIn: { fontSize: 11, lineHeight: 15 },
});
