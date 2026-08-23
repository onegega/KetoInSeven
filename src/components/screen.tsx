import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The web tab bar is a fixed overlay that reserves no space, so screens have to
 * leave room for it themselves. global.css moves it to the bottom of the
 * viewport to match iOS, which is why this is bottom padding.
 *
 * On iOS the real UITabBar is already accounted for by BottomTabInset in each
 * screen's scroll padding, so this is zero there.
 */
const WEB_TAB_BAR_INSET = Platform.OS === 'web' ? 72 : 0;

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
  tabBarInset: { paddingBottom: WEB_TAB_BAR_INSET },
});
