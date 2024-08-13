// BMIScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const BMIScreen = ({ route, navigation }) => {
  const { name, height, weight, bmi, exerciseLevel } = route.params;

  const handleNext = () => {
    navigation.navigate('Selection', { name, height, weight, bmi, exerciseLevel });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your BMI is {bmi}</Text>
      <Button title="Next" onPress={handleNext} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default BMIScreen;
