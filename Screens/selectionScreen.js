// selectionScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';

const options = [
  "I want to lose weight",
  "I like tracking my progress",
  "I need short, flexible workout plans",
  "I prefer exercising at home"
];

const SelectionScreen = ({ navigation }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const toggleOption = (option) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(option)
        ? prevSelected.filter((item) => item !== option)
        : [...prevSelected, option]
    );
  };

  const handleNext = () => {
    // Pass the selected options to the next screen
    navigation.navigate('Loading', { selectedOptions });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose what describes you the most!</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOptions.includes(option) && styles.selectedOption
            ]}
            onPress={() => toggleOption(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001F3F',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  optionsContainer: {
    width: '80%',
  },
  optionButton: {
    backgroundColor: '#1f7a8c',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#28A745',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  nextButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#28A745',
    borderRadius: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default SelectionScreen;
