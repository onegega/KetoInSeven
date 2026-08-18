import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { RecipeCard } from '@/components/recipe-card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { getRecipe } from '@/data/recipes';
import type { MealSlot, Recipe } from '@/data/types';
import { SLOT_LABELS } from '@/lib/preferences';
import { useApp } from '@/store/app-provider';

const SLOT_ORDER: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function SavedScreen() {
  const { savedIds } = useApp();

  const grouped = useMemo(() => {
    const recipes = savedIds
      .map(getRecipe)
      .filter((recipe): recipe is Recipe => recipe !== undefined);

    return SLOT_ORDER.map((slot) => ({
      slot,
      recipes: recipes.filter((recipe) => recipe.slot === slot),
    })).filter((group) => group.recipes.length > 0);
  }, [savedIds]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Saved</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {savedIds.length === 0
              ? 'Tap the heart on any recipe to keep it here.'
              : `${savedIds.length} recipe${savedIds.length === 1 ? '' : 's'} kept`}
          </ThemedText>
        </View>

        {grouped.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title="No saved recipes yet"
            body="Hearts you tap on the weekly plan show up here, grouped by meal, so a favourite is never more than one tab away."
          />
        ) : (
          grouped.map((group) => (
            <View key={group.slot} style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
                {SLOT_LABELS[group.slot].toUpperCase()}
              </ThemedText>

              <View style={styles.cards}>
                {group.recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} showSlot={false} />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
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
  cards: { gap: Spacing.two },
});
