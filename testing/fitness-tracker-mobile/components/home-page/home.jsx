import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../config/firebase-config';
import Toast from 'react-native-toast-message';

const Home = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Logged Out',
          text2: 'You have been successfully logged out.',
          position: 'top',
          visibilityTime: 5000,
          autoHide: true,
        });
        navigation.replace('Login');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
        Toast.show({
          type: 'error',
          text1: 'Logout Error',
          text2: 'An error occurred. Please try again.',
          position: 'top',
          visibilityTime: 5000,
          autoHide: true,
        });
      });
  };

  return (
    <LinearGradient
      colors={['#6a0dad', '#2c003e', '#1a1a1a']}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <View>
        <Text style={{ fontSize: 24, color: '#fff', marginBottom: 20 }}>Welcome to the Home Page!</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#fff',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: '#6a0dad', fontWeight: 'bold' }}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default Home;