import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Image, Animated, ScrollView, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import WorkoutCard from './workout-card/workout-card';
import { collection, getDocs, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase-config';
import styles from './workouts.style';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { handleActivityTracker } from '../profile/logActivityAndNotifications';

const { height } = Dimensions.get('window');

export default function Workouts() {
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const gradientColorOpacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const [editMode, setEditMode] = useState(false);
  const [shakingCardIndex, setShakingCardIndex] = useState(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(workouts.map(() => new Animated.Value(1))).current;
  const translateYAnim = useRef(workouts.map(() => new Animated.Value(0))).current;

  const fetchExerciseCount = async (workoutId, source, userId = null) => {
    try {
      let exercisesRef;
      if (source === "default") {
        exercisesRef = collection(db, `default_workouts/${workoutId}/exercise_id`);
      } else if (source === "personalized" && userId) {
        exercisesRef = collection(db, `users/${userId}/personalized_workouts/${workoutId}/exercise_id`);
      }
  
      const snapshot = await getDocs(exercisesRef);
      return snapshot.size;
    } catch (error) {
      console.error(`Error fetching exercises for workout ${workoutId}:`, error);
      return 0;
    }
  };

  const fetchWorkouts = async () => {
    try {
      const user = auth.currentUser;
      const defaultWorkoutsCollection = collection(db, "default_workouts");
      const personalizedWorkoutsCollection = user
        ? collection(db, `users/${user.uid}/personalized_workouts`)
        : null;
  
      const [defaultWorkoutsSnapshot, personalizedWorkoutsSnapshot] = await Promise.all([
        getDocs(defaultWorkoutsCollection),
        personalizedWorkoutsCollection ? getDocs(personalizedWorkoutsCollection) : Promise.resolve({ docs: [] }),
      ]);
  
      const defaultWorkouts = await Promise.all(
        defaultWorkoutsSnapshot.docs.map(async (doc) => {
          const exerciseCount = await fetchExerciseCount(doc.id, "default");
          return {
            id: doc.id,
            ...doc.data(),
            source: "default",
            exerciseCount,
          };
        })
      );
  
      const personalizedWorkouts = await Promise.all(
        personalizedWorkoutsSnapshot.docs.map(async (doc) => {
          const exerciseCount = await fetchExerciseCount(doc.id, "personalized", user.uid);
          return {
            id: doc.id,
            ...doc.data(),
            source: "personalized",
            exerciseCount,
          };
        })
      );
  
      const combinedWorkouts = [...defaultWorkouts, ...personalizedWorkouts];
      setWorkouts(combinedWorkouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [])
  );

  useEffect(() => {
    fadeAnim.current = workouts.map(() => new Animated.Value(1));
  }, [workouts]);

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

  const startShaking = (index) => {
    setEditMode(true);
    setShakingCardIndex(index);
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopShaking = () => {
    setEditMode(false);
    setShakingCardIndex(null);
    shakeAnim.stopAnimation();
    shakeAnim.setValue(0);
  };

  const handleWorkoutPress = (index) => {
    if (editMode) {
      stopShaking();
    } else {
      navigation.navigate('StartWorkout', { workout: workouts[index] });
    }
  };

  const handleDelete = async (index) => {
    const workoutToDelete = workouts[index];
    const user = auth.currentUser;

    stopShaking();
  
    if (!workoutToDelete) return;
  
    try {
      const docPath =
        workoutToDelete.source === "personalized"
          ? `users/${user.uid}/personalized_workouts/${workoutToDelete.id}`
          : `default_workouts/${workoutToDelete.id}`;
  
      await deleteDoc(doc(db, docPath));
      const updatedWorkouts = workouts.filter((_, i) => i !== index);
      setWorkouts(updatedWorkouts);

      handleActivityTracker(`You deleted the workout ${workoutToDelete.name} from your workouts list`);
    } catch (error) {
      console.error("Error deleting workout:", error);
      Alert.alert("Error", "Failed to delete workout. Please try again.");
    }
  };
  

  const handleEdit = (index) => {
    navigation.navigate('EditWorkout', { workout: workouts[index] });
    setEditMode(false);
    setShakingCardIndex(null);
  };

  const handleAddPersonalizedWorkout = async () => {
    const user = auth.currentUser;

    if (!user || !user.uid) {
      Alert.alert('Error', 'You must be logged in to create a workout.');
      return;
    }

    try {
      setLoading(true);

      const workoutsRef = collection(db, `users/${user.uid}/personalized_workouts`);
      const workoutDoc = await addDoc(workoutsRef, {
        name: '',
        description: '',
        difficulty: '',
        type: '',
        createdAt: serverTimestamp(),
      });

      console.log('Created personalized workout:', workoutDoc.id);

      navigation.navigate('AddPersonalizedWorkout', {
        workoutId: workoutDoc.id,
        userId: user.uid,
      });
    } catch (error) {
      console.error('Error creating personalized workout:', error);
      Alert.alert('Error', 'Could not create workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <Image source={require('../../assets/images/workouts-background.webp')} style={styles.backgroundImage} />
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
          {
            fontSize: textFontSize,
            left: textLeftPosition,
            transform: [
              { translateX: -20 },
              { translateY: textTranslateY },
            ],
          },
        ]}
      >
        Your Workouts
      </Animated.Text>

      {workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No workouts available. Add one!</Text>
          <TouchableOpacity style={styles.addWorkoutButton}>
            <Text style={styles.addWorkoutText}>+ Add Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView
        contentContainerStyle={styles.cardsContainer}
        style={{ marginTop: 100, height }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {workouts.map((workout, index) => {
          const isShaking = shakingCardIndex === index;
          return (
            <Animated.View
              key={index}
              style={[styles.card, [
                isShaking && {
                  opacity: fadeAnim[index],
                  transform: [
                    {
                      translateY: shakeAnim.interpolate({
                        inputRange: [-1, 1],
                        outputRange: [-5, 5],
                      }),
                    },
                  ],
                }],
              ]}
            >
              <WorkoutCard
                name={workout.name}
                exercises={workout.exerciseCount}
                source={workout.source}
                difficulty={workout.difficulty}
                type={workout.type}
                onPress={() => handleWorkoutPress(index)}
                onLongPress={() => startShaking(index)}
                showIcons={isShaking}
                onDelete={() => handleDelete(index)}
                onEdit={() => handleEdit(index)}
              />
            </Animated.View>
          );
        })}

        <TouchableOpacity style={styles.addWorkoutButton} onPress={handleAddPersonalizedWorkout}>
          <Text style={styles.addWorkoutText}>+ Add Personalized Workout</Text>
        </TouchableOpacity>
      </ScrollView>
      )}
    </View>
  );
}
