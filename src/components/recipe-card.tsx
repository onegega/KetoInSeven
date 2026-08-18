import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { totalMinutes, type Recipe } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { SLOT_LABELS } from '@/lib/preferences';

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

export function RecipeCard({ recipe, showSlot = true, cooked = false, onToggleCooked }: RecipeCardProps) {
  const theme = useTheme();

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
          accessibilityLabel={`${recipe.title}, ${recipe.macros.netCarbs} grams net carbs`}
          style={({ pressed }) => [styles.pressArea, pressed && styles.pressed]}>
          <View style={[styles.emojiTile, { backgroundColor: theme.accentSoft }]}>
            <ThemedText style={styles.emoji}>{recipe.emoji}</ThemedText>
          </View>

          <View style={styles.body}>
            {showSlot && (
              <ThemedText type="small" themeColor="accent" style={styles.slot}>
                {SLOT_LABELS[recipe.slot].toUpperCase()}
              </ThemedText>
            )}

            <ThemedText style={styles.title} numberOfLines={2}>
              {recipe.title}
            </ThemedText>

            <View style={styles.metaRow}>
              <Meta icon="time-outline" label={`${totalMinutes(recipe)} min`} />
              <Meta icon="flame-outline" label={`${recipe.macros.calories} kcal`} />
              <Meta icon="leaf-outline" label={`${recipe.macros.netCarbs}g net`} />
            </View>
          </View>
        </Pressable>
      </Link>

      <View style={styles.actions}>
        <SaveButton recipeId={recipe.id} />
        {onToggleCooked && (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: cooked }}
            accessibilityLabel={cooked ? 'Mark as not cooked' : 'Mark as cooked'}
            hitSlop={12}
            onPress={onToggleCooked}
            style={({ pressed }) => [styles.cookedButton, pressed && styles.pressed]}>
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    paddingRight: Spacing.two,
  },
  cardCooked: { opacity: 0.55 },
  pressArea: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
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
  actions: { paddingTop: Spacing.three, gap: Spacing.two, alignItems: 'center' },
  cookedButton: { padding: 4 },
});
