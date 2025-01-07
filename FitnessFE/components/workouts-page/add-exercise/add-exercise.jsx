import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase-config';
import { auth } from '../../config/firebase-config';
import StrengthExercises from './strength-exercises/strength-exercises';
import CardioExercises from './cardio-exercises/cardio-exercises';
import StretchingExercises from './stretching-exercises/stretching-exercises';

const Tab = createMaterialTopTabNavigator();

export default function AddExercisePage({ route, navigation }) {
  const { workoutId, workoutSource } = route.params;
  const [workoutExerciseIds, setWorkoutExerciseIds] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchWorkoutExerciseIds = async () => {
      try {
        let exercisesRef;
        if (workoutSource === 'default') {
          exercisesRef = collection(db, `default_workouts/${workoutId}/exercise_id`);
        } else if (workoutSource === 'personalized' && user) {
          exercisesRef = collection(db, `users/${user.uid}/personalized_workouts/${workoutId}/exercise_id`);
        }
        const snapshot = await getDocs(exercisesRef);
        if (!snapshot.empty) {
          const ids = snapshot.docs.map((doc) => doc.id);
          setWorkoutExerciseIds(ids);
        } else {
          setWorkoutExerciseIds([]);
        }
      } catch (error) {
        setWorkoutExerciseIds([]);
      }
    };

    fetchWorkoutExerciseIds();
  }, [workoutId]);

  const handleExerciseAdded = (newExerciseId) => {
    setWorkoutExerciseIds((prevIds) => [...prevIds, newExerciseId]);
  };

  if (workoutExerciseIds === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6a0dad',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: { backgroundColor: '#6a0dad' },
        tabBarStyle: { backgroundColor: '#000', borderTopWidth: 50, elevation: 0, shadowOpacity: 0 },
      }}
    >
      <Tab.Screen
        name="Strength"
        component={StrengthExercises}
        initialParams={{
          workoutId,
          workoutExerciseIds,
          workoutType: 'strength',
          workoutSource,
          userId: user?.uid,
          onExerciseAdded: handleExerciseAdded,
        }}
      />
      <Tab.Screen
        name="Cardio"
        component={CardioExercises}
        initialParams={{
          workoutId,
          workoutExerciseIds,
          workoutType: 'cardio',
          workoutSource,
          userId: user?.uid,
          onExerciseAdded: handleExerciseAdded,
        }}
      />
      <Tab.Screen
        name="Stretching"
        component={StretchingExercises}
        initialParams={{
          workoutId,
          workoutExerciseIds,
          workoutType: 'stretching',
          workoutSource,
          userId: user?.uid,
          onExerciseAdded: handleExerciseAdded,
        }}
      />
    </Tab.Navigator>
  );
}
