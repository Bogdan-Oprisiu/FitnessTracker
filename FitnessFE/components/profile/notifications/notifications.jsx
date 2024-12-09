import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { db, auth } from '../../config/firebase-config';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, getDoc, increment } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import styles from './notifications.style';

const Notifications = () => {
  const DEFAULT_PROFILE_PICTURE_URL = 'https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/defaultProfilePictures%2Fdefault-profile-picture.jpg?alt=media&token=YOUR_TOKEN';
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const userCache = useRef({});

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const friendRequestsRef = collection(db, 'users', currentUser.uid, 'friendRequests');
    const q = query(friendRequestsRef, where('status', '==', 'pending'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const requests = [];

      const fromUserIds = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fromUserIds.push(data.from);
      });

      const uniqueFromUserIds = [...new Set(fromUserIds)];

      const userPromises = uniqueFromUserIds.map(async (userId) => {
        if (userCache.current[userId]) {
          return userCache.current[userId];
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const userInfo = {
                id: userDoc.id,
                username: userData.username,
                profilePictureUrl: userData.profilePictureUrl || DEFAULT_PROFILE_PICTURE_URL,
              };
              userCache.current[userId] = userInfo;
              return userInfo;
            } else {
              console.warn(`User with ID ${userId} does not exist.`);
              return null;
            }
          } catch (error) {
            console.error(`Error fetching user data for ID ${userId}:`, error);
            return null;
          }
        }
      });

      const usersData = await Promise.all(userPromises);

      const userMap = {};
      usersData.forEach((user) => {
        if (user) {
          userMap[user.id] = user;
        }
      });

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const fromUserId = data.from;
        const fromUser = userMap[fromUserId];

        if (fromUser) {
          requests.push({
            id: docSnap.id,
            fromUserId: fromUserId,
            fromUsername: fromUser.username,
            fromProfilePictureUrl: fromUser.profilePictureUrl,
            requestedAt: data.requestedAt,
          });
        } else {
          requests.push({
            id: docSnap.id,
            fromUserId: fromUserId,
            fromUsername: 'Unknown User',
            fromProfilePictureUrl: DEFAULT_PROFILE_PICTURE_URL,
            requestedAt: data.requestedAt,
          });
        }
      });

      setFriendRequests(requests);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching friend requests:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not fetch friend requests.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAccept = async (request) => {
    try {
      const { fromUserId, fromUsername, fromProfilePictureUrl } = request;
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user is currently logged in.');

      const currentUserId = currentUser.uid;

      const senderFriendsRef = collection(db, 'users', fromUserId, 'friends');
      const receiverFriendsRef = collection(db, 'users', currentUserId, 'friends');

      await addDoc(senderFriendsRef, {
        friendId: currentUserId,
        addedAt: new Date(),
      });

      await addDoc(receiverFriendsRef, {
        friendId: fromUserId,
        addedAt: new Date(),
      });

      const requestDocRef = doc(db, 'users', currentUserId, 'friendRequests', request.id);
      await updateDoc(requestDocRef, {
        status: 'accepted',
        respondedAt: new Date(),
      });

      const currentUserDocRef = doc(db, 'users', currentUserId);
      await updateDoc(currentUserDocRef, {
        friendsCount: increment(1),
      });

      const senderUserDocRef = doc(db, 'users', fromUserId);
      await updateDoc(senderUserDocRef, {
        friendsCount: increment(1),
      });

      Toast.show({
        type: 'success',
        text1: 'Friend Added',
        text2: `${fromUsername} has been added to your friends.`,
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not accept friend request.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };

  const handleDecline = async (request) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user is currently logged in.');

      const requestDocRef = doc(db, 'users', currentUser.uid, 'friendRequests', request.id);
      await updateDoc(requestDocRef, {
        status: 'declined',
        respondedAt: new Date(),
      });

      Toast.show({
        type: 'info',
        text1: 'Friend Request Declined',
        text2: `You have declined ${request.fromUsername}'s friend request.`,
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    } catch (error) {
      console.error('Error declining friend request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not decline friend request.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Image 
        source={{ uri: item.fromProfilePictureUrl }} 
        style={styles.profileImage} 
      />
      <View style={styles.notificationTextContainer}>
        <Text style={styles.notificationText}>
          {item.fromUsername} wants to be your friend.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.acceptButton} 
            onPress={() => handleAccept(item)}
            accessible={true}
            accessibilityLabel={`Accept friend request from ${item.fromUsername}`}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.declineButton} 
            onPress={() => handleDecline(item)}
            accessible={true}
            accessibilityLabel={`Decline friend request from ${item.fromUsername}`}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a0dad" />
      </View>
    );
  }

  if (friendRequests.length === 0) {
    return (
      <View style={styles.noNotificationsContainer}>
        <Text style={styles.noNotificationsText}>No new friend requests.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={friendRequests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />
  );
};


export default Notifications;
