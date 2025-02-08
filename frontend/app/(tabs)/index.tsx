import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SpendingChart from '@/src/components/Graph';
import PieChartComponent from '@/src/components/PieChart';
import StackedBarChart from '@/src/components/BudgetBars';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <SpendingChart />
        <PieChartComponent />
        <StackedBarChart />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000', // Set the SafeAreaView background to black
  },
  scrollViewContent: {
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#000', // Set the ScrollView background to black
    flexGrow: 1, // Ensures the scroll content expands properly
  },
});

