import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealLog, Wallet, MealPrices, RegularMealPlan, NotificationSettings } from '../types';

class StorageService {
  private static instance: StorageService;
  
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Wallet operations
  async saveWallet(wallet: Wallet): Promise<void> {
    await AsyncStorage.setItem('wallet', JSON.stringify(wallet));
  }

  async getWallet(): Promise<Wallet | null> {
    const wallet = await AsyncStorage.getItem('wallet');
    return wallet ? JSON.parse(wallet) : null;
  }

  // Meal logs operations
  async saveMealLog(log: MealLog): Promise<void> {
    const logs = await this.getMealLogs();
    const existingIndex = logs.findIndex(l => l.date === log.date);
    
    if (existingIndex >= 0) {
      logs[existingIndex] = log;
    } else {
      logs.push(log);
    }
    
    await AsyncStorage.setItem('mealLogs', JSON.stringify(logs));
  }

  async getMealLogs(): Promise<MealLog[]> {
    const logs = await AsyncStorage.getItem('mealLogs');
    return logs ? JSON.parse(logs) : [];
  }

  async getMealLogByDate(date: string): Promise<MealLog | null> {
    const logs = await this.getMealLogs();
    return logs.find(log => log.date === date) || null;
  }

  // Meal prices operations
  async saveMealPrices(prices: MealPrices): Promise<void> {
    await AsyncStorage.setItem('mealPrices', JSON.stringify(prices));
  }

  async getMealPrices(): Promise<MealPrices> {
    const prices = await AsyncStorage.getItem('mealPrices');
    return prices ? JSON.parse(prices) : { tiffin: 0, lunch: 45, dinner: 40 };
  }

  // Regular meal plan operations
  async saveRegularMealPlan(plan: RegularMealPlan): Promise<void> {
    await AsyncStorage.setItem('regularMealPlan', JSON.stringify(plan));
  }

  async getRegularMealPlan(): Promise<RegularMealPlan> {
    const plan = await AsyncStorage.getItem('regularMealPlan');
    return plan ? JSON.parse(plan) : {
      includeTiffin: false,
      includeLunch: true,
      includeDinner: true,
      isActive: false
    };
  }

  // Notification settings operations
  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    const settings = await AsyncStorage.getItem('notificationSettings');
    return settings ? JSON.parse(settings) : {
      tiffinTime: '09:30',
      lunchTime: '14:00',
      dinnerTime: '21:00',
      enabled: true
    };
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove(['wallet', 'mealLogs', 'mealPrices', 'regularMealPlan', 'notificationSettings']);
  }
}

export default StorageService;