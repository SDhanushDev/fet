import { useState, useEffect } from 'react';
import { Wallet } from '../types';
import StorageService from '../services/StorageService';

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const savedWallet = await StorageService.getInstance().getWallet();
      setWallet(savedWallet);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const topUpWallet = async (amount: number) => {
    try {
      const newWallet: Wallet = {
        topupDate: new Date().toISOString(),
        topupAmount: amount,
        currentBalance: amount
      };
      
      await StorageService.getInstance().saveWallet(newWallet);
      setWallet(newWallet);
    } catch (error) {
      console.error('Failed to top up wallet:', error);
      throw error;
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (!wallet) return;
    
    try {
      const updatedWallet: Wallet = {
        ...wallet,
        currentBalance: newBalance
      };
      
      await StorageService.getInstance().saveWallet(updatedWallet);
      setWallet(updatedWallet);
    } catch (error) {
      console.error('Failed to update balance:', error);
      throw error;
    }
  };

  return {
    wallet,
    loading,
    topUpWallet,
    updateBalance,
    refreshWallet: loadWallet
  };
};