import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Animated, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import WorkoutCard from './workout-card/workout-card';
import styles from './workouts.style';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function Workouts() {
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const gradientColorOpacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const [editMode, setEditMode] = useState(false);
  const [shakingCardIndex, setShakingCardIndex] = useState(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [predefinedWorkouts, setPredefinedWorkouts] = useState([
    { id: 1, name: 'Full Body Blast', exercises: 10, duration: 30, difficulty: 'Intermediate', type: 'strength', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi tenetur facere explicabo culpa, accusamus libero assumenda! Laboriosam quidem repellendus dicta autem omnis voluptas, dolores hic quod asperiores magni quae minus!' },
    { id: 2, name: 'Core Crusher', exercises: 8, duration: 20, difficulty: 'Advanced', type: 'stretching', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi tenetur facere explicabo culpa, accusamus libero assumenda! Laboriosam quidem repellendus dicta autem omnis voluptas, dolores hic quod asperiores magni quae minus!' },
    { id: 3, name: 'Cardio Burn', exercises: 12, duration: 25, difficulty: 'Beginner', type: 'cardio', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi tenetur facere explicabo culpa, accusamus libero assumenda! Laboriosam quidem repellendus dicta autem omnis voluptas, dolores hic quod asperiores magni quae minus!' },
    { id: 1, name: 'Full Body Blast', exercises: 10, duration: 30, difficulty: 'Intermediate', type: 'strength', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi tenetur facere explicabo culpa, accusamus libero assumenda! Laboriosam quidem repellendus dicta autem omnis voluptas, dolores hic quod asperiores magni quae minus!' },
    { id: 2, name: 'Core Crusher', exercises: 8, duration: 20, difficulty: 'Advanced', type: 'stretching', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi tenetur facere explicabo culpa, accusamus libero assumenda! Laboriosam quidem repellendus dicta autem omnis voluptas, dolores hic quod asperiores magni quae minus!' },
    { id: 3, name: 'Cardio Burn', exercises: 12, duration: 25, difficulty: 'Beginner', type: 'cardio', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi tenetur facere explicabo culpa, accusamus libero assumenda! Laboriosam quidem repellendus dicta autem omnis voluptas, dolores hic quod asperiores magni quae minus!' },
    { id: 2, name: 'Core Crusher', exercises: 8, duration: 20, difficulty: 'Advanced', type: 'stretching', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi tenetur facere explicabo culpa, accusamus libero assumenda! Laboriosam quidem repellendus dicta autem omnis voluptas, dolores hic quod asperiores magni quae minus!' },
    { id: 3, name: 'Cardio Burn', exercises: 12, duration: 25, difficulty: 'Beginner', type: 'cardio', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi tenetur facere explicabo culpa, accusamus libero assumenda! Laboriosam quidem repellendus dicta autem omnis voluptas, dolores hic quod asperiores magni quae minus!' },
  ]);
  const fadeAnim = useRef(predefinedWorkouts.map(() => new Animated.Value(1))).current;
  const translateYAnim = useRef(predefinedWorkouts.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    fadeAnim.current = predefinedWorkouts.map(() => new Animated.Value(1));
  }, [predefinedWorkouts]);

  useEffect(() => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    Animated.timing(gradientColorOpacity, {
      toValue: 0.7,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  const startShaking = (index) => {
    setEditMode(true);
    setShakingCardIndex(index);
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopShaking = () => {
    setEditMode(false);
    setShakingCardIndex(null);
    shakeAnim.stopAnimation();
    shakeAnim.setValue(0);
  };

  const handleWorkoutPress = (index) => {
    if (editMode) {
      stopShaking();
    } else {
      navigation.navigate('StartWorkout', { workout: predefinedWorkouts[index] });
    }
  };

  const handleDelete = (index) => {
    Animated.timing(fadeAnim[index], {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      const updatedWorkouts = predefinedWorkouts.filter((_, i) => i !== index);

      updatedWorkouts.forEach((_, i) => {
        Animated.spring(translateYAnim[i], {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      });

      fadeAnim.splice(index, 1);
      translateYAnim.splice(index, 1);
      setPredefinedWorkouts(updatedWorkouts);
      setEditMode(false);
      setShakingCardIndex(null);
    });
  };

  const handleEdit = (index) => {
    console.log(`Edit workout at index ${index}`);
  };

  const textLeftPosition = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['15%', '12%'],
    extrapolate: 'clamp',
  });

  const textFontSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [50, 24],
    extrapolate: 'clamp',
  });

  const textTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundOverlay, { opacity: imageOpacity }]}>
        <Image source={require('../../assets/images/workouts-background.webp')} style={styles.backgroundImage} />
        <BlurView intensity={30} style={styles.blurView} />
        <LinearGradient
          colors={['transparent', '#000']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientOverlay}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: 'black', opacity: gradientColorOpacity },
        ]}
      />

      <Animated.Text
        style={[
          styles.yourWorkoutsText,
          {
            fontSize: textFontSize,
            left: textLeftPosition,
            transform: [
              { translateX: -20 },
              { translateY: textTranslateY },
            ],
          },
        ]}
      >
        Your Workouts
      </Animated.Text>

      <ScrollView
        contentContainerStyle={styles.cardsContainer}
        style={{ marginTop: 100, height }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {predefinedWorkouts.map((workout, index) => {
          const isShaking = shakingCardIndex === index;
          return (
            <Animated.View
              key={index}
              style={[styles.card, [
                isShaking && {
                  opacity: fadeAnim[index],
                  transform: [
                    {
                      translateY: shakeAnim.interpolate({
                        inputRange: [-1, 1],
                        outputRange: [-5, 5],
                      }),
                    },
                  ],
                }],
              ]}
            >
              <WorkoutCard
                name={workout.name}
                exercises={workout.exercises}
                duration={workout.duration}
                difficulty={workout.difficulty}
                type={workout.type}
                onPress={() => handleWorkoutPress(index)}
                onLongPress={() => startShaking(index)}
                showIcons={isShaking}
                onDelete={() => handleDelete(index)}
                onEdit={() => handleEdit(index)}
              />
            </Animated.View>
          );
        })}

        <TouchableOpacity style={styles.addWorkoutButton}>
          <Text style={styles.addWorkoutText}>+ Add Personalized Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
