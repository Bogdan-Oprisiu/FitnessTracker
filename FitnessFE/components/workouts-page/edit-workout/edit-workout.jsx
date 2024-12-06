import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, Modal, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useNavigation } from '@react-navigation/native';
import { getDoc, doc, collection, deleteDoc, query, orderBy, getDocs, updateDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../config/firebase-config';
import styles from './edit-workout.style';
import { ScrollView } from 'react-native-gesture-handler';

export default function EditWorkout({ route }) {
  const { workout } = route.params;
  const navigation = useNavigation();
  const [exercises, setExercises] = useState(workout.exercises);
  const [loading, setLoading] = useState(true);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSetCount, setCurrentSetCount] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(null);
  const [workoutName, setWorkoutName] = useState(workout.name);
  const [workoutDescription, setWorkoutDescription] = useState(workout.description || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const user = auth.currentUser;
  const basePath =
    workout.source === 'personalized' && user
      ? `users/${user.uid}/personalized_workouts/${workout.id}`
      : `default_workouts/${workout.id}`;

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const exercisesRef = collection(db, `${basePath}/exercise_id`);
        const exercisesQuery = query(exercisesRef, orderBy('order'));
        const snapshot = await getDocs(exercisesQuery);

        const detailedExercises = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const exerciseData = doc.data();
            const details = await fetchExerciseDetails(doc.id);
            return { id: doc.id, ...exerciseData, ...details };
          })
        );

        setExercises(detailedExercises.filter(Boolean));
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [basePath]);

  const handleEditExercise = (index) => {
    setCurrentSetCount(exercises[index].sets);
    setCurrentExerciseIndex(index);
    fadeInModal();
    setIsModalVisible(true);
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
    }).start(() => setIsModalVisible(false));
  };

  const handleDone = async () => {
    if (currentExerciseIndex !== null) {
      const updatedExercises = [...exercises];
      const exercise = updatedExercises[currentExerciseIndex];

      exercise.sets = Math.min(Math.max(currentSetCount, 0), 10);
      setExercises(updatedExercises);

      try {
        const exerciseDocRef = doc(
          db,
          `${basePath}/exercise_id/${exercise.id}`
        );
        await updateDoc(exerciseDocRef, { sets: exercise.sets });
        console.log('Exercise sets updated in Firestore');
      } catch (error) {
        console.error('Error updating exercise sets:', error);
      }
    }
    fadeOutModal();
  };

  const handleCancel = () => {
    fadeOutModal();
  };

  useEffect(() => {
    const workoutDocRef = doc(db, basePath);
    
    const unsubscribe = onSnapshot(workoutDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setWorkoutName(data.name); 
        console.log('Workout name updated in UI:', data.name);
      } else {
        console.warn('Workout document does not exist!');
      }
    });

    return () => unsubscribe();
  }, [workout.id]);

  useEffect(() => {
    const exercisesRef = collection(
      db,
      `${basePath}/exercise_id`
    );
    const orderedExercisesQuery = query(exercisesRef, orderBy('order'));
  
    const unsubscribe = onSnapshot(orderedExercisesQuery, async (snapshot) => {
      const updatedExercises = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const exerciseData = doc.data();
          const details = await fetchExerciseDetails(doc.id);
          return {
            id: doc.id,
            ...exerciseData,
            ...details,
          };
        })
      );
  
      setExercises(updatedExercises.filter(Boolean));
    });
  
    return () => unsubscribe();
  }, [workout.id]);
  

  const handleNameEdit = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Workout name cannot be empty.');   // should be a toast, hoepfully i dont forget
      return;
    }

    setLoading(true);
    try {
      const workoutDocRef = doc(db, basePath);
      await updateDoc(workoutDocRef, { name: workoutName });
      console.log('Workout name updated successfully in Firestore.');
    } catch (error) {
      console.error('Error updating workout name:', error);
      Alert.alert('Error', 'Failed to update workout name. Please try again.');
    } finally {
      setLoading(false);
      setIsEditingName(false);
    }
  };

  const handleDescriptionEdit = async () => {
    try {
      const workoutDocRef = doc(db, basePath);
      await updateDoc(workoutDocRef, { description: workoutDescription });
    } catch (error) {
      console.error('Error updating workout description:', error);
      alert('Failed to update workout description.');
    }
    setIsEditingDescription(false);
  };

  const handleDismissKeyboard = () => {
    if (isEditingName) {
      handleNameEdit();
    }
    Keyboard.dismiss();
  };

  useEffect(() => {
    const fetchAllExerciseDetails = async () => {
      try {
        const exercisesRef = collection(
          db,
          `${basePath}/exercise_id`
        );
        const orderedExercisesQuery = query(exercisesRef, orderBy('order'));
        const exercisesSnapshot = await getDocs(orderedExercisesQuery);

        const detailedExercises = await Promise.all(
          exercisesSnapshot.docs.map(async (doc) => {
            const exerciseData = doc.data();
            const details = await fetchExerciseDetails(doc.id);
            return {
              id: doc.id,
              ...exerciseData,
              ...details,
            };
          })
        );

        setExercises(detailedExercises.filter(Boolean));
      } catch (error) {
        console.error('Error fetching exercise details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllExerciseDetails();
  }, [workout.id]);

  const fetchExerciseDetails = async (exerciseId) => {
    const dbPath = (type, subPath) => `exercise_type/${type}/${subPath}`;
    const logNotFound = (type, levelOrGroup) =>
      console.log(`Checking ${type} "${levelOrGroup}" for ID "${exerciseId}"...`);
  
    const fetchFromCardioOrStretching = async (type) => {
      const levels = ['beginner', 'intermediate', 'advanced'];
  
      for (const level of levels) {
        logNotFound(type, level);
        const levelCollection = collection(db, dbPath(type, level));
        const exerciseDoc = doc(levelCollection, exerciseId);
  
        const exerciseSnapshot = await getDoc(exerciseDoc);
        if (exerciseSnapshot.exists()) {
          console.log(`Found exercise "${exerciseId}" in ${type} "${level}".`);
          return {
            ...exerciseSnapshot.data(),
            type: type.charAt(0).toUpperCase() + type.slice(1),
          };
        }
      }
      return null;
    };
  
    const fetchFromStrength = async () => {
      const type = 'strength';
    
      const muscleGroups = ['abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest', 'forearms', 'glutes', 'hamstrings', 
        'lats', 'lower_back', 'middle_back', 'neck', 'quadriceps', 'traps', 'triceps'
      ];
    
      for (const group of muscleGroups) {
        console.log(`Checking strength "${group}" for ID "${exerciseId}"...`);
    
        const groupCollection = collection(db, `exercise_type/${type}/${group}`);
        const exerciseDoc = doc(groupCollection, exerciseId);
    
        const exerciseSnapshot = await getDoc(exerciseDoc);
        if (exerciseSnapshot.exists()) {
          console.log(`Found exercise "${exerciseId}" in strength group "${group}".`);
          return {
            ...exerciseSnapshot.data(),
            type: 'Strength',
          };
        }
      }
    
      return null;
    };
    
    let exercise;
  
    exercise = await fetchFromCardioOrStretching('cardio');
    if (exercise) return exercise;
  
    exercise = await fetchFromStrength();
    if (exercise) return exercise;
  
    exercise = await fetchFromCardioOrStretching('stretching');
    if (exercise) return exercise;
  
    console.warn(`Exercise with ID "${exerciseId}" not found in cardio, strength, or stretching.`);
    return null;
  };

  const handleRemoveExercise = async (index) => {
    const exercise = exercises[index];
    const updatedExercises = exercises.filter((_, i) => i !== index);
    setExercises(updatedExercises);

    try {
      const exerciseDocRef = doc(
        db,
        `${basePath}/exercise_id/${exercise.id}`
      );
      await deleteDoc(exerciseDocRef);
      console.log('Exercise deleted from Firestore');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      Alert.alert('Error', 'Failed to delete exercise. Please try again.');
    }
  };

  const handleAddExercise = () => {
    navigation.navigate('AddExercisePage', { workoutId: workout.id, workoutSource: workout.source });  
  };

  const toggleDraggable = async () => {
    if (isDraggable) {
        try {
          console.log('Updating Firebase with new exercise order:', exercises);
    
          const updatedExercises = [...exercises].map((exercise, index) => ({
            ...exercise,
            order: index,
          }));
    
          setExercises(updatedExercises);
    
          const batch = writeBatch(db);
          updatedExercises.forEach((exercise) => {
            const exerciseRef = doc(db, `${basePath}/exercise_id/${exercise.id}`);
            batch.update(exerciseRef, { order: exercise.order });
          });
    
          await batch.commit();
          console.log('Exercise order updated in Firebase successfully');
        } catch (error) {
          console.error('Error updating exercise order in Firebase:', error);
        }
      }
      setIsDraggable(!isDraggable);
  };

  return (
    <>
    {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6a0dad" />
          <Text style={styles.loadingText}>Loading workout details...</Text>
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                {isEditingName ? (
                <View style={styles.inputWrapper}>
                    <TextInput
                    style={styles.input}
                    value={workoutName}
                    onChangeText={(text) => setWorkoutName(text.slice(0, 24))}
                    onBlur={handleNameEdit}
                    placeholder="Enter workout name"
                    placeholderTextColor="#fff"
                    autoFocus
                    />
                    <Text style={styles.counter}>
                    {workoutName.length}/24
                    </Text>
                </View>
                ) : (
                <TouchableOpacity
                    style={styles.titleWrapper}
                    onPress={() => setIsEditingName(true)}
                >
                    <Text style={styles.title}>{workoutName}</Text>
                    <MaterialIcons name="edit" size={16} color="#fff" />
                </TouchableOpacity>
                )}
            </View>

            <View style={styles.descriptionContainer}>
              {isEditingDescription ? (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={workoutDescription}
                    onChangeText={(text) => setWorkoutDescription(text.slice(0, 100))}
                    onBlur={handleDescriptionEdit}
                    placeholder="Enter workout description"
                    placeholderTextColor="#fff"
                    autoFocus
                  />
                  <Text style={styles.counter}>{workoutDescription.length}/100</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.descriptionWrapper}
                  onPress={() => setIsEditingDescription(true)}
                >
                  <Text style={styles.description}>{workoutDescription || 'Add a description'}</Text>
                  <MaterialIcons name="edit" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            {isDraggable ? (
              <ScrollView style={{ paddingRight: 20, paddingLeft: 20 }}>
                <DraggableFlatList
                    data={exercises}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    scrollEnabled={false}
                    renderItem={({ item, index, drag, isActive }) => (
                    <TouchableOpacity
                        style={[
                            styles.exerciseCard,
                            isActive && { backgroundColor: '#6a0dad' },
                        ]}
                        onPress={toggleDraggable}
                        onPressIn={drag}
                    >
                    <MaterialIcons
                        name="drag-handle"
                        size={24}
                        color="#666"
                        style={styles.dragHandle}
                    />
                    <Text style={styles.exerciseText}>{item.name}</Text>
                    </TouchableOpacity>
                    )}
                  onDragEnd={({ data }) => setExercises(data)}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
                </ScrollView>
            ) : (
                <ScrollView>
                    {exercises.map((exercise, index) => (
                        <TouchableOpacity onLongPress={toggleDraggable} key={exercise.id}>
                            <View style={styles.exerciseCard}>
                                <Text style={styles.exerciseText}>{exercise.name}</Text>
                                <Text style={styles.exerciseSets}>Sets: {exercise.sets}</Text>
                                <TouchableOpacity
                                    onPress={() => handleEditExercise(index)}
                                    style={styles.editButton}
                                >
                                    <MaterialIcons name="edit" size={24} color="#00f" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleRemoveExercise(index)}
                                    style={styles.removeExerciseButton}
                                >
                                    <MaterialIcons name="delete" size={24} color="#f00" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {isModalVisible && (
                <Modal transparent visible={isModalVisible}>
                <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
                    <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Set Count</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        value={String(currentSetCount)}
                        onChangeText={(value) =>
                        setCurrentSetCount(
                            Math.min(Math.max(parseInt(value || 0), 0), 10)
                        )
                        }
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
                        <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                </Animated.View>
                </Modal>
            )}

            <View style={styles.reorderHintContainer}>
                <MaterialIcons name="info-outline" size={18} color="#6a0dad" style={styles.infoIcon} />
                <Text style={styles.reorderHint}>
                    {isDraggable
                        ? 'Tap an exercise card after reordering to toggle off.'
                        : 'Long press an exercise card to toggle reorder view.'}
                </Text>
            </View>


            <TouchableOpacity style={styles.addExerciseButton} onPress={handleAddExercise}>
                <Text style={styles.addExerciseText}>+ Add Exercise</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      )} 
    </> 
  );
}
