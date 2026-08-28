import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useT } from '@/i18n';

export default function TabsLayout() {
  const t = useT();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = Colors[scheme];

  /**
   * The tab bar is dark in *both* schemes — ink in light mode, the card colour
   * in dark — so every colour drawn on it comes from the dark palette,
   * whichever scheme the user is in. That is what makes it a dark surface
   * rather than a surface that happens to be dark today.
   *
   * Deliberately not `inverseSurface` in dark mode, which is near-white: the
   * inversion that reads as confident at the size of a day chip reads as a
   * glare at the size of a tab bar.
   */
  const bar = {
    background: scheme === 'light' ? palette.inverseSurface : palette.surface,
    label: Colors.dark.text,
    icon: Colors.dark.textMuted,
    tint: Colors.dark.accent,
  };

  return (
    <NativeTabs
      backgroundColor={bar.background}
      iconColor={bar.icon}
      tintColor={bar.tint}
      labelStyle={{ color: bar.label }}>
      <NativeTabs.Trigger name="index">
        <Label>{t('tab.thisWeek')}</Label>
        <Icon sf={{ default: 'calendar', selected: 'calendar' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shopping">
        <Label>{t('tab.shopping')}</Label>
        <Icon sf={{ default: 'cart', selected: 'cart.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="scan">
        <Label>{t('tab.scan')}</Label>
        <Icon sf={{ default: 'barcode.viewfinder', selected: 'barcode.viewfinder' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="saved">
        <Label>{t('tab.saved')}</Label>
        <Icon sf={{ default: 'heart', selected: 'heart.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>{t('tab.settings')}</Label>
        <Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
