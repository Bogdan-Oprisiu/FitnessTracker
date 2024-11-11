import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Progress from 'react-native-progress';
import Confetti from 'react-native-confetti';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import styles from './home.style';

const { width } = Dimensions.get('window');

export default function Home() {
  const [goal, setGoal] = useState(3); // Weekly workout goal, default is 3
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const confettiRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (workoutsCompleted >= goal && confettiRef.current) {
      confettiRef.current.startConfetti();
      setTimeout(() => {
        confettiRef.current.stopConfetti();
      }, 5000);
    }
  }, [workoutsCompleted, goal]);

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
    }
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const gradientColorOpacity = scrollY.interpolate({
    inputRange: [200, 400],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [150, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#000000', '#808080', '#ffffff']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{ ...styles.container, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Animated.View
        style={{
          ...styles.overlay,
          backgroundColor: 'black',
          opacity: gradientColorOpacity,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <Animated.View style={[styles.stickyHeader, { opacity: stickyHeaderOpacity }]}>
        <View style={styles.progressDetailsRow}>
          <Text style={styles.goalText}>Weekly Goal: {workoutsCompleted}/{goal}</Text>
          <Progress.Bar
            progress={workoutsCompleted / goal}
            width={width * 0.5}
            color="#6a0dad"
            unfilledColor="#d3d3d3"
            borderWidth={0}
            style={styles.linearProgressBar}
          />
          <TouchableOpacity onPress={toggleCalendar} style={styles.calendarIcon}>
            <MaterialIcons name="calendar-today" size={24} color="#6a0dad" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.progressContainer, { opacity: scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0], extrapolate: 'clamp' }) }]}>
          <Confetti ref={confettiRef} duration={4000} confettiCount={250} />

          <Progress.Circle
            size={300}
            progress={workoutsCompleted / goal}
            showsText={true}
            textStyle={{ color: '#fff' }}
            color="#6a0dad"
            thickness={12}
            unfilledColor="#d3d3d3"
            formatText={() => `${workoutsCompleted}/${goal}`}
          />

          <Text style={styles.progressText}>Weekly Goal</Text>

          <TouchableOpacity onPress={completeWorkout} style={styles.button}>
            <Text style={styles.buttonText}>Complete Workout</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.extraContent}>
          {Array.from({ length: 20 }).map((_, index) => (
            <Text key={index} style={styles.extraText}>
              Motivational Tip #{index + 1}: Keep pushing forward, you got this!
            </Text>
          ))}
        </View>

        {showCalendar && (
          <Calendar
            markedDates={{
              '2024-11-01': { marked: true, dotColor: '#6a0dad' },
              '2024-11-02': { marked: true, dotColor: '#6a0dad' },
            }}
            theme={{
              backgroundColor: '#1a1a1a',
              calendarBackground: '#1a1a1a',
              textSectionTitleColor: '#fff',
              dayTextColor: '#fff',
              todayTextColor: '#6a0dad',
              monthTextColor: '#6a0dad',
              arrowColor: '#6a0dad',
            }}
          />
        )}
      </Animated.ScrollView>
    </View>
  );
}
