import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, ScrollView, Modal, Linking, Easing, LayoutAnimation, Platform, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from './start-workout.style';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function StartWorkout({ route }) {
  const { workout } = route.params;
  const navigation = useNavigation();

  const workoutImage =
    workout.type === 'strength'
      ? require('../../../assets/images/start-workout-strength-background.webp')
      : workout.type === 'cardio'
      ? require('../../../assets/images/start-workout-cardio-background.webp')
      : require('../../../assets/images/start-workout-stretching-background.webp');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [exercisesScrollEnabled, setExercisesScrollEnabled] = useState(false);
  const exercisesScrollY = useRef(new Animated.Value(0)).current;  
  const [expandedIndex, setExpandedIndex] = useState(null);
  const animatedOpacity = useRef([]);
  const animatedHeights = useRef([]);
  
  useEffect(() => {
    if (exercises.length > 0) {
      animatedOpacity.current = exercises.map((_, i) => animatedOpacity.current[i] || new Animated.Value(0));
      animatedHeights.current = exercises.map((_, i) => animatedHeights.current[i] || new Animated.Value(0));
  
      exercises.forEach((_, index) => {
        animatedOpacity.current[index].setValue(0);
        animatedHeights.current[index].setValue(0);
      });
    }
  }, [exercises]);
  

  const toggleDropdown = (index) => {
    if (expandedIndex === index) {
      Animated.parallel([
        Animated.timing(animatedOpacity.current[index], {
          toValue: 0,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedHeights.current[index], {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start(() => {
        setExpandedIndex(null);
      });
    } else {
      if (expandedIndex !== null && animatedOpacity.current[expandedIndex] && animatedHeights.current[expandedIndex]) {
        Animated.parallel([
          Animated.timing(animatedOpacity.current[expandedIndex], {
            toValue: 0,
            duration: 100,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(animatedHeights.current[expandedIndex], {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
        ]).start(() => {
          setExpandedIndex(index);
          expandDropdown(index);
        });
      } else {
        setExpandedIndex(index);
        expandDropdown(index);
      }
    }
  };
  
  const expandDropdown = (index) => {
    if (animatedOpacity.current[index] && animatedHeights.current[index]) {
      Animated.parallel([
        Animated.timing(animatedOpacity.current[index], {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedHeights.current[index], {
          toValue: 250,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const imageDarkenOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const fadeOutOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -170],
    extrapolate: 'clamp',
  });

  const exercisesOpacity = scrollY.interpolate({
    inputRange: [50, 300],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const exercises = [
    { name: 'Push-Ups', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k', sets: 4 },
    { name: 'Sit-Ups', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k', sets: 4 },
    { name: 'Squats', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k', sets: 3 },
    { name: 'Lunges', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k', sets: 3 },
    { name: 'Bench Press', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k', sets: 4 },
    { name: 'Bicep Curls', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k', sets: 4 },
    { name: 'Planks', duration: '1 min', videoLink: 'https://www.youtube.com/watch?v=F5vrjzPXZ9k', sets: 2 },
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
          <Animated.View style={{ opacity: fadeOutOpacity, marginTop: 10 }}>
            <Text style={styles.workoutDescription}>A high-intensity workout targeting all major muscle groups.</Text>
          </Animated.View>
        </View>
  
        <Animated.View style={[styles.exercisesContainer, { opacity: exercisesOpacity }]}>
          <ScrollView
            nestedScrollEnabled
            scrollEnabled={exercisesScrollEnabled}
            style={styles.exercisesScrollView}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: exercisesScrollY } } }],
              { useNativeDriver: false }
            )}
          >
            {exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseCard}>
                <TouchableOpacity
                  style={styles.exerciseDetails}
                  onPress={() => toggleDropdown(index)}
                  disabled={exercisesOpacity.__getValue() !== 1}
                >
                  <View>
                    <Text style={styles.exerciseText}>{exercise.name}</Text>
                    <Text style={styles.exerciseDuration}>Duration: {exercise.duration}</Text>
                  </View>
                  <MaterialIcons
                    name={expandedIndex === index ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={32}
                    color="#6a0dad"
                  />
                </TouchableOpacity>
  
                {animatedOpacity.current[index] && animatedHeights.current[index] && (
                  <Animated.View
                  style={[
                    styles.exerciseDropdown,
                    {
                      opacity: animatedOpacity.current[index],
                      height: animatedHeights.current[index],
                      overflow: 'hidden',
                    },
                  ]}
                >
                  <View style={styles.descriptionWrapper}>
                    <ScrollView
                      nestedScrollEnabled
                      style={styles.descriptionScrollView}
                      contentContainerStyle={styles.descriptionContent}
                      showsVerticalScrollIndicator={true}
                    >
                      <Text style={styles.exerciseDescription}>
                        Place a block or weight plate below the bar on the Smith machine. Set the bar to a position that best matches your height. Once the correct height is chosen and the bar is loaded, step onto the plates with the balls of your feet and place the bar on the back of your shoulders. Take the bar with both hands facing forward. Rotate the bar to unrack it. This will be your starting position. Raise your heels as high as possible by pushing off of the balls of your feet, flexing your calf at the top of the contraction. Your knees should remain extended. Hold the contracted position for a second before you start to go back down. Return slowly to the starting position as you breathe in while lowering your heels. Repeat for the recommended amount of repetitions."
                      </Text>
                    </ScrollView>
                    <View style={styles.fixedButtonContainer}>
                      <TouchableOpacity
                        style={styles.videoLinkButton}
                        onPress={() => openYouTubeLink(exercise.videoLink)}
                      >
                        <Text style={styles.videoLinkText}>Watch Video Tutorial</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>                
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.startWorkoutContainerScrolled}>
            <TouchableOpacity style={styles.startWorkoutButton} onPress={() => navigation.navigate('ExercisePage', { exercises, currentIndex: 0 })}>
              <Text style={styles.startWorkoutText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      <Animated.View style={[styles.pulseContainer, { opacity: fadeOutOpacity }]}>
        <Text style={styles.swipeText}>Swipe for Workout Details</Text>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <MaterialIcons name="keyboard-arrow-down" size={26} color="#6a0dad" />
        </Animated.View>
      </Animated.View>
      <Animated.View
        style={[
          styles.startArrow,
          { opacity: fadeOutOpacity },
        ]}
      >
        <TouchableOpacity 
          onPress={() => navigation.navigate('ExercisePage', { exercises, currentIndex: 0 })} 
        >
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
          >
            <MaterialIcons name="keyboard-arrow-right" size={50} color="#6a0dad" />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
  
}