import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, ScrollView, FlatList, Linking, Easing, TouchableWithoutFeedback, Platform, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { collection, getDocs, getDoc, doc, writeBatch, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../config/firebase-config';
import styles from './start-workout.style';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function StartWorkout({ route }) {
  const { workout } = route.params;
  const navigation = useNavigation();
  const [exercises, setExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState(workout.name);
  const [workoutDescription, setWorkoutDescription] = useState(workout.description);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [exercisesScrollEnabled, setExercisesScrollEnabled] = useState(false);
  const exercisesScrollY = useRef(new Animated.Value(0)).current;  
  const [expandedIndex, setExpandedIndex] = useState(null);
  const animatedOpacity = useRef([]);
  const animatedHeights = useRef([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const workoutImage =
    workout.type.toLowerCase() === 'strength'
      ? require('../../../assets/images/start-workout-strength-background.webp')
      : workout.type.toLowerCase() === 'cardio'
      ? require('../../../assets/images/start-workout-cardio-background.webp')
      : require('../../../assets/images/start-workout-stretching-background.webp');

  useEffect(() => {
    const fetchWorkoutExercises = async () => {
      try {
        const exercisesPath =
          workout.source === 'default'
            ? `default_workouts/${workout.id}/exercise_id`
            : `users/${auth.currentUser?.uid}/personalized_workouts/${workout.id}/exercise_id`;
  
        const exerciseCollection = collection(db, exercisesPath);
        const exerciseQuery = query(exerciseCollection, orderBy('order'));
        const exerciseSnapshot = await getDocs(exerciseQuery);
  
        const exerciseDetails = await Promise.all(
          exerciseSnapshot.docs.map(async (doc) => {
            const exerciseId = doc.id;
            const sets = doc.data().sets;
  
            const exercise = await fetchExerciseDetails(exerciseId);
            return { id: exerciseId, sets, ...exercise };
          })
        );
  
        setExercises(exerciseDetails);
      } catch (error) {
        console.error('Error fetching workout exercises:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchWorkoutExercises();
  }, [workout]);

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
  
  useEffect(() => {
    if (exercises.length > 0) {
      animatedOpacity.current = exercises.map((_, i) => animatedOpacity.current[i] || new Animated.Value(0));
      animatedHeights.current = exercises.map((_, i) => animatedHeights.current[i] || new Animated.Value(0));
  
      exercises.forEach((_, index) => {
        animatedOpacity.current[index].setValue(0);
        animatedHeights.current[index].setValue(0);
      });
    }
  }, [exercises]);

  useEffect(() => {
    const exercisesPath =
      workout.source === 'default'
        ? `default_workouts/${workout.id}/exercise_id`
        : `users/${auth.currentUser?.uid}/personalized_workouts/${workout.id}/exercise_id`;
  
    const exerciseCollection = collection(db, exercisesPath);
  
    const unsubscribe = onSnapshot(query(exerciseCollection, orderBy('order')), async (snapshot) => {
      const exerciseDetails = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const exerciseId = doc.id;
          const sets = doc.data().sets;
  
          const exercise = await fetchExerciseDetails(exerciseId);
          return { id: exerciseId, sets, ...exercise };
        })
      );
  
      setExercises(exerciseDetails);
    });
  
    return () => unsubscribe();
  }, [workout]);  
  

  const toggleDropdown = (index) => {
    if (expandedIndex === index) {
      Animated.parallel([
        Animated.timing(animatedOpacity.current[index], {
          toValue: 0,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedHeights.current[index], {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start(() => {
        setExpandedIndex(null);
      });
    } else {
      if (expandedIndex !== null && animatedOpacity.current[expandedIndex] && animatedHeights.current[expandedIndex]) {
        Animated.parallel([
          Animated.timing(animatedOpacity.current[expandedIndex], {
            toValue: 0,
            duration: 100,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(animatedHeights.current[expandedIndex], {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
        ]).start(() => {
          setExpandedIndex(index);
          expandDropdown(index);
        });
      } else {
        setExpandedIndex(index);
        expandDropdown(index);
      }
    }
  };
  
  const expandDropdown = (index) => {
    if (animatedOpacity.current[index] && animatedHeights.current[index]) {
      Animated.parallel([
        Animated.timing(animatedOpacity.current[index], {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedHeights.current[index], {
          toValue: 250,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const toggleEditMode = async () => {
    if (isEditMode) {
      try {
        console.log('Updating Firebase with new exercise order:', exercises);
  
        const updatedExercises = [...exercises].map((exercise, index) => ({
          ...exercise,
          order: index,
        }));
  
        setExercises(updatedExercises);
  
        const batch = writeBatch(db);

        updatedExercises.forEach((exercise) => {
          let exerciseRef;

          if (workout.source === 'default') {
            exerciseRef = doc(db, `default_workouts/${workout.id}/exercise_id/${exercise.id}`);
          } else if (workout.source === 'personalized' && auth.currentUser) {
            exerciseRef = doc(
              db,
              `users/${auth.currentUser.uid}/personalized_workouts/${workout.id}/exercise_id/${exercise.id}`
            );
          } else {
            console.warn('Invalid workout source or user is not authenticated.');
            return;
          }
          batch.update(exerciseRef, { order: exercise.order });
        });
  
        await batch.commit();
        console.log('Exercise order updated in Firebase successfully');
      } catch (error) {
        console.error('Error updating exercise order in Firebase:', error);
      }
    }
    setIsEditMode((prev) => !prev);
  };

  const imageDarkenOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const fadeOutOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -170],
    extrapolate: 'clamp',
  });

  const exercisesOpacity = scrollY.interpolate({
    inputRange: [50, 300],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    exercisesOpacity.addListener(({ value }) => {
      setExercisesScrollEnabled(value === 1);
    });

    return () => {
      exercisesOpacity.removeAllListeners();
    };
  }, [pulseAnim, exercisesOpacity]);

  const openYouTubeLink = (link) => {
    Linking.openURL(link).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6a0dad" />
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      ) : (
        <>
          <Animated.ScrollView
            contentContainerStyle={styles.container}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[styles.imageContainer, { opacity: imageDarkenOpacity }]}
            >
              <Image source={workoutImage} style={styles.workoutImage} />
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.6)', 'black']}
                locations={[0.2, 0.7, 1]}
                style={styles.imageGradient}
              />
            </Animated.View>
  
            <View style={styles.contentContainer}>
              <Animated.Text
                style={[
                  styles.workoutName,
                  { transform: [{ translateY: titleTranslateY }] },
                ]}
              >
                {workoutName}
              </Animated.Text>
              <Animated.View style={{ opacity: fadeOutOpacity, marginTop: 10 }}>
                <Text style={styles.workoutDescription}>
                {workoutDescription && workoutDescription.trim()
                  ? workoutDescription
                  : "No description available for this workout."}
                </Text>
              </Animated.View>

              <Animated.View
                style={[styles.pulseContainer, { opacity: fadeOutOpacity }]}
              >
                <Text style={styles.swipeText}>Swipe for Workout Details</Text>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <MaterialIcons name="keyboard-arrow-down" size={26} color="#6a0dad" />
                </Animated.View>
              </Animated.View>
            </View> 
  
            <Animated.View
              style={[styles.exercisesContainer, { opacity: exercisesOpacity }]}
            >
              <View style={styles.reorderButtonContainer}>
                <TouchableOpacity onPress={toggleEditMode}>
                  <Text style={styles.reorderButtonText}>
                    {isEditMode ? 'Done' : 'Reorder'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!isEditMode ? (
                <ScrollView
                  nestedScrollEnabled
                  scrollEnabled={exercisesScrollEnabled}
                  style={[styles.exercisesScrollView, { paddingBottom: 550 }]}
                  showsVerticalScrollIndicator={false}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: exercisesScrollY } } }],
                    { useNativeDriver: false }
                  )}
                >
                  {exercises.map((exercise, index) => (
                    <View key={index} style={styles.exerciseCard}>
                      <TouchableOpacity
                        style={styles.exerciseDetails}
                        onPress={() => toggleDropdown(index)}
                        disabled={exercisesOpacity.__getValue() !== 1}
                      >
                        <View>
                          <Text style={styles.exerciseText}>{exercise.name}</Text>
                          <Text style={styles.exerciseSets}>Sets: {exercise.sets}</Text>
                        </View>
                        <MaterialIcons
                          name={expandedIndex === index ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                          size={32}
                          color="#6a0dad"
                        />
                      </TouchableOpacity>
        
                      {animatedOpacity.current[index] && animatedHeights.current[index] && (
                        <Animated.View
                        style={[
                          styles.exerciseDropdown,
                          {
                            opacity: animatedOpacity.current[index],
                            height: animatedHeights.current[index],
                            overflow: 'hidden',
                          },
                        ]}
                      >
                        <View style={styles.descriptionWrapper}>
                          <ScrollView
                            nestedScrollEnabled
                            style={styles.descriptionScrollView}
                            contentContainerStyle={styles.descriptionContent}
                            showsVerticalScrollIndicator={true}
                          >
                            <Text style={styles.exerciseDescription}>
                              {exercise.instructions}
                            </Text>
                          </ScrollView>
                          <View style={styles.fixedButtonContainer}>
                            <TouchableOpacity
                              style={styles.videoLinkButton}
                              onPress={() => openYouTubeLink(exercise.videoLink)}
                            >
                              <Text style={styles.videoLinkText}>Watch Video Tutorial</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Animated.View>                
                      )}
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <DraggableFlatList
                  data={exercises}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  renderItem={({ item, index, drag, isActive }) => (
                    <View
                      style={[
                        styles.exerciseCard,
                        { backgroundColor: isActive ? '#6a0dad' : '#444' },
                      ]}
                      onTouchStart={drag}
                    >
                      <View style={styles.editModeDetails}>
                        <MaterialIcons
                          name="drag-handle"
                          size={24}
                          color="#ccc"
                          style={{ marginRight: 10 }}
                        />
                        <View style={styles.textContainer}>
                          <Text style={styles.exerciseText}>{item.name}</Text>
                          <Text style={styles.exerciseSets}>Sets: {item.sets}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  onDragEnd={({ data }) => setExercises(data)}
                  contentContainerStyle={{ paddingBottom: 90 }}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              )}

              <View style={styles.startWorkoutContainerScrolled}>
                  <TouchableOpacity
                    style={styles.startWorkoutButton}
                    onPress={() =>
                      navigation.navigate('ExercisePage', {
                        workoutId: workout.id,
                        exercises,
                        currentIndex: 0,
                        source: workout.source
                      })
                    }
                  >
                    <Text style={styles.startWorkoutText}>Start Workout</Text>
                  </TouchableOpacity>
                </View>
            </Animated.View>
          </Animated.ScrollView>
  
          <Animated.View style={[styles.startArrow, { opacity: fadeOutOpacity }]}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ExercisePage', { workoutId: workout.id, exercises, currentIndex: 0, source: workout.source })
              }
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <MaterialIcons name="keyboard-arrow-right" size={40} color="#6a0dad" />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </>
  );  
}