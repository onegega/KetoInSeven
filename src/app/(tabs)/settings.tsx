import { useState } from 'react';
import { Alert, I18nManager, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { ALL_RECIPES } from '@/data/recipes';
import type { DietTag, MealSlot } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { LOCALES, LOCALE_META, translate, useT, type Locale, type UIKey } from '@/i18n';
import { DAY_SHORT_KEY, DIET_KEY, SLOT_KEY } from '@/i18n/keys';
import { CARB_LIMIT_OPTIONS, DIET_ORDER, type Reminder } from '@/lib/preferences';
import { useApp } from '@/store/app-provider';

const PLANNABLE_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];
const REMINDER_TIMES = [7, 9, 12, 17, 19];

export default function SettingsScreen() {
  const t = useT();
  const { preferences, updatePreferences } = useApp();

  /**
   * Switching between a left-to-right and a right-to-left language flips the
   * whole layout, which React Native only applies on a fresh launch. The alert
   * is deliberately rendered in the language just chosen, not the one being
   * left, so it is readable to whoever asked for the change.
   */
  const changeLanguage = (next: Locale) => {
    if (next === preferences.locale) return;

    const directionChanges = LOCALE_META[preferences.locale].rtl !== LOCALE_META[next].rtl;
    updatePreferences({ locale: next });

    if (directionChanges) {
      I18nManager.allowRTL(LOCALE_META[next].rtl);
      I18nManager.forceRTL(LOCALE_META[next].rtl);
      Alert.alert(translate(next, 'alert.restartTitle'), translate(next, 'alert.restartBody'));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t('settings.title')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('settings.subtitle')}
          </ThemedText>
        </View>

        <Section title={t('settings.language')} footer={t('settings.languageFooter')}>
          <View style={styles.optionRow}>
            {LOCALES.map((locale) => (
              <OptionPill
                key={locale}
                label={LOCALE_META[locale].nativeName}
                active={preferences.locale === locale}
                onPress={() => changeLanguage(locale)}
              />
            ))}
          </View>
        </Section>

        <Section
          title={t('settings.dietaryFilters')}
          footer={t('settings.dietaryFiltersFooter')}>
          {DIET_ORDER.map((tag, index) => (
            <SwitchRow
              key={tag}
              label={t(DIET_KEY[tag])}
              value={preferences.diet.includes(tag)}
              isLast={index === DIET_ORDER.length - 1}
              onChange={(enabled) => updatePreferences({ diet: toggleTag(preferences.diet, tag, enabled) })}
            />
          ))}
        </Section>

        <Section title={t('settings.dailyNetCarbs')} footer={t('settings.dailyNetCarbsFooter')}>
          <View style={styles.optionRow}>
            {CARB_LIMIT_OPTIONS.map((limit) => (
              <OptionPill
                key={limit}
                label={t('settings.carbLimit', { count: limit })}
                active={preferences.netCarbLimit === limit}
                onPress={() => updatePreferences({ netCarbLimit: limit })}
              />
            ))}
          </View>
        </Section>

        <Section title={t('settings.mealsToPlan')}>
          <View style={styles.optionRow}>
            {PLANNABLE_SLOTS.map((slot) => (
              <OptionPill
                key={slot}
                label={t(SLOT_KEY[slot])}
                active={preferences.meals.includes(slot)}
                onPress={() => {
                  const next = toggleSlot(preferences.meals, slot);
                  // An empty week is not a useful state to be able to reach.
                  if (next.length === 0) return;
                  updatePreferences({ meals: next });
                }}
              />
            ))}
          </View>

          <SwitchRow
            label={t('settings.addSnack')}
            value={preferences.includeSnack}
            isLast
            onChange={(includeSnack) => updatePreferences({ includeSnack })}
          />
        </Section>

        <Section title={t('settings.weekStartsOn')}>
          <View style={styles.optionRow}>
            <OptionPill
              label={t('settings.monday')}
              active={preferences.weekStartsOn === 1}
              onPress={() => updatePreferences({ weekStartsOn: 1 })}
            />
            <OptionPill
              label={t('settings.sunday')}
              active={preferences.weekStartsOn === 0}
              onPress={() => updatePreferences({ weekStartsOn: 0 })}
            />
          </View>
        </Section>

        <ReminderSection />

        <Section title={t('settings.about')}>
          <View style={styles.aboutRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('settings.aboutBody', { count: ALL_RECIPES.length })}
            </ThemedText>
          </View>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function ReminderSection() {
  const t = useT();
  const { preferences, setReminder } = useApp();
  const { reminder } = preferences;
  const [pending, setPending] = useState(false);

  const applyReminder = async (patch: Partial<Reminder>) => {
    setPending(true);
    const scheduled = await setReminder({ ...reminder, ...patch });
    setPending(false);

    if (!scheduled) {
      Alert.alert(t('alert.notificationsOffTitle'), t('alert.notificationsOffBody'));
    }
  };

  return (
    <Section title={t('settings.weeklyReminder')} footer={t('settings.reminderFooter')}>
      <SwitchRow
        label={t('settings.reminderToggle')}
        value={reminder.enabled}
        disabled={pending}
        isLast={!reminder.enabled}
        onChange={(enabled) => void applyReminder({ enabled })}
      />

      {reminder.enabled && (
        <>
          <View style={styles.optionRow}>
            {DAY_SHORT_KEY.map((key: UIKey, index: number) => (
              <OptionPill
                key={key}
                label={t(key)}
                active={reminder.weekday === index}
                onPress={() => void applyReminder({ weekday: index })}
              />
            ))}
          </View>

          <View style={styles.optionRow}>
            {REMINDER_TIMES.map((hour) => (
              <OptionPill
                key={hour}
                label={`${`${hour}`.padStart(2, '0')}:00`}
                active={reminder.hour === hour}
                onPress={() => void applyReminder({ hour, minute: 0 })}
              />
            ))}
          </View>
        </>
      )}
    </Section>
  );
}

function Section({
  title,
  footer,
  children,
}: {
  title: string;
  footer?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        {title}
      </ThemedText>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {children}
      </View>

      {footer && (
        <ThemedText type="small" themeColor="textMuted" style={styles.footer}>
          {footer}
        </ThemedText>
      )}
    </View>
  );
}

function SwitchRow({
  label,
  value,
  onChange,
  isLast,
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  isLast: boolean;
  disabled?: boolean;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.switchRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
      ]}>
      <ThemedText type="small" style={styles.switchLabel}>
        {label}
      </ThemedText>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: theme.accent, false: theme.surfaceAlt }}
      />
    </View>
  );
}

function OptionPill({
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
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: active ? theme.accent : theme.surfaceAlt,
          borderColor: active ? theme.accent : theme.border,
        },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold" style={{ color: active ? theme.accentText : theme.textSecondary }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function toggleTag(tags: DietTag[], tag: DietTag, enabled: boolean): DietTag[] {
  if (enabled) return tags.includes(tag) ? tags : [...tags, tag];
  return tags.filter((existing) => existing !== tag);
}

/** Keeps the canonical breakfast → lunch → dinner order regardless of tap order. */
function toggleSlot(slots: MealSlot[], slot: MealSlot): MealSlot[] {
  const next = slots.includes(slot)
    ? slots.filter((existing) => existing !== slot)
    : [...slots, slot];

  return PLANNABLE_SLOTS.filter((candidate) => next.includes(candidate));
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.four,
  },
  header: { gap: 2 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  section: { gap: Spacing.two },
  sectionTitle: { letterSpacing: 0.8, fontSize: 11, lineHeight: 14 },
  card: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  footer: { paddingHorizontal: Spacing.half, fontSize: 12, lineHeight: 17 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 48,
  },
  switchLabel: { flex: 1, fontWeight: '600' },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: { opacity: 0.7 },
  aboutRow: { padding: Spacing.three },
});
