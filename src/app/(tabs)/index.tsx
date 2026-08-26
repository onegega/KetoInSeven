import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { DayStrip } from '@/components/day-strip';
import { MacroBar } from '@/components/macro-bar';
import { RecipeCard } from '@/components/recipe-card';
import { Screen } from '@/components/screen';
import { SpeechBubble } from '@/components/speech-bubble';
import { Tag } from '@/components/tag';
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
  isSameDay,
  relativeDayLabel,
  startOfWeek,
  toDateId,
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

  // The strip jumps the list rather than filtering it, so it needs each day's
  // offset within the scroll view. Sections report their own y as they lay out.
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Record<string, number>>({});
  const today = plan.days.find((day) => isSameDay(day.date, new Date()));
  const [selectedId, setSelectedId] = useState(() => toDateId(today?.date ?? plan.days[0].date));

  const jumpTo = useCallback((date: Date) => {
    const id = toDateId(date);
    setSelectedId(id);
    const y = offsets.current[id];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(y - Spacing.three, 0), animated: true });
  }, []);

  const onShuffle = () => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    shuffleWeek(plan.weekId);
  };

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText themeColor="textMuted" style={styles.eyebrow}>
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

        {/* Full-bleed: the strip should run off both edges as it scrolls, which
            means cancelling the content column's own horizontal padding. */}
        <View style={styles.bleed}>
          <DayStrip
            dates={plan.days.map((day) => day.date)}
            selectedId={selectedId}
            onSelect={jumpTo}
          />
        </View>

        <SpeechBubble>
          {t(overBudget ? 'week.bubbleOver' : 'week.bubbleUnder', {
            count: averageNetCarbs,
            limit: preferences.netCarbLimit,
          })}
        </SpeechBubble>

        <View style={[styles.summary, { backgroundColor: theme.surface }]}>
          <View style={styles.summaryTop}>
            <View>
              <ThemedText themeColor="textSecondary" style={styles.summaryLabel}>
                {t('week.averagePerDay')}
              </ThemedText>
              <ThemedText style={styles.summaryValue}>
                {t('week.kcal', { count: Math.round(dailyMacros.calories) })}
              </ThemedText>
            </View>

            <View style={styles.carbBadgeWrap}>
              <ThemedText themeColor="textSecondary" style={styles.summaryLabel}>
                {t('week.netCarbs')}
              </ThemedText>
              <ThemedText
                style={[styles.summaryValue, { color: overBudget ? theme.danger : theme.accent }]}>
                {t('week.netCarbsValue', { count: averageNetCarbs })}
                <ThemedText themeColor="textMuted" style={styles.summaryTarget}>
                  {t('week.netCarbsTarget', { count: preferences.netCarbLimit })}
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
            <Ionicons name="shuffle" size={18} color={theme.accentText} />
            <ThemedText style={[styles.shuffleLabel, { color: theme.accentText }]}>
              {shuffles === 0 ? t('week.shuffle') : t('week.shuffleAgain', { count: shuffles })}
            </ThemedText>
          </Pressable>
        </View>

        {notice && (
          <View style={[styles.notice, { backgroundColor: theme.surface }]}>
            <View
              style={[
                styles.noticeStripe,
                { backgroundColor: notice.serious ? theme.danger : theme.textMuted },
              ]}
            />
            <Ionicons
              name={notice.serious ? 'alert-circle' : 'information-circle'}
              size={18}
              color={notice.serious ? theme.danger : theme.textSecondary}
            />
            <ThemedText themeColor="textSecondary" style={styles.noticeText}>
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
            onLayoutY={(y) => {
              offsets.current[day.dateId] = y;
            }}
          />
        ))}

        {snack && (
          <View style={styles.section}>
            <ThemedText themeColor="textMuted" style={styles.sectionTitle}>
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
  onLayoutY: (y: number) => void;
};

function DaySection({ day, t, netCarbLimit, isCooked, onToggleCooked, onLayoutY }: DaySectionProps) {
  const macros = dayMacros(day);
  const over = macros.netCarbs > netCarbLimit;
  const label = relativeDayLabel(day.date, t);

  return (
    <View style={styles.section} onLayout={(event) => onLayoutY(event.nativeEvent.layout.y)}>
      <View style={styles.dayHeader}>
        <View style={styles.dayHeading}>
          <ThemedText style={styles.dayLabel}>{label}</ThemedText>
          <ThemedText themeColor="textMuted" style={styles.dayDate}>
            {formatDayAndMonth(day.date, t)}
          </ThemedText>
        </View>

        <Tag
          label={t('week.netCarbsChip', { count: Math.round(macros.netCarbs) })}
          color={over ? 'danger' : 'accent'}
          icon={over ? 'alert-circle' : 'leaf'}
          filled
        />
      </View>

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
        { backgroundColor: theme.surface },
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
  bleed: { marginHorizontal: -Spacing.three },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerText: { flex: 1, gap: 2 },
  eyebrow: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: 1 },
  headerTitle: { fontSize: 27, lineHeight: 33, fontWeight: '800', letterSpacing: -0.4 },
  weekNav: { flexDirection: 'row', gap: Spacing.two },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    borderRadius: Radius.xlarge,
    padding: Spacing.three + 2,
    gap: Spacing.three,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryLabel: { fontSize: 11, lineHeight: 15, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase' },
  summaryValue: { fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.5 },
  summaryTarget: { fontSize: 13, lineHeight: 18, fontWeight: '700' },
  carbBadgeWrap: { alignItems: 'flex-end' },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three - 2,
    borderRadius: Radius.medium,
  },
  shuffleLabel: { fontSize: 15, lineHeight: 20, fontWeight: '800' },
  pressed: { opacity: 0.7 },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    paddingLeft: Spacing.three + 4,
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
  noticeStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: 1 },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.half,
  },
  dayHeading: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  dayLabel: { fontSize: 18, lineHeight: 23, fontWeight: '800', letterSpacing: -0.2 },
  dayDate: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  cards: { gap: Spacing.two },
});
