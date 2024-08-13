import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const levels = [
  { label: "Not Very Active", description: "Spend most of the day sitting (e.g., desk job, studying)." },
  { label: "Lightly Active", description: "Spend a good part of the day on your feet (e.g., teacher, retail)." },
  { label: "Active", description: "Spend a good part of the day doing some physical activity (e.g., food server, postal carrier)." },
  { label: "Very Active", description: "Spend most of the day doing heavy physical activity (e.g., construction, athlete)." },
];

const ExerciseLevelScreen = ({ navigation, route }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { name, height, weight, bmi } = route.params;

  const handleNext = () => {
    if (selectedLevel) {
      navigation.navigate('BMIScreen', { name, height, weight, bmi, exerciseLevel: selectedLevel });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What is your baseline activity level?</Text>
      {levels.map((level, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.levelButton, selectedLevel === level.label && styles.selectedButton]}
          onPress={() => setSelectedLevel(level.label)}
        >
          <Text style={styles.levelText}>{level.label}</Text>
          <Text style={styles.descriptionText}>{level.description}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#001F3F',
  },
  title: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  levelButton: {
    backgroundColor: '#1f7a8c',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  selectedButton: {
    backgroundColor: '#28A745',
  },
  levelText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#ddd',
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default ExerciseLevelScreen;
