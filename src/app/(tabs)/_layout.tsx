import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useT } from '@/i18n';

export default function TabsLayout() {
  const t = useT();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = Colors[scheme];

  return (
    <NativeTabs
      backgroundColor={palette.background}
      iconColor={palette.textMuted}
      tintColor={palette.accent}
      labelStyle={{ color: palette.textSecondary }}>
      <NativeTabs.Trigger name="index">
        <Label>{t('tab.thisWeek')}</Label>
        <Icon sf={{ default: 'calendar', selected: 'calendar' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shopping">
        <Label>{t('tab.shopping')}</Label>
        <Icon sf={{ default: 'cart', selected: 'cart.fill' }} />
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
