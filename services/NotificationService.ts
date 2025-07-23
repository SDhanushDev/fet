import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings } from '../types';

class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false; // Notifications not supported on web
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async scheduleNotifications(settings: NotificationSettings): Promise<void> {
    if (Platform.OS === 'web' || !settings.enabled) {
      return;
    }

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule tiffin notification
    await this.scheduleNotification(
      'tiffin-reminder',
      'Tiffin Time! 🍽️',
      'Did you have your tiffin today?',
      settings.tiffinTime
    );

    // Schedule lunch notification
    await this.scheduleNotification(
      'lunch-reminder',
      'Lunch Time! 🍽️',
      'Time to log your lunch!',
      settings.lunchTime
    );

    // Schedule dinner notification
    await this.scheduleNotification(
      'dinner-reminder',
      'Dinner Time! 🍽️',
      'Don\'t forget to log your dinner!',
      settings.dinnerTime
    );
  }

  private async scheduleNotification(
    identifier: string,
    title: string,
    body: string,
    time: string
  ): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  }

  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }
}

export default NotificationService;