import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRef, useEffect } from 'react';

interface MealToggleProps {
  label: string;
  price: number;
  isSelected: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}

export const MealToggle: React.FC<MealToggleProps> = ({ 
  label, 
  price, 
  isSelected, 
  onToggle,
  icon 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(isSelected ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: isSelected ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: isSelected ? 1.02 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSelected]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: isSelected ? 1 : 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onToggle();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Animated.View 
        style={[
          styles.card,
          isSelected && styles.selectedCard,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
            {icon}
          </View>
          <View style={styles.toggle}>
            <View style={[styles.toggleTrack, isSelected && styles.selectedToggleTrack]}>
              <Animated.View 
                style={[
                  styles.toggleThumb,
                  {
                    transform: [{
                      translateX: isSelected ? 20 : 0
                    }]
                  }
                ]}
              />
            </View>
          </View>
        </View>
        
        <Text style={[styles.label, isSelected && styles.selectedLabel]}>
          {label}
        </Text>
        <Text style={[styles.price, isSelected && styles.selectedPrice]}>
          ₹{price}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: '#f0f9ff',
    borderColor: '#3b82f6',
    elevation: 4,
    shadowOpacity: 0.2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIconContainer: {
    backgroundColor: '#dbeafe',
  },
  toggle: {
    alignItems: 'center',
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  selectedToggleTrack: {
    backgroundColor: '#3b82f6',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  selectedLabel: {
    color: '#1e40af',
  },
  price: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectedPrice: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});