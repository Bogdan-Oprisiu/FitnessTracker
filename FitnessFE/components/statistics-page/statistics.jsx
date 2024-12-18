import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Image, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { BlurView } from 'expo-blur';
import { useHeartRate } from '../heart-rate-provider';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './statistics.style';
import AnimatedHeart from '../animated-components/heart-animation';
import { db, auth } from '../config/firebase-config';
import { collection, doc, onSnapshot, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

const TIMEFRAMES = [
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: 'All', value: 'ALL' },
];

const { width: screenWidth } = Dimensions.get('window');

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
  const [dailyActiveTimeData, setDailyActiveTimeData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Daily Active Time (mins)'],
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1W');
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const infoOpacity = useRef(new Animated.Value(0)).current;
  const infoBackgroundOpacity = useRef(new Animated.Value(0)).current;


  const fadeInInfo = () => {
    Animated.timing(infoOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const fadeOutInfo = () => {
    Animated.timing(infoOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const fadeInOverlay = () => {
    Animated.timing(infoBackgroundOpacity, {
      toValue: 0.5,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const fadeOutOverlay = () => {
    Animated.timing(infoBackgroundOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  useEffect(() => {
    if (selectedDataPoint) {
      fadeInOverlay();
      fadeInInfo();
    } else {
      fadeOutInfo();
      fadeOutOverlay();
    }
  }, [selectedDataPoint]);
  

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

    const unsubscribeWorkouts = fetchWorkoutDataRealtime(selectedTimeframe);
    const unsubscribeDailyActiveTime = fetchDailyActiveTimeRealtime(selectedTimeframe);

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

  const getDateRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const fetchWorkoutDataRealtime = (timeframe) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found.");
      setLoading(false);
      return () => {};
    }
    const userId = user.uid;

    const completedWorkoutsRef = collection(db, 'users', userId, 'completed_workouts');

    let q;
    const currentDate = new Date();
    let startDate;

    switch (timeframe) {
      case '1W':
        startDate = new Date();
        startDate.setDate(currentDate.getDate() - 6);
        q = query(
          completedWorkoutsRef,
          where('dateCompleted', '>=', startDate),
          orderBy('dateCompleted', 'asc')
        );
        break;
      case '1M':
        startDate = new Date();
        startDate.setMonth(currentDate.getMonth() - 1);
        q = query(
          completedWorkoutsRef,
          where('dateCompleted', '>=', startDate),
          orderBy('dateCompleted', 'asc')
        );
        break;
      case '6M':
        startDate = new Date();
        startDate.setMonth(currentDate.getMonth() - 6);
        q = query(
          completedWorkoutsRef,
          where('dateCompleted', '>=', startDate),
          orderBy('dateCompleted', 'asc')
        );
        break;
      case '1Y':
        startDate = new Date();
        startDate.setFullYear(currentDate.getFullYear() - 1);
        q = query(
          completedWorkoutsRef,
          where('dateCompleted', '>=', startDate),
          orderBy('dateCompleted', 'asc')
        );
        break;
      case 'ALL':
      default:
        q = query(completedWorkoutsRef, orderBy('dateCompleted', 'asc'));
        break;
    }

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
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
            legendFontColor: '#7F7F7F',
            legendFontSize: 11,
          }));

          setWorkoutData(pieData);
          setLoading(false);
        } catch (error) {
          console.error("Error processing workouts: ", error);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error listening to workouts: ", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  };

  const fetchDailyActiveTimeRealtime = (timeframe) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found.");
      setLoading(false);
      return () => {};
    }
    const userId = user.uid;

    const completedWorkoutsRef = collection(db, 'users', userId, 'completed_workouts');

    let q;
    const currentDate = new Date();
    let startDate;

    switch (timeframe) {
      case '1W':
        startDate = new Date();
        startDate.setDate(currentDate.getDate() - 6);
        q = query(
          completedWorkoutsRef,
          where('dateCompleted', '>=', startDate),
          orderBy('dateCompleted', 'asc')
        );
        break;
      case '1M':
        startDate = new Date();
        startDate.setMonth(currentDate.getMonth() - 1);
        q = query(
          completedWorkoutsRef,
          where('dateCompleted', '>=', startDate),
          orderBy('dateCompleted', 'asc')
        );
        break;
      case '6M':
        startDate = new Date();
        startDate.setMonth(currentDate.getMonth() - 6);
        q = query(
          completedWorkoutsRef,
          where('dateCompleted', '>=', startDate),
          orderBy('dateCompleted', 'asc')
        );
        break;
      case '1Y':
        startDate = new Date();
        startDate.setFullYear(currentDate.getFullYear() - 1);
        q = query(
          completedWorkoutsRef,
          where('dateCompleted', '>=', startDate),
          orderBy('dateCompleted', 'asc')
        );
        break;
      case 'ALL':
      default:
        q = query(completedWorkoutsRef, orderBy('dateCompleted', 'asc'));
        break;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const dailyActiveTime = {};

          snapshot.docs.forEach((doc) => {
            const { activeTime, dateCompleted } = doc.data();
            if (activeTime && dateCompleted) {
              const dateObj = dateCompleted.toDate();

              const dateStrISO = format(dateObj, 'yyyy-MM-dd');

              const dateStrLabel = format(dateObj, 'MMM dd, yyyy');

              if (dailyActiveTime[dateStrISO]) {
                dailyActiveTime[dateStrISO].activeTime += activeTime / 60;
              } else {
                dailyActiveTime[dateStrISO] = {
                  dateLabel: dateStrLabel,
                  activeTime: activeTime / 60,
                };
              }
            }
          });

          const endDate = new Date();
          let adjustedStartDate = new Date(startDate);
          adjustedStartDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          const allDates = getDateRange(adjustedStartDate, endDate);

          const completeData = allDates.map((date) => {
            const dateISO = format(date, 'yyyy-MM-dd');
            if (dailyActiveTime[dateISO]) {
              return {
                dateLabel: dailyActiveTime[dateISO].dateLabel,
                activeTime: dailyActiveTime[dateISO].activeTime.toFixed(2),
              };
            } else {
              return {
                dateLabel: format(date, 'MMM dd'),
                activeTime: 0,
              };
            }
          });

          completeData.sort((a, b) => {
            const dateA = new Date(a.dateLabel);
            const dateB = new Date(b.dateLabel);
            return dateA - dateB;
          });

          const chartLabels = completeData.map((entry) => entry.dateLabel);
          const chartData = completeData.map((entry) => entry.activeTime);

          console.log('Complete Daily Data:', completeData);
          console.log('Chart Labels:', chartLabels);
          console.log('Chart Data:', chartData);

          setDailyActiveTimeData({
            labels: chartLabels,
            datasets: [
              {
                data: chartData,
                color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          });
          setLoading(false);
        } catch (error) {
          console.error('Error fetching daily active time:', error);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to workouts for active time:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  };

  const screenWidth = Dimensions.get('window').width;

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

  const textTranslateX = scrollY.interpolate({
      inputRange: [-20, 100],
      outputRange: [0, -140],
      extrapolate: 'clamp',
  });

  const textTranslateY = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, -30],
      extrapolate: 'clamp',
  });

  const iconScale = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.7],
      extrapolate: 'clamp',
  });

  const iconTranslateX = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, -150],
      extrapolate: 'clamp',
  });

  const iconTranslateY = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, -33],
      extrapolate: 'clamp',
  });

  const widgetScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  const widgetTranslateX = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 80],
    extrapolate: 'clamp',
  });

  const widgetTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -95],
    extrapolate: 'clamp',
  });

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
        <View style={styles.textAndIconContainer}>
            <Animated.Text
            style={[
                styles.title,
                {
                    fontSize: textFontSize,
                    left: textLeftPosition,
                    transform: [
                    { translateX: textTranslateX },
                    { translateY: textTranslateY },
                    ],
                },
            ]}
            >
            Statistics
            </Animated.Text>
            <Animated.View style={{ transform: [{ translateX: iconTranslateX }, { translateY: iconTranslateY }, { scale: iconScale }] }}>
            <TouchableOpacity
                style={styles.headerIconButton}
                onPress={handleConnectPress}
                activeOpacity={0.3}
                accessibilityLabel={isConnected ? "Disconnect from Sensor" : "Connect to Sensor"}
            >
                <Icon
                name={'bluetooth-outline'}
                size={24}
                color="#6a0dad"
                />
            </TouchableOpacity>
            </Animated.View>
        </View>

        <Animated.View style={[styles.timeframeContainer, { transform: [{ translateX: widgetTranslateX }, { translateY: widgetTranslateY }, { scale: widgetScale }] }]}>
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
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.statsContainer}
        style={{ marginTop: -100 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
        )}
      >

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
            <LineChart
              data={{
                labels: [],
                datasets: [{ data: sanitizedHeartRateData }],
              }}
              width={screenWidth * 0.85}
              height={150}
              chartConfig={{
                backgroundGradientFrom: '#1E1E1E',
                backgroundGradientTo: '#1E1E1E',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(106, 0, 173, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '3',
                  strokeWidth: '1',
                  stroke: '#6a0dad',
                },
                propsForBackgroundLines: {
                  stroke: '#444',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        <View style={styles.pieChartContainer}>
          <Text style={styles.chartTitle}>Most Completed Workouts</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#6a0dad" />
          ) : workoutData.length === 0 ? (
            <Text style={styles.noDataText}>No workout data available.</Text>
          ) : (
            <PieChart
              data={workoutData}
              width={screenWidth * 0.85}
              height={120}
              chartConfig={{
                color: (opacity = 1) => `rgba(106, 0, 173, ${opacity})`,
              }}
              paddingLeft={-10} 
              accessor="population"
              backgroundColor="transparent"
              absolute
            />
          )}
        </View>
        <View style={styles.lineChartContainer}>
            <Text style={styles.chartTitle}>Daily Active Time (mins)</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#6a0dad" />
            ) : dailyActiveTimeData.labels.length === 0 ? (
                <Text style={styles.noDataText}>No workout data available.</Text>
            ) : (
                <LineChart
                data={dailyActiveTimeData}
                width={screenWidth * 0.85}
                height={220}
                chartConfig={{
                    backgroundGradientFrom: '#1a1a1a',
                    backgroundGradientTo: '#1a1a1a',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                    borderRadius: 16,
                    },
                    propsForDots: {
                    r: '0',
                    strokeWidth: '0',
                    stroke: '#6a0dad',
                    },
                    propsForBackgroundLines: {
                    stroke: '#444',
                    },
                }}
                bezier
                style={styles.lineChart}
                fromZero={true}
                verticalLabelRotation={-45}
                xLabelsOffset={30}
                withVerticalLabels={false} 
                onDataPointClick={(data) => {
                    setSelectedDataPoint({
                      date: dailyActiveTimeData.labels[data.index],
                      activeTime: dailyActiveTimeData.datasets[0].data[data.index],
                    });
                    fadeInOverlay();
                    fadeInInfo();
                }}
              />
            )}

            {selectedDataPoint && (
                <Animated.View style={[styles.overlay, { backgroundColor: 'black', opacity: infoBackgroundOpacity }]}>
                    <Animated.View style={[styles.modalContainer, { opacity: infoOpacity }]}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setSelectedDataPoint(null); 
                                fadeOutInfo();
                                fadeOutOverlay();
                            }}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Active Time Details</Text>
                        <Text style={styles.modalDate}>{selectedDataPoint.date}</Text>
                        <Text style={styles.modalValue}>{selectedDataPoint.activeTime} mins</Text>
                    </Animated.View>
                </Animated.View>
            )}
        </View>
      </ScrollView>
    </View>
  );
}
