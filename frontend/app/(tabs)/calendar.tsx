import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import CalendarComponent from '@/src/components/Calendar';
import WarningComponent from '@/src/components/Warning';
import ToolTip from '@/src/components/ToolTip';

export default function HomeScreen() {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  const paymentInfo = {
    paymentName: "Car Loan Payment",
    dueDate: "2025-02-20",
    amount: 500,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tooltipContainer}>
        <ToolTip message="Calendar Tip: Set automatic savings reminders!" />
      </View>
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
  tooltipContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 1000,
  },
  scrollViewContent: {
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#000', // Set the ScrollView background to black
    flexGrow: 1, // Ensures the scroll content expands properly
  },
});

