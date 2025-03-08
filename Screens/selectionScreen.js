import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  ImageBackground, Dimensions, ActivityIndicator 
} from 'react-native';
import { fetchFitnessHouse } from '../API/openAIConfig'; // ✅ Correct Import
import { useNavigation } from '@react-navigation/native';

const options = [
  { label: "Quick & effective workouts", size: 120 },
  { label: "Love working out at home", size: 130 },
  { label: "Lifting heavy is my thing", size: 140 },
  { label: "Enjoy outdoor adventures", size: 130 },
  { label: "I like tracking my progress", size: 150 },
  { label: "Fast-paced & intense", size: 110 },
  { label: "I want to be more flexible", size: 140 },
  { label: "Workouts help me relax", size: 120 },
  { label: "I have limited workout time", size: 160 },
  { label: "HIIT is my go-to", size: 140 },
  { label: "Love working out with others", size: 140 },
  { label: "Building endurance matters", size: 150 },
  { label: "Strength training all the way", size: 120 },
  { label: "I enjoy speed & agility drills", size: 130 },
  { label: "Mind-body workouts are my vibe", size: 120 },
  { label: "Bodyweight exercises are my favorite", size: 130 },
];

const { width } = Dimensions.get('window');

const SelectionScreen = ({ route }) => {
  const { name, email, height, weight, bmi, exerciseLevel,age } = route.params;
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ Loading State
  const navigation = useNavigation();

  // Toggle selected preferences
  const toggleOption = (option) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(option.label)
        ? prevSelected.filter((item) => item !== option.label)
        : [...prevSelected, option.label]
    );
  };

  // Handle Next Button Click
  const handleNext = async () => {
    if (selectedOptions.length === 0) {
      alert("Please select at least one option!");
      return;
    }
  
    setLoading(true); // ✅ Show Loading Indicator
  
    const userData = {
      name,
      age,
      email,
      height,
      weight,
      bmi,
      exercise_level: exerciseLevel, // Example: "Moderately Active"
      preferences: selectedOptions, // Selected fitness preferences
    };
  
    console.log("🚀 Sending User Data to OpenAI:", JSON.stringify(userData, null, 2)); // ✅ Debugging Log
  
    try {
      const response = await fetchFitnessHouse(userData); // ✅ API Call
      console.log("🔹 OpenAI Raw Response:", response); // ✅ Debugging Log
  
      if (!response || typeof response !== "object") {
        throw new Error("Invalid response format from OpenAI");
      }
  
      if (!response.house) {
        console.warn("⚠️ No 'house' in response. Full Response:", response);
        alert("Unexpected response from AI. Please try again.");
        return;
      }
  
      // ✅ Navigate to HouseSelectionScreen
      navigation.navigate("HouseSelection", { ...response, userData });
  
    } catch (error) {
      console.error("❌ Error fetching OpenAI response:", error);
      alert("Error processing your request. Please try again.");
    } finally {
      setLoading(false); // ✅ Hide Loading Indicator
    }
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

        <TouchableOpacity onPress={handleNext} style={styles.nextButton} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextButtonText}>Next</Text>}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 35,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
    marginHorizontal: 20,
    marginTop: 100,
  },
  step: {
    height: 3,
    flex: 1,
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    marginHorizontal: 50,
  },
  bubblesContainer: {
    paddingVertical: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: width * 2.5,
  },
  optionButton: {
    backgroundColor: 'rgba(103, 122, 132, 0.19)',
    borderRadius: 100,
    marginHorizontal: 5,
    marginVertical: 2,
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
    marginTop: 20,
    width: 331,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default SelectionScreen;
