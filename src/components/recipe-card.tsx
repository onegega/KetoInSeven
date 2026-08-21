import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { totalMinutes, type Recipe } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useRecipeText, useT } from '@/i18n';
import { SLOT_KEY } from '@/i18n/keys';

import { SaveButton } from './save-button';
import { ThemedText } from './themed-text';

type RecipeCardProps = {
  recipe: Recipe;
  /** Shown above the title, e.g. "Breakfast". Hidden on lists already grouped by slot. */
  showSlot?: boolean;
  /** Renders a tick and dims the card. */
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
 */
export function RecipeCard({ recipe, showSlot = true, cooked = false, onToggleCooked }: RecipeCardProps) {
  const theme = useTheme();
  const t = useT();
  const recipeText = useRecipeText();
  const [pressed, setPressed] = useState(false);
  const title = recipeText.title(recipe);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        cooked && styles.cardCooked,
      ]}>
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
              {showSlot && (
                <ThemedText type="small" themeColor="accent" style={styles.slot}>
                  {t(SLOT_KEY[recipe.slot]).toUpperCase()}
                </ThemedText>
              )}

              <ThemedText style={styles.title} numberOfLines={2}>
                {title}
              </ThemedText>

              <View style={styles.metaRow}>
                <Meta icon="time-outline" label={t('card.minutes', { count: totalMinutes(recipe) })} />
                <Meta icon="flame-outline" label={t('card.kcal', { count: recipe.macros.calories })} />
                <Meta icon="leaf-outline" label={t('card.netCarbs', { count: recipe.macros.netCarbs })} />
              </View>
            </View>
          </View>
        </Pressable>
      </Link>

      {/* Floated above the press area so the link stays one uninterrupted target. */}
      <View style={styles.actions}>
        <SaveButton recipeId={recipe.id} />
        {onToggleCooked && (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: cooked }}
            accessibilityLabel={t(cooked ? 'card.markNotCooked' : 'card.markCooked')}
            hitSlop={12}
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
    </View>
  );
}

function Meta({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={13} color={theme.textMuted} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.metaLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

/** Width reserved on the right of the press area for the floating actions. */
const ACTIONS_GUTTER = 52;

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    // Anchors the absolutely positioned actions column.
    position: 'relative',
  },
  cardCooked: { opacity: 0.55 },
  pressArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    paddingRight: ACTIONS_GUTTER,
  },
  pressed: { opacity: 0.6 },
  emojiTile: {
    width: 52,
    height: 52,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26, lineHeight: 32 },
  body: { flex: 1, gap: 2 },
  slot: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.6 },
  title: { fontWeight: '700', lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two + 4, marginTop: Spacing.one },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaLabel: { fontSize: 12, lineHeight: 16 },
  actions: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.two,
    alignItems: 'center',
    gap: Spacing.two,
  },
  cookedButton: { padding: 4 },
});
