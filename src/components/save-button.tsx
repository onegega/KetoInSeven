import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';

export function SaveButton({ recipeId, size = 22 }: { recipeId: string; size?: number }) {
  const theme = useTheme();
  const { isSaved, toggleSaved } = useApp();
  const saved = isSaved(recipeId);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from saved recipes' : 'Save recipe'}
      // Icon-only controls are well under the 44pt minimum on their own.
      hitSlop={12}
      onPress={() => {
        if (Platform.OS !== 'web') void Haptics.selectionAsync();
        toggleSaved(recipeId);
      }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Ionicons
        name={saved ? 'heart' : 'heart-outline'}
        size={size}
        color={saved ? theme.accent : theme.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: 4, borderRadius: Radius.pill },
  pressed: { opacity: 0.5 },
});
