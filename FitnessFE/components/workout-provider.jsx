import React, { createContext, useContext, useState, useRef } from 'react';
import Toast from 'react-native-toast-message';
import Confetti from 'react-native-confetti';

const WorkoutContext = createContext();

export const useWorkout = () => useContext(WorkoutContext);

export const WorkoutProvider = ({ children }) => {
  const [goal, setGoal] = useState(5); // weekly workout goal, default is 3 workouts per week
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const confettiRef = useRef(null);

  const completeWorkout = () => {
    if (workoutsCompleted < 7) {
      setWorkoutsCompleted(workoutsCompleted + 1);
      Toast.show({
        type: 'success',
        text1: 'Workout Completed',
        text2: `You have completed ${workoutsCompleted + 1} out of ${goal} workouts!`,
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });

      if (workoutsCompleted + 1 >= goal && confettiRef.current) {
        confettiRef.current.startConfetti();
        setTimeout(() => {
          confettiRef.current.stopConfetti();
        }, 5000);
      }
    }
  };

  return (
    <WorkoutContext.Provider value={{ goal, workoutsCompleted, setWorkoutsCompleted, completeWorkout, confettiRef }}>
      {children}
    </WorkoutContext.Provider>
  );
};
