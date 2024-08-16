// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebaseConfig';
import Chat from './Screens/chat';
import HouseSelectionScreen from './Screens/houseSelectionScreen';
import LoadingScreen from './Screens/loadingScreen';
import SelectionScreen from './Screens/selectionScreen';
import LoginScreen from './Screens/loginScreen';
import SignUpScreen from './Screens/signUpScreen';
import UserInfoScreen from './Screens/userInfoScreen';
import BMIScreen from './Screens/BMIScreen';
import ExerciseLevelScreen from './Screens/exerciseLevelScreen';

const Stack = createNativeStackNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.homeText}>Hi! Welcome to our app.</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Selection')} style={styles.button}>
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
};

export default function App() {
  const [initializing, setInitializing] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const auth = getAuth(app);

  const onAuthStateChangedHandler = (user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  React.useEffect(() => {
    const subscriber = onAuthStateChanged(auth, onAuthStateChangedHandler);
    return subscriber;
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="UserInfo" component={UserInfoScreen} />
            <Stack.Screen name="BMIScreen" component={BMIScreen} />
            <Stack.Screen name="Selection" component={SelectionScreen} />
            <Stack.Screen name="HouseSelection" component={HouseSelectionScreen} />
            <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }}/>
            <Stack.Screen name="ExerciseLevel" component={ExerciseLevelScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
        <Stack.Screen name="Loading" component={LoadingScreen}  />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeText: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
