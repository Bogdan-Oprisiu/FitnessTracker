import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './start-workout.style'

export default function StartWorkout({ route }) {
  const { workout } = route.params;

  const workoutImage = 
    workout.type === 'strength'
      ? require('../../../assets/images/start-workout-strength-background.webp')
      : workout.type === 'cardio'
      ? require('../../../assets/images/start-workout-cardio-background.webp')
      : require('../../../assets/images/start-workout-stretching-background.webp');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

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
  }, []);

  const imageDarkenOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const fadeOutOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -80],
    extrapolate: 'clamp',
  });

  const exercisesOpacity = scrollY.interpolate({
    inputRange: [50, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleStartPress = (name) => {
    console.log('Workout ' + name + ' has started');
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.imageContainer, { opacity: imageDarkenOpacity }]}>
        <Image source={workoutImage} style={styles.workoutImage} />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.6)', 'black']}
          locations={[0.2, 0.7, 1]}
          style={styles.imageGradient}
        />
      </Animated.View>

      <View style={styles.contentContainer}>
        <Animated.Text style={[styles.workoutName, { transform: [{ translateY: titleTranslateY }] }]}>
          {workout.name}
        </Animated.Text>
        <Animated.View style={{ opacity: fadeOutOpacity }}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartPress(workout.name)}>
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.View style={[styles.pulseContainer, { opacity: fadeOutOpacity }]}>
        <Text style={styles.swipeText}>Swipe for Workout Details</Text>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <MaterialIcons name="keyboard-arrow-down" size={26} color="#6a0dad" />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.exercisesContainer, { opacity: exercisesOpacity }]}>
        <ScrollView 
          nestedScrollEnabled 
          style={styles.exercisesScrollView} 
          showsVerticalScrollIndicator={false}
        >
        {['Push-Ups', 'Sit-Ups', 'Squats', 'Lunges', 'Planks', 'Bench Press', 'Hammer Curls'].map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <Text style={styles.exerciseText}>{exercise}</Text>
              <Text style={styles.exerciseDetails}>Duration: 1 min</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.startWorkoutContainerScrolled}>
          <TouchableOpacity style={styles.startWorkoutButton} onPress={handleStartPress(workout.name)}>
            <Text style={styles.startWorkoutText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
