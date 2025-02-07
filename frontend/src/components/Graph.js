import { LineChart } from "react-native-chart-kit";
import { Dimensions, View, StyleSheet, TouchableOpacity, Text } from "react-native";

const SpendingChart = () => {
  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      {/* Button Group */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Transport</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Shopping</Text>
        </TouchableOpacity>
      </View>

      {/* Line Chart */}
      <LineChart
        data={{
          labels: ["Jan 1", "Jan 2", "Jan 3", "Jan 4", "Jan 5"],
          datasets: [
            {
              data: [50, 30, 20, 100, 40],
            },
          ],
        }}
        width={screenWidth - 20}
        height={220}
        borderRadius={20}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 2,
        }}
        bezier
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SpendingChart;