import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ImageBackground, Animated, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ref, set } from 'firebase/database';
import { db } from '../firebaseConfig';
import { getFitnessResponse } from '../API/chatApi'; // Import the OpenAI API function
import styles from "../styles/chatStyles";
import { WebView } from 'react-native-webview';

// Function to encode the email for Firebase path
const encodeEmail = (email) => {
  return email.replace(/\./g, ',').replace(/@/g, '_at_').replace(/\$/g, '_dollar_').replace(/#/g, '_hash_');
};

// Background images based on house
const backgroundImages = {
  Nova: require('../assets/novaBG.png'),
  Valor: require('../assets/valorBG.png'),
  Lumina: require('../assets/luminaBG.png'),
};

const trainerAvatars = {
  Nova: require('../assets/novaPP.png'),
  Lumina: require('../assets/luminaPP.png'),
  Valor: require('../assets/valorPP.png'),
};

const Chat = ({ route, navigation }) => {
  const [messages, setMessages] = useState(route.params?.chatHistory || []);
  const [points, setPoints] = useState(0); // State to store points
  const [input, setInput] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const progress = useRef(new Animated.Value(0)).current;

  const userInfo = route.params?.userInfo || {};
  const { name = "User", email = "dummy@outlook.com", height = 0, weight = 0, bmi = 0, exerciseLevel = "unknown", house = "unknown", selectedOptions = [] } = userInfo;

  const trainerAvatar = trainerAvatars[house] || trainerAvatars.Nova;
  const encodedEmail = encodeEmail(email); // Encode the email for Firebase path

  const getBackgroundImage = () => {
    switch (house) {
      case 'Nova':
        return backgroundImages.Nova;
      case 'Valor':
        return backgroundImages.Valor;
      case 'Lumina':
        return backgroundImages.Lumina;
      default:
        return require('../assets/splash.png'); // Fallback image
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log("Initializing chat..."); // Debugging log
        if (!name || !house || !selectedOptions.length) {
          console.error("Incomplete user information provided.");
          throw new Error("Incomplete user information provided.");
        }
    
        if (messages.length === 0) {
          const prompt = `Hello ${name}, welcome to the House of ${house}! Based on your BMI of ${bmi}, activity level (${exerciseLevel}), and your selected goals (${selectedOptions.join(', ')}), I have tailored a fitness plan for you. Let's get started!`;
    
          console.log("Sending prompt to OpenAI:", prompt); // Debugging log
    
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
    
          console.log("OpenAI Response:", response); // Debugging log
    
          if (response && response.response) {
            console.log("Setting greeting message:", response.response); // Debugging log
            setMessages([{ id: 1, text: response.response, sender: 'trainer' }]);
          } else {
            // Add the initialTrainerResponse here
            const initialTrainerResponse = "Hi Trainer! Let's get started!";
            console.log("Setting initial trainer message:", initialTrainerResponse);
            setMessages([{ id: 1, text: initialTrainerResponse, sender: 'trainer' }]);
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
      duration: 3000,
      useNativeDriver: false,
    }).start();
  }, [name, height, weight, bmi, exerciseLevel, house, selectedOptions]);

  const progressInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const takePicture = useCallback(async () => {
    if (!permission.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        alert('Camera permission is required to take pictures.');
        return;
      }
    }

    try {
      if (cameraRef.current) {
        const options = { quality: 0.5, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);
        const newImageMessage = { id: messages.length + 1, imageUri: data.uri, sender: 'user', type: 'image' };
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
  }, [permission, messages, encodedEmail]);

  const sendMessage = useCallback(async () => {
    if (input.trim()) {
      setIsLoading(true); // Start loading
      const newMessage = { id: messages.length + 1, text: input, sender: 'user' };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setInput('');
  
      try {
        const response = await getFitnessResponse({
          ...userInfo,
          message: input,
        });
  
        console.log('Raw OpenAI Response:', response); // Debugging log
  
        if (response && response.response) {
          console.log("Valid response received:", response); // Debugging log
  
          // Extract points from the sanitized counters
          const pointsEarned = response.counters.points;
          console.log("Points earned:", pointsEarned); // Debugging log
  
          // Update the points state
          setPoints((prevPoints) => prevPoints + pointsEarned);
  
          // Create the bot response object
          const botResponse = {
            id: updatedMessages.length + 1,
            text: response.response,
            sender: 'trainer',
            type: 'text',
            points: pointsEarned,
            exerciseDetails: response.exerciseDetails,
            youtubeLink: response.youtubeLink, // Add this line
          };

          console.log("Bot response object:", botResponse); // Debugging log
  
          const finalMessages = [...updatedMessages, botResponse];
          console.log("Final messages before state update:", finalMessages); // Debugging log
  
          // Save chat to Firebase
          try {
            await set(ref(db, `chats/${encodedEmail}`), finalMessages);
            console.log("Chat saved to Firebase successfully."); // Debugging log
          } catch (error) {
            console.error("Error saving chat to Firebase:", error); // Debugging log
          }
  
          // Update the messages state
          setMessages(finalMessages);
        } else {
          console.error('Invalid response structure from OpenAI:', response); // Debugging log
          setMessages([...updatedMessages, { id: updatedMessages.length + 1, text: "Sorry, something went wrong. Please try again.", sender: 'trainer' }]);
        }
      } catch (error) {
        console.error('Error sending message:', error); // Debugging log
        let errorMessage = "Sorry, something went wrong. Please try again.";
        if (error.message.includes("exerciseDetails")) {
          errorMessage = "Sorry, I couldn't generate a valid exercise plan. Please try again.";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        setMessages([...updatedMessages, { id: updatedMessages.length + 1, text: errorMessage, sender: 'trainer' }]);
      } finally {
        setIsLoading(false); // Stop loading
      }
    }
  }, [input, userInfo, messages, encodedEmail]);

  const convertToEmbedUrl = (url) => {
    if (!url) return null;
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^"&?\/\s]{11})/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url); // Throws an error if the URL is invalid
      return true;
    } catch (error) {
      return false;
    }
  };

  const sanitizeCounters = (counters) => {
    if (!counters) {
      return { calories: 0, points: 0, tasksCompleted: 0 };
    }
    return {
      calories: isNaN(Number(counters.calories)) ? 0 : Number(counters.calories),
      points: isNaN(Number(counters.points)) ? 0 : Number(counters.points),
      tasksCompleted: isNaN(Number(counters.tasksCompleted)) ? 0 : Number(counters.tasksCompleted),
    };
  };

  const handleTutorial = (messageId) => {
  const message = messages.find((msg) => msg.id === messageId);

  if (message && message.youtubeLink) {
    const tutorialMessage = {
      id: messages.length + 1,
      text: "Here's a guided tutorial!",
      sender: "trainer",
      youtubeLink: message.youtubeLink, //Use message.youtubeLink
      type: "video",
    };

    setMessages([...messages, tutorialMessage]);
  } else {
    // Handle case where there's no YouTube link
    const noVideoMessage = {
      id: messages.length + 1,
      text: "Sorry, I couldn't find a tutorial for that exercise.",
      sender: "trainer",
    };
    setMessages([...messages, noVideoMessage]);
  }
};

  const handleCompleted = (messageId) => {
    setPoints((prevPoints) => prevPoints + 5); // Add 5 points
  
    const completedMessage = {
      id: messages.length + 1,
      text: "Great job!",
      sender: "trainer",
    };
  
    setMessages([...messages, completedMessage]);
  };
  if (!initialized) {
    return (
      <ImageBackground source={getBackgroundImage()} style={styles.Loading_backgroundImage}>
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
        <CameraView style={styles.cameraPreview} ref={cameraRef} onCameraReady={() => console.log('Camera ready')}>
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
  
      <ImageBackground source={require('../assets/gradientBG.png')} style={styles.backgroundImage}>
        {/* Top Navigation */}
        <View style={styles.topNavContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={styles.titleContainer}></View>
          <View style={styles.pointsContainer}>
            <Image source={require('../assets/points-icon.png')} style={styles.pointsIcon} />
            <Text style={styles.pointsText}>
              {points || 0}
            </Text>
          </View>
        </View>
  
        <View style={styles.container}>



        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
  {messages.map((message, index) => {
    console.log("Rendering message:", message); // Debugging log

    return (
      <View key={message.id || index} style={message.sender === 'trainer' ? styles.trainerMessage : styles.userMessage}>
        {/* Parent Container for Message and Exercise Details/Buttons */}
        <View style={{ flexDirection: 'column' }}>
          {/* Message and Profile Picture */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* User Message: Avatar on the right, message bubble on the left */}
            {message.sender === 'user' && (
              <>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{message.text}</Text>
                </View>
                <Image source={trainerAvatar} style={styles.profilePic} />
              </>
            )}

            {/* Trainer Message: Avatar on the left, message bubble on the right */}
            {message.sender === 'trainer' && (
              <>
                <Image source={trainerAvatar} style={styles.profilePic} />
                <View style={styles.trainerBubble}>
                  <Text style={styles.trainerText}>{message.text}</Text>
                </View>
              </>
            )}
          </View>

          {/* Videos and Images */}
          {message.type === 'video' && isValidUrl(message.youtubeLink) ? (
            <View style={styles.videoContainer}>
              <WebView
                source={{ uri: convertToEmbedUrl(message.youtubeLink) }}
                style={{ width: '100%', height: 173 }}
                allowsFullscreenVideo={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            </View>
          ) : message.type === 'image' ? (
            <Image source={{ uri: message.imageUri }} style={styles.capturedImage} />
          ) : null}

          {/* Exercise Details and Buttons */}
          {message.exerciseDetails && (
  <View style={{ flexDirection: 'column', alignSelf: 'flex-start', maxWidth: '90%' }}>
  <View style={styles.exerciseDetailsBox}>
    {Array.isArray(message.exerciseDetails) ? (
      message.exerciseDetails.map((exercise, i) => (
        <Text key={i} style={styles.exerciseDetailsText}>
          {exercise.exercise} - {exercise.sets} sets of {exercise.reps} reps
        </Text>
      ))
    ) : (
      typeof message.exerciseDetails === 'object' && message.exerciseDetails.exercise ? (
        <Text style={styles.exerciseDetailsText}>
          {message.exerciseDetails.exercise} - {message.exerciseDetails.sets} sets of {message.exerciseDetails.reps} reps
        </Text>
      ) : null
    )}
  </View>
  <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.completedButton} onPress={() => handleCompleted(message.id)}>
      <Text style={styles.buttonText}>Completed</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tutorialButton} onPress={() => handleTutorial(message.id)}>
      <Text style={styles.buttonText}>Need Tutorial</Text>
    </TouchableOpacity>
  </View>
</View>
)}
        </View>
      </View>
    );
  })}
</ScrollView>
  
          {/* Input Container */}
          <View style={styles.inputContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <>
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
              </>
            )}
          </View>
        </View>
      </ImageBackground>
  );
};

export default React.memo(Chat);