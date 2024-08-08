import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet} from 'react-native';
import { Picker } from '@react-native-picker/picker';  // Correct import for Picker
import { db, auth } from '../firebaseConfig';
import { ref, set } from 'firebase/database';

const UserInfoScreen = ({ navigation }) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [exerciseLevel, setExerciseLevel] = useState('');

  const handleNext = async () => {
    const user = auth.currentUser;
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    if (!isNaN(heightInMeters) && !isNaN(weightInKg) && heightInMeters > 0) {
      const bmi = weightInKg / (heightInMeters * heightInMeters);
      await set(ref(db, 'users/' + user.uid + '/info'), {
        height: height,
        weight: weight,
        exerciseLevel: exerciseLevel,
        bmi: bmi.toFixed(2),
      });
      navigation.navigate('BMIScreen', { bmi: bmi.toFixed(2) });
    } else {
      console.error('Invalid height or weight');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's get to know you better</Text>
      <TextInput
        style={styles.input}
        placeholder="What's your height? (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="What's your weight? (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      <Picker
        selectedValue={exerciseLevel}
        style={styles.input}
        onValueChange={(itemValue) => setExerciseLevel(itemValue)}
      >
        <Picker.Item label="Sedentary" value="sedentary" />
        <Picker.Item label="Lightly active" value="lightly_active" />
        <Picker.Item label="Moderately active" value="moderately_active" />
        <Picker.Item label="Very active" value="very_active" />
        <Picker.Item label="Super active" value="super_active" />
      </Picker>
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
