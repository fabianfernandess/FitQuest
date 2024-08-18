import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';

const options = [
  { label: "Powerlifting", size: 120, house: "House of Valor" },
  { label: "HIIT", size: 100, house: "House of Valor" },
  { label: "Bodyweight Strength", size: 150, house: "House of Valor" },
  { label: "Kettlebell Swings", size: 130, house: "House of Valor" },
  { label: "Plyometrics", size: 110, house: "House of Valor" },
  { label: "Yoga Flow", size: 140, house: "House of Elara" },
  { label: "Endurance Running", size: 120, house: "House of Elara" },
  { label: "Pilates Core", size: 130, house: "House of Elara" },
  { label: "Mindful Meditation", size: 100, house: "House of Elara" },
  { label: "Tai Chi", size: 120, house: "House of Elara" },
  { label: "TRX Suspension", size: 130, house: "House of Nova" },
  { label: "Functional Circuit", size: 120, house: "House of Nova" },
  { label: "Virtual Reality", size: 140, house: "House of Nova" },
  { label: "Agility Ladder", size: 110, house: "House of Nova" },
  { label: "Dynamic Stretching", size: 130, house: "House of Nova" },
];

const SelectionScreen = ({ route, navigation }) => {
  const { name, email, height, weight, bmi, exerciseLevel } = route.params;
  const [selectedOptions, setSelectedOptions] = useState([]);

  const toggleOption = (option) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(option.label)
        ? prevSelected.filter((item) => item !== option.label)
        : [...prevSelected, option.label]
    );
  };

  const handleNext = () => {
    navigation.navigate('HouseSelection', {
      name,
      email,
      height,
      weight,
      bmi,
      exerciseLevel,
      selectedOptions,
    });
  };

  return (
    <ImageBackground
      source={require('../assets/signupBG.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.stepperContainer}>
          <View style={[styles.step, styles.activeStep]} />
          <View style={[styles.step, styles.activeStep]} />
          <View style={[styles.step, styles.activeStep]} />
          <View style={[styles.step, styles.activeStep]} />
        </View>

        <View style={styles.centeredContent}>
          <Text style={styles.title}>Choose what describes you the most!</Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOptions.includes(option.label) && styles.selectedOption,
                  { width: option.size, height: option.size, marginLeft: (index % 2 === 0) ? 15 : 0, marginTop: (index % 3 === 0) ? 15 : 0 },
                ]}
                onPress={() => toggleOption(option)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
  },
  step: {
    height: 3,
    flex: 1,
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: '#fff',
  },
  inactiveStep: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: 'rgba(103, 122, 132, 0.19)',
    borderRadius: 100,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(184, 184, 184, 0.26)',
  },
  selectedOption: {
    backgroundColor: '#03C988',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  nextButton: {
    padding: 15,
    backgroundColor: 'transparent',
    borderColor: '#03C988',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#03C988',
    fontSize: 18,
  },
});

export default SelectionScreen;
