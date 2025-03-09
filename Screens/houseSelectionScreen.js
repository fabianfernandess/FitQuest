import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

// 🔹 House Crest Images
const houseImages = {
  Nova: require('../assets/houseofnova.png'),
  Lumina: require('../assets/houseoflumina.png'),
  Valor: require('../assets/houseofvalor.png'),
};

// 🔹 Trainer Profile Images
const trainerAvatars = {
  Nova: require('../assets/novaPP.png'),
  Lumina: require('../assets/luminaPP.png'),
  Valor: require('../assets/valorPP.png'),
};

// 🔹 Icons
const icons = {
  bmi: require('../assets/bullseye.png'),
  calories: require('../assets/fire.png'),
};

const HouseSelectionScreen = ({ route, navigation }) => {
  console.log("DEBUG - route.params:", route.params); // Check if data is received

  const {
    name = "Unknown",
    email = "N/A",
    height = 0,
    weight = 0,
    bmi = 0,
    exerciseLevel = "N/A",
    selectedOptions = [],
    house = "Nova", // Default to Nova if not found
    trainer = "Default Trainer",
    recommended_calories_per_day = 2000,
    target_bmi = 22,
    justification = "You belong here!",
  } = route.params || {};

  console.log("DEBUG - House Selection Data:", {
    name, email, height, weight, bmi, exerciseLevel, selectedOptions
  });

  // 🛠 Normalize houseKey
  const formattedHouse = house?.trim()?.replace(/^House of /i, '');
  const houseKey = formattedHouse?.charAt(0).toUpperCase() + formattedHouse?.slice(1).toLowerCase();

  console.log("DEBUG - Selected House:", houseKey);

  // 🏠 Assign House Crest and Trainer Profile Image
  const houseImage = houseImages[houseKey] || houseImages.Nova;
  const trainerAvatar = trainerAvatars[houseKey] || trainerAvatars.Nova;

  return (
    <ImageBackground source={require('../assets/hselectionBG.png')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Based on your selections, you belong to</Text>
        <Text style={styles.houseName}>{`House of ${houseKey}`}</Text>

        {/* Main Card */}
        <View style={styles.cardWrapper}>
          <View style={styles.overflowContainer} />
          <View style={styles.cardContainer}>
            
            {/* House Crest */}
            <Image source={houseImage} style={styles.houseImage} />

            {/* Justification */}
            <Text style={styles.justificationText}>{justification}</Text>

            {/* Trainer Info Section */}
            <View style={styles.trainerContainer}>
              <View>
                <Text style={styles.trainerLabel}>Trainer</Text>
                <Text style={styles.trainerName}>{trainer}</Text>
              </View>
              <Image source={trainerAvatar} style={styles.trainerAvatar} />
            </View>

            {/* BMI & Calories Section */}
            <View style={styles.infoContainer}>
              <View style={styles.infoBox}>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Target{"\n"}BMI</Text>
                  <Text style={styles.infoValue}>{target_bmi}</Text>
                </View>
                <Image source={icons.bmi} style={styles.infoIcon} />
              </View>

              <View style={styles.infoBox}>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Daily{"\n"}Calories</Text>
                  <Text style={styles.infoValue}>{recommended_calories_per_day} kcal</Text>
                </View>
                <Image source={icons.calories} style={styles.infoIcon} />
              </View>
            </View>
          </View>
          <View style={styles.overflowContainer} />
        </View>

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() =>
              navigation.navigate('Chat', {
                userInfo: {
                  name,
                  email,
                  height,
                  weight,
                  bmi,
                  exerciseLevel,
                  house: houseKey,
                  trainer,
                  recommended_calories_per_day,
                  target_bmi,
                  justification,
                  selectedOptions,
                },
              })
            }
          >
            <Text style={styles.confirmButtonText}>Confirm House</Text>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 0, // ✅ Ensures no extra top margin
    paddingTop: 0, // ✅ Avoids unnecessary spacing
  },
  title: {
    fontSize: 20,
    color: '#B5B5B5',
    textAlign: 'center',
    marginTop: 0, // ✅ Ensures no extra top margin
    paddingTop: 0, // ✅ Avoids unnecessary spacing
    
  },
  houseName: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    marginBottom:20,
  },
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0, // ✅ Avoids unnecessary spacing
    marginTop: 10,
  },
  overflowContainer: {
    width: 100,
    height: 475,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 7,
    marginHorizontal: 20,
  },
  cardContainer: {
    width: 274,
    height: 475,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 7,
    alignItems: 'center',
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  houseImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
    marginTop:15,
  },
  justificationText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  trainerContainer: {
    width: '100%',
    backgroundColor: 'rgba(103, 122, 132, 0.19)',
    borderRadius: 7,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trainerLabel: {
    fontSize: 14,
    color: '#BBBBBB',
  },
  trainerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D9D9D9',
    marginTop: 2,
  },
  trainerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  infoContainer: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  infoBox: {
    width: '48%',
    backgroundColor: 'rgba(103, 122, 132, 0.19)',
    borderRadius: 7,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  infoTextContainer: {
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: 14,
    color: '#BBBBBB',
    lineHeight: 18,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D9D9D9',
    marginTop: 4,
  },
  infoIcon: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 5,
    right: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  confirmButton: {
    width:320,
    height: 50,
    backgroundColor: '#03C988',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom:20,
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default HouseSelectionScreen;
