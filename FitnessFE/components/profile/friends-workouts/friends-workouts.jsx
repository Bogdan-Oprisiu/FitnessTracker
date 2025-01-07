import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Image
} from 'react-native';
import { db, auth } from '../../config/firebase-config';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDocs, 
  getDoc, 
  orderBy 
} from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import styles from './friends-workouts.style';

const FriendsWorkouts = () => {
  const [friendsWorkouts, setFriendsWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendsList, setFriendsList] = useState([]);
  
  const defaultWorkoutsCache = useRef({});
  const personalizedWorkoutsCache = useRef({});
  
  const friendNames = useRef({});
  const friendProfilePictures = useRef({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [selectedFriendName, setSelectedFriendName] = useState('');
  const [selectedFriendProfilePicture, setSelectedFriendProfilePicture] = useState('');
  
  const noFriendsSelectedText = "Select a friend to view their workouts in the last week.\n\nTo view a complete workout history check the calendar on the home tab.";

  const getOneWeekAgoTimestamp = () => {
    const now = new Date();
    now.setDate(now.getDate() - 7);
    return now;
  };

  const fetchFriendDetails = async (friendId) => {
    try {
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (friendDoc.exists()) {
        friendNames.current[friendId] = friendDoc.data().username;
        friendProfilePictures.current[friendId] = friendDoc.data().profilePictureUrl || 'https://via.placeholder.com/150';
      } else {
        friendNames.current[friendId] = 'Unknown';
        friendProfilePictures.current[friendId] = 'https://via.placeholder.com/150';
      }
    } catch (error) {
      console.error(`Error fetching name/profile picture for friendId ${friendId}:`, error);
      friendNames.current[friendId] = 'Unknown';
      friendProfilePictures.current[friendId] = 'https://via.placeholder.com/150';
    }
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const friendshipsRef = collection(db, 'friendships');
    const q1 = query(
      friendshipsRef,
      where('status', '==', 'accepted'),
      where('user1', '==', currentUser.uid)
    );
    const q2 = query(
      friendshipsRef,
      where('status', '==', 'accepted'),
      where('user2', '==', currentUser.uid)
    );

    const handleFriendshipSnapshot = async (snapshot, userKey) => {
      const friends = [...friendsList];

      snapshot.docChanges().forEach(change => {
        const data = change.doc.data();
        const friendId = data[userKey === 'user1' ? 'user2' : 'user1'];

        if (change.type === 'added') {
          if (!friends.includes(friendId)) {
            friends.push(friendId);
          }
        }

        if (change.type === 'removed') {
          const index = friends.indexOf(friendId);
          if (index > -1) {
            friends.splice(index, 1);
          }

          if (friendId === selectedFriendId) {
            setSelectedFriendId(null);
            setSelectedFriendName('');
            setSelectedFriendProfilePicture('');
            setFriendsWorkouts([]);
            setLoading(false);
          }
        }

      });

      setFriendsList(friends);

      const newFriendIds = friends.filter(id => !(id in friendNames.current));
      if (newFriendIds.length > 0) {
        const nameAndPicturePromises = newFriendIds.map(async friendId => {
          await fetchFriendDetails(friendId);
        });

        await Promise.all(nameAndPicturePromises);
      }

      Object.keys(friendNames.current).forEach(friendId => {
        if (!friends.includes(friendId)) {
          delete friendNames.current[friendId];
        }
      });

      Object.keys(friendProfilePictures.current).forEach(friendId => {
        if (!friends.includes(friendId)) {
          delete friendProfilePictures.current[friendId];
        }
      });
    };

    const unsubscribe1 = onSnapshot(q1, snapshot => {
      handleFriendshipSnapshot(snapshot, 'user1');
    });

    const unsubscribe2 = onSnapshot(q2, snapshot => {
      handleFriendshipSnapshot(snapshot, 'user2');
    });

    const initialFetch = async () => {
      const allFriendIds = friendsList;
      const nameAndPicturePromises = allFriendIds.map(async friendId => {
        if (!(friendId in friendNames.current)) {
          await fetchFriendDetails(friendId);
        }
      });
      await Promise.all(nameAndPicturePromises);
    };

    initialFetch();

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [friendsList, selectedFriendId]);

  useEffect(() => {
    if (friendsList.length === 0) {
      return;
    }

    const fetchDefaultWorkouts = async () => {
      try {
        const defaultWorkoutsRef = collection(db, 'default_workouts');
        const q = query(defaultWorkoutsRef);
        const querySnapshot = await getDocs(q);

        const defaultWorkouts = {};
        querySnapshot.forEach(docSnap => {
          defaultWorkouts[docSnap.id] = docSnap.data();
        });

        defaultWorkoutsCache.current = defaultWorkouts;
      } catch (error) {
        console.error('Error fetching default workouts:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Could not fetch default workouts.',
          position: 'top',
          visibilityTime: 5000,
          autoHide: true,
        });
      }
    };

    fetchDefaultWorkouts();
  }, [friendsList]);

  useEffect(() => {
    if (!selectedFriendId) {
      setFriendsWorkouts([]);
      setLoading(false);
      return;
    }

    const oneWeekAgo = getOneWeekAgoTimestamp();

    const listenToSelectedFriendWorkouts = () => {
      const workoutsRef = collection(db, 'users', selectedFriendId, 'completed_workouts');
      const q = query(
        workoutsRef,
        where('dateCompleted', '>=', oneWeekAgo),
        orderBy('dateCompleted', 'desc')
      );

      const unsubscribe = onSnapshot(q, async snapshot => {
        const workouts = [];

        for (const docSnap of snapshot.docs) {
          const workoutData = docSnap.data();
          const { workoutId, source, dateCompleted } = workoutData;

          let detailedWorkout = null;

          if (source === 'default') {
            detailedWorkout = defaultWorkoutsCache.current[workoutId];
          } else if (source === 'personalized') {
            const cacheKey = `${selectedFriendId}_${workoutId}`;
            if (personalizedWorkoutsCache.current[cacheKey]) {
              detailedWorkout = personalizedWorkoutsCache.current[cacheKey];
            } else {
              try {
                const personalizedWorkoutRef = doc(db, 'users', selectedFriendId, 'personalized_workouts', workoutId);
                const personalizedWorkoutSnap = await getDoc(personalizedWorkoutRef);
                if (personalizedWorkoutSnap.exists()) {
                  detailedWorkout = personalizedWorkoutSnap.data();
                  personalizedWorkoutsCache.current[cacheKey] = detailedWorkout;
                } else {
                  console.warn(`Personalized workout with ID ${workoutId} not found for user ${selectedFriendId}.`);
                }
              } catch (error) {
                console.error(`Error fetching personalized workout ${workoutId} for user ${selectedFriendId}:`, error);
              }
            }
          }

          if (detailedWorkout) {
            workouts.push({
              id: docSnap.id,
              friendId: selectedFriendId,
              workoutName: detailedWorkout.name || detailedWorkout.workoutName,
              dateCompleted: dateCompleted,
            });
          }
        }

        setFriendsWorkouts(workouts);
        setLoading(false);
      }, error => {
        console.error(`Error listening to workouts of ${selectedFriendId}:`, error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: `Could not listen to workouts of ${selectedFriendName}.`,
          position: 'top',
          visibilityTime: 5000,
          autoHide: true,
        });
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = listenToSelectedFriendWorkouts();

    return () => {
      unsubscribe();
    };
  }, [selectedFriendId]);

  const renderItem = ({ item }) => (
    <View style={styles.workoutCard}>
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutName}>{item.workoutName}</Text>
        <Text style={styles.timestamp}>
          {item.dateCompleted?.toDate().toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderSeparator = () => (
    <View style={styles.separator} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <MaterialIcons name="search" size={24} color="#6a0dad" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search friends"
          placeholderTextColor="#ccc"
          value={searchQuery}
          onChangeText={text => {
            setSearchQuery(text);
            if (text.length > 0) {
              const filtered = friendsList.filter(friendId => {
                const friendName = friendNames.current[friendId] || '';
                return friendName.toLowerCase().includes(text.toLowerCase());
              });
              setFilteredFriends(filtered);
            } else {
              setFilteredFriends([]);
            }
          }}
        />
      </View>

      {filteredFriends.length > 0 && (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => {
                if (item === selectedFriendId) {
                  return;
                }
                setSelectedFriendId(item);
                setSelectedFriendName(friendNames.current[item] || 'Unknown');
                setSelectedFriendProfilePicture(friendProfilePictures.current[item] || 'https://via.placeholder.com/150');
                setSearchQuery('');
                setFilteredFriends([]);
                setFriendsWorkouts([]);
                setLoading(true);
              }}
              style={styles.friendItemContainer}
            >
              <Image 
                source={{ uri: friendProfilePictures.current[item] !== 'Unknown' ? friendProfilePictures.current[item] : 'https://via.placeholder.com/150' }}
                style={styles.friendImage}
              />
              <Text style={styles.friendItemText}>{friendNames.current[item]}</Text>
            </TouchableOpacity>
          )}
          style={styles.filteredFriendsList}
        />
      )}

      {selectedFriendId && (
        <Text style={styles.selectedFriendTitle}>
          Workouts by {selectedFriendName} in the Last Week
        </Text>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6a0dad" />
        </View>
      ) : selectedFriendId ? (
        friendsWorkouts.length === 0 ? (
          <View style={styles.noWorkoutsContainer}>
            <Text style={styles.noWorkoutsText}>No workouts to display for {selectedFriendName} in the last week.</Text>
          </View>
        ) : (
          <FlatList
            data={friendsWorkouts.sort((a, b) => b.dateCompleted - a.dateCompleted)}
            keyExtractor={(item) => `${item.friendId}_${item.id}`}
            renderItem={renderItem}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={styles.listContainer}
          />
        )
      ) : (
        <View style={styles.noSelectionContainer}>
          <Text style={styles.noSelectionText}>{noFriendsSelectedText}</Text>
        </View>
      )}
    </View>
  );
};

export default FriendsWorkouts;
