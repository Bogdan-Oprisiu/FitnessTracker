import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, ScrollView, Modal, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './start-workout.style';

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
  const scrollY = useRef(new Animated.Value(0)).current;

  const [exercisesScrollEnabled, setExercisesScrollEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const openModal = (exercise) => {
    setModalVisible(true);
    setSelectedExercise(exercise);
    Animated.timing(modalOpacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalOpacity, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedExercise(null);
    });
  };

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

  const exercises = [
    { name: 'Push-Ups', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k' },
    { name: 'Sit-Ups', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k' },
    { name: 'Squats', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k' },
    { name: 'Lunges', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k' },
    { name: 'Planks', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k' },
    { name: 'Planks', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k' },
    { name: 'Planks', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k' },
  ];

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

    exercisesOpacity.addListener(({ value }) => {
      setExercisesScrollEnabled(value === 1);
    });

    return () => {
      exercisesOpacity.removeAllListeners();
    };
  }, [pulseAnim, exercisesOpacity]);

  const openYouTubeLink = (link) => {
    Linking.openURL(link).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <>
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
            <TouchableOpacity style={styles.startButton} onPress={() => console.log('Start Workout')}>
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
            scrollEnabled={exercisesScrollEnabled}
            style={styles.exercisesScrollView}
            showsVerticalScrollIndicator={false}
          >
            {exercises.map((exercise, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exerciseCard}
                onPress={() => exercisesOpacity.__getValue() === 1 && openModal(exercise)}
              >
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseText}>{exercise.name}</Text>
                  <Text style={styles.exerciseDuration}>Duration: {exercise.duration}</Text>
                </View>
                <MaterialIcons name="keyboard-arrow-right" size={32} color="#6a0dad" />
              </TouchableOpacity>
            ))}

        <View style={styles.startWorkoutContainerScrolled}>
          <TouchableOpacity style={styles.startWorkoutButton}>
            <Text style={styles.startWorkoutText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
          </ScrollView>
        </Animated.View>
      </ScrollView>

      {modalVisible && (
      <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, { opacity: modalOpacity }]}>
            <Text style={styles.modalTitle}>{selectedExercise?.name}</Text>
            <Text style={styles.modalDuration}>Duration: {selectedExercise?.duration}</Text>
            <TouchableOpacity
              style={styles.videoLinkButton}
              onPress={() => openYouTubeLink(selectedExercise?.videoLink)}
            >
              <Text style={styles.videoLinkText}>Watch Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
)}

    </>
  );
}
