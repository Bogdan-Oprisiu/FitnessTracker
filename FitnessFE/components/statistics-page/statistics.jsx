import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Image, Dimensions, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useHeartRate } from '../heart-rate-provider';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './statistics.style';
import AnimatedHeart from '../animated-components/heart-animation';
import { db, auth } from '../config/firebase-config';
import { collection, doc, onSnapshot, getDoc, query, orderBy, where, limit } from 'firebase/firestore';
import { format, subWeeks, subMonths, subYears, addDays, startOfDay } from 'date-fns';

const TIMEFRAMES = [
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: 'All', value: 'ALL' },
];

export default function Statistics() {
  const { heartRate, heartRateData, connectToSensor, disconnectFromSensor } = useHeartRate();
  const sanitizedHeartRateData = heartRateData.map((value) =>
    typeof value === 'number' && isFinite(value) ? value : 0
  );
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const gradientColorOpacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isConnected, setIsConnected] = useState(false);
  const [workoutData, setWorkoutData] = useState([]);
  const [dailyActiveTimeData, setDailyActiveTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [selectedData, setSelectedData] = useState(null);

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

    const unsubscribeWorkouts = fetchWorkoutDataRealtime();
    const unsubscribeDailyActiveTime = fetchDailyActiveTimeRealtime();

    return () => {
      unsubscribeWorkouts();
      unsubscribeDailyActiveTime();
    };
  }, [selectedTimeframe]); 

  const handleConnectPress = () => {
    if (isConnected) {
      disconnectFromSensor();
    } else {
      connectToSensor();
    }
    setIsConnected(!isConnected);
  };

  const getColor = (index) => {
    const colors = ['#FF6347', '#1E90FF', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
    return colors[index % colors.length];
  };

  const getStartDate = (timeframe) => {
    const today = startOfDay(new Date());
    switch (timeframe) {
      case '1W':
        return subWeeks(today, 1);
      case '1M':
        return subMonths(today, 1);
      case '6M':
        return subMonths(today, 6);
      case '1Y':
        return subYears(today, 1);
      case 'ALL':
        return new Date(0); 
      default:
        return subMonths(today, 1);
    }
  };

  const fetchWorkoutDataRealtime = () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found.");
      setLoading(false);
      return () => {};
    }
    const userId = user.uid;

    const completedWorkoutsRef = collection(db, 'users', userId, 'completed_workouts');

    const unsubscribe = onSnapshot(completedWorkoutsRef, async (snapshot) => {
      try {
        const workoutCounts = {};

        const workoutPromises = snapshot.docs.map(async (workoutDoc) => {
          const { source, workoutId } = workoutDoc.data();
          let workoutName = 'Unknown';

          if (source === 'default') {
            const defaultWorkoutRef = doc(db, 'default_workouts', workoutId);
            const defaultWorkoutSnap = await getDoc(defaultWorkoutRef);
            if (defaultWorkoutSnap.exists()) {
              workoutName = defaultWorkoutSnap.data().name || 'Unnamed Workout';
            }
          } else if (source === 'personalized') {
            const personalizedWorkoutRef = doc(db, 'users', userId, 'personalized_workouts', workoutId);
            const personalizedWorkoutSnap = await getDoc(personalizedWorkoutRef);
            if (personalizedWorkoutSnap.exists()) {
              workoutName = personalizedWorkoutSnap.data().name || 'Unnamed Workout';
            }
          }

          if (workoutName in workoutCounts) {
            workoutCounts[workoutName] += 1;
          } else {
            workoutCounts[workoutName] = 1;
          }
        });

        await Promise.all(workoutPromises);

        const pieData = Object.entries(workoutCounts).map(([name, population], index) => ({
          name,
          population,
          color: getColor(index),
          legendFontColor: "#7F7F7F",
          legendFontSize: 11,
        }));

        setWorkoutData(pieData);
        setLoading(false);
      } catch (error) {
        console.error("Error processing workouts: ", error);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error listening to workouts: ", error);
      setLoading(false);
    });

    return unsubscribe;
  };

  const fetchDailyActiveTimeRealtime = () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found.");
      setLoading(false);
      return () => {};
    }
    const userId = user.uid;

    const completedWorkoutsRef = collection(db, 'users', userId, 'completed_workouts');
    const startDate = getStartDate(selectedTimeframe);

    const q = query(
      completedWorkoutsRef,
      where('dateCompleted', '>=', startDate),
      orderBy('dateCompleted', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const workoutMap = {};

          snapshot.docs.forEach((doc) => {
            const { activeTime, dateCompleted } = doc.data();
            if (activeTime && dateCompleted) {
              const dateObj = dateCompleted.toDate();
              const dateKey = format(dateObj, 'yyyy-MM-dd');
              if (workoutMap[dateKey]) {
                workoutMap[dateKey] += activeTime / 60;
              } else {
                workoutMap[dateKey] = activeTime / 60;
              }
            }
          });

          const today = startOfDay(new Date());
          const allDates = [];
          let currentDate = startOfDay(startDate);
          while (currentDate <= today) {
            const dateKey = format(currentDate, 'yyyy-MM-dd');
            allDates.push(dateKey);
            currentDate = addDays(currentDate, 1);
          }

          const chartData = allDates.map((dateKey) => {
            return {
              date: format(new Date(dateKey), 'MMM dd'), 
              activeTime: workoutMap[dateKey] || 0,
            };
          });

          setDailyActiveTimeData(chartData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching daily active time:", error);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error listening to workouts for active time:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundOverlay, { opacity: imageOpacity }]}>
        <Image source={require('../../assets/images/statistics-background3.webp')} style={styles.backgroundImage} />
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

      <View style={styles.header}>
        <Animated.Text
          style={[
            styles.title,
            {
              // Animated styles if any
            },
          ]}
        >
          Statistics
        </Animated.Text>
        <Animated.View style={{ transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }] }}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleConnectPress}
            activeOpacity={0.3}
            accessibilityLabel={isConnected ? "Disconnect from Sensor" : "Connect to Sensor"}
          >
            <Icon
              name={isConnected ? 'bluetooth-off-outline' : 'bluetooth-outline'}
              size={24}
              color="#6a0dad"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.statsContainer}
        style={{ marginTop: -20 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Timeframe Selection Buttons */}
        <View style={styles.timeframeContainer}>
          {TIMEFRAMES.map((tf) => (
            <TouchableOpacity
              key={tf.value}
              style={[
                styles.timeframeButton,
                selectedTimeframe === tf.value && styles.timeframeButtonSelected,
              ]}
              onPress={() => setSelectedTimeframe(tf.value)}
            >
              <Text
                style={[
                  styles.timeframeButtonText,
                  selectedTimeframe === tf.value && styles.timeframeButtonTextSelected,
                ]}
              >
                {tf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Existing BPM and LineChart Section */}
        <View style={styles.combinedWidget}>
          <View style={styles.bpmChartContainer}>
            <View style={styles.bpmContainer}>
              <View style={styles.bpmTextContainer}>
                <Text style={styles.bpmLabel}>Current BPM</Text>
                <Text style={styles.bpmValue}>
                  {heartRate !== null && heartRate > 0 && heartRate < 300 ? `${heartRate} bpm` : `-- bpm`}
                </Text>
              </View>
              <AnimatedHeart />
            </View>
            {/* Optional: Additional charts or information */}
          </View>
        </View>

        {/* Existing Pie Chart Section */}
        <View style={styles.pieChartContainer}>
          <Text style={styles.chartTitle}>Most Completed Workouts</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#6a0dad" />
          ) : (
            <PieChart
              data={workoutData}
              width={screenWidth * 0.85}
              height={120}
              chartConfig={{
                color: (opacity = 1) => `rgba(106, 0, 173, ${opacity})`,
              }}
              paddingLeft='-10'
              accessor="population"
              backgroundColor="transparent"
              absolute
            />
          )}
        </View>

        {/* New Daily Active Time Victory LineChart Section */}
        <View style={styles.lineChartContainer}>
          <Text style={styles.chartTitle}>Daily Active Time (mins)</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#6a0dad" />
          ) : dailyActiveTimeData.length === 0 ? (
            <Text style={styles.noDataText}>No workout data available.</Text>
          ) : (
            <View style={{ width: '100%', alignItems: 'center', position: 'relative' }}>
              {selectedData && (
                <View style={styles.infoPanel}>
                  <Text style={styles.infoDate}>{selectedData.x}</Text>
                  <Text style={styles.infoActiveTime}>{selectedData.y} mins</Text>
                </View>
              )}
              <VictoryChart
                theme={VictoryTheme.material}
                containerComponent={
                  <VictoryVoronoiContainer
                    labels={({ datum }) => datum.label}
                    labelComponent={
                      <VictoryTooltip
                        flyoutStyle={{ fill: "#1E1E1E" }}
                        style={{ fill: "#FFFFFF" }}
                      />
                    }
                    onActivated={(points) => {
                      if (points.length > 0) {
                        setSelectedData(points[0]);
                      }
                    }}
                    onDeactivated={() => {
                      setSelectedData(null);
                    }}
                  />
                }
                scale={{ x: "linear", y: "linear" }}
                style={{
                  parent: {
                    backgroundColor: '#1E1E1E',
                    borderRadius: 16,
                  },
                }}
              >
                <VictoryAxis
                  tickFormat={() => ''}
                  style={{
                    axis: { stroke: "transparent" },
                    ticks: { stroke: "transparent" },
                    tickLabels: { fill: "transparent" },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(y) => `${y}`}
                  style={{
                    axis: { stroke: "transparent" },
                    grid: { stroke: "#444" },
                    ticks: { stroke: "transparent" },
                    tickLabels: { fill: "#FFFFFF", fontSize: 10, padding: 5 },
                  }}
                />
                <VictoryLine
                  data={dailyActiveTimeData.map((entry) => ({
                    x: entry.date,
                    y: entry.activeTime,
                    label: `${entry.date}\n${entry.activeTime} mins`,
                  }))}
                  style={{
                    data: { stroke: "#1E90FF" },
                  }}
                />
              </VictoryChart>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
