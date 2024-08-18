import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

const { width } = Dimensions.get('window');

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
  const { name, email, height, weight, bmi, exerciseLevel, selectedOptions } = route.params;

  const [selectedHouseIndex, setSelectedHouseIndex] = useState(0);
  const selectedHouse = houses[selectedHouseIndex];

  const auth = getAuth();
  const db = getDatabase();

  const handleConfirm = () => {
    const userId = auth.currentUser.uid;
    const userRef = ref(db, `users/${userId}`);

    const userInfo = {
      name,
      email,
      height,
      weight,
      bmi,
      exerciseLevel,
      house: selectedHouse.name,
      selectedOptions,
    };

    set(userRef, userInfo)
      .then(() => {
        navigation.navigate('Chat', { userInfo });
      })
      .catch((error) => {
        console.error('Error writing document: ', error);
      });
  };

  return (
    <ImageBackground
      source={require('../assets/hselectionBG.png')} // Replace with the actual path to your background image
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Based on your selections you belong to</Text>
        <Text style={styles.houseName}>{selectedHouse.name}</Text>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const selectedIndex = Math.round(contentOffsetX / width);
            setSelectedHouseIndex(selectedIndex);
          }}
          contentContainerStyle={styles.scrollViewContent}
        >
          {houses.map((house, index) => (
            <View key={index} style={[styles.cardContainer, index === selectedHouseIndex && styles.selectedCard]}>
              <Image source={house.image} style={styles.houseImage} />
              <Text style={styles.houseDescription}>{house.description}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.indicatorContainer}>
          {houses.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === selectedHouseIndex ? styles.activeIndicator : styles.inactiveIndicator,
              ]}
            />
          ))}
        </View>
        <Text style={styles.swipeText}>Swipe to explore other houses</Text>

        {/* Regular button replacing the swipe button */}
        <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirm House</Text>
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
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: '#B5B5B5',
    marginBottom: 10,
    textAlign: 'center',
    marginTop:120,
  },
  houseName: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollViewContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: 274, // Figma dimensions
    height: 334, // Figma dimensions
    marginHorizontal: (width - 320) / 2, // Centering the card
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Glassmorphic effect
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    borderColor: '#FFF', // Border color
    borderWidth: 1, // Border width
  },
  selectedCard: {
    transform: [{ scale: 1.1 }],
  },
  houseImage: {
    width: 200, // Increase the logo size
    height: 250, // Increase the logo size
    marginBottom: 5,
  },
  houseDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: '#03C988',
  },
  inactiveIndicator: {
    backgroundColor: '#ccc',
  },
  swipeText: {
    fontSize: 14,
    color: '#B5B5B5',
    marginVertical: 20,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#03C988',
    padding: 15,
    borderRadius: 10,
    marginTop:20,
  },
  confirmButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default HouseSelectionScreen;
