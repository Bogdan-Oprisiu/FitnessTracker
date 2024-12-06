import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase-config';
import styles from './strength-exercises.style';

const muscleGroups = [
  { id: 'abdominals', name: 'Abdominals' },
  { id: 'abductors', name: 'Abductors' },
  { id: 'adductors', name: 'Adductors' },
  { id: 'biceps', name: 'Biceps' },
  { id: 'calves', name: 'Calves'},
  { id: 'chest', name: 'Chest' },
  { id: 'forearms', name: 'Forearms' },
  { id: 'glutes', name: 'Glutes' }, 
  { id: 'hamstrings', name: 'Hamstrings' },
  { id: 'lats', name: 'Lats' },
  { id: 'lower_back', name: 'Lower Back' },
  { id: 'middle_back', name: 'Middle Back' },
  { id: 'neck', name: 'Neck' },
  { id: 'quadriceps', name: 'Quadriceps' },
  { id: 'traps', name: 'Traps' },
  { id: 'triceps', name: 'Triceps' },
];

export default function StrengthExercises({ navigation, route }) {
  const { workoutId, workoutExerciseIds, onExerciseAdded, workoutSource, userId } = route.params;
    
  const handleMuscleGroupPress = async (group) => {
    let exercisesRef;
    
    if (workoutSource === 'default') {
      exercisesRef = collection(db, `default_workouts/${workoutId}/exercise_id`);
    } else if (workoutSource === 'personalized' && userId) {
      exercisesRef = collection(db, `users/${userId}/personalized_workouts/${workoutId}/exercise_id`);
    } else {
      console.warn('Invalid workout source or userId is missing.');
      return;
    }

    const snapshot = await getDocs(exercisesRef);
    const updatedWorkoutExerciseIds = snapshot.docs.map((doc) => doc.id);

    navigation.navigate('MuscleGroupExercises', {
        muscleGroup: group,
        workoutExerciseIds: updatedWorkoutExerciseIds,
        workoutId,
        onExerciseAdded,
        exerciseType: 'strength',
        workoutSource,
        userId
      });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={muscleGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.muscleGroupCard}
            onPress={() => handleMuscleGroupPress(item.id)}
          >
            <Text style={styles.muscleGroupText}>{item.name}</Text>
            <MaterialIcons
                name="keyboard-arrow-right"
                size={32}
                color="#6a0dad"
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}