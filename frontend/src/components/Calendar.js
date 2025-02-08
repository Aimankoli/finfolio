import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, Dimensions } from "react-native";
import { Calendar } from "react-native-calendars";

// Get screen width
const screenWidth = Dimensions.get("window").width;

// Sample data for money flow
const moneyFlowData = {
  "2025-02-07": { amount: 200, type: "in" },
  "2025-02-10": { amount: -150, type: "out" },
  "2025-02-15": { amount: 300, type: "in" },
  "2025-02-20": { amount: -50, type: "out" },
};

const CalendarComponent = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const generateMarkedDates = () => {
    const markedDates = {};

    Object.keys(moneyFlowData).forEach((date) => {
      const data = moneyFlowData[date];
      markedDates[date] = {
        customStyles: {
          container: {
            backgroundColor: data.type === "in" ? `rgba(0, 255, 0, ${Math.min(Math.abs(data.amount) / 500, 1)})` : `rgba(255, 0, 0, ${Math.min(Math.abs(data.amount) / 500, 1)})`,
          },
          text: {
            color: "#ffffff",
            fontWeight: "bold",
          },
        },
      };
    });

    return markedDates;
  };

  const markedDates = generateMarkedDates();

  const handleDayPress = (day) => {
    const dateInfo = moneyFlowData[day.dateString];
    setSelectedDate({ date: day.dateString, ...dateInfo });
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={new Date().toISOString().split("T")[0]}
        markingType={"custom"}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
            backgroundColor: "#2d2d2d", // Dark gray background
            calendarBackground: "#2d2d2d", // Dark gray calendar background
            textSectionTitleColor: "#ffffff",
            dayTextColor: "#d4d4d4",
            todayTextColor: "#00adf5",
            selectedDayBackgroundColor: "#444",
            selectedDayTextColor: "#ffffff",
            arrowColor: "#ffffff",
            monthTextColor: "#ffffff",
          }}
  
        style={{
          borderRadius: 10,
          width: screenWidth * 0.9, // 90% of screen width
          alignSelf: "center", // Center horizontally
          elevation: 5, // Shadow effect on Android
          shadowColor: "#000", // Shadow color on iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedDate ? (
              <>
                <Text style={styles.modalTitle}>Details for {selectedDate.date}</Text>
                <Text style={styles.modalText}>
                  {selectedDate.type === "in"
                    ? `Money In: $${selectedDate.amount}`
                    : `Money Out: $${Math.abs(selectedDate.amount)}`}
                </Text>
              </>
            ) : (
              <Text style={styles.modalText}>No Data</Text>
            )}
            <Text style={styles.closeButton} onPress={() => setModalVisible(false)}>
              Close
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e1e1e",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#333333",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ffffff",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: "#d4d4d4",
  },
  closeButton: {
    fontSize: 16,
    color: "#00adf5",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CalendarComponent;
