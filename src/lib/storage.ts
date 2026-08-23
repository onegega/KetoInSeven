import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Bump this if a stored shape ever changes incompatibly — old keys are simply
 * left behind rather than migrated.
 */
const NAMESPACE = 'ketoweek/v1';

const namespaced = (key: string) => `${NAMESPACE}/${key}`;

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(namespaced(key));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // A corrupt or unreadable value should never stop the app from starting.
    return fallback;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(namespaced(key), JSON.stringify(value));
  } catch {
    // Persistence is best-effort; the in-memory state stays correct either way.
  }
}

export const StorageKeys = {
  preferences: 'preferences',
  savedRecipes: 'saved-recipes',
  shuffles: 'shuffles',
  checkedItems: 'checked-items',
  cookedMeals: 'cooked-meals',
} as const;
