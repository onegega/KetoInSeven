import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { MacroBar } from '@/components/macro-bar';
import { SaveButton } from '@/components/save-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, SLOT_COLOR, Spacing } from '@/constants/theme';
import { getRecipe } from '@/data/recipes';
import { totalMinutes, type Ingredient, type Recipe } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useRecipeText, useT, type RecipeTranslator, type Translator } from '@/i18n';
import { DIET_KEY, SLOT_KEY } from '@/i18n/keys';
import { capitaliseFirst, formatAmount } from '@/lib/shopping';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const recipeText = useRecipeText();
  const recipe = getRecipe(id);

  if (!recipe) {
    return (
      <Screen edges={[]} underTabBar={false}>
        <EmptyState
          icon="restaurant-outline"
          title={t('recipe.notFoundTitle')}
          body={t('recipe.notFoundBody')}
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
        <Hero recipe={recipe} t={t} recipeText={recipeText} />
        <MacroCard recipe={recipe} t={t} />
        <Ingredients recipe={recipe} t={t} recipeText={recipeText} />
        <Method recipe={recipe} t={t} recipeText={recipeText} />
      </ScrollView>
    </Screen>
  );
}

function Hero({
  recipe,
  t,
  recipeText,
}: {
  recipe: Recipe;
  t: Translator;
  recipeText: RecipeTranslator;
}) {
  const theme = useTheme();

  return (
    <View style={styles.hero}>
      <View style={[styles.emojiTile, { backgroundColor: theme.accentSoft }]}>
        <ThemedText style={styles.emoji}>{recipe.emoji}</ThemedText>
      </View>

      <ThemedText type="small" themeColor={SLOT_COLOR[recipe.slot]} style={styles.slot}>
        {t(SLOT_KEY[recipe.slot]).toUpperCase()}
      </ThemedText>

      <ThemedText style={styles.title}>{recipeText.title(recipe)}</ThemedText>

      <ThemedText type="small" themeColor="textSecondary" style={styles.blurb}>
        {recipeText.blurb(recipe)}
      </ThemedText>

      <View style={styles.metaRow}>
        <Meta icon="people-outline" label={t('recipe.serves', { count: recipe.servings })} />
        <Meta icon="time-outline" label={t('recipe.totalMinutes', { count: totalMinutes(recipe) })} />
        <Meta
          icon="flame-outline"
          label={t('recipe.cookingMinutes', { count: recipe.cookMinutes })}
        />
      </View>

      <View style={styles.chipRow}>
        {recipe.tags.map((tag) => (
          <Chip key={tag} label={recipeText.tag(tag)} />
        ))}
        {recipe.diet.map((tag) => (
          <Chip key={tag} label={t(DIET_KEY[tag])} tone="accent" />
        ))}
      </View>
    </View>
  );
}

function MacroCard({ recipe, t }: { recipe: Recipe; t: Translator }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.macroHeader}>
        <ThemedText type="smallBold">{t('recipe.perServing')}</ThemedText>
        <ThemedText type="smallBold" themeColor="accent">
          {t('card.kcal', { count: recipe.macros.calories })}
        </ThemedText>
      </View>

      <MacroBar macros={recipe.macros} />

      <ThemedText type="small" themeColor="textMuted" style={styles.macroFootnote}>
        {t('recipe.macroFootnote', {
          netCarbs: recipe.macros.netCarbs,
          fiber: recipe.macros.fiber,
          servings: recipe.servings,
        })}
      </ThemedText>
    </View>
  );
}

function Ingredients({
  recipe,
  t,
  recipeText,
}: {
  recipe: Recipe;
  t: Translator;
  recipeText: RecipeTranslator;
}) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        {t('recipe.ingredients')}
      </ThemedText>

      <View style={[styles.listCard, { backgroundColor: theme.surface }]}>
        {recipe.ingredients.map((ingredient, index) => (
          <IngredientRow
            key={`${ingredient.name}-${ingredient.unit}`}
            ingredient={ingredient}
            recipeText={recipeText}
            isLast={index === recipe.ingredients.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

function IngredientRow({
  ingredient,
  recipeText,
  isLast,
}: {
  ingredient: Ingredient;
  recipeText: RecipeTranslator;
  isLast: boolean;
}) {
  const theme = useTheme();
  const translated = recipeText.ingredient(ingredient);

  return (
    <View
      style={[
        styles.ingredientRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
      ]}>
      <View style={styles.ingredientBody}>
        <ThemedText type="small" style={styles.ingredientName}>
          {capitaliseFirst(translated.name)}
        </ThemedText>
        {translated.note && (
          <ThemedText type="small" themeColor="textMuted" style={styles.ingredientNote}>
            {translated.note}
          </ThemedText>
        )}
      </View>

      <ThemedText type="smallBold" themeColor="textSecondary">
        {formatAmount(ingredient, recipeText.unit)}
      </ThemedText>
    </View>
  );
}

function Method({
  recipe,
  t,
  recipeText,
}: {
  recipe: Recipe;
  t: Translator;
  recipeText: RecipeTranslator;
}) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        {t('recipe.method')}
      </ThemedText>

      <View style={styles.steps}>
        {recipeText.steps(recipe).map((step, index) => (
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
    borderRadius: Radius.xlarge,
    padding: Spacing.three,
    gap: Spacing.two + 4,
  },
  // Rows carry their own dividers, so this variant has no gap of its own.
  listCard: {
    borderRadius: Radius.xlarge,
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
  ingredientName: { fontWeight: '600' },
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
