import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * On iOS the tab bar is a real UITabBar along the bottom and costs nothing at
 * the top of a screen. The web renderer instead floats a fixed bar across the
 * top (24px down, 40px tall, above everything) and reserves no space for it, so
 * without this the first heading of every tab sits underneath it.
 */
const WEB_TAB_BAR_INSET = Platform.OS === 'web' ? 76 : 0;

type ScreenProps = {
  children: ReactNode;
  /** Safe-area edges to pad. Bottom is normally left to the tab bar. */
  edges?: readonly Edge[];
  /** Set false for screens pushed above the tabs, which have no tab bar. */
  underTabBar?: boolean;
};

/** Themed page background plus a centred, max-width content column. */
export function Screen({ children, edges = ['top'], underTabBar = true }: ScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={edges}>
        <View style={[styles.column, underTabBar && styles.tabBarInset]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  tabBarInset: { paddingTop: WEB_TAB_BAR_INSET },
});
