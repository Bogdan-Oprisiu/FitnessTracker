import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Progress from 'react-native-progress';
import Confetti from 'react-native-confetti';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { BlurView } from 'expo-blur';
import WeeklyProgress from './weekly-progress/weekly-progress';
import Widget from '../widgets-template';
import styles from './home.style';

const { width } = Dimensions.get('window');

export default function Home() {
  const [goal, setGoal] = useState(3); // weekly workout goal, default is 3
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const confettiRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const backgroundImage = require('../../assets/images/home-background3.webp')

  useEffect(() => {
    if (workoutsCompleted >= goal && confettiRef.current) {
      setConfettiVisible(true);
      confettiRef.current.startConfetti();
      setTimeout(() => {
        confettiRef.current.stopConfetti();
        setConfettiVisible(false);
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

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [0.15, 0],
    extrapolate: 'clamp',
  });

  const gradientColorOpacity = scrollY.interpolate({
    inputRange: [150, 500],
    outputRange: [0, 0.9],
    extrapolate: 'clamp',
  });

  const circleOpacity = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#000000', '#2c2c2c', '#000000']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{ ...styles.container, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <Animated.View style={{ position: 'absolute', width: '100%', height: 800, opacity: imageOpacity }}>
        <View style={styles.imageContainer}>
          <Image
            source={backgroundImage}
            style={styles.backgroundImage}
          />
          <BlurView intensity={30} style={styles.blurView} />
        </View>
        
        <Animated.View style={[styles.darkOverlay, { opacity: gradientColorOpacity }]} />

        <LinearGradient
          colors={['transparent', '#000']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
          }}
        />
      </Animated.View>

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

      <Animated.View style={{ opacity: gradientColorOpacity }}>
        <View style={styles.progressDetailsRow}>
          <Text style={styles.goalText}>Weekly Goal:</Text>
          <Text style={styles.goalNumbers}>{workoutsCompleted}/{goal}</Text>
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
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: confettiVisible ? 999 : 0 }}>
          <Confetti ref={confettiRef} duration={4000} confettiCount={250} />
        </View>

        <Animated.View style={[styles.progressContainer, { opacity: circleOpacity }]}>
          <View style={{ position: 'relative' }}>
            <Progress.Circle
              size={300}
              progress={workoutsCompleted / goal}
              showsText={false}
              color="#6a0dad"
              thickness={22}
              unfilledColor="#d3d3d3"
            />
            <View style={{ position: 'absolute', top: '45%', left: '50%', transform: [{ translateX: -160 }, { translateY: -50 }] }}>
              <Text style={styles.progressText}>Weekly Goal</Text>
              <Text style={styles.weeklyStats}>{workoutsCompleted} / {goal}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={completeWorkout} style={styles.button}>
            <Text style={styles.buttonText}>Complete Workout</Text>
          </TouchableOpacity>

          <WeeklyProgress onPress={toggleCalendar} />
        </Animated.View>

        <View style={styles.widgetsContainer}>
          <Widget title="Connect With Friends" iconName="group" fullWidth={true} />
          <Widget title="Discover New Workouts" iconName="fitness-center" />
          <Widget title="Ask GymBuddy Anything" iconName="smart-toy" />
          <Widget title="Personalize Your Experience" iconName="person" />
          <Widget title="Connect With Friends" iconName="group" />
          <Widget title="Discover New Workouts" iconName="fitness-center" />
          <Widget title="Connect With Friends" iconName="group" />
        </View>

        {showCalendar && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showCalendar}
            onRequestClose={toggleCalendar}
          >
            <View style={styles.modalBackground}>
              <View style={styles.calendarContainer}>
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
                <TouchableOpacity onPress={toggleCalendar} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </Animated.ScrollView>
    </View>
  );
}