// BMIScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const BMIScreen = ({ route, navigation }) => {
  const { bmi } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your BMI is</Text>
      <Text style={styles.bmi}>{bmi}</Text>
      <Button title="Next" onPress={() => navigation.navigate('Selection')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  bmi: {
    fontSize: 48,
    marginBottom: 20,
  },
});

export default BMIScreen;
