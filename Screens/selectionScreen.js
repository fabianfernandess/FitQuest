import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Dimensions } from 'react-native';

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

const { width } = Dimensions.get('window');

const SelectionScreen = ({ route, navigation }) => {
  const { Name, email, height, weight, bmi, exerciseLevel } = route.params;
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
      Name,
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

        <Text style={styles.title}>Choose what describes you the most!</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.bubblesContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOptions.includes(option.label) && styles.selectedOption,
                  { width: option.size, height: option.size },
                ]}
                onPress={() => toggleOption(option)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

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
    alignItems:'center',
    paddingBottom: 35,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
    marginHorizontal:20,
    marginTop:100,
    marginHorizontal:30
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
    marginBottom: 20,
    textAlign: 'center',
    marginHorizontal:50,
    
  },
  bubblesContainer: {
    paddingVertical:50,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: width * 2.5, // Adjust the width to control the wrapping (approx. 2.5 screen widths)
  },
  optionButton: {
    backgroundColor: 'rgba(103, 122, 132, 0.19)',
    borderRadius: 100,
    marginHorizontal:5,
    marginVertical: 5,
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
    backgroundColor: '#03C988',
    padding: 15,
    borderRadius: 10,
    marginTop:20,
    width:331,
    marginTop: 30,
    marginHorizontal:20,
  },
  nextButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default SelectionScreen;
