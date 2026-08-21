import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { MacroBar } from '@/components/macro-bar';
import { RecipeCard } from '@/components/recipe-card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { getRecipe } from '@/data/recipes';
import type { Recipe } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { averageDailyMacros, dayMacros, type PlannedDay, type WeeklyPlan } from '@/lib/plan';
import { useT, type Translator } from '@/i18n';
import { SLOT_KEY } from '@/i18n/keys';
import { useApp } from '@/store/app-provider';
import {
  addDays,
  formatDayAndMonth,
  formatWeekRange,
  relativeDayLabel,
  startOfWeek,
} from '@/lib/week';

export default function ThisWeekScreen() {
  const theme = useTheme();
  const t = useT();
  const { preferences, planFor, shuffleWeek, shuffleCount, isCooked, toggleCooked } = useApp();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(
    () => startOfWeek(addDays(new Date(), weekOffset * 7), preferences.weekStartsOn),
    [weekOffset, preferences.weekStartsOn]
  );

  const plan = useMemo(() => planFor(weekStart), [planFor, weekStart]);
  // Every figure on the summary card is a daily average, so they all come from
  // one source rather than mixing a per-day headline with week-long totals.
  const dailyMacros = useMemo(() => averageDailyMacros(plan), [plan]);
  const snack = plan.snackId ? getRecipe(plan.snackId) : undefined;
  const shuffles = shuffleCount(plan.weekId);

  const averageNetCarbs = Math.round(dailyMacros.netCarbs);
  const overBudget = averageNetCarbs > preferences.netCarbLimit;
  const daysOverLimit = plan.days.filter(
    (day) => dayMacros(day).netCarbs > preferences.netCarbLimit
  ).length;
  const notice = weekNotice(plan, daysOverLimit, preferences.netCarbLimit, t);

  const onShuffle = () => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    shuffleWeek(plan.weekId);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="small" themeColor="accent" style={styles.eyebrow}>
              {t(weekOffset === 0 ? 'week.thisWeek' : weekOffset === 1 ? 'week.nextWeek' : 'week.weekOf')}
            </ThemedText>
            <ThemedText style={styles.headerTitle}>{formatWeekRange(weekStart, t)}</ThemedText>
          </View>

          <View style={styles.weekNav}>
            <NavButton
              icon="chevron-back"
              label={t('week.previousWeek')}
              onPress={() => setWeekOffset((value) => value - 1)}
            />
            <NavButton
              icon="chevron-forward"
              label={t('week.nextWeekLabel')}
              onPress={() => setWeekOffset((value) => value + 1)}
            />
          </View>
        </View>

        <View style={[styles.summary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.summaryTop}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                {t('week.averagePerDay')}
              </ThemedText>
              <ThemedText style={styles.summaryValue}>
                {t('week.kcal', { count: Math.round(dailyMacros.calories) })}
              </ThemedText>
            </View>

            <View style={styles.carbBadgeWrap}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('week.netCarbs')}
              </ThemedText>
              <ThemedText
                style={[styles.summaryValue, { color: overBudget ? theme.danger : theme.accent }]}>
                {averageNetCarbs}g
                <ThemedText type="small" themeColor="textMuted">
                  {` / ${preferences.netCarbLimit}g`}
                </ThemedText>
              </ThemedText>
            </View>
          </View>

          <MacroBar macros={dailyMacros} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Shuffle this week's meals"
            onPress={onShuffle}
            style={({ pressed }) => [
              styles.shuffleButton,
              { backgroundColor: theme.accent },
              pressed && styles.pressed,
            ]}>
            <Ionicons name="shuffle" size={17} color={theme.accentText} />
            <ThemedText type="smallBold" style={{ color: theme.accentText }}>
              {shuffles === 0 ? t('week.shuffle') : t('week.shuffleAgain', { count: shuffles })}
            </ThemedText>
          </Pressable>
        </View>

        {notice && (
          <View
            style={[
              styles.notice,
              { backgroundColor: theme.surfaceAlt, borderColor: notice.serious ? theme.danger : theme.border },
            ]}>
            <Ionicons
              name={notice.serious ? 'alert-circle-outline' : 'information-circle-outline'}
              size={18}
              color={notice.serious ? theme.danger : theme.textSecondary}
            />
            <ThemedText type="small" themeColor="textSecondary" style={styles.noticeText}>
              {notice.message}
            </ThemedText>
          </View>
        )}

        {plan.days.map((day) => (
          <DaySection
            key={day.dateId}
            day={day}
            t={t}
            netCarbLimit={preferences.netCarbLimit}
            isCooked={isCooked}
            onToggleCooked={toggleCooked}
          />
        ))}

        {snack && (
          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
              {t('week.snackOfTheWeek')}
            </ThemedText>
            <RecipeCard recipe={snack} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

/**
 * At most one notice, because two stacked warnings on the first screen read as
 * noise. A diet filter that had to be ignored always wins: it means the week
 * contains food the user asked not to see.
 */
function weekNotice(
  plan: WeeklyPlan,
  daysOverLimit: number,
  netCarbLimit: number,
  t: Translator
): { message: string; serious: boolean } | null {
  if (plan.dietRelaxed.length > 0) {
    const slots = plan.dietRelaxed.map((slot) => t(SLOT_KEY[slot]).toLowerCase()).join(' / ');
    return { message: t('week.noticeDietIgnored', { slots }), serious: true };
  }

  if (daysOverLimit > 0) {
    return {
      message: t(
        daysOverLimit === 1 ? 'week.noticeOverTargetOne' : 'week.noticeOverTargetMany',
        { count: daysOverLimit, limit: netCarbLimit }
      ),
      serious: false,
    };
  }

  return null;
}

type DaySectionProps = {
  day: PlannedDay;
  t: Translator;
  netCarbLimit: number;
  isCooked: (dateId: string, slot: Recipe['slot']) => boolean;
  onToggleCooked: (dateId: string, slot: Recipe['slot']) => void;
};

function DaySection({ day, t, netCarbLimit, isCooked, onToggleCooked }: DaySectionProps) {
  const theme = useTheme();
  const macros = dayMacros(day);
  const over = macros.netCarbs > netCarbLimit;
  const label = relativeDayLabel(day.date, t);

  return (
    <View style={styles.section}>
      <View style={styles.dayHeader}>
        <View style={styles.dayHeading}>
          <ThemedText type="smallBold" style={styles.dayLabel}>
            {label.toUpperCase()}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {formatDayAndMonth(day.date, t)}
          </ThemedText>
        </View>

        <Chip
          label={t('week.netCarbsChip', { count: Math.round(macros.netCarbs) })}
          tone={over ? 'neutral' : 'accent'}
        />
      </View>

      <View style={[styles.dayRule, { backgroundColor: theme.border }]} />

      <View style={styles.cards}>
        {day.meals.map((meal) => {
          const recipe = getRecipe(meal.recipeId);
          if (!recipe) return null;

          return (
            <RecipeCard
              key={`${day.dateId}-${meal.slot}`}
              recipe={recipe}
              cooked={isCooked(day.dateId, meal.slot)}
              onToggleCooked={() => onToggleCooked(day.dateId, meal.slot)}
            />
          );
        })}
      </View>
    </View>
  );
}

function NavButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navButton,
        { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <Ionicons name={icon} size={18} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.four,
  },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.three },
  headerText: { flex: 1, gap: 2 },
  eyebrow: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.8 },
  headerTitle: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  weekNav: { flexDirection: 'row', gap: Spacing.two },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryValue: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  carbBadgeWrap: { alignItems: 'flex-end' },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + 4,
    borderRadius: Radius.medium,
  },
  pressed: { opacity: 0.7 },
  notice: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  noticeText: { flex: 1 },
  section: { gap: Spacing.two },
  sectionTitle: { letterSpacing: 0.8, fontSize: 11, lineHeight: 14 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayHeading: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  dayLabel: { letterSpacing: 0.8, fontSize: 13 },
  dayRule: { height: StyleSheet.hairlineWidth, marginBottom: Spacing.one },
  cards: { gap: Spacing.two },
});
