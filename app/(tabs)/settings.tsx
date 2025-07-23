import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings as SettingsIcon, DollarSign, Bell, Coffee, UtensilsCrossed, Moon, Save, Trash2 } from 'lucide-react-native';
import { MealPrices, RegularMealPlan, NotificationSettings } from '../../types';
import StorageService from '../../services/StorageService';
import NotificationService from '../../services/NotificationService';

export default function SettingsScreen() {
  const [mealPrices, setMealPrices] = useState<MealPrices>({ tiffin: 0, lunch: 45, dinner: 40 });
  const [regularPlan, setRegularPlan] = useState<RegularMealPlan>({
    includeTiffin: false,
    includeLunch: true,
    includeDinner: true,
    isActive: false
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    tiffinTime: '09:30',
    lunchTime: '14:00',
    dinnerTime: '21:00',
    enabled: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [prices, plan, notificationSettings] = await Promise.all([
        StorageService.getInstance().getMealPrices(),
        StorageService.getInstance().getRegularMealPlan(),
        StorageService.getInstance().getNotificationSettings()
      ]);
      
      setMealPrices(prices);
      setRegularPlan(plan);
      setNotifications(notificationSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSavePrices = async () => {
    try {
      setLoading(true);
      await StorageService.getInstance().saveMealPrices(mealPrices);
      Alert.alert('Success', 'Meal prices updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update meal prices');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRegularPlan = async () => {
    try {
      setLoading(true);
      await StorageService.getInstance().saveRegularMealPlan(regularPlan);
      Alert.alert('Success', 'Regular meal plan updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update regular meal plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      await StorageService.getInstance().saveNotificationSettings(notifications);
      
      if (notifications.enabled) {
        const hasPermission = await NotificationService.getInstance().requestPermissions();
        if (hasPermission) {
          await NotificationService.getInstance().scheduleNotifications(notifications);
        } else {
          Alert.alert('Permission Required', 'Please enable notifications in your device settings');
        }
      } else {
        await NotificationService.getInstance().cancelAllNotifications();
      }
      
      Alert.alert('Success', 'Notification settings updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.getInstance().clearAllData();
              Alert.alert('Success', 'All data cleared successfully');
              loadSettings();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  const calculateRegularPlanTotal = () => {
    let total = 0;
    if (regularPlan.includeTiffin) total += mealPrices.tiffin;
    if (regularPlan.includeLunch) total += mealPrices.lunch;
    if (regularPlan.includeDinner) total += mealPrices.dinner;
    return total;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.background}
      >
        <ScrollView>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <SettingsIcon color="#3b82f6" size={24} />
              <Text style={styles.title}>Settings</Text>
            </View>
          </View>

          {/* Meal Prices */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <DollarSign color="#3b82f6" size={20} />
              <Text style={styles.sectionTitle}>Meal Prices</Text>
            </View>
            
            <View style={styles.priceInputs}>
              <View style={styles.priceInput}>
                <Coffee color="#6b7280" size={16} />
                <Text style={styles.priceLabel}>Tiffin</Text>
                <TextInput
                  style={styles.priceTextInput}
                  value={mealPrices.tiffin.toString()}
                  onChangeText={(text) => setMealPrices({...mealPrices, tiffin: parseFloat(text) || 0})}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              
              <View style={styles.priceInput}>
                <UtensilsCrossed color="#6b7280" size={16} />
                <Text style={styles.priceLabel}>Lunch</Text>
                <TextInput
                  style={styles.priceTextInput}
                  value={mealPrices.lunch.toString()}
                  onChangeText={(text) => setMealPrices({...mealPrices, lunch: parseFloat(text) || 0})}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              
              <View style={styles.priceInput}>
                <Moon color="#6b7280" size={16} />
                <Text style={styles.priceLabel}>Dinner</Text>
                <TextInput
                  style={styles.priceTextInput}
                  value={mealPrices.dinner.toString()}
                  onChangeText={(text) => setMealPrices({...mealPrices, dinner: parseFloat(text) || 0})}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePrices}>
              <Save color="#3b82f6" size={16} />
              <Text style={styles.saveButtonText}>Save Prices</Text>
            </TouchableOpacity>
          </View>

          {/* Regular Meal Plan */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <UtensilsCrossed color="#3b82f6" size={20} />
              <Text style={styles.sectionTitle}>Regular Meal Plan</Text>
            </View>
            
            <View style={styles.planOptions}>
              <View style={styles.planOption}>
                <Text style={styles.planOptionText}>Include Tiffin</Text>
                <Switch
                  value={regularPlan.includeTiffin}
                  onValueChange={(value) => setRegularPlan({...regularPlan, includeTiffin: value})}
                />
              </View>
              
              <View style={styles.planOption}>
                <Text style={styles.planOptionText}>Include Lunch</Text>
                <Switch
                  value={regularPlan.includeLunch}
                  onValueChange={(value) => setRegularPlan({...regularPlan, includeLunch: value})}
                />
              </View>
              
              <View style={styles.planOption}>
                <Text style={styles.planOptionText}>Include Dinner</Text>
                <Switch
                  value={regularPlan.includeDinner}
                  onValueChange={(value) => setRegularPlan({...regularPlan, includeDinner: value})}
                />
              </View>
              
              <View style={styles.planOption}>
                <Text style={styles.planOptionText}>Activate Plan</Text>
                <Switch
                  value={regularPlan.isActive}
                  onValueChange={(value) => setRegularPlan({...regularPlan, isActive: value})}
                />
              </View>
            </View>
            
            <View style={styles.planSummary}>
              <Text style={styles.planSummaryText}>
                Daily Cost: ₹{calculateRegularPlanTotal()}
              </Text>
              <Text style={styles.planSummaryText}>
                Monthly Cost: ₹{calculateRegularPlanTotal() * 30}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveRegularPlan}>
              <Save color="#3b82f6" size={16} />
              <Text style={styles.saveButtonText}>Save Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Notification Settings */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Bell color="#3b82f6" size={20} />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            
            <View style={styles.notificationOption}>
              <Text style={styles.notificationOptionText}>Enable Notifications</Text>
              <Switch
                value={notifications.enabled}
                onValueChange={(value) => setNotifications({...notifications, enabled: value})}
              />
            </View>
            
            {notifications.enabled && (
              <View style={styles.timeInputs}>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Tiffin Time</Text>
                  <TextInput
                    style={styles.timeTextInput}
                    value={notifications.tiffinTime}
                    onChangeText={(text) => setNotifications({...notifications, tiffinTime: text})}
                    placeholder="09:30"
                  />
                </View>
                
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Lunch Time</Text>
                  <TextInput
                    style={styles.timeTextInput}
                    value={notifications.lunchTime}
                    onChangeText={(text) => setNotifications({...notifications, lunchTime: text})}
                    placeholder="14:00"
                  />
                </View>
                
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Dinner Time</Text>
                  <TextInput
                    style={styles.timeTextInput}
                    value={notifications.dinnerTime}
                    onChangeText={(text) => setNotifications({...notifications, dinnerTime: text})}
                    placeholder="21:00"
                  />
                </View>
              </View>
            )}
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveNotifications}>
              <Save color="#3b82f6" size={16} />
              <Text style={styles.saveButtonText}>Save Notifications</Text>
            </TouchableOpacity>
          </View>

          {/* Data Management */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Trash2 color="#ef4444" size={20} />
              <Text style={styles.sectionTitle}>Data Management</Text>
            </View>
            
            <TouchableOpacity style={styles.dangerButton} onPress={handleClearAllData}>
              <Trash2 color="#ef4444" size={16} />
              <Text style={styles.dangerButtonText}>Clear All Data</Text>
            </TouchableOpacity>
          </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  sectionCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  priceInputs: {
    marginBottom: 16,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  priceTextInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#374151',
    width: 80,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  saveButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  planOptions: {
    marginBottom: 16,
  },
  planOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  planSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  planSummaryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 4,
  },
  notificationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  timeInputs: {
    marginBottom: 16,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#374151',
  },
  timeTextInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#374151',
    width: 80,
    textAlign: 'center',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  dangerButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});