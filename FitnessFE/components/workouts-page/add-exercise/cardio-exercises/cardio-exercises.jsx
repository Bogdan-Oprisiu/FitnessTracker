import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import styles from './cardio-exercises.style';

const dummyCardioExercises = [
  { id: '1', name: 'Running' },
  { id: '2', name: 'Cycling' },
  { id: '3', name: 'Jumping Jacks' },
  { id: '4', name: 'Burpees' },
];

export default function CardioExercises() {
  const handleAddExercise = (exercise) => {
    alert(`Added ${exercise.name}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyCardioExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddExercise(item)}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
