import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: ReactNode;
  /** Safe-area edges to pad. Bottom is normally left to the tab bar. */
  edges?: readonly Edge[];
};

/** Themed page background plus a centred, max-width content column. */
export function Screen({ children, edges = ['top'] }: ScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={edges}>
        <View style={styles.column}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
});
