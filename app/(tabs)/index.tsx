import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { WalletCard } from '../../components/WalletCard';
import { SpendingChart } from '../../components/SpendingChart';
import { TopUpModal } from '../../components/TopUpModal';
import { useWallet } from '../../hooks/useWallet';
import { useMealLogs } from '../../hooks/useMealLogs';
import { MealPrices } from '../../types';
import StorageService from '../../services/StorageService';

export default function Dashboard() {
  const { wallet, topUpWallet } = useWallet();
  const { logs, calculateSummary } = useMealLogs();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [mealPrices, setMealPrices] = useState<MealPrices>({ tiffin: 0, lunch: 45, dinner: 40 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMealPrices();
  }, []);

  const loadMealPrices = async () => {
    try {
      const prices = await StorageService.getInstance().getMealPrices();
      setMealPrices(prices);
    } catch (error) {
      console.error('Failed to load meal prices:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMealPrices();
    setRefreshing(false);
  };

  const summary = calculateSummary(mealPrices);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysFromTopUp = () => {
    if (!wallet) return 0;
    const topUpDate = new Date(wallet.topupDate);
    const today = new Date();
    const diffTime = today.getTime() - topUpDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.background}
      >
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>Good day! 👋</Text>
            <Text style={styles.subGreeting}>Track your food spending</Text>
          </View>

          <WalletCard
            balance={wallet?.currentBalance || 0}
            totalSpent={summary.totalSpent}
            onTopUp={() => setShowTopUpModal(true)}
          />

          <SpendingChart summary={summary} />

          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Monthly Summary</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{summary.daysActive}</Text>
                  <Text style={styles.statLabel}>Days Active</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>₹{summary.averageDaily.toFixed(0)}</Text>
                  <Text style={styles.statLabel}>Avg Daily</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{getDaysFromTopUp()}</Text>
                  <Text style={styles.statLabel}>Days Since Top-up</Text>
                </View>
              </View>

              {wallet && (
                <View style={styles.topUpInfo}>
                  <Text style={styles.topUpInfoText}>
                    Last top-up: ₹{wallet.topupAmount} on {formatDate(wallet.topupDate)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <TopUpModal
          visible={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
          onTopUp={topUpWallet}
        />
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    margin: 16,
    marginTop: 0,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  topUpInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  topUpInfoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});