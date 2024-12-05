import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getDocs, collection } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { db } from '../../../config/firebase-config';
import styles from './difficulty-filtered-exercises.style';

export default function DifficultyFilteredExercises({ route }) {
  const { difficulty, workoutId, workoutExerciseIds } = route.params;
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const levelCollection = collection(db, `exercise_type/cardio/${difficulty}`);
        const snapshot = await getDocs(levelCollection);

        const fetchedExercises = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExercises(fetchedExercises);
      } catch (error) {
        console.error('Error fetching exercises for difficulty:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [difficulty]);

  const handleAddExercise = async (exercise) => {
    try {
      const exercisesRef = collection(db, `default_workouts/${workoutId}/exercise_id`);

      const currentExercisesSnapshot = await getDocs(exercisesRef);
      const nextOrder = currentExercisesSnapshot.size;

      const exerciseDocRef = doc(db, `default_workouts/${workoutId}/exercise_id/${exercise.id}`);
      await setDoc(exerciseDocRef, {
        sets: 1,
        order: nextOrder,
      });

      Toast.show({
        type: 'success',
        text1: `${exercise.name} Added Successfully`,
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    } catch (error) {
      console.error('Error adding exercise to workout:', error);
      Toast.show({
        type: 'error',
        text1: 'Error Adding Exercise',
        text2: 'Could not add the exercise.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Exercises</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isPresent = workoutExerciseIds.includes(item.id);

          return (
            <View style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <TouchableOpacity
                style={[styles.addButton, isPresent && styles.disabledButton]}
                onPress={() => !isPresent && handleAddExercise(item)}
                disabled={isPresent}
              >
                <Text style={styles.addButtonText}>
                  {isPresent ? 'Already Added' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}
