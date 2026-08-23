import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LOCALE_META } from '@/i18n';
import { AppProvider, useApp } from '@/store/app-provider';

SplashScreen.preventAutoHideAsync();

function navigationTheme(scheme: 'light' | 'dark') {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const palette = Colors[scheme];

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.accent,
      background: palette.background,
      card: palette.background,
      text: palette.text,
      border: palette.border,
    },
  };
}

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <AppProvider>
      <ThemeProvider value={navigationTheme(scheme)}>
        <RootStack />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProvider>
  );
}

function RootStack() {
  const { hydrated, preferences } = useApp();

  /**
   * React Native only reads the RTL flag at launch, so this cannot flip the
   * layout that is already on screen — Settings tells the user to reopen the
   * app when they pick a direction-changing language. What it does is make the
   * flag agree with the stored preference, so the *next* launch is correct even
   * if the two ever drift, such as after reinstalling.
   */
  useEffect(() => {
    if (!hydrated) return;

    const shouldBeRTL = LOCALE_META[preferences.locale].rtl;

    // The browser needs telling separately: it drives bidirectional text runs —
    // Arabic sentences carrying Latin numerals and units — and gives assistive
    // technology the right language for the page.
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.dir = shouldBeRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = preferences.locale;
    }

    if (I18nManager.isRTL === shouldBeRTL) return;

    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }, [hydrated, preferences.locale]);

  // Hold the splash screen until stored preferences are in, so the first frame
  // is never a default-preferences week that then jumps to the real one.
  useEffect(() => {
    if (hydrated) void SplashScreen.hideAsync();
  }, [hydrated]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="recipe/[id]"
        options={{ title: '', headerBackButtonDisplayMode: 'minimal' }}
      />
    </Stack>
  );
}
