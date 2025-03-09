import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageBackground, Animated, TextInput } from 'react-native';
import { ref, set, push, onValue } from 'firebase/database';
import { db } from '../firebaseConfig';
import YoutubeIframe from 'react-native-youtube-iframe';
import { sendMessageToChatGPT } from '../API/chatApi';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/chatStyles';

const backgroundImages = {
  Nova: require('../assets/novaBG.png'),
  Valor: require('../assets/valorBG.png'),
  Lumina: require('../assets/luminaBG.png'),
};

const Chat = ({ route }) => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [points, setPoints] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  
  console.log("Route Parameters:", route.params); // Debugging
  console.log("DEBUG - Received userInfo in Chat.js:", route.params?.userInfo);


  const userInfo = route.params?.userInfo || {};
  console.log("Extracted userInfo:", userInfo); // Debugging

  const {
    name = "User",
    email = "",
    height = 0,
    weight = 0,
    bmi = 0,
    exerciseLevel = "unknown",
    house = "unknown",
    selectedOptions = [],
    recommended_calories_per_day = 0,
    target_bmi = 0,
  } = userInfo;

  if (!email) {
    console.error("User email is missing. Check navigation parameters.", userInfo);
  }

  const getBackgroundImage = () => backgroundImages[house] || require('../assets/splash.png');

  useEffect(() => {
    const initializeChat = async () => {
      if (!email) {
        console.error("User email is missing. Check navigation parameters.");
        return;
      }

      // Firebase: Load Previous Messages
      const chatRef = ref(db, `chats/${email.replace(".", "_")}`);
      onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setMessages(data);
        }
      });

      // Generate welcome message
      const prompt = `Hello ${name}, welcome to ${house}! Based on your BMI of ${bmi}, activity level (${exerciseLevel}), and your selected goals (${selectedOptions.join(', ')}), I have tailored a fitness plan for you. Let's get started!`;

      try {
        const response = await sendMessageToChatGPT(prompt, userInfo);
        const trainerMessage = { id: 1, text: response.response, sender: 'trainer', type: 'text' };
        setMessages([trainerMessage]);

        // Save welcome message to Firebase
        await set(chatRef, [trainerMessage]);

        setInitialized(true);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();

    // Loading animation
    Animated.timing(progress, { toValue: 1, duration: 3000, useNativeDriver: false }).start();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { id: messages.length + 1, text: input, sender: "user", type: "text" };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");

    try {
      const response = await sendMessageToChatGPT(input, userInfo);
      const trainerMessage = { id: updatedMessages.length + 1, text: response.response, sender: "trainer", type: "text" };

      setMessages([...updatedMessages, trainerMessage]);

      // Save messages to Firebase
      const chatRef = ref(db, `chats/${email.replace(".", "_")}`);
      await set(chatRef, [...updatedMessages, trainerMessage]);

      // Update Points if API returns them
      if (response.points) {
        setPoints((prev) => prev + response.points);
      }
    } catch (error) {
      console.error("ChatGPT API error:", error);
    }
  };

  return initialized ? (
    <ImageBackground source={getBackgroundImage()} style={styles.backgroundImage}>
      <View style={styles.container}>
        {/* Points Section */}
        <View style={styles.pointsContainer}>
          <Image source={require('../assets/points-icon.png')} style={styles.pointsIcon} />
          <Text style={styles.pointsText}>{points}</Text>
        </View>

        {/* Chat Messages */}
        <ScrollView style={styles.chatContainer}>
          {messages.map((msg) => (
            <View key={msg.id} style={msg.sender === 'user' ? styles.userMessage : styles.trainerMessage}>
              {msg.type === 'video' ? (
                <YoutubeIframe height={200} videoId={msg.youtubeLink} />
              ) : (
                <Text style={styles.messageText}>{msg.text}</Text>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input Section */}
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type a message..." />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  ) : (
    <ImageBackground source={getBackgroundImage()} style={styles.Loading_backgroundImage}>
      <View style={styles.Loading_container}>
        <Text style={styles.Loading_welcomeText}>Hi {name}, welcome to {house}!</Text>
      </View>
    </ImageBackground>
  );
};

export default Chat;
