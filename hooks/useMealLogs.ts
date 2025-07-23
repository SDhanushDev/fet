import { useState, useEffect } from 'react';
import { MealLog, MealPrices, SpendingSummary } from '../types';
import StorageService from '../services/StorageService';

export const useMealLogs = () => {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const savedLogs = await StorageService.getInstance().getMealLogs();
      setLogs(savedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Failed to load meal logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMealLog = async (log: MealLog) => {
    try {
      await StorageService.getInstance().saveMealLog(log);
      await loadLogs();
    } catch (error) {
      console.error('Failed to save meal log:', error);
      throw error;
    }
  };

  const getTodaysLog = async (): Promise<MealLog | null> => {
    const today = new Date().toISOString().split('T')[0];
    return await StorageService.getInstance().getMealLogByDate(today);
  };

  const calculateSummary = (prices: MealPrices): SpendingSummary => {
    const totalSpent = logs.reduce((sum, log) => sum + log.amountSpent, 0);
    const tiffinSpent = logs.reduce((sum, log) => sum + (log.hadTiffin ? prices.tiffin : 0), 0);
    const lunchSpent = logs.reduce((sum, log) => sum + (log.hadLunch ? prices.lunch : 0), 0);
    const dinnerSpent = logs.reduce((sum, log) => sum + (log.hadDinner ? prices.dinner : 0), 0);
    const daysActive = logs.length;
    const averageDaily = daysActive > 0 ? totalSpent / daysActive : 0;

    return {
      totalSpent,
      tiffinSpent,
      lunchSpent,
      dinnerSpent,
      daysActive,
      averageDaily
    };
  };

  return {
    logs,
    loading,
    saveMealLog,
    getTodaysLog,
    calculateSummary,
    refreshLogs: loadLogs
  };
};