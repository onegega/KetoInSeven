import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Reminder } from '@/lib/preferences';

const CATEGORY = 'weekly-plan';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Replaces any existing reminder with one matching `reminder`. Cancelling first
 * keeps changing the day or time from stacking up duplicate notifications.
 *
 * Returns false when the reminder could not be scheduled — almost always
 * because notification permission was refused.
 */
export async function syncWeeklyReminder(reminder: Reminder): Promise<boolean> {
  await cancelWeeklyReminder();

  if (!reminder.enabled) return true;

  const granted = await requestPermission();
  if (!granted) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CATEGORY, {
      name: 'Weekly plan',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.scheduleNotificationAsync({
    identifier: CATEGORY,
    content: {
      title: 'Your keto week is ready 🥑',
      body: 'Seven days of meals and a shopping list are waiting.',
      data: { screen: 'plan' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      // expo-notifications counts weekdays 1-7 from Sunday; JS Date uses 0-6.
      weekday: reminder.weekday + 1,
      hour: reminder.hour,
      minute: reminder.minute,
      channelId: CATEGORY,
    },
  });

  return true;
}

export async function cancelWeeklyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(CATEGORY);
  } catch {
    // Nothing was scheduled under that identifier — nothing to undo.
  }
}
