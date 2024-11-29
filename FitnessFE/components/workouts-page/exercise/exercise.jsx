import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Linking, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import AnimatedHeart from '../../animated-components/heart-animation';
import { useHeartRate } from '../../heart-rate-provider';
import { useWorkout } from '../../workout-provider';
import styles from './exercise.style';

export default function ExercisePage({ route }) {
  const navigation = useNavigation();
  const { exercises, currentIndex } = route.params;
  const { completeWorkout } = useWorkout();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(currentIndex || 0);
  const [currentSet, setCurrentSet] = useState(0);
  const { heartRate } = useHeartRate();
  const [isResting, setIsResting] = useState(false);
  const [restStartTime, setRestStartTime] = useState(null);
  const [restDuration, setRestDuration] = useState(0);
  const currentExercise = exercises[currentExerciseIndex];
  const [isReadyToProceed, setIsReadyToProceed] = useState(false);
  const [isExtraWait, setIsExtraWait] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let timerInterval;
  
    if (isResting) {
      timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - restStartTime) / 1000);
        setRestDuration(elapsed);
      }, 1000);
    }
  
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isResting, restStartTime]);
  
  useEffect(() => {
    if (isResting) {
      if (restDuration >= 180 && heartRate <= 80) {
        setIsReadyToProceed(true);
      } else if (restDuration >= 180 && !isExtraWait) {
        setIsExtraWait(true);
      } else if (isExtraWait && heartRate <= 80) {
        setIsReadyToProceed(true);
      } else if (restDuration >= 300) {
        setIsReadyToProceed(true);
      }
    }
  }, [heartRate, restDuration, isResting, isExtraWait]);  

  const handleNextSet = () => {
    const totalSets = exercises[currentExerciseIndex].sets;
  
    fadeTransition(() => {
      if (currentSet < totalSets) {
        handleNewSet();
      } else {
        if (currentExerciseIndex < exercises.length - 1) {
          handleProceed();
        } else {
          handleFinishWorkout();
        }
      }
    })
  };

  const handleProceed = () => {
    setIsResting(false);
    setIsReadyToProceed(false);
    setIsExtraWait(false);
    setRestStartTime(null);
    setRestDuration(0);
    setCurrentSet(0);
    setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
  };

  const handleNewSet = () => {
    setIsResting(false);
    setIsReadyToProceed(false);
    setIsExtraWait(false);
    setRestStartTime(null);
    setRestDuration(0);
  }

  const handleFinishWorkout = () => {
    setTimeout(() => {
      completeWorkout();
    }, 500);
    navigation.navigate('Home');
  };

  const handleNext = () => {
    fadeTransition(() => {
      if (currentExerciseIndex < exercises.length - 1 || currentSet < currentExercise.sets - 1) {
        setIsResting(true);
        setIsReadyToProceed(false);
        setIsExtraWait(false);
        setRestStartTime(Date.now());
        setRestDuration(0);
      } else if (currentExerciseIndex === exercises.length - 1 && currentSet === currentExercise.sets - 1) {
        handleFinishWorkout();
      }
    })
  };
  

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prevIndex) => prevIndex - 1);
      setCurrentSet(0);
    }
  };

  const fadeTransition = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const openYouTubeLink = (link) => {
    Linking.openURL(link).catch((err) => console.error("Couldn't load page", err));
  };

  const formatClockTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          {isResting ? (
            <View style={styles.contentContainer}>
              <View style={styles.progressContainer}>
              <Text style={styles.takeABreakText}>Take a Break</Text>
            </View>
              <Text style={styles.restInstructions}>
                It is strongly advised to rest for optimal results.
                {'\n'}Recommended Rest: Wait until your BPM reaches 80 or 3-5 minutes.
                {'\n\n'}Your current BPM: {heartRate > 0 ? heartRate : '--'}
              </Text>
              <Text style={styles.restDuration}>
                Elapsed Time: {formatClockTime(restDuration)}
              </Text>
              {currentExerciseIndex < exercises.length - 1 && currentSet === currentExercise.sets && (
                <Text style={styles.nextUp}>
                  Next Up: 
                  {'\n'}{exercises[currentExerciseIndex + 1].name}
                </Text>
              )}
              <View style={styles.fixedButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.proceedButton,
                    { backgroundColor: isReadyToProceed ? '#6a0dad' : 'gray' },
                  ]}
                  onPress={() => handleNextSet()}
                >
                  <Text style={styles.proceedButtonText}>
                    {currentSet < currentExercise.sets && isReadyToProceed
                      ? `Proceed to Set ${currentSet + 1}`
                      : isReadyToProceed
                      ? 'Proceed to Next Exercise'
                      : 'Proceed (Not Recommended)'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.contentContainer}>
                <Progress.Circle
                  progress={currentSet / currentExercise.sets}
                  size={300}
                  showsText={false}
                  thickness={12}
                  color="#6a0dad"
                  unfilledColor="#d3d3d3"
                >
                  <View style={styles.centeredTextContainer}>
                    <Text style={styles.exerciseName}>{currentExercise.name}</Text>
                    <Text style={styles.setProgress}>
                      {currentSet} / {currentExercise.sets}
                    </Text>
                  </View>
                </Progress.Circle>
                <ScrollView style={styles.descriptionContainer} showsVerticalScrollIndicator={true}>
                  <Text style={styles.exerciseDescription}>{currentExercise.instructions}</Text>
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
              {currentExerciseIndex === exercises.length - 1 && currentSet === currentExercise.sets - 1 ? (
                <TouchableOpacity 
                onPress={() => {
                  // add a delay to allow the progress circle to fill up the needed amount
                  setCurrentSet((prevSet) => prevSet + 1);
                  setTimeout(() => {
                    handleNext();
                  }, 750);
                }} 
                  style={styles.arrowButtonRight}
                >
                  <Text style={styles.finishText}>Finish</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={() => {
                    // add a delay to allow the progress circle to fill up the needed amount
                    setCurrentSet((prevSet) => prevSet + 1);
                    setTimeout(() => {
                      handleNext();
                    }, 750);
                  }}
                  style={styles.arrowButtonRight}
                >
                  <MaterialIcons name="arrow-forward" size={36} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          )}
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}


