/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  // useColorScheme resolves to null when the platform has no preference.
  return Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
