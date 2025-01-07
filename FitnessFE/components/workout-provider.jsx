import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';
import Confetti from 'react-native-confetti';
import { auth, db } from './config/firebase-config';
import { doc, getDoc, onSnapshot, collection, query, where, getCountFromServer, addDoc } from 'firebase/firestore';

const WorkoutContext = createContext();

export const useWorkout = () => useContext(WorkoutContext);

export const WorkoutProvider = ({ children }) => {
  const [goal, setGoal] = useState(null);
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const confettiRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);

        const fetchWeeklyGoal = async () => {
          try {
            const userSnapshot = await getDoc(userDocRef);
            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();
              setGoal(userData.weeklyGoal || 5);
            } else {
              console.warn('User document does not exist. Using default weeklyGoal.');
              setGoal(5);
            }
          } catch (err) {
            console.error('Error fetching weeklyGoal:', err);
            setError('Failed to fetch weekly goal.');
            setGoal(5);
          }
        };

        fetchWeeklyGoal();

        const countWorkoutsLastWeek = async () => {
          try {
            const completedWorkoutsRef = collection(db, 'users', user.uid, 'completed_workouts');
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const q = query(completedWorkoutsRef, where('dateCompleted', '>=', sevenDaysAgo));

            const snapshot = await getCountFromServer(q);
            setWorkoutsCompleted(snapshot.data().count);
          } catch (err) {
            console.error('Error counting workouts:', err);
            setError('Failed to count workouts.');
            setWorkoutsCompleted(0);
          } finally {
            setLoading(false);
          }
        };

        countWorkoutsLastWeek();

        const unsubscribeSnapshot = onSnapshot(
          query(collection(db, 'users', user.uid, 'completed_workouts'), where('dateCompleted', '>=', new Date(new Date().setDate(new Date().getDate() - 7)))),
          (snapshot) => {
            setWorkoutsCompleted(snapshot.size);
          },
          (err) => {
            console.error('Error with onSnapshot:', err);
            setError('Failed to listen to completed workouts.');
          }
        );

        const unsubscribeGoal = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              if (userData.weeklyGoal && typeof userData.weeklyGoal === 'number') {
                setGoal(userData.weeklyGoal);
              } else {
                console.warn('weeklyGoal not set or invalid. Using default.');
                setGoal(5);
              }
            } else {
              console.warn('User document does not exist. Using default weeklyGoal.');
              setGoal(5);
            }
          },
          (err) => {
            console.error('Error listening to weeklyGoal:', err);
            setError('Failed to listen to weekly goal.');
          }
        );

        return () => {
          unsubscribeSnapshot();
          unsubscribeGoal();
        };
      } else {
        setGoal(null);
        setWorkoutsCompleted(0);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

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
    <WorkoutContext.Provider value={{ goal, workoutsCompleted, setWorkoutsCompleted, completeWorkout, confettiRef, loading, error }}>
      {children}
      <Confetti ref={confettiRef} />
      <Toast />
    </WorkoutContext.Provider>
  );
};
