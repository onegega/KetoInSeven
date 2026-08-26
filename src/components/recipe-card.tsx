import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, SLOT_COLOR, Spacing } from '@/constants/theme';
import { totalMinutes, type Recipe } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useRecipeText, useT } from '@/i18n';
import { SLOT_KEY } from '@/i18n/keys';

import { SaveButton } from './save-button';
import { Tag } from './tag';
import { ThemedText } from './themed-text';

type RecipeCardProps = {
  recipe: Recipe;
  /** Shown above the title, e.g. "Breakfast". Hidden on lists already grouped by slot. */
  showSlot?: boolean;
  /** Strikes the title through and marks the card done. */
  cooked?: boolean;
  onToggleCooked?: () => void;
};

/**
 * Layout note: the `Pressable` under `Link asChild` deliberately carries no
 * style of its own.
 *
 * `asChild` renders through Radix's `Slot`, which merges the child's `style`
 * into its own with an object spread. Spreading a style *function* (the form
 * `Pressable` uses for press state) yields `{}`, and spreading an *array*
 * yields `{0: …, 1: …}` — either way the styles are silently dropped and the
 * row collapses into a column on web. Only a plain object survives, which is
 * too sharp an edge to build on, so all layout lives on the inner view and the
 * press state is tracked by hand.
 *
 * The right-hand rail sits outside the link for the same reason it always did:
 * its buttons are their own targets, and the link stays one uninterrupted
 * rectangle. It is absolutely positioned so it can run the full height of the
 * card and carry the divider, whatever the title wraps to.
 */
export function RecipeCard({ recipe, showSlot = true, cooked = false, onToggleCooked }: RecipeCardProps) {
  const theme = useTheme();
  const t = useT();
  const recipeText = useRecipeText();
  const [pressed, setPressed] = useState(false);
  const title = recipeText.title(recipe);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <Link href={{ pathname: '/recipe/[id]', params: { id: recipe.id } }} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('card.a11yRecipe', { title, count: recipe.macros.netCarbs })}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}>
          <View style={[styles.pressArea, pressed && styles.pressed]}>
            <View style={[styles.emojiTile, { backgroundColor: theme.accentSoft }]}>
              <ThemedText style={styles.emoji}>{recipe.emoji}</ThemedText>
            </View>

            <View style={styles.body}>
              <ThemedText
                style={[styles.title, cooked && styles.titleCooked]}
                themeColor={cooked ? 'textSecondary' : 'text'}
                numberOfLines={2}>
                {title}
              </ThemedText>

              {/* One tag, and done outranks the slot: a cooked meal's status is
                  the more useful of the two once the week is under way. */}
              {cooked ? (
                <Tag label={t('card.done')} color="accent" icon="checkmark-circle" />
              ) : (
                showSlot && (
                  <Tag label={t(SLOT_KEY[recipe.slot])} color={SLOT_COLOR[recipe.slot]} icon="ellipse" />
                )
              )}

              <View style={styles.metaRow}>
                <Meta icon="time-outline" label={t('card.minutes', { count: totalMinutes(recipe) })} />
                <Meta icon="flame-outline" label={t('card.kcal', { count: recipe.macros.calories })} />
              </View>
            </View>
          </View>
        </Pressable>
      </Link>

      <View style={[styles.rail, { borderLeftColor: theme.border }]}>
        <View style={styles.actions}>
          <SaveButton recipeId={recipe.id} />
          {onToggleCooked && (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: cooked }}
              accessibilityLabel={t(cooked ? 'card.markNotCooked' : 'card.markCooked')}
              hitSlop={10}
              onPress={onToggleCooked}
              style={({ pressed: tapped }) => [styles.cookedButton, tapped && styles.pressed]}>
              <Ionicons
                name={cooked ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={cooked ? theme.accent : theme.textMuted}
              />
            </Pressable>
          )}
        </View>

        {/* The one number a keto planner exists to show, given the whole rail. */}
        <View style={styles.metric}>
          <ThemedText style={styles.metricValue}>
            {t('card.netCarbsValue', { count: recipe.macros.netCarbs })}
          </ThemedText>
          <ThemedText themeColor="textMuted" style={styles.metricCaption} numberOfLines={2}>
            {t('card.netCarbsCaption')}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

function Meta({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={13} color={theme.textMuted} />
      <ThemedText themeColor="textSecondary" style={styles.metaLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

/** Width of the right-hand rail, reserved as padding inside the press area. */
const RAIL = 88;

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    // Anchors the absolutely positioned rail.
    position: 'relative',
    overflow: 'hidden',
  },
  pressArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three - 2,
    padding: Spacing.three,
    paddingRight: RAIL + Spacing.two,
  },
  pressed: { opacity: 0.6 },
  emojiTile: {
    width: 48,
    height: 48,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 24, lineHeight: 30 },
  body: { flex: 1, gap: Spacing.one },
  title: { fontSize: 16, lineHeight: 21, fontWeight: '700' },
  titleCooked: { textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two + 2, marginTop: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaLabel: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  rail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: RAIL,
    borderLeftWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  cookedButton: { padding: 2 },
  metric: { alignItems: 'center' },
  metricValue: { fontSize: 19, lineHeight: 24, fontWeight: '800' },
  metricCaption: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
