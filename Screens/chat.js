import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
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
        return require('../assets/novaBG.png');
      case 'House Valor':
        return require('../assets/valorBG.png');
      case 'House Elara':
        return require('../assets/elaraBG.png');
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
        You are an advanced AI fitness trainer assigned to assist the user ${name}. 
        ${name} belongs to the ${house}, and their fitness profile is as follows:
        - BMI: ${bmi}
        - Height: ${height} cm
        - Weight: ${weight} kg
        - Exercise Level: ${exerciseLevel}
        - Fitness Goals: ${selectedOptions.join(', ')}

        Your role is to embody the traits and training approach of the ${house} to provide personalized fitness coaching. Tailor your responses to match the user's fitness goals, offering guidance on exercises, nutrition, and motivation in short, engaging, and fun pieces. Use emojis and keep the tone light and motivational.

        **House Traits:**
        1. **House of Valor**
          - **Trainer:** Maximus
          - **Traits:** Strength, resilience, and high-intensity training.
          - **Approach:** Be direct, assertive, and highly motivational. Push ${name} to exceed their limits with strength-building exercises.

        2. **House of Elara**
          - **Trainer:** Serene
          - **Traits:** Flexibility, mental well-being, and endurance.
          - **Approach:** Offer gentle encouragement with a focus on yoga, meditation, and balanced workouts. Keep the tone calm and supportive.

        3. **House of Nova**
          - **Trainer:** Lyra
          - **Traits:** Innovation, agility, and cutting-edge fitness technology.
          - **Approach:** Keep things fresh, dynamic, and tech-savvy. Engage ${name} with innovative workouts and maintain an inspiring tone.

        **Responsibilities:**
        1. **Step-by-Step Guidance:** 
          - Start with exercises that have associated demo videos in the system. 
          - Introduce one exercise at a time with a clear, concise instruction like, “Let's start with Jumping Jacks. Here's how to do it.”
          - Immediately follow up with, “Here’s the demonstration,” and display the demo video right after the instruction.
          - Ensure that the video is displayed right after the instruction, so ${name} can see how the exercise is performed.
          - Wait for ${name} to confirm they’ve completed the exercise before moving on to the next step.

        2. **Handling User Questions Related to Videos:**
          - If ${name} asks questions related to an exercise right after a video has been shown, understand that the question is likely about the exercise demonstrated in the video.
          - Provide further clarification, tips, or additional guidance on the specific exercise shown in the video, ensuring ${name} fully understands how to perform it correctly.

        3. **Progress and Points System:**
          - After each completed exercise, remind ${name} of the points they’ve earned and how it contributes to their overall goals. For example, "Great job! You've earned 10 points for completing that exercise!"

        4. **Meal Verification:**
          - After the workout, guide ${name} to verify their meal by snapping a photo. Provide immediate feedback on the nutritional content and its alignment with their fitness goals.
          - Reward verified meals with additional points to encourage healthy eating habits.

        5. **Motivational Engagement:**
          - Keep the interaction lively with motivational messages, emojis, and regular updates on their progress.
          - Tailor responses based on ${name}'s performance, keeping them focused and engaged.

        **Task:**
        - Start each session with a warm greeting. Introduce yourself, the house, and the first exercise, play the demo video immediately after, and confirm that ${name} has completed it before moving on to the next step. Maintain a friendly, motivating tone throughout, and use the points system to keep ${name} engaged and motivated. Ensure the conversation is short and to the point, with only one exercise or task discussed at a time.
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
  }, [name, height, weight, bmi, exerciseLevel, house, selectedOptions]);

  const takePicture = async () => {
    if (!permission.granted) {
      await requestPermission();
    }

    try {
      if (cameraRef.current) {
        const options = { quality: 0.5, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);
        setImageUri(data.uri);
        setCameraVisible(false);

        // Directly use the base64 data
        const base64ImageData = data.base64;

        // Prepare the image data for Gemini
        const imageData = {
          mimeType: 'image/jpeg',
          data: base64ImageData
        };

        // Use the image data in your AI model prompt
        if (model) {
          const result = await model.generateContent([
            {
              inlineData: imageData,
            },
            { text: "Analyze this meal image." }
          ]);

          const botMessage = result.response?.text || "Sorry, I couldn't process the image.";

          const botResponse = {
            id: messages.length + 2,
            text: botMessage,
            sender: 'trainer',
            type: 'text',
          };

          const finalMessages = [...messages, botResponse];
          setMessages(finalMessages);

          // Save chat to Firebase with encoded email
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
          const prompt = messages.map(msg => msg.text).join('\n') + `\n${input}`;
          const result = await model.generateContent(prompt);
          const botMessage = result.response?.text();

          let videoUrl = null;
          for (let exercise in exerciseVideos) {
            if (botMessage.includes(exercise)) {
              videoUrl = exerciseVideos[exercise];
              break;
            }
          }

          const botResponse = { 
            id: messages.length + 2, 
            text: botMessage, 
            sender: 'trainer', 
            type: videoUrl ? 'video' : 'text', 
            videoUrl: videoUrl 
          };

          const finalMessages = [...updatedMessages, botResponse];
          setMessages(finalMessages);

          // Save chat to Firebase with encoded email
          await set(ref(db, `chats/${encodedEmail}`), finalMessages);
        } else {
          console.error('Model is not initialized');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  if (!initialized) {
    return (
      <ImageBackground
      source={getBackgroundImage()}
      style={styles.Loading_backgroundImage}
    >
      <View style={styles.Loading_container}>
        <Text style={styles.Loading_welcomeText}>Hi Andrew, welcome to {house}!{'\n'}I'm Lyra your trainer!</Text>
        <TouchableOpacity style={styles.Loading_button} onPress={() => navigation.navigate('NextScreen')}>
          <Text style={styles.Loading_buttonText}>Next</Text>
        </TouchableOpacity>
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

      {/* Main Chat Content */}
      <View style={styles.container}>
        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages.map(message => (
            <View key={message.id} style={message.sender === 'trainer' ? styles.trainerMessage : styles.userMessage}>
              <Image
                source={message.sender === 'trainer' ? require('../assets/trainer.png') : require('../assets/user.png')}
                style={styles.profilePic}
              />
              {message.type === 'video' ? (
                <Video
                  source={message.videoUrl}
                  style={styles.video}
                  useNativeControls
                  resizeMode="contain"
                  shouldPlay={true}   // This will start the video automatically
                  isLooping={false}   // Set to true if you want the video to loop
                />
              ) : message.imageUri ? (
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
  },
  userMessage: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  },
  userText: {
    color: '#fff',
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
      marginHorizontal:50,
    },
    Loading_button: {
      backgroundColor: '#03C988',
      padding: 15,
      borderRadius: 10,
      marginTop:20,
      width:331,
    },
    Loading_buttonText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 18,
    },

});

export default Chat;
