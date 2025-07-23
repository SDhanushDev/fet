import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { MealLog, MealPrices, SpendingSummary } from '../types';

class ExportService {
  private static instance: ExportService;
  
  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  async exportToCSV(logs: MealLog[], prices: MealPrices, summary: SpendingSummary): Promise<void> {
    try {
      const csvContent = this.generateCSVContent(logs, prices, summary);
      const fileName = `food-spending-${new Date().toISOString().split('T')[0]}.csv`;

      if (Platform.OS === 'web') {
        // Web-compatible export using browser download
        this.downloadCSVOnWeb(csvContent, fileName);
      } else {
        // Native export using expo-file-system and expo-sharing
        const fileUri = FileSystem.documentDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  }

  private downloadCSVOnWeb(csvContent: string, fileName: string): void {
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  private generateCSVContent(logs: MealLog[], prices: MealPrices, summary: SpendingSummary): string {
    let csv = 'Date,Tiffin,Lunch,Dinner,Amount Spent,Wallet Balance\n';
    
    // Add meal logs
    logs.forEach(log => {
      csv += `${log.date},${log.hadTiffin ? 'Yes' : 'No'},${log.hadLunch ? 'Yes' : 'No'},${log.hadDinner ? 'Yes' : 'No'},₹${log.amountSpent},₹${log.walletBalanceAfter}\n`;
    });

    // Add summary
    csv += '\n--- SUMMARY ---\n';
    csv += `Total Spent,₹${summary.totalSpent}\n`;
    csv += `Tiffin Spent,₹${summary.tiffinSpent}\n`;
    csv += `Lunch Spent,₹${summary.lunchSpent}\n`;
    csv += `Dinner Spent,₹${summary.dinnerSpent}\n`;
    csv += `Days Active,${summary.daysActive}\n`;
    csv += `Average Daily,₹${summary.averageDaily}\n`;

    // Add current meal prices
    csv += '\n--- CURRENT MEAL PRICES ---\n';
    csv += `Tiffin,₹${prices.tiffin}\n`;
    csv += `Lunch,₹${prices.lunch}\n`;
    csv += `Dinner,₹${prices.dinner}\n`;

    return csv;
  }
}

export default ExportService;