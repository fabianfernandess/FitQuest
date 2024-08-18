import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';

const options = [
  { label: "Lose Weight", size: 120 },
  { label: "Track Progress", size: 100 },
  { label: "Flexible Plans", size: 150 },
  { label: "Exercise at Home", size: 130 },
];

const SelectionScreen = ({ route, navigation }) => {
  const { name, email, height, weight, bmi, exerciseLevel } = route.params;
  const [selectedOptions, setSelectedOptions] = useState([]);

  const toggleOption = (option) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(option)
        ? prevSelected.filter((item) => item !== option)
        : [...prevSelected, option]
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
      source={require('../assets/signupBG.png')} // Replace with the correct background image path
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <View style={styles.stepperContainer}>
            <View style={[styles.step, styles.activeStep]} />
            <View style={[styles.step, styles.activeStep]} />
            <View style={[styles.step, styles.activeStep]} />
            <View style={[styles.step, styles.activeStep]} />
          </View>

          <Text style={styles.title}>Choose what describes you the most!</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOptions.includes(option.label) && styles.selectedOption,
                  { width: option.size, height: option.size },
                ]}
                onPress={() => toggleOption(option.label)}
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
    justifyContent: 'space-between',
    padding: 30,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: 'rgba(103, 122, 132, 0.19)',
    borderRadius: 100,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
