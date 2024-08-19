import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground, Animated } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ref, set } from 'firebase/database';
import { db } from '../firebaseConfig';
import { Video } from 'expo-av';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Function to encode the email for Firebase path
const encodeEmail = (email) => {
  return email.replace(/\./g, ',').replace(/@/g, '_at_');
};

// Background images based on house
const backgroundImages = {
  Nova: require('../assets/novaBG.png'),
  Valor: require('../assets/valorBG.png'),
  Elara: require('../assets/elaraBG.png'),
};

// Mapping exercises to video files
const exerciseVideos = {
  "Bicycle Crunch": require('../assets/Animations/bicycleCrunch.mov'),
  "Burpees": require('../assets/Animations/burpees.mov'),
  "Push-Ups": require('../assets/Animations/pushups.mov'),
  "Squats": require('../assets/Animations/squats.mov'),
  "Star Jumps": require('../assets/Animations/starjumps.mov'),
  "Jumping Jacks": require('../assets/Animations/jumpingJacks.mov')
};

const Chat = ({ route }) => {
  const [messages, setMessages] = useState(route.params?.chatHistory || []);
  const [input, setInput] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [model, setModel] = useState(null);
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
    selectedOptions = []
  } = userInfo;

  const encodedEmail = encodeEmail(email); // Encode the email for Firebase path

  const getBackgroundImage = () => {
    switch (house) {
      case 'House Nova':
        return backgroundImages.Nova;
      case 'House Valor':
        return backgroundImages.Valor;
      case 'House Elara':
        return backgroundImages.Elara;
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

        const systemInstruction = `
        You are an advanced AI fitness trainer assisting the user ${name}. ${name} belongs to the ${house}, with the following fitness profile:

        - **BMI:** ${bmi}
        - **Height:** ${height} cm
        - **Weight:** ${weight} kg
        - **Exercise Level:** ${exerciseLevel}
        - **Fitness Goals:** ${selectedOptions.join(', ')}

        **Your Role:**
        - Provide personalized coaching, aligning with the traits of ${house}.
        - Focus on exercises for which demo videos are available.
        - Keep responses short, engaging, and motivational.
        - Always mention points earned after each exercise.
        - Avoid placeholders in responses.

        **House Traits and Approach:**

        1. **House of Valor (Trainer: Maximus):** Focus on strength and resilience. Provide clear, motivational guidance.
          - Example: "Hi ${name}, I'm Maximus from House Valor! Your BMI is ${bmi}. Let's build your strength with some focused exercises. Ready to start? 💪"

        2. **House of Elara (Trainer: Serene):** Focus on flexibility, well-being, and endurance. Offer gentle, supportive guidance.
          - Example: "Hello ${name}, I'm Serene from House Elara. 🌿 Your BMI is ${bmi}. Let's work on balance and mindfulness together. Shall we begin?"

        3. **House of Nova (Trainer: Lyra):** Focus on innovation and agility. Keep sessions dynamic and fun.
          - Example: "Hey ${name}, I'm Lyra from House Nova! 🌟 With a BMI of ${bmi}, let's keep things fresh with innovative workouts. Ready to dive in?"

        **Responsibilities:**

        1. **Greeting and Overview:** Start each session with a warm greeting. Introduce yourself and provide a brief, supportive BMI overview.

        2. **Exercise Guidance:** Introduce each exercise one at a time. Focus only on the following exercises for which demo videos are available:
           - **Bicycle Crunch**
           - **Burpees**
           - **Push-Ups**
           - **Squats**
           - **Star Jumps**
           - **Jumping Jacks**

           After explaining the exercise, immediately show the demo video. Wait for ${name} to confirm they’ve completed the exercise before moving on to the next step.

        3. **User Questions:** Address user questions clearly and helpfully, focusing on the specific exercise discussed.

        4. **Points System:** After each exercise, remind ${name} of the points they’ve earned and encourage continued progress.

        5. **Meal Verification:** After workouts, guide ${name} to verify their meal with a photo. Provide feedback on its nutritional content and award points for healthy choices.

        6. **Motivational Engagement:** Keep interactions lively and motivational, with regular progress updates. Tailor responses to ${name}'s performance.

        **Warnings:**
        - Do not include placeholders or vague instructions in responses.
        - Always keep the interactions positive, encouraging, and clear.
        `;

        const initializedModel = genAI.getGenerativeModel({
          model: 'gemini-1.5-pro',
          systemInstruction,
        });

        setModel(initializedModel);

        if (messages.length === 0) {
          const prompt = `Hello ${name}, welcome to the House of ${house}! Based on your BMI of ${bmi}, activity level (${exerciseLevel}), and your selected goals (${selectedOptions.join(', ')}), I have tailored a fitness plan for you. Let's get started!`;

          const result = await initializedModel.generateContent(prompt);
          const botMessage = result.response?.text();

          setMessages([{ id: 1, text: botMessage, sender: 'trainer' }]);
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

        const base64ImageData = data.base64;

        const imageData = {
          mimeType: 'image/jpeg',
          data: base64ImageData,
        };

        if (model) {
          const result = await model.generateContent([
            {
              inlineData: imageData,
            },
            { text: "Analyze this meal image." }
          ]);

          const botMessageText = result.response?.text();

          if (typeof botMessageText !== 'string') {
            throw new Error('Expected response text to be a string');
          }

          const botResponse = {
            id: updatedMessagesWithImage.length + 1,
            text: botMessageText,
            sender: 'trainer',
            type: 'text',
          };

          const finalMessages = [...updatedMessagesWithImage, botResponse];
          setMessages(finalMessages);

          // Save chat to Firebase
          await set(ref(db, `chats/${encodedEmail}`), finalMessages);
        }
      } else {
        console.error("Camera reference is not available");
      }
    } catch (error) {
      console.error('Error capturing image or processing with Gemini:', error);
    }
  };

  const sendMessage = async () => {
    if (input.trim()) {
      const newMessage = { id: messages.length + 1, text: input, sender: 'user' };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setInput('');
  
      try {
        if (model) {
          const prompt = messages.map((msg) => msg.text).join('\n') + `\n${input}`;
          const result = await model.generateContent(prompt);
  
          const botMessage = result.response?.text();
  
          // Check if the botMessage contains any of the exercise keywords
          let videoUrl = null;
          let exerciseMentioned = false;
  
          for (let exercise in exerciseVideos) {
            if (botMessage.includes(exercise)) {
              videoUrl = exerciseVideos[exercise];
              exerciseMentioned = true;
              break; // Stop looping once the relevant exercise video is found
            }
          }
  
          // Add trainer's message to the chat
          const botResponse = {
            id: updatedMessages.length + 1,
            text: botMessage,
            sender: 'trainer',
            type: 'text',
          };
  
          const finalMessages = [...updatedMessages, botResponse];
  
          // If an exercise was mentioned, add the corresponding video to the chat
          if (exerciseMentioned && videoUrl) {
            const videoMessage = {
              id: finalMessages.length + 1,
              sender: 'trainer',
              type: 'video',
              videoUrl: videoUrl,
            };
            finalMessages.push(videoMessage);
          }
  
          setMessages(finalMessages);
  
          // Save chat to Firebase with encoded email
          await set(ref(db, `chats/${encodedEmail}`), finalMessages);
        } else {
          console.error('Model is not initialized');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        // Optionally, show a user-friendly error message to the user
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
                    source={message.videoUrl}
                    style={styles.video}
                    useNativeControls
                    resizeMode="contain"
                    shouldPlay={true}
                    isLooping={true} // Ensure the video doesn't loop
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
                // Render the captured image
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

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  trainerMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    fontSize: 16,
  },
  userMessage: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 20,
    fontSize: 16,
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 10,
  },
  trainerBubble: {
    padding: 15,
    maxWidth: '85%',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  userBubble: {
    backgroundColor: '#03C988',
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
    marginRight: 10,
  },
  trainerText: {
    color: '#fff',
    fontSize: 16,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  video: {
    width: 320,
    height: 213,
    borderRadius: 10,
  },
  capturedImage: {
    width: 250,
    height: 150,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 5,
    backgroundColor: 'rgba(36, 40, 47, 0.6)',
    borderRadius: 10,
    marginHorizontal: 5,
    marginBottom: 20,
  },
  cameraButton: {
    marginHorizontal: 5,
    marginVertical: 5,
  },
  cameraIcon: {
    width: 24,
    height: 24,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#03C988',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  topNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 65,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#353E3A',
  },
  pointsIcon: {
    width: 28,
    height: 28,
    marginRight: 5,
  },
  pointsText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  cameraPreview: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    height: '100%',
  },
  captureButtonContainer: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  captureButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
  },
  captureButtonText: {
    fontSize: 14,
    color: '#000',
  },

  Loading_backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover',
  },
  Loading_container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  Loading_welcomeText: {
    color: '#fff',
    fontSize: 21,
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 50,
  },
  progressBarContainer: {
    width: '80%',
    height: 10,
    backgroundColor: '#d8d8d8',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#03C988',
    borderRadius: 5,
  },
  completeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#03C988',
    borderRadius: 10,
  },
  completeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default Chat;
