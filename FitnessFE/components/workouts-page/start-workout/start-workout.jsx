import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './start-workout.style';

export default function StartWorkout({ route, navigation }) {
  const { workout } = route.params;

  const handleStartWorkout = () => {
    console.log('Starting workout:', workout.name);
  };

  const workoutImage = 
    workout.type === 'strength'
      ? require('../../../assets/images/start-workout-strength-background.webp')
      : workout.type === 'cardio'
      ? require('../../../assets/images/start-workout-cardio-background.webp')
      : require('../../../assets/images/start-workout-stretching-background.webp');
    
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);


  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={workoutImage}
          style={styles.workoutImage}
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 1)', 'black']}
          locations={[0, 1, 1]}
          style={styles.imageGradient}
        />
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pulseContainer}>
        <Text style={styles.swipeText}>Swipe for Workout Details</Text>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <MaterialIcons name="keyboard-arrow-down" size={26} color="#6a0dad" />
        </Animated.View>
      </View>
    </View>
  );
}
