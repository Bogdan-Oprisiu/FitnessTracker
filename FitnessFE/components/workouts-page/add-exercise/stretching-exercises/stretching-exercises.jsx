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
  const { workoutId, workoutExerciseIds, onExerciseAdded } = route.params;

  const handleDifficultyPress = async (level) => {
    const exercisesRef = collection(db, `default_workouts/${workoutId}/exercise_id`);
    const snapshot = await getDocs(exercisesRef);
    const updatedWorkoutExerciseIds = snapshot.docs.map((doc) => doc.id);

    navigation.navigate('DifficultyFilteredExercises', {
      difficulty: level,
      workoutExerciseIds: updatedWorkoutExerciseIds,
      workoutId,
      onExerciseAdded,
      exerciseType: 'stretching'
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
