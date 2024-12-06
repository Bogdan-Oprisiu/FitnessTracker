import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './add-personalized-workout.style';

export default function AddPersonalizedWorkout({ navigation }) {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);

  const handleAddExercise = () => {
    navigation.navigate('AddExercisePage', {
      onExerciseSelected: (exercise) => {
        setSelectedExercises((prev) => [...prev, exercise]);
      },
    });
  };

  const handleRemoveExercise = (index) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveWorkout = () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Workout name is required.');
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'At least one exercise is required.');
      return;
    }

    const difficultyCount = {};
    const typeCount = {};
    selectedExercises.forEach((exercise) => {
      difficultyCount[exercise.difficulty] =
        (difficultyCount[exercise.difficulty] || 0) + 1;
      typeCount[exercise.type] = (typeCount[exercise.type] || 0) + 1;
    });

    const majorityDifficulty = Object.keys(difficultyCount).reduce((a, b) =>
      difficultyCount[a] > difficultyCount[b] ? a : b
    );
    const majorityType = Object.keys(typeCount).reduce((a, b) =>
      typeCount[a] > typeCount[b] ? a : b
    );

    const newWorkout = {
      name: workoutName,
      description: workoutDescription,
      exercises: selectedExercises,
      difficulty: majorityDifficulty,
      type: majorityType,
    };

    console.log('Saving workout:', newWorkout);
    Alert.alert('Success', 'Workout saved successfully!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Personalized Workout</Text>
      <TextInput
        style={styles.input}
        placeholder="Workout Name *"
        placeholderTextColor="#aaa"
        value={workoutName}
        onChangeText={setWorkoutName}
        maxLength={50}
      />
      <Text style={styles.charCounter}>{workoutName.length}/50</Text>
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Workout Description (Optional)"
        placeholderTextColor="#aaa"
        value={workoutDescription}
        onChangeText={setWorkoutDescription}
        maxLength={100}
        multiline
      />
      <Text style={styles.charCounter}>{workoutDescription.length}/100</Text>
      <View style={styles.exerciseListContainer}>
        <Text style={styles.subTitle}>Selected Exercises</Text>
        <FlatList
          data={selectedExercises}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item, index }) => (
            <View style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveExercise(index)}
                style={styles.removeButton}
              >
                <MaterialIcons name="remove-circle" size={24} color="#f00" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No exercises selected. Add some!
            </Text>
          }
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddExercise}>
          <Text style={styles.addButtonText}>+ Add Exercise</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[
          styles.saveButton,
          !workoutName.trim() || selectedExercises.length === 0
            ? styles.disabledButton
            : null,
        ]}
        onPress={handleSaveWorkout}
        disabled={!workoutName.trim() || selectedExercises.length === 0}
      >
        <Text style={styles.saveButtonText}>Save Workout</Text>
      </TouchableOpacity>
    </View>
  );
}
