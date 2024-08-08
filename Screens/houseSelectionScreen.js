// houseSelectionScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const houses = [
  {
    name: 'House Nova',
    description: 'House Nova specializes in strength training, HIIT, and endurance exercises.',
    image: require('../assets/houseNova.png'),
    match: ['I want to lose weight', 'I like tracking my progress'],
  },
  {
    name: 'House Elara',
    description: 'House Elara focuses on flexibility, yoga, and mental well-being.',
    image: require('../assets/houseElara.png'),
    match: ['I need short, flexible workout plans', 'I prefer exercising at home'],
  },
  {
    name: 'House Valor',
    description: 'House Valor is for those who love outdoor activities and team sports.',
    image: require('../assets/houseValor.png'),
    match: ['I want to lose weight', 'I prefer exercising at home'],
  },
];

const HouseSelectionScreen = ({ route, navigation }) => {
  const { selectedOptions } = route.params;

  const determineHouse = () => {
    for (let house of houses) {
      if (house.match.every(option => selectedOptions.includes(option))) {
        return house;
      }
    }
    return houses[0]; // Default to House Nova if no match found
  };

  const selectedHouse = determineHouse();

  const handleConfirm = () => {
    navigation.navigate('Chat', { selectedHouse });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Based on your selections you belong to</Text>
      <Image source={selectedHouse.image} style={styles.houseImage} />
      <Text style={styles.houseName}>{selectedHouse.name}</Text>
      <Text style={styles.houseDescription}>{selectedHouse.description}</Text>
      <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Slide to confirm house</Text>
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
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
  houseImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  houseName: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  houseDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default HouseSelectionScreen;
