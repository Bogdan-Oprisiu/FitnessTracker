import React, { useRef, useEffect } from 'react';
import { View, Image, Animated, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import WorkoutCard from './workout-card/workout-card';
import styles from './workouts.style';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function Workouts() {
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const gradientColorOpacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const backgroundImage = require('../../assets/images/workouts-background.webp');
  const navigation = useNavigation();
  const strength_background = require('../../assets/images/start-workout-strength-background.webp')
  const predefinedWorkouts = [
    { name: 'Full Body Blast', exercises: 10, duration: 30, difficulty: 'Intermediate', type: 'strength' },
    { name: 'Core Crusher', exercises: 8, duration: 20, difficulty: 'Advanced', type: 'stretching' },
    { name: 'Cardio Burn', exercises: 12, duration: 25, difficulty: 'Beginner', type: 'cardio' },
    { name: 'Full Body Blast', exercises: 10, duration: 30, difficulty: 'Intermediate', type: 'strength' },
    { name: 'Core Crusher', exercises: 8, duration: 20, difficulty: 'Advanced', type: 'stretching' },
    { name: 'Cardio Burn', exercises: 12, duration: 25, difficulty: 'Beginner', type: 'cardio' },
    { name: 'Core Crusher', exercises: 8, duration: 20, difficulty: 'Advanced', type: 'stretching' },
    { name: 'Cardio Burn', exercises: 12, duration: 25, difficulty: 'Beginner', type: 'cardio' },
  ];

  useEffect(() => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    Animated.timing(gradientColorOpacity, {
      toValue: 0.7,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleWorkoutPress = (workout) => {
    navigation.navigate('StartWorkout', { workout });
  }

  const textLeftPosition = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['15%', '12%'],
    extrapolate: 'clamp',
  });

  const textFontSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [50, 24],
    extrapolate: 'clamp',
  });

  const textTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundOverlay, { opacity: imageOpacity }]}>
        <Image source={backgroundImage} style={styles.backgroundImage} />
        <BlurView intensity={30} style={styles.blurView} />
        <LinearGradient
          colors={['transparent', '#000']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientOverlay}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: 'black', opacity: gradientColorOpacity },
        ]}
      />

      <Animated.Text
        style={[
          styles.yourWorkoutsText,
          { fontSize: textFontSize, left: textLeftPosition, transform: [
            { translateX: -20 },
            { translateY: textTranslateY },
          ], },
        ]}
      >
        Your Workouts
      </Animated.Text>

      <ScrollView
        contentContainerStyle={[styles.cardsContainer]}
        style={{ marginTop: 100, height: height }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {predefinedWorkouts.map((workout, index) => (
          <WorkoutCard
            key={index}
            name={workout.name}
            exercises={workout.exercises}
            duration={workout.duration}
            difficulty={workout.difficulty}
            type={workout.type}
            onPress={() => handleWorkoutPress(workout)}
          />
        ))}
        <TouchableOpacity style={styles.addWorkoutButton}>
          <Text style={styles.addWorkoutText}>+ Add Personalized Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
