import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet as WalletIcon, Plus, Download, History, TrendingUp, TrendingDown } from 'lucide-react-native';
import { TopUpModal } from '../../components/TopUpModal';
import { useWallet } from '../../hooks/useWallet';
import { useMealLogs } from '../../hooks/useMealLogs';
import { MealPrices } from '../../types';
import StorageService from '../../services/StorageService';
import ExportService from '../../services/ExportService';

export default function WalletScreen() {
  const { wallet, topUpWallet, refreshWallet } = useWallet();
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
    await Promise.all([refreshWallet(), loadMealPrices()]);
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      const summary = calculateSummary(mealPrices);
      await ExportService.getInstance().exportToCSV(logs, mealPrices, summary);
      Alert.alert('Success', 'Data exported successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const summary = calculateSummary(mealPrices);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      time: 'short'
    });
  };

  const recentTransactions = logs.slice(0, 5);

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
            <View style={styles.headerContent}>
              <WalletIcon color="#3b82f6" size={24} />
              <Text style={styles.title}>Wallet</Text>
            </View>
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.balanceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>₹{wallet?.currentBalance?.toFixed(2) || '0.00'}</Text>
              
              <View style={styles.balanceActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowTopUpModal(true)}
                >
                  <Plus color="white" size={16} />
                  <Text style={styles.actionButtonText}>Top Up</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleExport}
                >
                  <Download color="white" size={16} />
                  <Text style={styles.actionButtonText}>Export</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Spending Stats</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <TrendingDown color="#ef4444" size={20} />
                  <Text style={styles.statValue}>₹{summary.totalSpent.toFixed(0)}</Text>
                  <Text style={styles.statLabel}>Total Spent</Text>
                </View>
                
                <View style={styles.statBox}>
                  <TrendingUp color="#10b981" size={20} />
                  <Text style={styles.statValue}>₹{summary.averageDaily.toFixed(0)}</Text>
                  <Text style={styles.statLabel}>Daily Average</Text>
                </View>
                
                <View style={styles.statBox}>
                  <History color="#6366f1" size={20} />
                  <Text style={styles.statValue}>{summary.daysActive}</Text>
                  <Text style={styles.statLabel}>Days Active</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsContainer}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            
            {recentTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            ) : (
              <View style={styles.transactionsList}>
                {recentTransactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.date)}
                      </Text>
                      <Text style={styles.transactionMeals}>
                        {[
                          transaction.hadTiffin && 'Tiffin',
                          transaction.hadLunch && 'Lunch',
                          transaction.hadDinner && 'Dinner'
                        ].filter(Boolean).join(' + ')}
                      </Text>
                    </View>
                    <View style={styles.transactionAmount}>
                      <Text style={styles.transactionSpent}>
                        -₹{transaction.amountSpent.toFixed(0)}
                      </Text>
                      <Text style={styles.transactionBalance}>
                        Balance: ₹{transaction.walletBalanceAfter.toFixed(0)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  balanceCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  balanceGradient: {
    borderRadius: 16,
    padding: 24,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  transactionsContainer: {
    margin: 16,
    marginTop: 0,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  transactionsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  transactionMeals: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionSpent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  transactionBalance: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});