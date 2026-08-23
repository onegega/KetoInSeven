import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { MealSlot } from '@/data/types';
import { syncWeeklyReminder } from '@/lib/notifications';
import { buildWeeklyPlan, type WeeklyPlan } from '@/lib/plan';
import { DEFAULT_PREFERENCES, type Preferences, type Reminder } from '@/lib/preferences';
import { StorageKeys, loadJSON, saveJSON } from '@/lib/storage';
import { toDateId } from '@/lib/week';

type BooleanMap = Record<string, true>;

type AppState = {
  /** False until stored state has been read; screens show a spinner meanwhile. */
  hydrated: boolean;
  preferences: Preferences;
  updatePreferences: (patch: Partial<Preferences>) => void;
  /**
   * Persists the reminder and reschedules the local notification. Resolves
   * false when the OS refused permission, in which case the reminder is left
   * switched off.
   */
  setReminder: (reminder: Reminder) => Promise<boolean>;

  savedIds: string[];
  isSaved: (recipeId: string) => boolean;
  toggleSaved: (recipeId: string) => void;

  /** How many times the user has reshuffled a given week. */
  shuffleCount: (weekId: string) => number;
  shuffleWeek: (weekId: string) => void;
  resetWeek: (weekId: string) => void;

  isChecked: (weekId: string, itemKey: string) => boolean;
  toggleChecked: (weekId: string, itemKey: string) => void;
  clearChecked: (weekId: string) => void;

  isCooked: (dateId: string, slot: MealSlot) => boolean;
  toggleCooked: (dateId: string, slot: MealSlot) => void;

  planFor: (weekStart: Date) => WeeklyPlan;
};

const AppContext = createContext<AppState | null>(null);

const scopedKey = (scope: string, key: string) => `${scope}::${key}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [shuffles, setShuffles] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<BooleanMap>({});
  const [cooked, setCooked] = useState<BooleanMap>({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [storedPrefs, storedSaved, storedShuffles, storedChecked, storedCooked] = await Promise.all([
        loadJSON<Partial<Preferences>>(StorageKeys.preferences, {}),
        loadJSON<string[]>(StorageKeys.savedRecipes, []),
        loadJSON<Record<string, number>>(StorageKeys.shuffles, {}),
        loadJSON<BooleanMap>(StorageKeys.checkedItems, {}),
        loadJSON<BooleanMap>(StorageKeys.cookedMeals, {}),
      ]);

      if (cancelled) return;

      // Spread over the defaults so a preference added in a later version has a
      // sensible value for people upgrading.
      setPreferences({ ...DEFAULT_PREFERENCES, ...storedPrefs });
      setSavedIds(storedSaved);
      setShuffles(storedShuffles);
      setChecked(storedChecked);
      setCooked(storedCooked);
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      void saveJSON(StorageKeys.preferences, next);
      return next;
    });
  }, []);

  const setReminder = useCallback(
    async (reminder: Reminder) => {
      const scheduled = await syncWeeklyReminder(reminder);
      // Permission was refused, so leave the switch off rather than showing an
      // enabled reminder that will never fire.
      updatePreferences({ reminder: scheduled ? reminder : { ...reminder, enabled: false } });
      return scheduled;
    },
    [updatePreferences]
  );

  const toggleSaved = useCallback((recipeId: string) => {
    setSavedIds((current) => {
      const next = current.includes(recipeId)
        ? current.filter((id) => id !== recipeId)
        : [recipeId, ...current];
      void saveJSON(StorageKeys.savedRecipes, next);
      return next;
    });
  }, []);

  const shuffleWeek = useCallback((weekId: string) => {
    setShuffles((current) => {
      const next = { ...current, [weekId]: (current[weekId] ?? 0) + 1 };
      void saveJSON(StorageKeys.shuffles, next);
      return next;
    });
  }, []);

  const resetWeek = useCallback((weekId: string) => {
    setShuffles((current) => {
      const next = { ...current };
      delete next[weekId];
      void saveJSON(StorageKeys.shuffles, next);
      return next;
    });
  }, []);

  const toggleChecked = useCallback((weekId: string, itemKey: string) => {
    setChecked((current) => {
      const key = scopedKey(weekId, itemKey);
      const next = { ...current };
      if (next[key]) delete next[key];
      else next[key] = true;
      void saveJSON(StorageKeys.checkedItems, next);
      return next;
    });
  }, []);

  const clearChecked = useCallback((weekId: string) => {
    setChecked((current) => {
      const prefix = `${weekId}::`;
      const next = Object.fromEntries(
        Object.entries(current).filter(([key]) => !key.startsWith(prefix))
      ) as BooleanMap;
      void saveJSON(StorageKeys.checkedItems, next);
      return next;
    });
  }, []);

  const toggleCooked = useCallback((dateId: string, slot: MealSlot) => {
    setCooked((current) => {
      const key = scopedKey(dateId, slot);
      const next = { ...current };
      if (next[key]) delete next[key];
      else next[key] = true;
      void saveJSON(StorageKeys.cookedMeals, next);
      return next;
    });
  }, []);

  const planFor = useCallback(
    (weekStart: Date) => buildWeeklyPlan(weekStart, preferences, shuffles[toDateId(weekStart)] ?? 0),
    [preferences, shuffles]
  );

  const value = useMemo<AppState>(
    () => ({
      hydrated,
      preferences,
      updatePreferences,
      setReminder,
      savedIds,
      isSaved: (recipeId) => savedIds.includes(recipeId),
      toggleSaved,
      shuffleCount: (weekId) => shuffles[weekId] ?? 0,
      shuffleWeek,
      resetWeek,
      isChecked: (weekId, itemKey) => Boolean(checked[scopedKey(weekId, itemKey)]),
      toggleChecked,
      clearChecked,
      isCooked: (dateId, slot) => Boolean(cooked[scopedKey(dateId, slot)]),
      toggleCooked,
      planFor,
    }),
    [
      hydrated,
      preferences,
      updatePreferences,
      setReminder,
      savedIds,
      toggleSaved,
      shuffles,
      shuffleWeek,
      resetWeek,
      checked,
      toggleChecked,
      clearChecked,
      cooked,
      toggleCooked,
      planFor,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside <AppProvider>');
  return context;
}
