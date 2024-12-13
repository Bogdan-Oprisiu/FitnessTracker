import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase-config';
import styles from './date-workouts-modal.style';
import FriendsTab from './friends-tab';

const { width, height } = Dimensions.get('window');

const DateWorkoutsModal = ({ visible, onClose, selectedDate }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [tabRoutes] = useState([
    { key: 'you', title: 'You' },
    { key: 'friends', title: 'Friends' },
  ]);

  useEffect(() => {
    if (visible) {
      setTabIndex(0);
    }
  }, [visible]);
  

  const [workoutsForYou, setWorkoutsForYou] = useState([]);
  const [loadingYou, setLoadingYou] = useState(false);
  const [errorYou, setErrorYou] = useState('');

  const fetchWorkoutsForYou = useCallback(async () => {
    setLoadingYou(true);
    setErrorYou('');
    setWorkoutsForYou([]);

    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorYou('User not authenticated.');
        setLoadingYou(false);
        return;
      }

      const selectedDateObj = new Date(selectedDate);
      selectedDateObj.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('Fetching "You" workouts for date:', selectedDateObj, endOfDay);

      const completedWorkoutsRef = collection(db, 'users', user.uid, 'completed_workouts');
      const completedWorkoutsQuery = query(
        completedWorkoutsRef,
        where('dateCompleted', '>=', selectedDateObj),
        where('dateCompleted', '<=', endOfDay)
      );

      const completedWorkoutsSnapshot = await getDocs(completedWorkoutsQuery);

      console.log('Completed workouts snapshot:', completedWorkoutsSnapshot.size);

      if (completedWorkoutsSnapshot.empty) {
        setWorkoutsForYou([]);
        setLoadingYou(false);
        return;
      }

      const workouts = [];

      for (const docSnap of completedWorkoutsSnapshot.docs) {
        const data = docSnap.data();
        const workoutId = data.workoutId;
        const source = data.source;

        let workoutDocRef;

        if (source === 'default') {
          workoutDocRef = doc(db, 'default_workouts', workoutId);
        } else if (source === 'personalized') {
          workoutDocRef = doc(db, 'users', user.uid, 'personalized_workouts', workoutId);
        } else {
          console.warn(`Unknown source '${source}' for workoutId '${workoutId}'`);
          continue;
        }

        const workoutSnapshot = await getDoc(workoutDocRef);

        if (workoutSnapshot.exists()) {
          const workoutData = workoutSnapshot.data();
          workouts.push({
            id: workoutSnapshot.id,
            name: workoutData.name,
            description: workoutData.description,
            type: workoutData.type.charAt(0).toUpperCase() + workoutData.type.slice(1),
            difficulty: workoutData.difficulty.charAt(0).toUpperCase() + workoutData.difficulty.slice(1),
          });
        } else {
          console.warn(`Workout with id '${workoutId}' not found in '${source}_workouts'`);
        }
      }

      console.log('"You" workouts fetched:', workouts);
      setWorkoutsForYou(workouts);
    } catch (err) {
      console.error('Error fetching workouts for you:', err);
      setErrorYou('Failed to fetch workouts. Please try again.');
    } finally {
      setLoadingYou(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (visible && selectedDate) {
      fetchWorkoutsForYou();
    }
  }, [visible, selectedDate, fetchWorkoutsForYou]);

  const YouRoute = () => (
    <View style={styles.tabContainer}>
      {loadingYou ? (
        <ActivityIndicator size="large" color="#6a0dad" />
      ) : errorYou ? (
        <Text style={styles.errorText}>{errorYou}</Text>
      ) : workoutsForYou.length === 0 ? (
        <Text style={styles.noWorkoutsText}>No workouts found for this date.</Text>
      ) : (
        <FlatList
          data={workoutsForYou}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.workoutCard}>
              <Text style={styles.workoutName}>{item.name}</Text>
              <Text style={styles.workoutDescription}>{item.description}</Text>
              <Text style={styles.workoutDetails}>{item.type} | {item.difficulty}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <Text style={styles.noWorkoutsText}>No workouts found for this date.</Text>
          )}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );

  const renderScene = SceneMap({
    you: YouRoute,
    friends: () => <FriendsTab selectedDate={selectedDate} />,
  });

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Workouts Completed on {selectedDate}
          </Text>

          <TabView
            navigationState={{ index: tabIndex, routes: tabRoutes }}
            renderScene={renderScene}
            onIndexChange={setTabIndex}
            initialLayout={{ width, height }}
            renderTabBar={props =>
              <TabBar
                {...props}
                indicatorStyle={{ backgroundColor: '#6a0dad' }}
                style={{ backgroundColor: '#1a1a1a' }}
                labelStyle={{ color: '#ccc', fontWeight: 'bold' }}
                activeColor='#6a0dad'
              />
            }
            style={styles.tabViewContainer}
          />

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close workouts modal"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DateWorkoutsModal;
