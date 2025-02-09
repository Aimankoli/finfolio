import { ScrollView, StyleSheet, View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

import SpendingChart from '../../src/components/Graph';
import StackedBarChart from '@/src/components/BudgetBars';
import { API_URL } from '@/src/config';
import TransactionList from '@/src/components/TransactionList';
import TopTwoSpenders from '@/src/components/TopTwoSpenders';
import SubscriptionsList from '@/src/components/Subscriptions';
import ToolTip from '@/src/components/ToolTip';

export default function HomeScreen() {
  const [spendingData, setSpendingData] = useState<{
    all: Record<string, number>;
    food: Record<string, number>;
    travel: Record<string, number>;
    entertainment: Record<string, number>;
  }>({
    all: {},
    food: {},
    travel: {},
    entertainment: {}
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [topSpenders, setTopSpenders] = useState({
    top_spender: '',
    top2_spender: '',
    top_spender_count: 0,
    top2_spender_count: 0,
  });

  const [isAlert, setIsAlert] = useState(false);

  const checkAlertStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/alert_status`);
      const data = await response.json();
      console.log('Alert Status Response:', data);
      
      if ((data.isalert === true || data.isalert === 1) && !isAlert) {
        setIsAlert(true);
        Alert.alert(
          "High Value Transaction Detected",
          "A transaction over $100 has been detected. Please verify this transaction.",
          [
            {
              text: "Verify",
              onPress: () => handleAlertResolve("yes"),
            },
            {
              text: "Report Fraud",
              onPress: () => handleAlertResolve("report"),
              style: "destructive"
            }
          ],
          { cancelable: false } // Prevent dismissing the alert by tapping outside
        );
      }
    } catch (error) {
      console.error('Error checking alert status:', error);
    }
  };

  const handleAlertResolve = async (action: "yes" | "report") => {
    try {
      const response = await fetch(`${API_URL}/alert_resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      console.log('Alert Resolve Response:', data);
      
      // Reset alert state only after successful resolution
      if (response.ok) {
        setIsAlert(false);
        
        // Show confirmation message
        Alert.alert(
          action === "yes" ? "Transaction Verified" : "Fraud Reported",
          action === "yes" 
            ? "Thank you for verifying this transaction." 
            : "This transaction has been reported as fraudulent.",
          [{ text: "OK" }]
        );
      }
      
    } catch (error) {
      console.error('Error resolving alert:', error);
      Alert.alert("Error", "Failed to process your response. Please try again.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch spending graph data
        const [allRes, foodRes, travelRes, entertainmentRes] = await Promise.all([
          fetch(`${API_URL}/graph_data`),
          fetch(`${API_URL}/graph_data_food`),
          fetch(`${API_URL}/graph_data_travel`),
          fetch(`${API_URL}/graph_data_entertainment`)
        ]);

        const [allData, foodData, travelData, entertainmentData] = await Promise.all([
          allRes.json(),
          foodRes.json(),
          travelRes.json(),
          entertainmentRes.json()
        ]);

        setSpendingData({
          all: allData.cumulative_spending || {},
          food: foodData.cumulative_spending || {},
          travel: travelData.cumulative_spending || {},
          entertainment: entertainmentData.cumulative_spending || {}
        });

        // Fetch transactions
        const transactionsRes = await fetch(`${API_URL}/transactions`);
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || []);

        // Call /top_spenders using POST.
        // The backend expects the username as a query parameter,
        // so we append it to the URL. Here, the user ID is hardcoded as "user_good".
        const topSpendersRes = await fetch(
          `${API_URL}/top_spenders?username=user_good`,
          { method: "POST" }
        );
        const topSpendersData = await topSpendersRes.json();
        console.log('Top Spenders Data:', topSpendersData);
        
        setTopSpenders({
          top_spender: topSpendersData.top_spender || '',
          top2_spender: topSpendersData.top2_spender || '',
          top_spender_count: topSpendersData.top_spender_count || 0,
          top2_spender_count: topSpendersData.top2_spender_count || 0,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    checkAlertStatus();
    
    const interval = setInterval(checkAlertStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: 'all', title: 'Total Spending', color: '#007AFF' },
    { id: 'food', title: 'Food Spending', color: '#34C759' },
    { id: 'travel', title: 'Travel Spending', color: '#FF9500' },
    { id: 'entertainment', title: 'Entertainment Spending', color: '#AF52DE' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tooltipContainer}>
        <ToolTip message="Calendar Tip: Set automatic savings reminders!" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buttonContainer}>
        {categories.map((category) => (
          <Text
            key={category.id}
            style={[
              styles.button,
              selectedCategory === category.id && styles.selectedButton
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            {category.id.charAt(0).toUpperCase() + category.id.slice(1)}
          </Text>
        ))}
      </ScrollView>
      
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {categories.map((category) => (
          selectedCategory === category.id && (
            <SpendingChart
              key={category.id}
              data={spendingData[category.id as keyof typeof spendingData] ?? {}}
              title={category.title}
              color={category.color}
            />
          )
        ))}
        <TopTwoSpenders
          topSpender={topSpenders.top_spender}
          top2Spender={topSpenders.top2_spender}
          topSpenderCount={topSpenders.top_spender_count}
          top2SpenderCount={topSpenders.top2_spender_count}
        />
        <SubscriptionsList />
        <TransactionList transactions={transactions} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000', // Black background for the SafeAreaView
  },
  scrollViewContent: {
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#000', // Black background for the ScrollView
    flexGrow: 1,
  },
  buttonContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#000',
  },
  button: {
    color: '#fff',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 80,
    textAlign: 'center',
  },
  selectedButton: {
    backgroundColor: '#333',
    borderColor: '#fff',
  },
  tooltipContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 1000,
  },
});
