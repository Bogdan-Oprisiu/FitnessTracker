import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GlobalBackground = ({ children }) => (
  <LinearGradient colors={['#6a0dad', '#2c003e', '#1a1a1a']} style={styles.background}>
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});

export default GlobalBackground;
