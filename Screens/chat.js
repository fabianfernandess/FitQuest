import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image,ImageBackground,KeyboardAvoidingView } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebaseConfig';
import { Video } from 'expo-av';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Function to encode the email for Firebase path
const encodeEmail = (email) => {
  return email.replace(/\./g, ',').replace(/@/g, '_at_');
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
          const response = await result.response;
          const botMessage = response.text();

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

        const newMessage = { id: messages.length + 1, text: 'Image captured', imageUri: data.uri, sender: 'user' };
        setMessages([...messages, newMessage]);

        // Save message to Firebase
        await set(ref(db, `chats/${encodedEmail}`), messages);
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
        if (model) {
          const prompt = messages.map(msg => msg.text).join('\n') + `\n${input}`;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const botMessage = response.text();
  
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
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
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
        source={require('../assets/gradientBG.png')} // Replace with your background image path
        style={styles.backgroundImage}
      >
        <View style={styles.topNavContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            {/* <Text style={styles.titleText}>Chat</Text> */}
          </View>
          <View style={styles.pointsContainer}>
            <Image source={require('../assets/points-icon.png')} style={styles.pointsIcon} />
            <Text style={styles.pointsText}>10</Text>
          </View>
        </View>
  
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={90} // Adjust based on your header height
        >
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
        </KeyboardAvoidingView>
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
    paddingTop:30,
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
    borderRadius: '10%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  },
  userBubble: {
    backgroundColor: '#1ccf6e', // Green bubble color for user
    padding: 10,
    borderRadius: '10%',
    maxWidth: '80%',
    marginRight: 10,
  },
  trainerText: {
    color: '#fff', // White text for trainer
  },
  userText: {
    color: '#fff', // White text for user
  },
  video: {
    width: 320, /* 90% of 390px screen width */
    height: 213,/* Adjusted to maintain aspect ratio */
    borderRadius: "20%",
    // marginTop: 20,
  },
  capturedImage: {
    width: 250,
    height: 150,
    borderRadius: 10,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft:10,
    paddingRight:5,
    paddingVertical:5,
    backgroundColor: 'rgba(36, 40, 47, 0.6)', // Dark background for the input field
    borderRadius: '10%', // Rounded corners
    marginHorizontal: 5,
    marginBottom: 20, // Add some margin at the bottom
  },
  cameraButton: {
    marginHorizontal: 5,
    marginVertical:5,
  },
  cameraIcon: {
    width: 24, // Adjust icon size to fit within the input container
    height: 24,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20, // Rounded corners for the input field
    color: '#fff', // White text color
  },
  sendButton: {
    backgroundColor: '#34c759', // Green color for the send button
    padding: 10,
    borderRadius:10, // Rounded button shape
    marginLeft: 10, // Space between input and send button
  },
  sendButtonText: {
    color: '#fff', // White text for the send button
    fontSize: 18, // Larger font size for the send icon
  },
  topNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:0,
    paddingTop:65,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 10, // Vertical padding for spacing
    paddingHorizontal: 15, // Horizontal padding for spacing
    // borderBottomWidth: 1,
    // borderBottomColor: '#333', // Subtle bottom border color
  },
  backButton: {
    padding: 10, // Space around the back button
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff', // White color for the icon
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center', // Center the title text
  },
  titleText: {
    color: '#fff', // White text color
    fontSize: 18,
    fontWeight: '600', // Slightly bolder text
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#353E3A'
  },
  pointsIcon: {
    width: 28,
    height: 28,
    marginRight: 5,
    // tintColor: '#fff', // White color for the points icon
  },
  pointsText: {
    color: '#fff', // White text color
    fontSize: 16,
    marginRight:10,
  },
});

export default Chat;
