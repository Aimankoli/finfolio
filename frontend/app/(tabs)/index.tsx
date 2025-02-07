import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import CustomButton  from '@/src/components/Button';
import SpendingChart from '@/src/components/Graph';
import { SafeAreaView } from 'react-native-safe-area-context';
import PieChartComponent from '@/src/components/PieChart';

export default function HomeScreen() {
  return (
    <SafeAreaView>
      <SpendingChart></SpendingChart>
      <PieChartComponent></PieChartComponent>
      <CustomButton onPress title></CustomButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
