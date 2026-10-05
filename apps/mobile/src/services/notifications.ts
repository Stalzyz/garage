import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiFetch } from './api';

// Configure notification presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notifications = {
  /**
   * Request push notification permissions & retrieve Expo Push Token
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Agency Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0A84FF',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notification] Permission not granted for push alerts.');
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      // Register token with backend notification service
      await apiFetch('/notifications/push-token', {
        method: 'POST',
        body: JSON.stringify({ token, platform: Platform.OS }),
      }).catch(() => {});

      return token;
    } catch (e: any) {
      console.log('[Notification] Expo Push Token registration notice:', e.message);
      return null;
    }
  },

  /**
   * Schedule an instant local alert (e.g. for offline queue sync, lead assignment)
   */
  async triggerLocalAlert(title: string, body: string, data = {}) {
    if (Platform.OS === 'web') {
      console.log(`[Notification] ${title}: ${body}`);
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null,
    });
  },
};
