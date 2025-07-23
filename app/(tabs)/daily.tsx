import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Coffee, UtensilsCrossed, Moon, Save, Calendar } from 'lucide-react-native';
import { MealToggle } from '../../components/MealToggle';
import { useWallet } from '../../hooks/useWallet';
import { useMealLogs } from '../../hooks/useMealLogs';
import { MealPrices, MealLog } from '../../types';
import StorageService from '../../services/StorageService';

export default function DailyLog() {
  const { wallet, updateBalance } = useWallet();
  const { getTodaysLog, saveMealLog } = useMealLogs();
  const [mealPrices, setMealPrices] = useState<MealPrices>({ tiffin: 0, lunch: 45, dinner: 40 });
  const [todaysLog, setTodaysLog] = useState<MealLog | null>(null);
  const [hadTiffin, setHadTiffin] = useState(false);
  const [hadLunch, setHadLunch] = useState(false);
  const [hadDinner, setHadDinner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTodaysData();
  }, []);

  const loadTodaysData = async () => {
    try {
      const [prices, log] = await Promise.all([
        StorageService.getInstance().getMealPrices(),
        getTodaysLog()
      ]);
      
      setMealPrices(prices);
      setTodaysLog(log);
      
      if (log) {
        setHadTiffin(log.hadTiffin);
        setHadLunch(log.hadLunch);
        setHadDinner(log.hadDinner);
      }
    } catch (error) {
      console.error('Failed to load today\'s data:', error);
    }
  };

  const calculateTotalSpend = () => {
    let total = 0;
    if (hadTiffin) total += mealPrices.tiffin;
    if (hadLunch) total += mealPrices.lunch;
    if (hadDinner) total += mealPrices.dinner;
    return total;
  };

  const handleSave = async () => {
    if (!wallet) {
      Alert.alert('Error', 'Please set up your wallet first');
      return;
    }

    setLoading(true);
    try {
      const totalSpend = calculateTotalSpend();
      const newBalance = wallet.currentBalance - totalSpend + (todaysLog?.amountSpent || 0);
      
      if (newBalance < 0) {
        Alert.alert('Insufficient Balance', 'You don\'t have enough balance in your wallet');
        setLoading(false);
        return;
      }

      const newLog: MealLog = {
        id: todaysLog?.id || Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        hadTiffin,
        hadLunch,
        hadDinner,
        amountSpent: totalSpend,
        walletBalanceAfter: newBalance
      };

      await saveMealLog(newLog);
      await updateBalance(newBalance);
      setTodaysLog(newLog);
      
      Alert.alert('Success', `Meal log saved! Spent: ₹${totalSpend}`);
    } catch (error) {
      console.error('Failed to save meal log:', error);
      Alert.alert('Error', 'Failed to save meal log');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.background}
      >
        <ScrollView>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Calendar color="#3b82f6" size={24} />
              <Text style={styles.title}>Daily Log</Text>
            </View>
            <Text style={styles.date}>{today}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Today's Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Spend:</Text>
              <Text style={styles.summaryValue}>₹{calculateTotalSpend()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Wallet Balance:</Text>
              <Text style={styles.summaryValue}>₹{wallet?.currentBalance || 0}</Text>
            </View>
            {todaysLog && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Previously Spent:</Text>
                <Text style={styles.summaryValue}>₹{todaysLog.amountSpent}</Text>
              </View>
            )}
          </View>

          <View style={styles.mealsContainer}>
            <Text style={styles.mealsTitle}>Select Meals</Text>
            
            <View style={styles.mealsGrid}>
              <MealToggle
                label="Tiffin"
                price={mealPrices.tiffin}
                isSelected={hadTiffin}
                onToggle={() => setHadTiffin(!hadTiffin)}
                icon={<Coffee color={hadTiffin ? '#3b82f6' : '#6b7280'} size={20} />}
              />
              
              <MealToggle
                label="Lunch"
                price={mealPrices.lunch}
                isSelected={hadLunch}
                onToggle={() => setHadLunch(!hadLunch)}
                icon={<UtensilsCrossed color={hadLunch ? '#3b82f6' : '#6b7280'} size={20} />}
              />
              
              <MealToggle
                label="Dinner"
                price={mealPrices.dinner}
                isSelected={hadDinner}
                onToggle={() => setHadDinner(!hadDinner)}
                icon={<Moon color={hadDinner ? '#3b82f6' : '#6b7280'} size={20} />}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#9ca3af', '#6b7280'] : ['#3b82f6', '#1d4ed8']}
              style={styles.saveButtonGradient}
            >
              <Save color="white" size={20} />
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Today\'s Log'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  date: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  mealsContainer: {
    margin: 16,
    marginTop: 0,
  },
  mealsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  mealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  saveButton: {
    margin: 16,
    marginTop: 0,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});