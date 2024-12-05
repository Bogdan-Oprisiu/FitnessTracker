import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './cardio-exercises.style';

const difficultyLevels = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
];

export default function CardioExercises({ navigation, route }) {
  const { workoutId, workoutExerciseIds, onExerciseAdded } = route.params;

  const handleDifficultyPress = async (level) => {
    const exercisesRef = collection(db, `default_workouts/${workoutId}/exercise_id`);
    const snapshot = await getDocs(exercisesRef);
    const updatedWorkoutExerciseIds = snapshot.docs.map((doc) => doc.id);

    navigation.navigate('DifficultyFilteredExercises', {
      difficulty: level,
      workoutExerciseIds: updatedWorkoutExerciseIds,
      workoutId,
      onExerciseAdded
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cardio Exercises by Difficulty</Text>
      <FlatList
        data={difficultyLevels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.difficultyCard}
            onPress={() => handleDifficultyPress(item.id)}
          >
            <Text style={styles.difficultyText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
