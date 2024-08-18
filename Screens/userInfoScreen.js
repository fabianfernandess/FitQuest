// screens/UserInfoScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const UserInfoScreen = ({ route, navigation }) => {
  const [Name, setName] = useState(''); // New state for full name
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Extract email from route params
  const { email } = route.params;

  const handleNext = () => {
    const bmi = (weight / ((height / 100) ** 2)).toFixed(2);
    // Pass fullName, height, weight, bmi, and email to the next screen
    navigation.navigate('ExerciseLevel', { Name, height, weight, bmi, email });
  };

  return (
    <ImageBackground
      source={require('../assets/signupBG.png')} // Change the path accordingly
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <View style={styles.stepperContainer}>
            <View style={[styles.step, styles.activeStep]} />
            <View style={[styles.step, styles.activeStep]} />
            <View style={[styles.step, styles.inactiveStep]} />
            <View style={[styles.step, styles.inactiveStep]} />
          </View>

          <Text style={styles.title}>Let's get to know you better</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Type your full name"
            placeholderTextColor="#888"
            value={Name}
            onChangeText={setName}
          />

          <Text style={styles.label}>What's your height?</Text>
          <TextInput
            style={styles.input}
            placeholder="Type your height"
            placeholderTextColor="#888"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />

          <Text style={styles.label}>What's your weight?</Text>
          <TextInput
            style={styles.input}
            placeholder="Type your weight"
            placeholderTextColor="#888"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Go back</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 68,
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
    marginBottom: 60,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 40,
    backgroundColor: 'rgba(36, 40, 47, 0.69)',
    color: '#fff',
  },
  button: {
    backgroundColor: '#03C988',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
  },
  linkText: {
    color: '#007BFF',
    textAlign: 'center',
  },
});

export default UserInfoScreen;
