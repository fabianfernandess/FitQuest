import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';
import { CameraView, useCameraPermissions } from 'expo-camera';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const Chat = ({ route }) => {
  const [messages, setMessages] = useState([]);
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
    height = 0,
    weight = 0,
    bmi = 0,
    exerciseLevel = "unknown",
    house = "unknown",
    selectedOptions = []
  } = userInfo;

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

            House of Valor:
            AI Trainer Name: Maximus
            Traits: Focuses on strength, resilience, and high-intensity training.
            Training Approach: Maximus is assertive and challenges users with powerlifting and bodybuilding workouts. Keep responses direct, encouraging, and motivational.

            House of Elara:
            AI Trainer Name: Serene
            Traits: Emphasizes mental well-being, flexibility, and endurance.
            Training Approach: Serene offers nurturing advice with yoga, meditation, and gentle fitness routines. Responses should be calming, supportive, and focused on balance.

            House of Nova:
            AI Trainer Name: Lyra
            Traits: Prioritizes innovation, agility, and cutting-edge fitness technology.
            Training Approach: Lyra keeps things fresh and exciting with the latest fitness trends. Responses should be dynamic, tech-savvy, and inspiring.

            Additional Responsibilities:
            - Workout Demos and Animations: Each workout session includes a demo or animation to provide clear, visual instructions, ensuring exercises are performed correctly and safely.
            - Calorie Goals and Meal Verification: Set personalized daily calorie goals. After workouts, remind the user to verify their meal by capturing an image with their camera. Use image recognition to assess the meal’s nutritional content, giving immediate feedback. Meals that align with their goals are marked as 'verified' and earn them points.
            - Points System: Encourage consistent engagement by awarding points for completing workouts, verifying meals, and meeting daily calorie goals. Points can be accumulated and redeemed for rewards such as badges, gift vouchers, or discounts on fitness gear. For example:
              - Workout Completion: 💪 10 points per completed workout.
              - Meal Verification: 🍎 5 points per verified healthy meal.
              - Meeting Calorie Goals: 🎯 Additional points for maintaining within the calorie range.
            - Interactive Elements: Incorporate fun elements like virtual challenges, progress tracking, and real-time feedback. Regularly notify users of their points and progress with motivational messages and emojis to keep the experience engaging.

            Task:
            Begin each interaction with a friendly greeting and introduction. Design a comprehensive week-long training program reflecting your house’s ethos. Include daily workouts, motivational messages, and tailored nutrition tips, but deliver the information in small, manageable chunks. After workouts, prompt the user to verify their meals, track calorie intake, and remind them of the points they’ve earned. Ensure every interaction is engaging, fun, and keeps the user motivated towards achieving their fitness goals.

            `;

        const initializedModel = genAI.getGenerativeModel({
          model: 'gemini-1.5-pro',
          systemInstruction,
        });

        setModel(initializedModel);

        const prompt = `Hello ${name}, welcome to the House of ${house}! Based on your BMI of ${bmi}, activity level (${exerciseLevel}), and your selected goals (${selectedOptions.join(', ')}), I have tailored a fitness plan for you. Let's get started!`;

        const result = await initializedModel.generateContent(prompt);
        const response = await result.response;
        const botMessage = response.text();

        setMessages([{ id: 1, text: botMessage, sender: 'trainer' }]);
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
      setMessages([...messages, newMessage]);
      setInput('');

      try {
        if (model) {
          const prompt = messages.map(msg => msg.text).join('\n') + `\n${input}`;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const botMessage = response.text();

          setMessages(prevMessages => [
            ...prevMessages,
            { id: prevMessages.length + 1, text: botMessage, sender: 'trainer' }
          ]);
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
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.map(message => (
          <View key={message.id} style={message.sender === 'trainer' ? styles.trainerMessage : styles.userMessage}>
            <Image
              source={message.sender === 'trainer' ? require('../assets/trainer.png') : require('../assets/user.png')}
              style={styles.profilePic}
            />
            {message.imageUri ? (
              <Image source={{ uri: message.imageUri }} style={styles.capturedImage} />
            ) : (
              <Text style={styles.messageText}>{message.text}</Text>
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
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F3F',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPreview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignSelf: 'stretch',
  },
  captureButtonContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  captureButton: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  captureButtonText: {
    fontSize: 14,
    color: '#000',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 10,
  },
  trainerMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  messageText: {
    backgroundColor: '#1f7a8c',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#001F3F',
  },
  cameraButton: {
    marginRight: 10,
  },
  cameraIcon: {
    width: 30,
    height: 30,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#28A745',
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
  },
  loadingText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  capturedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});

export default Chat;
