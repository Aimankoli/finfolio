import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// Define the props type explicitly
interface SpendingChartProps {
  data: Record<string, number>;
  title: string;
  color: string;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data, title, color }) => {
  // Ensure we have valid data
  const validData = Object.keys(data).length > 0 ? data : { [new Date().toISOString().split('T')[0]]: 0 };

  const chartData = {
    labels: Object.keys(validData).map(date => date.split('-')[2]),
    datasets: [{
      data: Object.values(validData),
      color: () => color,
    }],
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ color: 'white', fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
        {title}
      </Text>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 20}
        height={220}
        chartConfig={{
          backgroundColor: '#1e1e1e',
          backgroundGradientFrom: '#1e1e1e',
          backgroundGradientTo: '#1e1e1e',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

// Ensure it's correctly exported
export default SpendingChart;
