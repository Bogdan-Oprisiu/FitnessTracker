import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions, Modal, Image, ActivityIndicator, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Progress from 'react-native-progress';
import Confetti from 'react-native-confetti';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { BlurView } from 'expo-blur';
import WeeklyProgress from './weekly-progress/weekly-progress';
import { useWorkout } from '../workout-provider';
import { db, auth } from '../config/firebase-config';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import Widget from '../widgets-template';
import DateWorkoutsModal from './date-workouts-modal/date-workouts-modal';
import styles from './home.style';

const { width } = Dimensions.get('window');

export default function Home() {
  const route = useRoute();
  const navigation = useNavigation();
  const { workoutsCompleted, setWorkoutsCompleted, goal, completeWorkout, confettiRef } = useWorkout();
  const [confettiVisible, setConfettiVisible] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [completedDays, setCompletedDays] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const backgroundImage = require('../../assets/images/home-background3.webp');
  const [isDateWorkoutsModalVisible, setIsDateWorkoutsModalVisible] = useState(false);

  useEffect(() => {
  if (goal && workoutsCompleted >= goal && confettiRef.current) {
    confettiRef.current.startConfetti();
    setConfettiVisible(true);
    setTimeout(() => {
      if (confettiRef.current) {
        confettiRef.current.stopConfetti();
        setConfettiVisible(false);
      }
    }, 5000);
  }
}, [workoutsCompleted, goal]);


  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(backgroundOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  useEffect(() => {
    if (route.params?.newCompletionDate) {
      const newDate = route.params.newCompletionDate.toISOString().split('T')[0];
      const completedDate = new Date(route.params.newCompletionDate);
      const dayName = completedDate.toLocaleDateString('en-US', { weekday: 'short' });

      setMarkedDates((prevDates) => ({
        ...prevDates,
        [newDate]: { marked: true, dotColor: '#6a0dad' },
      }));

      setCompletedDays((prevDays) => [...prevDays, dayName]);

      navigation.setParams({ newCompletionDate: null });
    }
  }, [route.params?.newCompletionDate]);

  useEffect(() => {}, [workoutsCompleted]);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setIsDateWorkoutsModalVisible(true);
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

  useEffect(() => {
    const subscribe = () => {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user is signed in');
        return;
      }

      const completedWorkoutsRef = collection(db, 'users', user.uid, 'completed_workouts');
      const q = query(completedWorkoutsRef);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const dates = {};
          let countLastWeek = 0;

          const now = new Date();
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);

          const completedDaysSet = new Set();

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const dateCompleted = data.dateCompleted ? data.dateCompleted.toDate() : null;

            if (dateCompleted) {
              const dateStr = dateCompleted.toISOString().split('T')[0];
              dates[dateStr] = { marked: true, dotColor: '#6a0dad' };

              if (dateCompleted >= oneWeekAgo && dateCompleted <= now) {
                const dayName = dateCompleted.toLocaleDateString('en-US', { weekday: 'short' }); // like 'Mon'
                completedDaysSet.add(dayName);
                countLastWeek += 1;
              }
            }
          });

          setMarkedDates(dates);
          setWorkoutsCompleted(countLastWeek);
          setCompletedDays(Array.from(completedDaysSet));

          if (route.params?.newCompletionDate) {
            const newDate = route.params.newCompletionDate.toISOString().split('T')[0];
            dates[newDate] = { marked: true, dotColor: '#6a0dad' };
            const newDateObj = new Date(route.params.newCompletionDate);
            if (newDateObj >= oneWeekAgo && newDateObj <= now) {
              setWorkoutsCompleted((prev) => prev + 1);
              const newDayName = newDateObj.toLocaleDateString('en-US', { weekday: 'short' });
              setCompletedDays((prev) => [...prev, newDayName]);
            }
            navigation.setParams({ newCompletionDate: null });
          }
        },
        (error) => {
          console.error('Error fetching completed workouts:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Could not fetch completed workouts.',
          });
        }
      );

      return unsubscribe;
    };

    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [route.params?.newCompletionDate]);
  
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
            progress={goal ? workoutsCompleted / goal : 0}
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
              progress={goal ? workoutsCompleted / goal : 0}
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

          <WeeklyProgress onPress={toggleCalendar} completedDays={completedDays} />
        </Animated.View>

        <View style={styles.widgetsContainer}>
          <Widget title="Connect With Friends" iconName="group" fullWidth={true} onPress={() => navigation.navigate('Profile', { openFriendsModalFromHome: true, setOpenFriendsModalFromHome: true })} />
          <Widget title="Discover New Workouts" iconName="fitness-center" fullWidth={true} onPress={() => navigation.navigate('Workouts')} />
          <Widget title="Ask GymBuddy Anything" iconName="smart-toy" fullWidth={true} onPress={() => navigation.navigate('GymBuddyTabs')}/>
          <Widget title="Personalize Your Experience" iconName="person" fullWidth={true} onPress={() => navigation.navigate('Profile')} />
          <Widget title="Check your detailed stats" iconName="analytics" fullWidth={true} onPress={() => navigation.navigate('Statistics')} />
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
                  markedDates={markedDates}
                  theme={{
                    backgroundColor: '#1a1a1a',
                    calendarBackground: '#1a1a1a',
                    textSectionTitleColor: '#fff',
                    dayTextColor: '#fff',
                    todayTextColor: '#6a0dad',
                    monthTextColor: '#6a0dad',
                    arrowColor: '#6a0dad',
                  }}
                  onDayPress={handleDayPress}
                />
                <TouchableOpacity onPress={toggleCalendar} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        <DateWorkoutsModal
          visible={isDateWorkoutsModalVisible}
          onClose={() => setIsDateWorkoutsModalVisible(false)}
          selectedDate={selectedDate}
        />
      </Animated.ScrollView>
    </View>
  );
}