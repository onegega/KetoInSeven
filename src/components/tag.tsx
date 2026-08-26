import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

type TagProps = {
  label: string;
  /** Which palette entry colours the label and its glyph. */
  color?: ThemeColor;
  /** A small leading glyph. The reference language marks every tag with one. */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Filled tags get a tinted bed; bare tags are just coloured text. */
  filled?: boolean;
};

/**
 * The small uppercase status marker that sits under a title.
 *
 * Bare by default, because a card already has a fill of its own and a second
 * filled shape inside it turns a calm row into a busy one. `filled` is for the
 * few tags that need to survive on the page background.
 */
export function Tag({ label, color = 'textSecondary', icon, filled = false }: TagProps) {
  const theme = useTheme();

  return (
    <View style={[styles.tag, filled && styles.filled, filled && { backgroundColor: theme.surfaceAlt }]}>
      {icon && <Ionicons name={icon} size={11} color={theme[color]} />}
      <ThemedText themeColor={color} style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  filled: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
});
