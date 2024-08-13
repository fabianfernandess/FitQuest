// userInfoScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const UserInfoScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [exerciseLevel, setExerciseLevel] = useState('');

  const handleNext = () => {
    const bmi = (weight / ((height / 100) ** 2)).toFixed(2);
    navigation.navigate('ExerciseLevel', { name, height, weight, bmi });
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's get to know you better</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="What's your height?"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="What's your weight?"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      
      <Button title="Next" onPress={handleNext} />
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
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default UserInfoScreen;
