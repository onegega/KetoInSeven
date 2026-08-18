import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { MacroBar } from '@/components/macro-bar';
import { SaveButton } from '@/components/save-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { getRecipe } from '@/data/recipes';
import { totalMinutes, type Ingredient, type Recipe } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { DIET_LABELS, SLOT_LABELS } from '@/lib/preferences';
import { formatAmount } from '@/lib/shopping';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = getRecipe(id);

  if (!recipe) {
    return (
      <Screen edges={[]} underTabBar={false}>
        <EmptyState
          icon="restaurant-outline"
          title="Recipe not found"
          body="This recipe is no longer in the library. Head back to the weekly plan to pick another."
        />
      </Screen>
    );
  }

  return (
    <Screen edges={[]} underTabBar={false}>
      <Stack.Screen
        options={{
          headerRight: () => <SaveButton recipeId={recipe.id} size={24} />,
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Hero recipe={recipe} />
        <MacroCard recipe={recipe} />
        <Ingredients recipe={recipe} />
        <Method recipe={recipe} />
      </ScrollView>
    </Screen>
  );
}

function Hero({ recipe }: { recipe: Recipe }) {
  const theme = useTheme();

  return (
    <View style={styles.hero}>
      <View style={[styles.emojiTile, { backgroundColor: theme.accentSoft }]}>
        <ThemedText style={styles.emoji}>{recipe.emoji}</ThemedText>
      </View>

      <ThemedText type="small" themeColor="accent" style={styles.slot}>
        {SLOT_LABELS[recipe.slot].toUpperCase()}
      </ThemedText>

      <ThemedText style={styles.title}>{recipe.title}</ThemedText>

      <ThemedText type="small" themeColor="textSecondary" style={styles.blurb}>
        {recipe.blurb}
      </ThemedText>

      <View style={styles.metaRow}>
        <Meta icon="people-outline" label={`Serves ${recipe.servings}`} />
        <Meta icon="time-outline" label={`${totalMinutes(recipe)} min total`} />
        <Meta icon="flame-outline" label={`${recipe.cookMinutes} min cooking`} />
      </View>

      <View style={styles.chipRow}>
        {recipe.tags.map((tag) => (
          <Chip key={tag} label={tag} />
        ))}
        {recipe.diet.map((tag) => (
          <Chip key={tag} label={DIET_LABELS[tag]} tone="accent" />
        ))}
      </View>
    </View>
  );
}

function MacroCard({ recipe }: { recipe: Recipe }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.macroHeader}>
        <ThemedText type="smallBold">Per serving</ThemedText>
        <ThemedText type="smallBold" themeColor="accent">
          {recipe.macros.calories} kcal
        </ThemedText>
      </View>

      <MacroBar macros={recipe.macros} />

      <ThemedText type="small" themeColor="textMuted" style={styles.macroFootnote}>
        {`${recipe.macros.netCarbs}g net carbs · ${recipe.macros.fiber}g fibre · figures are estimates for one of ${recipe.servings} servings.`}
      </ThemedText>
    </View>
  );
}

function Ingredients({ recipe }: { recipe: Recipe }) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        INGREDIENTS
      </ThemedText>

      <View style={[styles.listCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {recipe.ingredients.map((ingredient, index) => (
          <IngredientRow
            key={`${ingredient.name}-${ingredient.unit}`}
            ingredient={ingredient}
            isLast={index === recipe.ingredients.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

function IngredientRow({ ingredient, isLast }: { ingredient: Ingredient; isLast: boolean }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.ingredientRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
      ]}>
      <View style={styles.ingredientBody}>
        <ThemedText type="small" style={styles.ingredientName}>
          {ingredient.name}
        </ThemedText>
        {ingredient.note && (
          <ThemedText type="small" themeColor="textMuted" style={styles.ingredientNote}>
            {ingredient.note}
          </ThemedText>
        )}
      </View>

      <ThemedText type="smallBold" themeColor="textSecondary">
        {formatAmount(ingredient)}
      </ThemedText>
    </View>
  );
}

function Method({ recipe }: { recipe: Recipe }) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        METHOD
      </ThemedText>

      <View style={styles.steps}>
        {recipe.steps.map((step, index) => (
          <View key={step.slice(0, 24)} style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.accentSoft }]}>
              <ThemedText type="smallBold" themeColor="accent">
                {index + 1}
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.stepText}>
              {step}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

function Meta({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={theme.textMuted} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.metaLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  hero: { gap: Spacing.two, alignItems: 'flex-start' },
  emojiTile: {
    width: 76,
    height: 76,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  emoji: { fontSize: 40, lineHeight: 48 },
  slot: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.8 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  blurb: { lineHeight: 21 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.one },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one + 1 },
  metaLabel: { fontSize: 12, lineHeight: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one + 2, marginTop: Spacing.one },
  card: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two + 4,
  },
  // Rows carry their own dividers, so this variant has no gap of its own.
  listCard: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
  },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  macroFootnote: { fontSize: 11, lineHeight: 16 },
  section: { gap: Spacing.two },
  sectionTitle: { letterSpacing: 0.8, fontSize: 11, lineHeight: 14 },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  ingredientBody: { flex: 1, gap: 1 },
  ingredientName: { fontWeight: '600', textTransform: 'capitalize' },
  ingredientNote: { fontSize: 11, lineHeight: 15 },
  steps: { gap: Spacing.three },
  step: { flexDirection: 'row', gap: Spacing.two + 4, alignItems: 'flex-start' },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, lineHeight: 22 },
});
