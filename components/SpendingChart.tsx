import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';
import { SpendingSummary } from '../types';

interface SpendingChartProps {
  summary: SpendingSummary;
}

const { width } = Dimensions.get('window');
const chartSize = width * 0.6;
const radius = chartSize / 2 - 20;
const circumference = 2 * Math.PI * radius;

export const SpendingChart: React.FC<SpendingChartProps> = ({ summary }) => {
  const { tiffinSpent, lunchSpent, dinnerSpent, totalSpent } = summary;
  
  if (totalSpent === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Spending Breakdown</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No spending data yet</Text>
        </View>
      </View>
    );
  }

  const tiffinPercentage = (tiffinSpent / totalSpent) * 100;
  const lunchPercentage = (lunchSpent / totalSpent) * 100;
  const dinnerPercentage = (dinnerSpent / totalSpent) * 100;

  const tiffinOffset = 0;
  const lunchOffset = (tiffinPercentage / 100) * circumference;
  const dinnerOffset = ((tiffinPercentage + lunchPercentage) / 100) * circumference;

  const colors = {
    tiffin: '#ff6b6b',
    lunch: '#4ecdc4',
    dinner: '#45b7d1',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending Breakdown</Text>
      
      <View style={styles.chartContainer}>
        <Svg width={chartSize} height={chartSize}>
          {/* Background circle */}
          <Circle
            cx={chartSize / 2}
            cy={chartSize / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={20}
          />
          
          {/* Tiffin arc */}
          {tiffinSpent > 0 && (
            <Circle
              cx={chartSize / 2}
              cy={chartSize / 2}
              r={radius}
              fill="none"
              stroke={colors.tiffin}
              strokeWidth={20}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (tiffinPercentage / 100) * circumference}
              strokeLinecap="round"
              transform={`rotate(-90 ${chartSize / 2} ${chartSize / 2})`}
            />
          )}
          
          {/* Lunch arc */}
          {lunchSpent > 0 && (
            <Circle
              cx={chartSize / 2}
              cy={chartSize / 2}
              r={radius}
              fill="none"
              stroke={colors.lunch}
              strokeWidth={20}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (lunchPercentage / 100) * circumference}
              strokeLinecap="round"
              transform={`rotate(${(tiffinPercentage / 100) * 360 - 90} ${chartSize / 2} ${chartSize / 2})`}
            />
          )}
          
          {/* Dinner arc */}
          {dinnerSpent > 0 && (
            <Circle
              cx={chartSize / 2}
              cy={chartSize / 2}
              r={radius}
              fill="none"
              stroke={colors.dinner}
              strokeWidth={20}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (dinnerPercentage / 100) * circumference}
              strokeLinecap="round"
              transform={`rotate(${((tiffinPercentage + lunchPercentage) / 100) * 360 - 90} ${chartSize / 2} ${chartSize / 2})`}
            />
          )}
          
          {/* Center text */}
          <SvgText
            x={chartSize / 2}
            y={chartSize / 2 - 10}
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fill="#374151"
          >
            ₹{totalSpent.toFixed(0)}
          </SvgText>
          <SvgText
            x={chartSize / 2}
            y={chartSize / 2 + 15}
            textAnchor="middle"
            fontSize="14"
            fill="#6b7280"
          >
            Total Spent
          </SvgText>
        </Svg>
      </View>
      
      <View style={styles.legendContainer}>
        {tiffinSpent > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.tiffin }]} />
            <Text style={styles.legendText}>Tiffin: ₹{tiffinSpent.toFixed(0)}</Text>
          </View>
        )}
        
        {lunchSpent > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.lunch }]} />
            <Text style={styles.legendText}>Lunch: ₹{lunchSpent.toFixed(0)}</Text>
          </View>
        )}
        
        {dinnerSpent > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.dinner }]} />
            <Text style={styles.legendText}>Dinner: ₹{dinnerSpent.toFixed(0)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  legendContainer: {
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});