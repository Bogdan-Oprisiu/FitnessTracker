import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Toast from 'react-native-toast-message';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase-config'; 
import styles from './workout-generator.style';

const geminiApiKey = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_KEY;
const gemini = new GoogleGenerativeAI(geminiApiKey);

const Generator = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  const workoutTypes = ['Cardio', 'Strength', 'Stretching'];
  const focusAreas = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Glutes'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleGenerateWorkout = async () => {
    if (!selectedType) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a workout type.',
      });
      return;
    }

    if (selectedType === 'Strength' && !selectedFocus) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a focus area for Strength workouts.',
      });
      return;
    }

    if (!selectedDifficulty) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a difficulty level.',
      });
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User is not logged in.',
      });
      return;
    }

    const userId = currentUser.uid;

    setIsLoading(true);

    try {
      const defaultExercises = await fetchDefaultExercises();
      const allExercises = [...defaultExercises];

      const prompt = `
        You are a fitness assistant tasked with creating personalized workout plans.
        All exercises must be selected **only** from the provided database. Use the "name" field for exercise names.
        Do not include a "description" field for exercises.
        
        Create a ${selectedDuration}-minute workout plan focusing on ${selectedFocus || selectedType}.
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

      if (!workoutPlan) {
        throw new Error('Invalid workout plan generated.');
      }

      await saveWorkoutForUser(userId, workoutPlan);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Workout saved successfully!',
      });
    } catch (error) {
      console.error('Error generating workout:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cleanAndParseResponse = (rawResponse, allExercises) => {
    try {
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
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to parse workout plan. Please try again.',
      });
      return null;
    }
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
        const levels = ['Beginner', 'Intermediate', 'Advanced'];

        for (const level of levels) {
          logCheckingPath(type, level);
          const levelCollection = collection(db, dbPath(type, level.toLowerCase()));
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
      await fetchFromCardioOrStretching('Cardio');
      await fetchFromCardioOrStretching('Stretching');

      console.log('All Exercises:', allExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch exercises. Please try again.',
      });
    }

    return allExercises;
  };

  const saveWorkoutForUser = async (userId, workoutPlan) => {
    if (!workoutPlan) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid workout plan.',
      });
      return;
    }

    try {
      const workoutsCollectionRef = collection(db, `users/${userId}/personalized_workouts`);
      const newWorkoutRef = doc(workoutsCollectionRef);

      const description = selectedFocus
        ? `A personalized workout focusing on ${selectedFocus}.`
        : `A personalized ${selectedType} workout.`;

      await setDoc(newWorkoutRef, {
        name: `Workout - ${new Date().toLocaleDateString()}`,
        description: description,
        type: selectedType.toLowerCase(),
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error saving workout to Firestore.',
      });
    }
  };

  const renderPickerItems = (items) =>
    items.map((item) => (
      <Picker.Item key={item} label={item} value={item} />
    ));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GymBuddy Workout Generator</Text>
      </View>

      <Text style={styles.label}>Workout Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedType}
          onValueChange={(itemValue) => setSelectedType(itemValue)}
          style={styles.picker}
          prompt="Select Workout Type"
          dropdownIconColor="#fff"
        >
          <Picker.Item label="Select Type" value="" color="#ccc" />
          {workoutTypes.map((type) => (
            <Picker.Item key={type} label={type} value={type} color="#000" />
          ))}
        </Picker>
      </View>

      {selectedType === 'Strength' && (
        <>
          <Text style={styles.label}>Focus Area:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedFocus}
              onValueChange={(itemValue) => setSelectedFocus(itemValue)}
              style={styles.picker}
              prompt="Select Focus Area"
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Select Focus Area" value="" color="#ccc" />
              {focusAreas.map((area) => (
                <Picker.Item key={area} label={area} value={area} color="#000" />
              ))}
            </Picker>
          </View>
        </>
      )}

      <Text style={styles.label}>Difficulty:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDifficulty}
          onValueChange={(itemValue) => setSelectedDifficulty(itemValue)}
          style={styles.picker}
          prompt="Select Difficulty"
          dropdownIconColor="#fff"
        >
          <Picker.Item label="Select Difficulty" value="" color="#ccc" />
          {difficulties.map((level) => (
            <Picker.Item key={level} label={level} value={level} color="#000" />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Duration: {selectedDuration} minutes</Text>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={5}
          maximumValue={180}
          step={5}
          value={selectedDuration}
          onValueChange={(value) => setSelectedDuration(value)}
          minimumTrackTintColor="#6a0dad"
          maximumTrackTintColor="#444"
          thumbTintColor="#6a0dad"
        />
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6a0dad" />
          <Text style={styles.loadingText}>Piecing together a tailored workout...</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.generateButton,
          isLoading && styles.disabledButton,
        ]}
        onPress={handleGenerateWorkout}
        disabled={isLoading}
      >
        <View style={styles.buttonContent}>
          <MaterialIcons name="star" size={20} color="#fff" style={styles.iconStyle} />
          <Text style={styles.generateButtonText}>Generate and Save Workout</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Generator;
