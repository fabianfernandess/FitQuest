// loadingScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LoadingScreen = ({ route, navigation }) => {
  const { selectedOptions } = route.params;

  useEffect(() => {
    setTimeout(() => {
      navigation.replace('HouseSelection', { selectedOptions });
    }, 2000); // Simulate loading time
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Selecting the best house for you...</Text>
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
  text: {
    fontSize: 24,
    color: '#fff',
  },
});

export default LoadingScreen;
