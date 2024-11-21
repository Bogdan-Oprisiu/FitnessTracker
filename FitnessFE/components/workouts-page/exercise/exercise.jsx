import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AnimatedHeart from '../../animated-components/heart-animation';
import { useHeartRate } from '../../heart-rate-provider';
import { useWorkout } from '../../workout-provider';
import styles from './exercise.style';

export default function ExercisePage({ route }) {
  const navigation = useNavigation();
  const { exercises, currentIndex } = route.params;
  const { completeWorkout } = useWorkout();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(currentIndex || 0);
  const { heartRate } = useHeartRate();

  const currentExercise = {
    ...exercises[currentExerciseIndex],
    description: "Begin seated on your butt with your knees bent and feet on the ground. Lean your upper body back to form a 45-degree angle with the floor. Bring your feet off the ground so that your body resembles a 'V' shape. Grasp a dumbbell in each hand and hold tight to your chest with palms facing each other. This will be your starting position. While keeping your core tight and maintaining your body's 'V' position, quickly extend your left arm straight out (similar to a jab) and then bring it back to the starting position while simultaneously punching out with the right arm. Your torso and legs may slightly rotate side to side opposite of your hands throughout the movementâ€”this is okay. A punch with each hand counts as one total repetition. Repeat for recommended number of repetitions."
  };

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      completeWorkout();
      navigation.navigate('Home');
    }
  };

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const openYouTubeLink = (link) => {
    Linking.openURL(link).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#6a0dad', '#000']} style={styles.gradientContainer}>
        <Text style={styles.exerciseCounter}>{`${currentExerciseIndex + 1} / ${exercises.length}`}</Text>

        <View style={styles.heartRateDisplay}>
          <Text style={styles.heartRateText}>
            {heartRate > 0 ? heartRate : '--'}
          </Text>
          <AnimatedHeart heartRate={heartRate} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <ScrollView style={styles.descriptionContainer} showsVerticalScrollIndicator={true}>
            <Text style={styles.exerciseDescription}>
                {currentExercise.description || 'Description for this exercise is not available at this point. Stay tuned.'}
            </Text>
            </ScrollView>
        </View>

        <View style={styles.fixedButtonContainer}>
            <TouchableOpacity style={styles.videoLinkButton} onPress={() => openYouTubeLink(currentExercise.videoLink)}>
                <Text style={styles.videoLinkText}>Watch Video Tutorial</Text>
            </TouchableOpacity>
        </View>

        {currentExerciseIndex > 0 && (
          <TouchableOpacity onPress={handlePrevious} style={styles.arrowButtonLeft}>
            <MaterialIcons name="arrow-back" size={36} color="#fff" />
          </TouchableOpacity>
        )}
        {currentExerciseIndex === exercises.length - 1 ? (
          <TouchableOpacity onPress={handleNext} style={styles.arrowButtonRight}>
            <Text style={styles.finishText}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleNext} style={styles.arrowButtonRight}>
            <MaterialIcons name="arrow-forward" size={36} color="#fff" />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}
