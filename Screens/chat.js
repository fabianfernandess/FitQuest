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

        console.log('Raw OpenAI Response:', response);

        if (response && response.response) { // Changed to check for response property directly as per updated API function return
          const sanitizedResponse = response; // Now the direct return from getFitnessResponse is already sanitized

          // Extract points from the sanitized counters
          const pointsEarned = sanitizedResponse.counters.points;

          // Update the points state
          setPoints((prevPoints) => prevPoints + pointsEarned);

          // Create the bot response object
          const botResponse = {
            id: updatedMessages.length + 1,
            text: sanitizedResponse.response,
            sender: 'trainer',
            type: 'text',
            points: pointsEarned, // Include points in the bot response
            exerciseDetails: sanitizedResponse.exerciseDetails, // Include exerciseDetails
          };

          const finalMessages = [...updatedMessages, botResponse];

          // If a YouTube link is provided and valid, add it as a video message
          if (sanitizedResponse.youtubeLink && isValidUrl(sanitizedResponse.youtubeLink)) {
            const videoMessage = {
              id: finalMessages.length + 1,
              sender: 'trainer',
              type: 'video',
              youtubeLink: sanitizedResponse.youtubeLink,
            };
            finalMessages.push(videoMessage);
          }

          // Save chat to Firebase
          await set(ref(db, `chats/${encodedEmail}`), finalMessages);

          // Update the messages state
          setMessages(finalMessages);
        } else {
          console.error('Invalid response structure from OpenAI:', response); // Keep error logging in case of issues
          setMessages([...updatedMessages, { id: updatedMessages.length + 1, text: "Sorry, something went wrong. Please try again.", sender: 'trainer' }]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages([...updatedMessages, { id: updatedMessages.length + 1, text: "Sorry, something went wrong. Please try again.", sender: 'trainer' }]);
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
        text: "Here's a guided tutorial on how to do effective burpees!",
        sender: "trainer",
        youtubeLink: message.youtubeLink,
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
  {messages.map((message, index) => (
   <View key={message.id || index} style={message.sender === 'trainer' ? styles.trainerMessage : styles.userMessage}>
   {/* Parent Container for Trainer Message and Exercise Details/Buttons */}
   <View style={{ flexDirection: 'column' }}>
     {/* Trainer Message and Profile Picture */}
     <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
       <Image source={trainerAvatar} style={styles.profilePic} />
 
       {message.type === 'video' && isValidUrl(message.youtubeLink) ? (
         <View style={styles.videoContainer}>
           <WebView
             source={{ uri: convertToEmbedUrl(message.youtubeLink) }}
             style={{ width: '80%', height: 200 }}
             allowsFullscreenVideo={true}
             javaScriptEnabled={true}
             domStorageEnabled={true}
           />
         </View>
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
 
     {/* Exercise Details and Buttons Container */}
     {message.exerciseDetails && (
       <View style={{ flexDirection: 'column', alignSelf: 'flex-start', maxWidth: '90%' }}>
         {/* Exercise Details Section */}
         <View style={styles.exerciseDetailsContainer}>
           {Array.isArray(message.exerciseDetails) ? (
             message.exerciseDetails.map((exercise, i) => (
               <Text key={i} style={styles.exerciseText}>
                 {exercise.name}: {exercise.sets} sets of {exercise.reps} reps
               </Text>
             ))
           ) : (
             <Text style={styles.exerciseText}>
               {message.exerciseDetails.name}: {message.exerciseDetails.sets} sets of {message.exerciseDetails.reps} reps
             </Text>
           )}
         </View>
 
         {/* Buttons Section */}
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
  ))}
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