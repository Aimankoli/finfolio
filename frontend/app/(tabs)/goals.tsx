import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/context/AuthContext";

interface GoalData {
  saving_goal: number;
  time_months: number;
  amount: number;
}

export default function GoalsScreen(): JSX.Element {
  const { username } = useAuth();
  const [goalAmount, setGoalAmount] = useState<number | null>(null);
  const [timeToAchieve, setTimeToAchieve] = useState<number | null>(null);
  const [daysSpent, setDaysSpent] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoalData = async (): Promise<void> => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/set_goal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            // Since this is a fetch endpoint, we don't need to send amount and time_months
            // The backend will return the existing values
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.saving_goal) {
          throw new Error("No goal data found");
        }

        // Set the values from the response
        setGoalAmount(data.saving_goal);
        setTimeToAchieve(data.time_months * 30); // Convert months to days
        setDaysSpent(data.days_spent || 0); // Use 0 as fallback if not provided

      } catch (error) {
        console.error("Error fetching goal data:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    void fetchGoalData();
  }, [username]);

  if (!username) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Please log in to view your goals.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Goal</Text>
      <Text style={styles.text}>Goal Amount: ${goalAmount?.toLocaleString()}</Text>
      <Text style={styles.text}>Time to Achieve: {timeToAchieve} days</Text>
      <Text style={styles.text}>Days Spent: {daysSpent} days</Text>
      <Text style={styles.text}>
        Days Left: {timeToAchieve && daysSpent ? (timeToAchieve - daysSpent) : 0} days
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
  },
  loader: {
    marginTop: 50,
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
});