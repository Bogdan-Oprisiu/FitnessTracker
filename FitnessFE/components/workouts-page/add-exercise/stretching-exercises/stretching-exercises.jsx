import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import styles from './stretching-exercises.style';

const dummyStretchingExercises = [
  { id: '1', name: 'Forward Bend' },
  { id: '2', name: 'Seated Hamstring Stretch' },
  { id: '3', name: 'Child’s Pose' },
  { id: '4', name: 'Cat-Cow Stretch' },
];

export default function StretchingExercises() {
  const handleAddExercise = (exercise) => {
    alert(`Added ${exercise.name}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyStretchingExercises}
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