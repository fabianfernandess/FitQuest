import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const Chat = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [model, setModel] = useState(null); // Added state to store the model

  // Extracting userInfo safely with defaults
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

        // Construct the system instruction dynamically
        const systemInstruction = `
          You are an AI fitness trainer assigned to assist the user ${name}. 
          They belong to the ${house}, and their fitness profile is as follows:
          
          - BMI: ${bmi}
          - Height: ${height} cm
          - Weight: ${weight} kg
          - Exercise Level: ${exerciseLevel}
          - Fitness Goals: ${selectedOptions.join(', ')}

          Your role is to embody the traits and training approach of the ${house} to provide personalized fitness coaching. 
          Tailor your responses to match the user's fitness goals, and offer guidance on exercises, nutrition, and motivation.
        `;

        // Initialize the model with the system instruction
        const initializedModel = genAI.getGenerativeModel({
          model: 'gemini-1.5-pro',
          systemInstruction,
        });

        setModel(initializedModel); // Store the initialized model in state

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

  const sendMessage = async () => {
    if (input.trim()) {
      const newMessage = { id: messages.length + 1, text: input, sender: 'user' };
      setMessages([...messages, newMessage]);
      setInput('');

      try {
        if (model) { // Check if the model is initialized
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.map(message => (
          <View key={message.id} style={message.sender === 'trainer' ? styles.trainerMessage : styles.userMessage}>
            <Image
              source={message.sender === 'trainer' ? require('../assets/trainer.png') : require('../assets/user.png')}
              style={styles.profilePic}
            />
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
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
});

export default Chat;
