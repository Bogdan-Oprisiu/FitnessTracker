import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../../../config/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './stretching-exercises.style';

const difficultyLevels = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
];

export default function StretchingExercises({ navigation, route }) {
  const { workoutId, workoutExerciseIds, onExerciseAdded, workoutSource, userId } = route.params;

  const handleDifficultyPress = async (level) => {
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

    navigation.navigate('DifficultyFilteredExercises', {
      difficulty: level,
      workoutExerciseIds: updatedWorkoutExerciseIds,
      workoutId,
      onExerciseAdded,
      exerciseType: 'stretching',
      workoutSource,
      userId
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={difficultyLevels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.difficultyCard}
            onPress={() => handleDifficultyPress(item.id)}
          >
            <Text style={styles.difficultyText}>{item.name}</Text>
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
