import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Workouts() {

  return (
    <LinearGradient
      colors={['#ffffff', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <View>
        <Text style={{ fontSize: 24, color: '#fff', marginBottom: 20 }}>Welcome to the Workouts Page!</Text>
      </View>
    </LinearGradient>
  );
}
