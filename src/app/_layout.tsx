import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  const { hydrated } = useApp();

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
