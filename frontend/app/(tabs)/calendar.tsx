import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalendarComponent from '@/src/components/Calendar';
import WarningComponent from '@/src/components/Warning';

export default function HomeScreen() {
  const paymentInfo = {
    paymentName: "Car Loan Payment",
    dueDate: "2025-02-20",
    amount: 500,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <CalendarComponent></CalendarComponent>
        <WarningComponent
          message="Warning: Your balance is too low to meet your upcoming payment!"
          paymentInfo={paymentInfo}
        />
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

