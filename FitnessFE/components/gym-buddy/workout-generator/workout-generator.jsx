import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase-config';
import styles from './workout-generator.style';

const geminiApiKey = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_KEY;

const gemini = new GoogleGenerativeAI(geminiApiKey);

const WorkoutGenerator = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');

  const handleGenerateWorkout = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'User is not logged in.');
      return;
    }
  
    const userId = currentUser.uid;
  
    try {
      const defaultExercises = await fetchDefaultExercises();
  
      const allExercises = [...defaultExercises];
    
      const prompt = `
        You are a fitness assistant tasked with creating personalized workout plans.
        All exercises must be selected **only** from the provided database. Use the "name" field for exercise names.
        Do not include a "description" field for exercises.
        
        Create a ${selectedDuration}-minute workout plan focusing on ${selectedFocus}.
        Difficulty: ${selectedDifficulty}.
        Include warm-up, main workout, and cool-down exercises in the plan.
        
        Use only these exercises:
        ${JSON.stringify(allExercises.map((ex) => ex.name))}.
        
        Return the response in JSON format with:
        - "workout_name" (string)
        - "duration" (total duration in minutes)
        - "exercises" (array with "name", "sets", and "duration").
        Ensure each exercise has a "name" that matches the provided database names.
      `;
  
      const model = gemini.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          candidateCount: 1,
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });
  
      const result = await model.generateContent(prompt);
      let rawResponse = result.response.text();
      rawResponse = rawResponse.replace(/```json|```/g, '').trim();
  
      console.log('Raw JSON Response:', rawResponse);
  
      const workoutPlan = cleanAndParseResponse(rawResponse, allExercises);
      console.log('Parsed Workout Plan:', workoutPlan);
  
      await saveWorkoutForUser(userId, workoutPlan);
      Alert.alert('Success', 'Workout saved successfully!');
    } catch (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };
  
  const cleanAndParseResponse = (rawResponse, allExercises) => {
    const parsedResponse = JSON.parse(rawResponse);
  
    const exercises = parsedResponse.exercises.map((exercise) => {
      const matchedExercise = allExercises.find(
        (ex) => ex.id === exercise.name || ex.name === exercise.name
      );
      if (matchedExercise) {
        return {
          id: matchedExercise.id,
          name: matchedExercise.name,
          sets: exercise.sets || 1,
          duration: exercise.duration || null,
        };
      } else {
        console.warn(`No match found for exercise: ${exercise.name}`);
        return { id: null, name: exercise.name, sets: exercise.sets || 1, duration: exercise.duration || null };
      }
    });
  
    return { ...parsedResponse, exercises };
  };  

  const fetchDefaultExercises = async () => {
    const allExercises = [];
    
    const dbPath = (type, subPath) => `exercise_type/${type}/${subPath}`;
    const logCheckingPath = (type, subPath) =>
      console.log(`Checking ${type} at path "${subPath}"...`);
  
    try {
      const fetchFromStrength = async () => {
        const muscleGroups = [
          'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest', 'forearms', 'glutes', 'hamstrings',
          'lats', 'lower_back', 'middle_back', 'neck', 'quadriceps', 'traps', 'triceps',
        ];
  
        for (const group of muscleGroups) {
          logCheckingPath('strength', group);
          const groupCollection = collection(db, dbPath('strength', group));
          const groupSnapshot = await getDocs(groupCollection);
  
          groupSnapshot.forEach((exerciseDoc) => {
            allExercises.push({
              id: exerciseDoc.id,
              name: exerciseDoc.data().name,
              type: 'Strength',
              group,
            });
          });
        }
      };
  
      const fetchFromCardioOrStretching = async (type) => {
        const levels = ['beginner', 'intermediate', 'advanced'];
  
        for (const level of levels) {
          logCheckingPath(type, level);
          const levelCollection = collection(db, dbPath(type, level));
          const levelSnapshot = await getDocs(levelCollection);
  
          levelSnapshot.forEach((exerciseDoc) => {
            allExercises.push({
              id: exerciseDoc.id,
              name: exerciseDoc.data().name,
              type: type.charAt(0).toUpperCase() + type.slice(1),
              level,
            });
          });
        }
      };
  
      await fetchFromStrength();
      await fetchFromCardioOrStretching('cardio');
      await fetchFromCardioOrStretching('stretching');
  
      console.log('All Exercises:', allExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error.message);
    }
  
    return allExercises;
  };  

  const saveWorkoutForUser = async (userId, workoutPlan) => {
    try {
      const workoutsCollectionRef = collection(db, `users/${userId}/personalized_workouts`);
      const newWorkoutRef = doc(workoutsCollectionRef);

      await setDoc(newWorkoutRef, {
        name: `Workout - ${new Date().toLocaleDateString()}`,
        description: `A personalized workout focusing on ${selectedFocus}.`,
        type: selectedType,
        difficulty: selectedDifficulty,
        source: 'personalized',
        createdAt: new Date().toISOString(),
      });

      const exercisesRef = collection(newWorkoutRef, 'exercise_id');
      let order = 0;

      for (const exercise of workoutPlan.exercises) {
        if (exercise.id) {
          const exerciseRef = doc(exercisesRef, exercise.id);
          await setDoc(exerciseRef, {
            name: exercise.name,
            sets: exercise.sets || 1,
            duration: exercise.duration || null,
            order: order++,
          });
        }
      }

      console.log(`Workout saved successfully for user ${userId}`);
    } catch (error) {
      console.error('Error saving workout:', error.message);
      Alert.alert('Error', 'Error saving workout to Firestore.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Personalized Workout</Text>

      <Text style={styles.label}>Workout Type:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter workout type (e.g., Strength, Cardio)"
        value={selectedType}
        onChangeText={setSelectedType}
      />

      <Text style={styles.label}>Focus Area:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter focus area (e.g., Chest, Back)"
        value={selectedFocus}
        onChangeText={setSelectedFocus}
      />

      <Text style={styles.label}>Difficulty:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter difficulty (e.g., Beginner, Intermediate)"
        value={selectedDifficulty}
        onChangeText={setSelectedDifficulty}
      />

      <Text style={styles.label}>Duration (minutes):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter duration in minutes"
        value={selectedDuration}
        onChangeText={setSelectedDuration}
      />

      <TouchableOpacity style={styles.generateButton} onPress={handleGenerateWorkout}>
        <Text style={styles.generateButtonText}>Generate and Save Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default WorkoutGenerator;
