import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase-config';
import debounce from 'lodash.debounce';
import styles from './date-workouts-modal.style';

const FriendsTab = React.memo(({ selectedDate }) => {
  const [friendsList, setFriendsList] = useState([]);
  const [friendNames, setFriendNames] = useState({});
  const [friendProfilePictures, setFriendProfilePictures] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [selectedFriendName, setSelectedFriendName] = useState('');
  const [selectedFriendProfilePicture, setSelectedFriendProfilePicture] = useState('');
  const [workoutsForFriend, setWorkoutsForFriend] = useState([]);
  const [loadingFriend, setLoadingFriend] = useState(false);
  const [errorFriend, setErrorFriend] = useState('');

  const debouncedSearch = useCallback(
    debounce((text, currentFriendsList, currentFriendNames) => {
      if (text.length > 0) {
        const filtered = currentFriendsList.filter(friendId => {
          const friendName = currentFriendNames[friendId] || '';
          return friendName.toLowerCase().includes(text.toLowerCase());
        });
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery, friendsList, friendNames);
  }, [searchQuery, friendsList, friendNames, debouncedSearch]);

  const fetchFriendDetails = useCallback(async (friendId) => {
    try {
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (friendDoc.exists()) {
        setFriendNames(prev => ({ ...prev, [friendId]: friendDoc.data().username }));
        setFriendProfilePictures(prev => ({ ...prev, [friendId]: friendDoc.data().profilePictureUrl || 'https://via.placeholder.com/150' }));
      } else {
        setFriendNames(prev => ({ ...prev, [friendId]: 'Unknown' }));
        setFriendProfilePictures(prev => ({ ...prev, [friendId]: 'https://via.placeholder.com/150' }));
      }
    } catch (error) {
      console.error(`Error fetching details for friendId ${friendId}:`, error);
      setFriendNames(prev => ({ ...prev, [friendId]: 'Unknown' }));
      setFriendProfilePictures(prev => ({ ...prev, [friendId]: 'https://via.placeholder.com/150' }));
    }
  }, []);

  const fetchWorkoutsForFriend = useCallback(async (friendId, date) => {
    setLoadingFriend(true);
    setErrorFriend('');
    setWorkoutsForFriend([]);

    try {
      const selectedDateObj = new Date(date);
      selectedDateObj.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      console.log(`Fetching workouts for friend ${friendId} on date:`, selectedDateObj, endOfDay);

      const completedWorkoutsRef = collection(db, 'users', friendId, 'completed_workouts');
      const completedWorkoutsQuery = query(
        completedWorkoutsRef,
        where('dateCompleted', '>=', selectedDateObj),
        where('dateCompleted', '<=', endOfDay)
      );

      const completedWorkoutsSnapshot = await getDocs(completedWorkoutsQuery);

      console.log('Friend completed workouts snapshot:', completedWorkoutsSnapshot.size);

      if (completedWorkoutsSnapshot.empty) {
        setWorkoutsForFriend([]);
        setLoadingFriend(false);
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
          workoutDocRef = doc(db, 'users', friendId, 'personalized_workouts', workoutId);
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

      console.log(`Friend's workouts fetched for ${friendId}:`, workouts);
      setWorkoutsForFriend(workouts);
    } catch (err) {
      console.error('Error fetching workouts for friend:', err);
      setErrorFriend('Failed to fetch friend workouts. Please try again.');
    } finally {
      setLoadingFriend(false);
    }
  }, []);

  useEffect(() => {
    const setupFriendsListeners = () => {
      const user = auth.currentUser;
      if (!user) return;

      const friendshipsRef = collection(db, 'friendships');
      const q1 = query(
        friendshipsRef,
        where('status', '==', 'accepted'),
        where('user1', '==', user.uid)
      );
      const q2 = query(
        friendshipsRef,
        where('status', '==', 'accepted'),
        where('user2', '==', user.uid)
      );

      const handleFriendshipSnapshot = async (snapshot, userKey) => {
        setFriendsList(prevFriends => {
          let updatedFriends = [...prevFriends];
          snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const friendId = data[userKey === 'user1' ? 'user2' : 'user1'];

            if (change.type === 'added') {
              if (!updatedFriends.includes(friendId)) {
                updatedFriends.push(friendId);
                fetchFriendDetails(friendId);
              }
            }

            if (change.type === 'removed') {
              const index = updatedFriends.indexOf(friendId);
              if (index > -1) {
                updatedFriends.splice(index, 1);
              }

              if (friendId === selectedFriendId) {
                clearSelectedFriend();
              }

              setFriendNames(prev => {
                const updated = { ...prev };
                delete updated[friendId];
                return updated;
              });
              setFriendProfilePictures(prev => {
                const updated = { ...prev };
                delete updated[friendId];
                return updated;
              });
            }
          });
          return updatedFriends;
        });
      };

      const unsubscribe1 = onSnapshot(q1, snapshot => {
        handleFriendshipSnapshot(snapshot, 'user1');
      });

      const unsubscribe2 = onSnapshot(q2, snapshot => {
        handleFriendshipSnapshot(snapshot, 'user2');
      });

      return () => {
        unsubscribe1();
        unsubscribe2();
      };
    };

    const unsubscribe = setupFriendsListeners();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchFriendDetails, selectedFriendId, clearSelectedFriend]);

  const handleFriendSelect = useCallback((friendId) => {
    setSelectedFriendId(friendId);
    setSelectedFriendName(friendNames[friendId] || 'Unknown');
    setSelectedFriendProfilePicture(friendProfilePictures[friendId] || 'https://via.placeholder.com/150');
    setSearchQuery('');
    setSearchResults([]);
    setWorkoutsForFriend([]);
    if (selectedDate) {
      fetchWorkoutsForFriend(friendId, selectedDate);
    }
  }, [friendNames, friendProfilePictures, selectedDate, fetchWorkoutsForFriend]);

  const clearSelectedFriend = useCallback(() => {
    setSelectedFriendId(null);
    setSelectedFriendName('');
    setSelectedFriendProfilePicture('');
    setWorkoutsForFriend([]);
  }, []);

  const renderWorkoutItem = useCallback(({ item }) => (
    <View style={styles.workoutCard}>
      <Text style={styles.workoutName}>{item.name}</Text>
      <Text style={styles.workoutDescription}>{item.description}</Text>
      <Text style={styles.workoutDetails}>{item.type} | {item.difficulty}</Text>
    </View>
  ), []);

  const renderFriendItem = useCallback(({ item }) => (
    <TouchableOpacity 
      onPress={() => handleFriendSelect(item)}
      style={styles.friendItemContainer}
      accessibilityLabel={`Select ${friendNames[item]} to view workouts`}
    >
      <Image 
        source={{ uri: friendProfilePictures[item] !== 'Unknown' ? friendProfilePictures[item] : 'https://via.placeholder.com/150' }}
        style={styles.friendImage}
        accessibilityLabel={`${friendNames[item]}'s profile picture`}
      />
      <Text style={styles.friendItemText}>{friendNames[item]}</Text>
    </TouchableOpacity>
  ), [friendNames, friendProfilePictures, handleFriendSelect]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.searchBarContainer}>
        <MaterialIcons name="search" size={24} color="#6a0dad" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search friends"
          placeholderTextColor="#ccc"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item}
          renderItem={renderFriendItem}
          style={styles.searchResultsList}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={() => (
            <Text style={styles.noWorkoutsText}>No friends found.</Text>
          )}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
        />
      )}

      {selectedFriendId && (
        <View style={styles.selectedFriendContainer}>
          <Text style={styles.selectedFriendTitle}>
            Workouts by {selectedFriendName} on {selectedDate}
          </Text>
          {loadingFriend ? (
            <ActivityIndicator size="large" color="#6a0dad" />
          ) : errorFriend ? (
            <Text style={styles.errorText}>{errorFriend}</Text>
          ) : workoutsForFriend.length === 0 ? (
            <Text style={styles.noWorkoutsText}>No workouts found for this friend on this date.</Text>
          ) : (
            <FlatList
              data={workoutsForFriend}
              keyExtractor={(item) => item.id}
              renderItem={renderWorkoutItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={() => (
                <Text style={styles.noWorkoutsText}>No workouts found for this friend on this date.</Text>
              )}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              removeClippedSubviews={true}
            />
          )}
          <TouchableOpacity onPress={clearSelectedFriend} style={styles.clearFriendButton}>
            <Text style={styles.clearFriendButtonText}>Clear Selection</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
});

export default FriendsTab;
