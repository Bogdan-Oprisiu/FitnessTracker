import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNavigation } from '@react-navigation/native';
import styles from './chat.style';

const gemini = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_KEY);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSend = async () => {
    if (!userMessage.trim() || loading) return;

    const newMessage = { id: Date.now().toString(), type: 'user', text: userMessage };
    setMessages((prev) => [...prev, newMessage]);

    setUserMessage('');
    setLoading(true);

    try {
      const prompt = `User: ${userMessage}\nAI:`;

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

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: result.response.text(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error with Gemini API:', error);

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
      <View style={styles.header}>
      <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.chatText}>GymBuddy Chat</Text>
        <View style={styles.infoContainer}>
          <MaterialIcons name="info-outline" size={18} color="#6a0dad" style={styles.infoIcon} />
          <Text style={styles.infoText}>Please note that chats disappear upon leaving the page</Text>
        </View>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Start the conversation!</Text>
        </View>
      ) : (
        <FlatList
          data={loading ? [...messages, { id: 'loading', type: 'ai', text: 'Thinking...' }] : messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask your Gym Buddy..."
          placeholderTextColor="#ccc"
          value={userMessage}
          onChangeText={setUserMessage}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={loading}
        >
          <Ionicons name="paper-plane" size={24} color={loading ? "#ccc" : "#6a0dad"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chat;
