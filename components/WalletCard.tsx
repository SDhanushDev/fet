import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, CreditCard, TrendingUp, TrendingDown } from 'lucide-react-native';

interface WalletCardProps {
  balance: number;
  totalSpent: number;
  onTopUp: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ balance, totalSpent, onTopUp }) => {
  const isLowBalance = balance < 500;
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Wallet color="white" size={24} />
          <Text style={styles.title}>My Wallet</Text>
        </View>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={[styles.balance, isLowBalance && styles.lowBalance]}>
            ₹{balance.toFixed(2)}
          </Text>
          {isLowBalance && (
            <Text style={styles.lowBalanceText}>Low Balance!</Text>
          )}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <TrendingDown color="rgba(255,255,255,0.8)" size={16} />
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>₹{totalSpent.toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity style={styles.topUpButton} onPress={onTopUp}>
            <CreditCard color="white" size={16} />
            <Text style={styles.topUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  balance: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  lowBalance: {
    color: '#ff6b6b',
  },
  lowBalanceText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  topUpText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});