import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I’m your trainer from House Elara. I’ll help you with flexibility, yoga, and mental well-being. Let's get started! Can you tell me your height and weight?", sender: 'trainer' },
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Automatically send the initial message from the trainer
    const initialMessage = "Hi! I’m your trainer from House Elara. I’ll help you with flexibility, yoga, and mental well-being. Let's get started! Can you tell me your height and weight?";
    sendMessageToGemini([{ role: 'trainer', content: initialMessage }]);
  }, []);

  const sendMessage = async () => {
    if (input.trim()) {
      const newMessage = { id: messages.length + 1, text: input, sender: 'user' };
      setMessages([...messages, newMessage]);
      setInput('');

      try {
        const response = await sendMessageToGemini([...messages, newMessage].map(msg => ({ role: msg.sender, content: msg.text })));
        const botMessages = response.choices.map(choice => ({ id: messages.length + 2, text: choice.message.content, sender: 'trainer' }));
        setMessages([...messages, newMessage, ...botMessages]);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const sendMessageToGemini = async (messages) => {
    try {
      console.log('Sending request to Gemini API...');
      const prompt = messages.map(msg => msg.content).join('\n');
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      console.log(text);
      return { choices: [{ message: { content: text } }] };
    } catch (error) {
      console.error('Error communicating with Gemini API:', error);
      throw error;
    }
  };

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
});

export default Chat;
