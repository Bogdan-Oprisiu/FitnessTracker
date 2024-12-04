import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, Animated, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { setDoc, doc, getDocs, query, orderBy, collection } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { db } from '../../../../config/firebase-config';
import styles from './muscle-groups-exercises.style';

export default function MuscleGroupExercises({ route }) {
  const { muscleGroup, workoutExerciseIds: initialExerciseIds = [], workoutId } = route.params;
  const [workoutExerciseIds, setWorkoutExerciseIds] = useState(initialExerciseIds);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [currentExerciseInfo, setCurrentExerciseInfo] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [setModalVisible, setSetModalVisible] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [setsInput, setSetsInput] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const muscleGroupCollection = collection(db, `exercise_type/strength/${muscleGroup}`);
        const snapshot = await getDocs(muscleGroupCollection);

        const fetchedExercises = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExercises(fetchedExercises);
        console.log('Workout exercise IDs:', workoutExerciseIds);
      } catch (error) {
        console.error('Error fetching exercises for muscle group:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [muscleGroup]);

  const handleInfoPress = (exercise) => {
    setCurrentExerciseInfo(exercise);
    fadeInModal();
    setInfoModalVisible(true);
  };

  const handleAddExercise = (exercise) => {
    setCurrentExercise(exercise);
    fadeInSetModal();
    setSetsInput('');
    setSetModalVisible(true);
  };

  const confirmAddExercise = async () => {
    try {
      const exercisesRef = collection(db, `default_workouts/${workoutId}/exercise_id`);

      const currentExercisesSnapshot = await getDocs(query(exercisesRef, orderBy('order')));
      const currentExercises = currentExercisesSnapshot.docs.map((doc) => doc.data());
      const nextOrder = currentExercises.length;

      const exerciseDocRef = doc(db, `default_workouts/${workoutId}/exercise_id/${currentExercise.id}`);
      await setDoc(exerciseDocRef, {
        sets: parseInt(setsInput, 10),
        order: nextOrder,
      });

      route.params.onExerciseAdded(currentExercise.id);

      Toast.show({
        type: 'success',
        text1: `${currentExercise.name} Added Successfully`,
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });

      setWorkoutExerciseIds((prevIds) => [...prevIds, currentExercise.id]);
      setSetModalVisible(false);
    } catch (error) {
      console.error('Error adding exercise to workout:', error);
      Toast.show({
        type: 'error',
        text1: 'Error Adding Exercise',
        text2: 'Could not add the exercise.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };

  const handleToggleSelection = (exerciseId) => {
    if (workoutExerciseIds.includes(exerciseId)) {
      return;
    }
  
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises((prevSelected) =>
        prevSelected.filter((id) => id !== exerciseId)
      );
    } else {
      const selectedExercise = exercises.find((exercise) => exercise.id === exerciseId);
      setCurrentExercise(selectedExercise);
      fadeInSetModal();
      setSetsInput('');
      setSetModalVisible(true);
    }
  };
  
  const handleLongPress = () => {
    setIsSelectionMode(true);
    setSelectedExercises([]);
  };

  const handleExitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedExercises([]);
  };

  const handleAddSelectedExercises = async () => {
    try {
      const exercisesRef = collection(db, `default_workouts/${workoutId}/exercise_id`);
  
      const currentExercisesSnapshot = await getDocs(query(exercisesRef, orderBy('order')));
      const currentExercises = currentExercisesSnapshot.docs.map((doc) => doc.data());
      let nextOrder = currentExercises.length;
  
      for (const exerciseId of selectedExercises) {
        const exerciseDocRef = doc(db, `default_workouts/${workoutId}/exercise_id/${exerciseId}`);
        await setDoc(exerciseDocRef, {
          sets: 1,
          order: nextOrder++,
        });
      }
  
      setWorkoutExerciseIds((prevIds) => [...prevIds, ...selectedExercises]);
  
      Toast.show({
        type: 'success',
        text1: 'Selected Exercises Added',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
  
      handleExitSelectionMode();
    } catch (error) {
      console.error('Error adding selected exercises:', error);
      Toast.show({
        type: 'error',
        text1: 'Error Adding Exercises',
        text2: 'Could not add the selected exercises.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };
  

  const fadeInModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const fadeOutModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setInfoModalVisible(false));
  };

  const fadeInSetModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const fadeOutSetModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSetModalVisible(false));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercises for {muscleGroup}</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          isSelectionMode ? { paddingBottom: 70 } : null
        }
        renderItem={({ item }) => {
          const isPresent = workoutExerciseIds.includes(item.id);
          const isSelected = selectedExercises.includes(item.id);

          return (
            <TouchableOpacity
              style={styles.exerciseCard}
              onLongPress={handleLongPress}
              onPress={() => !isSelectionMode || handleToggleSelection(item.id)}
              disabled={isPresent && isSelectionMode}
            >
              <View style={styles.exerciseInfo}>
                {isSelectionMode ? (
                  <TouchableOpacity onPress={() => handleToggleSelection(item.id)} disabled={isPresent} style={styles.multipleSelectionCard}>
                    <MaterialIcons
                      name={isPresent || isSelected ? 'check-circle' : 'radio-button-unchecked'}
                      size={24}
                      color={isSelected ? '#6a0dad' : '#6a0dad'}
                      style={styles.selectCircle}
                    />
                  <Text style={styles.exerciseName}>{item.name}</Text>
                </TouchableOpacity>
                ) : (
                  <>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <TouchableOpacity onPress={() => handleInfoPress(item)}>
                      <MaterialIcons name="info-outline" size={24} color="#6a0dad" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
              {!isSelectionMode && (
                <TouchableOpacity
                  style={[styles.addButton, isPresent && styles.disabledButton]}
                  onPress={() => !isPresent && handleAddExercise(item)}
                  disabled={isPresent}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {isSelectionMode && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleAddSelectedExercises}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      )}

      {!isSelectionMode && (
        <View style={styles.infoTextContainer}>
          <MaterialIcons name="info-outline" size={16} color="#6a0dad" style={styles.infoIcon} />
          <Text style={styles.infoText}>Long press to select multiple exercises</Text>
        </View>
      )}

      {infoModalVisible && (
        <Modal transparent visible={infoModalVisible}>
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{currentExerciseInfo?.name}</Text>
              <Text style={styles.modalDescription}>{currentExerciseInfo?.description}</Text>
              {currentExerciseInfo?.video && (
                <TouchableOpacity onPress={() => alert('Navigate to video')}>
                  <Text style={styles.videoLink}>Watch Tutorial</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={fadeOutModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Modal>
      )}

      {setModalVisible && (
        <Modal transparent visible={setModalVisible}>
          <Animated.View style={[styles.setModalContainer, { opacity: fadeAnim }]}>
            <View style={styles.setModalContent}>
              <Text style={styles.setModalTitle}>Enter Number of Sets</Text>
              <TextInput
                style={styles.setInput}
                keyboardType="number-pad"
                placeholder="Number of Sets"
                placeholderTextColor="#fff"
                value={setsInput}
                onChangeText={setSetsInput}
              />
              <View style={styles.setsModalButtonsContainer}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={confirmAddExercise}
                  disabled={!setsInput || isNaN(setsInput) || parseInt(setsInput, 10) <= 0 || parseInt(setsInput, 10) >= 11}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={fadeOutSetModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Modal>
      )}
    </View>
  );
}
