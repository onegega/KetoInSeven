import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { ALL_RECIPES } from '@/data/recipes';
import type { DietTag, MealSlot } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import {
  CARB_LIMIT_OPTIONS,
  DIET_LABELS,
  DIET_ORDER,
  SLOT_LABELS,
  type Reminder,
} from '@/lib/preferences';
import { useApp } from '@/store/app-provider';
import { DAY_SHORT } from '@/lib/week';

const PLANNABLE_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];
const REMINDER_TIMES = [7, 9, 12, 17, 19];

export default function SettingsScreen() {
  const { preferences, updatePreferences } = useApp();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Settings</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Changing anything here reshuffles the week to match.
          </ThemedText>
        </View>

        <Section title="DIETARY FILTERS" footer="Only recipes matching every filter are planned.">
          {DIET_ORDER.map((tag, index) => (
            <SwitchRow
              key={tag}
              label={DIET_LABELS[tag]}
              value={preferences.diet.includes(tag)}
              isLast={index === DIET_ORDER.length - 1}
              onChange={(enabled) => updatePreferences({ diet: toggleTag(preferences.diet, tag, enabled) })}
            />
          ))}
        </Section>

        <Section
          title="DAILY NET CARBS"
          footer="Recipes are picked to fit this budget across the day. If too few match, the limit is loosened for that meal and the week says so.">
          <View style={styles.optionRow}>
            {CARB_LIMIT_OPTIONS.map((limit) => (
              <OptionPill
                key={limit}
                label={`${limit}g`}
                active={preferences.netCarbLimit === limit}
                onPress={() => updatePreferences({ netCarbLimit: limit })}
              />
            ))}
          </View>
        </Section>

        <Section title="MEALS TO PLAN">
          <View style={styles.optionRow}>
            {PLANNABLE_SLOTS.map((slot) => (
              <OptionPill
                key={slot}
                label={SLOT_LABELS[slot]}
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
            label="Add a snack of the week"
            value={preferences.includeSnack}
            isLast
            onChange={(includeSnack) => updatePreferences({ includeSnack })}
          />
        </Section>

        <Section title="WEEK STARTS ON">
          <View style={styles.optionRow}>
            <OptionPill
              label="Monday"
              active={preferences.weekStartsOn === 1}
              onPress={() => updatePreferences({ weekStartsOn: 1 })}
            />
            <OptionPill
              label="Sunday"
              active={preferences.weekStartsOn === 0}
              onPress={() => updatePreferences({ weekStartsOn: 0 })}
            />
          </View>
        </Section>

        <ReminderSection />

        <Section title="ABOUT">
          <View style={styles.aboutRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {ALL_RECIPES.length} recipes bundled with the app. Everything works offline — no
              account, no API key, no network calls.
            </ThemedText>
          </View>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function ReminderSection() {
  const { preferences, setReminder } = useApp();
  const { reminder } = preferences;
  const [pending, setPending] = useState(false);

  const applyReminder = async (patch: Partial<Reminder>) => {
    setPending(true);
    const scheduled = await setReminder({ ...reminder, ...patch });
    setPending(false);

    if (!scheduled) {
      Alert.alert(
        'Notifications are off',
        'Turn on notifications for KetoWeek in the Settings app to get the weekly reminder.'
      );
    }
  };

  return (
    <Section
      title="WEEKLY REMINDER"
      footer="A local notification — nothing leaves the device.">
      <SwitchRow
        label="Remind me when the new week lands"
        value={reminder.enabled}
        disabled={pending}
        isLast={!reminder.enabled}
        onChange={(enabled) => void applyReminder({ enabled })}
      />

      {reminder.enabled && (
        <>
          <View style={styles.optionRow}>
            {DAY_SHORT.map((day, index) => (
              <OptionPill
                key={day}
                label={day}
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
