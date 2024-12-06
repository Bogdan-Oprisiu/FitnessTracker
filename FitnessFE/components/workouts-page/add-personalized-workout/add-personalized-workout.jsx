import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, setDoc, collection, onSnapshot, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase-config';
import styles from './add-personalized-workout.style';

export default function AddPersonalizedWorkout({ navigation, route }) {
  const { workoutId, userId } = route.params;
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);

  useEffect(() => {
    if (!workoutId) return;
  
    const exercisesRef = collection(db, `users/${userId}/personalized_workouts/${workoutId}/exercise_id`);
    const unsubscribe = onSnapshot(exercisesRef, async (snapshot) => {
      const exercisePromises = snapshot.docs.map(async (docSnapshot) => {
        const exerciseData = docSnapshot.data();
        const exerciseId = docSnapshot.id;
  
        const exerciseInfo = await fetchExerciseDetails(exerciseId);
  
        if (exerciseInfo) {
          return {
            id: exerciseId,
            ...exerciseData,
            ...exerciseInfo,
          };
        }
        return null;
      });
  
      const exercises = (await Promise.all(exercisePromises)).filter(Boolean);
      setSelectedExercises(exercises);
    });
  
    return () => unsubscribe();
  }, [workoutId, userId]);
  
  const fetchExerciseDetails = async (exerciseId) => {
    const exerciseTypes = ['strength', 'cardio', 'stretching'];
    for (const type of exerciseTypes) {
      const levelsOrGroups = type === 'strength'
        ? ['abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest', 'forearms', 'glutes', 'hamstrings', 'lats', 'lower_back', 'middle_back', 'neck', 'quadriceps', 'traps', 'triceps']
        : ['beginner', 'intermediate', 'advanced'];
  
      for (const subPath of levelsOrGroups) {
        const exerciseDocRef = doc(db, `exercise_type/${type}/${subPath}/${exerciseId}`);
        const exerciseSnapshot = await getDoc(exerciseDocRef);
  
        if (exerciseSnapshot.exists()) {
          return {
            name: exerciseSnapshot.data().name,
            type,
            difficulty: exerciseSnapshot.data().difficulty,
            ...exerciseSnapshot.data(),
          };
        }
      }
    }
    console.warn(`Exercise with ID ${exerciseId} not found.`);
    return null;
  };

  const handleAddExercise = () => {
    if (!workoutId) {
      Alert.alert('Error', 'Workout frame has not been created.');
      return;
    }
    navigation.navigate("AddExercisePage", {
      workoutId,
      workoutSource: "personalized",
      userId,
    });
  };

  const handleRemoveExercise = async (index) => {
    const exerciseToRemove = selectedExercises[index];
    try {
      await deleteDoc(doc(db, `users/${userId}/personalized_workouts/${workoutId}/exercise_id/${exerciseToRemove.id}`));
      Alert.alert('Success', 'Exercise removed successfully.');
    } catch (error) {
      console.error('Error removing exercise:', error);
      Alert.alert('Error', 'Failed to remove exercise. Please try again.');
    }
  };

  const handleSaveWorkout = async () => {
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
      difficultyCount[a] > difficultyCount[b] ? a : b,
    );
    const majorityType = Object.keys(typeCount).reduce((a, b) =>
      typeCount[a] > typeCount[b] ? a : b,
    );

    try {
      const workoutDocRef = doc(db, `users/${userId}/personalized_workouts/${workoutId}`);
      await setDoc(workoutDocRef, {
        name: workoutName,
        description: workoutDescription,
        difficulty: majorityDifficulty || 'unknown',
        type: majorityType || 'unknown',
      });

      Alert.alert('Success', 'Workout saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
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
        maxLength={24}
      />
      <Text style={styles.charCounter}>{workoutName.length}/24</Text>
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
