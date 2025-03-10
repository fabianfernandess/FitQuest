import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ref, set } from 'firebase/database';
import { db } from '../firebaseConfig';
import { Video } from 'expo-av';
import { getFitnessResponse } from '../API/chatApi'; // Import the OpenAI API function
import styles from "../styles/chatStyles"

// Function to encode the email for Firebase path
const encodeEmail = (email) => {
  return email.replace(/\./g, ',').replace(/@/g, '_at_');
};

// Background images based on house
const backgroundImages = {
  Nova: require('../assets/novaBG.png'),
  Valor: require('../assets/valorBG.png'),
  lumina: require('../assets/luminaBG.png'),
};

const Chat = ({ route }) => {
  const [messages, setMessages] = useState(route.params?.chatHistory || []);
  const [input, setInput] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  // Define currentExercise and exerciseInProgress state
  const [currentExercise, setCurrentExercise] = useState(null); // Track current exercise
  const [exerciseInProgress, setExerciseInProgress] = useState(false); // Flag to prevent looping

  const progress = useRef(new Animated.Value(0)).current;

  const userInfo = route.params?.userInfo || {};
  const {
    name = "User",
    email = "dummy@outlook.com", // Default email for example purposes
    height = 0,
    weight = 0,
    bmi = 0,
    exerciseLevel = "unknown",
    house = "unknown",
    selectedOptions = [],
  } = userInfo;

  const encodedEmail = encodeEmail(email); // Encode the email for Firebase path

  const getBackgroundImage = () => {
    switch (house) {
      case 'Nova':
        return backgroundImages.Nova;
      case 'Valor':
        return backgroundImages.Valor;
      case 'lumina':
        return backgroundImages.lumina;
      default:
        return require('../assets/splash.png'); // Fallback image
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!name || !house || !selectedOptions.length) {
          console.error("Incomplete user information provided.");
          throw new Error("Incomplete user information provided.");
        }

        if (messages.length === 0) {
          const prompt = `Hello ${name}, welcome to the House of ${house}! Based on your BMI of ${bmi}, activity level (${exerciseLevel}), and your selected goals (${selectedOptions.join(', ')}), I have tailored a fitness plan for you. Let's get started!`;

          const response = await getFitnessResponse({
            name,
            house,
            bmi,
            height,
            weight,
            exerciseLevel,
            selectedOptions,
            message: prompt,
          });

          if (response.response) {
            setMessages([{ id: 1, text: response.response, sender: 'trainer' }]);
          }
        }
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();

    Animated.timing(progress, {
      toValue: 1,
      duration: 3000, // 3 seconds for the splash screen
      useNativeDriver: false,
    }).start();
  }, [name, height, weight, bmi, exerciseLevel, house, selectedOptions]);

  const progressInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const takePicture = async () => {
    if (!permission.granted) {
      await requestPermission();
    }

    try {
      if (cameraRef.current) {
        const options = { quality: 0.5, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);
        const newImageMessage = {
          id: messages.length + 1,
          imageUri: data.uri, // Add image URI
          sender: 'user',
          type: 'image', // Specify the type as 'image'
        };
        const updatedMessagesWithImage = [...messages, newImageMessage];

        setMessages(updatedMessagesWithImage);
        setCameraVisible(false);

        // Save chat to Firebase
        await set(ref(db, `chats/${encodedEmail}`), updatedMessagesWithImage);
      } else {
        console.error("Camera reference is not available");
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  };

  const sendMessage = async () => {
    if (input.trim()) {
      const newMessage = { id: messages.length + 1, text: input, sender: 'user' };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setInput('');

      try {
        const response = await getFitnessResponse({
          ...userInfo,
          message: input,
        });

        if (response.response) {
          const botResponse = {
            id: updatedMessages.length + 1,
            text: response.response,
            sender: 'trainer',
            type: 'text',
          };

          const finalMessages = [...updatedMessages, botResponse];

          // If a YouTube link is provided, add it as a video message
          if (response.youtubeLink) {
            const videoMessage = {
              id: finalMessages.length + 1,
              sender: 'trainer',
              type: 'video',
              videoUrl: response.youtubeLink,
            };
            finalMessages.push(videoMessage);
          }

          setMessages(finalMessages);

          // Save chat to Firebase
          await set(ref(db, `chats/${encodedEmail}`), finalMessages);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages([...updatedMessages, { id: updatedMessages.length + 1, text: "Sorry, something went wrong. Please try again.", sender: 'trainer' }]);
      }
    }
  };

  const handleExerciseComplete = () => {
    setExerciseInProgress(false);
    setCurrentExercise(null);
  };

  if (!initialized) {
    return (
      <ImageBackground
        source={getBackgroundImage()}
        style={styles.Loading_backgroundImage}
      >
        <View style={styles.Loading_container}>
          <Text style={styles.Loading_welcomeText}>Hi {name}, welcome to {house}!</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, { width: progressInterpolate }]} />
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (cameraVisible) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.cameraPreview}
          ref={cameraRef}
          onCameraReady={() => console.log('Camera ready')}
        >
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
              <Text style={styles.captureButtonText}>SNAP</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/gradientBG.png')}
      style={styles.backgroundImage}
    >
      {/* Top Navigation */}
      <View style={styles.topNavContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.titleContainer}></View>
        <View style={styles.pointsContainer}>
          <Image source={require('../assets/points-icon.png')} style={styles.pointsIcon} />
          <Text style={styles.pointsText}>10</Text>
        </View>
      </View>

      <View style={styles.container}>
        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages.map((message, index) => (
            <View
              key={message.id || index}
              style={message.sender === 'trainer' ? styles.trainerMessage : styles.userMessage}
            >
              <Image
                source={message.sender === 'trainer' ? require('../assets/trainer.png') : require('../assets/user.png')}
                style={styles.profilePic}
              />
              {message.type === 'video' ? (
                <>
                  <Video
                    source={{ uri: message.videoUrl }}
                    style={styles.video}
                    useNativeControls
                    resizeMode="contain"
                    shouldPlay={true}
                    isLooping={true}
                    onPlaybackStatusUpdate={(status) => {
                      if (status.didJustFinish) {
                        handleExerciseComplete(); // Mark exercise as completed when video finishes
                      }
                    }}
                  />
                  {exerciseInProgress && currentExercise === message.text && (
                    <TouchableOpacity onPress={handleExerciseComplete} style={styles.completeButton}>
                      <Text style={styles.completeButtonText}>Exercise Completed</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : message.type === 'image' ? (
                <Image source={{ uri: message.imageUri }} style={styles.capturedImage} />
              ) : (
                <View style={message.sender === 'trainer' ? styles.trainerBubble : styles.userBubble}>
                  <Text style={message.sender === 'trainer' ? styles.trainerText : styles.userText}>
                    {message.text}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setCameraVisible(true)} style={styles.cameraButton}>
            <Image source={require('../assets/camera.png')} style={styles.cameraIcon} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your questions..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Image source={require('../assets/send.png')} style={styles.sendIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Chat;
