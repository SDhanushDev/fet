export interface MealLog {
  id: string;
  date: string;
  hadTiffin: boolean;
  hadLunch: boolean;
  hadDinner: boolean;
  amountSpent: number;
  walletBalanceAfter: number;
}

export interface Wallet {
  topupDate: string;
  topupAmount: number;
  currentBalance: number;
}

export interface MealPrices {
  tiffin: number;
  lunch: number;
  dinner: number;
}

export interface RegularMealPlan {
  includeTiffin: boolean;
  includeLunch: boolean;
  includeDinner: boolean;
  isActive: boolean;
}

export interface NotificationSettings {
  tiffinTime: string;
  lunchTime: string;
  dinnerTime: string;
  enabled: boolean;
}

export interface SpendingSummary {
  totalSpent: number;
  tiffinSpent: number;
  lunchSpent: number;
  dinnerSpent: number;
  daysActive: number;
  averageDaily: number;
}