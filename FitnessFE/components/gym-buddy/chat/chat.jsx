import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import styles from './chat.style';

// Initialize Gemini with your API key
const gemini = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_KEY);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userMessage.trim() || loading) return;

    // Add user message to the chat
    const newMessage = { id: Date.now().toString(), type: 'user', text: userMessage };
    setMessages((prev) => [...prev, newMessage]);

    setUserMessage('');
    setLoading(true);

    try {
      // Prepare prompt for Gemini
      const prompt = `User: ${userMessage}\nAI:`;

      // Call Gemini API
      const model = gemini.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          candidateCount: 1,
          stopSequences: [],
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(prompt);

      // Add Gemini's response to the chat
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: result.response.text(), // Use the text response from Gemini
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error with Gemini API:', error);

      // Fallback AI response on error
      const fallbackMessage = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        text: "I'm having trouble responding right now. Please try again later!",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.type === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask your Gym Buddy..."
          value={userMessage}
          onChangeText={setUserMessage}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>{loading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chat;
