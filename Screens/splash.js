import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/splashscreen.png')}
        style={styles.backgroundImage}
      >
        {/* Add any additional content here if needed */}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // This will cover the screen
  },
});

export default SplashScreen;
