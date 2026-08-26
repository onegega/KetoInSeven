import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

type SpeechBubbleProps = {
  children: string;
  /** Which side the little tail hangs from. */
  tail?: 'left' | 'right' | 'none';
};

/**
 * A rounded aside for the one line of encouragement or advice on a screen.
 *
 * Set in italic small-caps so it reads as a voice rather than as chrome — the
 * app talking to you, not another label. Used sparingly: two bubbles on one
 * screen and neither one is a voice any more.
 */
export function SpeechBubble({ children, tail = 'left' }: SpeechBubbleProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.bubble, { backgroundColor: theme.surface }]}>
        <ThemedText themeColor="textSecondary" style={styles.text}>
          {children}
        </ThemedText>
      </View>
      {tail !== 'none' && (
        <View
          style={[
            styles.tail,
            { backgroundColor: theme.surface },
            tail === 'left' ? styles.tailLeft : styles.tailRight,
          ]}
        />
      )}
    </View>
  );
}

const TAIL = 14;

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  bubble: {
    borderRadius: Radius.xlarge,
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: Spacing.three - 2,
  },
  text: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  /**
   * A rounded square nudged under the bubble and clipped by nothing — at this
   * corner radius it reads as a tail without needing a rotated triangle, which
   * React Native cannot border-radius cleanly.
   */
  tail: {
    position: 'absolute',
    bottom: -TAIL / 2.5,
    width: TAIL,
    height: TAIL,
    borderRadius: 5,
    transform: [{ rotate: '45deg' }],
  },
  tailLeft: { left: Spacing.four },
  tailRight: { right: Spacing.four },
});
