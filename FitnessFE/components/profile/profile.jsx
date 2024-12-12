import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, FlatList, TextInput, ActivityIndicator, Animated } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { auth, db, storage } from '../config/firebase-config';
import { getDoc, doc, updateDoc, query, where, getDocs, collection, addDoc, deleteDoc, onSnapshot, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { getStorage, uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { debounce } from 'lodash';
import { useNavigation } from '@react-navigation/native';
import Notifications from './notifications/notifications';
import Toast from 'react-native-toast-message';
import styles from './profile.style';
import useFriends from './useFriends';
import useNotifications from './useNotifications';
import { logRecentActivity } from './activity-logger';
import { handleFriendRequestResponse } from './logActivityAndNotifications';
import RecentActivities from './recent-activities/recent-activities';

export default function Profile() {
  const DEFAULT_PROFILE_PICTURE_URL = 'https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/defaultProfilePictures%2Fdefault-profile-picture.jpg?alt=media&token=YOUR_TOKEN';
  const navigation = useNavigation();
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [username, setUsername] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_HEIGHT = 60;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [HEADER_HEIGHT, HEADER_HEIGHT * 0.7],
    extrapolate: 'clamp',
  });

  const editButtonOpacity = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const profileScale = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const profileTranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, -550],
    extrapolate: 'clamp',
  });

  const profileTranslateY = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, -470],
    extrapolate: 'clamp',
  });

  const usernameScale = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const usernameTranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, -125],
    extrapolate: 'clamp',
  });

  const usernameTranslateY = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, -290],
    extrapolate: 'clamp',
  });

  const icon1TranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, 190],
    extrapolate: 'clamp',
  });
  
  const icon2TranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, 140], 
    extrapolate: 'clamp',
  });
  
  const icon3TranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, 90], 
    extrapolate: 'clamp',
  });
  
  const icon4TranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, 40],
    extrapolate: 'clamp',
  });

  const openFriendsModal = () => {
    setFriendsModalVisible(true);
  };

  const closeFriendsModal = () => {
    setFriendsModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setLoading(false);
          return;
        }

        const uid = currentUser.uid;

        const userDocRef = doc(db, 'users', uid);

        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUsername(userData.username);

          if (typeof userData.profilePictureUrl === 'string' && userData.profilePictureUrl.startsWith('http')) {
            setProfilePicture(userData.profilePictureUrl);
          } else {
            setProfilePicture(DEFAULT_PROFILE_PICTURE_URL);
            console.warn(`Invalid profilePictureUrl for user ${uid}. Using default image.`);
          }

          setFriendsCount(userData.friendsCount || 0);
        } 
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const { friends, loading: loadingFriends } = useFriends();
  const { notifications, loadingNotifications, markNotificationsAsRead } = useNotifications();
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const sentRef = collection(db, 'friendships');
        const qSent = query(
          sentRef,
          where('status', '==', 'pending'),
          where('user1', '==', currentUser.uid)
        );
        const sentSnapshot = await getDocs(qSent);
        const sent = sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSentRequests(sent);

        const receivedRef = collection(db, 'friendships');
        const qReceived = query(
          receivedRef,
          where('status', '==', 'pending'),
          where('user2', '==', currentUser.uid)
        );
        const receivedSnapshot = await getDocs(qReceived);
        const received = receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReceivedRequests(received);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Could not fetch friend requests.',
          position: 'top',
          visibilityTime: 5000,
          autoHide: true,
        });
      }
    };

    if (friendsModalVisible) {
      fetchFriendRequests();
    }
  }, [friendsModalVisible]);

  const createQuery = (collectionRef, ...conditions) => {
    return query(collectionRef, ...conditions);
  };

  const debouncedHandleSearch = useRef(
    debounce((input) => {
      handleSearch(input);
    }, 500) 
  ).current;

  const handleSearchInput = (text) => {
    setSearchQuery(text);
    debouncedHandleSearch(text);
  };

  const handleSearch = async (input) => {
    if (input.trim() === '') {
      setSearchResults([]);
      return;
    }
  
    try {
      setLoadingUsers(true);
  
      const q = query(
        collection(db, 'users'),
        where('username_lowercase', '>=', input.toLowerCase()),
        where('username_lowercase', '<=', input.toLowerCase() + '\uf8ff')
      );
  
      const querySnapshot = await getDocs(q);
  
      const fetchedUsers = [];
  
      for (const userDoc of querySnapshot.docs) {
        if (userDoc.id === auth.currentUser.uid) continue;
  
        const userData = userDoc.data();
  
        let friendshipId = null;
        let status = 'none'; 
  
        const friendshipQ1 = query(
          collection(db, 'friendships'),
          where('user1', '==', auth.currentUser.uid),
          where('user2', '==', userDoc.id)
        );
  
        const friendshipSnapshot1 = await getDocs(friendshipQ1);
  
        if (!friendshipSnapshot1.empty) {
          const friendshipDoc = friendshipSnapshot1.docs[0];
          friendshipId = friendshipDoc.id;
          status = friendshipDoc.data().status;
        } else {
          const friendshipQ2 = query(
            collection(db, 'friendships'),
            where('user1', '==', userDoc.id),
            where('user2', '==', auth.currentUser.uid)
          );
  
          const friendshipSnapshot2 = await getDocs(friendshipQ2);
  
          if (!friendshipSnapshot2.empty) {
            const friendshipDoc = friendshipSnapshot2.docs[0];
            friendshipId = friendshipDoc.id;
            status = friendshipDoc.data().status;
          }
        }
  
        let relationshipStatus = 'none';
        if (status === 'accepted') {
          relationshipStatus = 'friends';
        } else if (status === 'pending') {
          if (friendshipSnapshot1.empty === false) {
            relationshipStatus = 'pendingSent';
          } else {
            relationshipStatus = 'pendingReceived';
          }
        }
  
        fetchedUsers.push({
          id: userDoc.id,
          username: userData.username,
          profilePictureUrl: userData.profilePictureUrl || DEFAULT_PROFILE_PICTURE_URL,
          friendshipId: friendshipId,
          relationshipStatus: relationshipStatus,
        });
      }
  
      setSearchResults(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not search users. Please try again.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const getRelationshipStatus = (otherUserId) => {
    if (friends.some(friend => friend.friendUserId === otherUserId)) {
      return 'friends';
    }

    if (sentRequests.some(request => request.user2 === otherUserId && request.status === 'pending')) {
      return 'pendingSent';
    }

    if (receivedRequests.some(request => request.user1 === otherUserId && request.status === 'pending')) {
      return 'pendingReceived';
    }
    return 'none';
  };

  const handleAddFriend = async (otherUserId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently logged in.');
      }
    
      const friendshipsRef = collection(db, 'friendships');
      const q = query(
        friendshipsRef, 
        where('user1', 'in', [currentUser.uid, otherUserId]),
        where('user2', 'in', [currentUser.uid, otherUserId])
      );
      const querySnapshot = await getDocs(q);
    
      if (!querySnapshot.empty) {
        Toast.show({
          type: 'info',
          text1: 'Request Already Sent',
          text2: "You already sent a friend request or you're already friends.",
          position: 'top',
          visibilityTime: 5000,
          autoHide: true,
        });
        return;
      }
    
      await addDoc(friendshipsRef, {
        user1: currentUser.uid,
        user2: otherUserId,
        status: 'pending',
        createdAt: new Date(),
      });
    
      const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
      const otherUsername = otherUserDoc.exists() ? otherUserDoc.data().username : 'Unknown User';

      await handleFriendRequestResponse(
        otherUserId,
        `Received friend request from ${username}`,
        `Sent friend request to ${otherUsername}`,
        'friendRequestReceived'
      );

      Toast.show({
        type: 'success',
        text1: 'Friend Request Sent',
        text2: 'Your friend request has been sent.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    
    } catch (error) {
      console.error('Error sending friend request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not send friend request. Please try again.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently logged in.');
      }
  
      const friendshipRef = doc(db, 'friendships', friendshipId);
      const friendshipDoc = await getDoc(friendshipRef);
  
      if (!friendshipDoc.exists()) {
        throw new Error('Friendship document does not exist.');
      }
  
      const data = friendshipDoc.data();
      const user1Id = data.user1;
      const user2Id = data.user2;
  
      const user1Ref = doc(db, 'users', user1Id);
      const user2Ref = doc(db, 'users', user2Id);
  
      const batch = writeBatch(db);
  
      batch.delete(friendshipRef);
  
      batch.update(user1Ref, {
        friendsCount: increment(-1),
      });
  
      batch.update(user2Ref, {
        friendsCount: increment(-1),
      });
  
      await batch.commit();
  
      const otherUserId = currentUser.uid === user1Id ? user2Id : user1Id;
      const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
      const otherUsername = otherUserDoc.exists() ? otherUserDoc.data().username : 'Unknown User';

      await handleFriendRequestResponse(
        otherUserId,
        `${username} removed you from friends`,
        `Removed ${otherUsername} from friends`,
        'friendRemoved'
      );
  
      Toast.show({
        type: 'success',
        text1: 'Friend Removed',
        text2: 'You have removed this friend.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
  
    } catch (error) {
      console.error('Error removing friend:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not remove friend. Please try again.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };  

  const handleAcceptRequest = async (friendshipId, fromUserId) => {
    try {
      const friendshipRef = doc(db, 'friendships', friendshipId);
      await updateDoc(friendshipRef, {
        status: 'accepted',
        respondedAt: serverTimestamp(),
      });
  
      const friendshipDoc = await getDoc(friendshipRef);
      if (!friendshipDoc.exists()) throw new Error('Friendship document does not exist.');
      const data = friendshipDoc.data();
      const currentUserId = auth.currentUser.uid;
      const friendUserId = data.user1 === currentUserId ? data.user2 : data.user1;
  
      const currentUserDocRef = doc(db, 'users', currentUserId);
      const friendUserDocRef = doc(db, 'users', friendUserId);
  
      await updateDoc(currentUserDocRef, {
        friendsCount: increment(1),
      });
  
      await updateDoc(friendUserDocRef, {
        friendsCount: increment(1),
      });
    
      const friendDoc = await getDoc(doc(db, 'users', friendUserId));
      const friendUsername = friendDoc.exists() ? friendDoc.data().username : 'Unknown User';

      const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
      const currentUsername = currentUserDoc.exists() ? currentUserDoc.data().username : 'Unknown User';

      await handleFriendRequestResponse(
        fromUserId, 
        `${currentUsername} Accepted Your Friend Request`,
        `Accepted Friend Request from ${friendUsername}`,  
        'friendRequestAccepted'
      );
      await logRecentActivity(currentUserId, 'Friend Request Accepted', friendUserId, friendUsername);
      await logRecentActivity(friendUserId, 'Friend Request Accepted', currentUserId, currentUsername);
    
      Toast.show({
        type: 'success',
        text1: 'Friend Added',
        text2: 'You are now friends.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not accept friend request. Please try again.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };

  const handleRejectRequest = async (friendshipId, fromUserId) => {
    try {
      const friendshipRef = doc(db, 'friendships', friendshipId);
      const friendshipDoc = await getDoc(friendshipRef);
      if (!friendshipDoc.exists()) {
        throw new Error('Friendship document does not exist.');
      }
      const data = friendshipDoc.data();
      const currentUserId = auth.currentUser.uid;
      const friendUserId = data.user1 === currentUserId ? data.user2 : data.user1;
  
      await deleteDoc(friendshipRef);
    
      const friendDoc = await getDoc(doc(db, 'users', friendUserId));
      const friendUsername = friendDoc.exists() ? friendDoc.data().username : 'Unknown User';
  
      const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
      const currentUsername = currentUserDoc.exists() ? currentUserDoc.data().username : 'Unknown User';

      await handleFriendRequestResponse(
        fromUserId, 
        `${currentUsername} Rejected Your Friend Request`, 
        `Rejected Friend Request from ${friendUsername}`, 
        'friendRequestRejected'
      );
      await logRecentActivity(currentUserId, 'Friend Request Rejected', friendUserId, friendUsername);
      await logRecentActivity(friendUserId, 'Friend Request Rejected', currentUserId, currentUsername);
    
      Toast.show({
        type: 'info',
        text1: 'Friend Request Rejected',
        text2: 'You have rejected this friend request.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not reject friend request. Please try again.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };

  const handleEdit = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
    if (!permissionResult.granted) {
        Toast.show({
            type: 'error',
            text1: 'Permission Denied',
            text2: 'We need permission to access your gallery.',
            position: 'top',
            visibilityTime: 5000,
            autoHide: true, 
        });
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    if (!result.canceled) {

      const imageUri = result.uri || (result.assets && result.assets[0].uri);
      
      if (imageUri) {
          setProfilePicture(imageUri);
          
          try {
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
              throw new Error('No user is currently logged in.');
            }
            
            const userId = currentUser.uid;            
            const timestamp = Date.now();
            const fileExtension = imageUri.substring(imageUri.lastIndexOf('.') + 1);
            const fileName = `profile_${timestamp}.${fileExtension}`;
            const storageRef = ref(storage, `profilePictures/${userId}/${fileName}`);
            const response = await fetch(imageUri);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
              profilePictureUrl: downloadURL,
            });
            
            setProfilePicture(downloadURL);
            
            Toast.show({
              type: 'success',
              text1: 'Profile Picture Updated',
              text2: 'Your profile picture has been successfully updated.',
              position: 'top',
              visibilityTime: 5000,
              autoHide: true,
            });
            
          } catch (error) {
            console.error('Error uploading image:', error);
            Toast.show({
              type: 'error',
              text1: 'Upload Failed',
              text2: 'There was an error updating your profile picture. Please try again.',
              position: 'top',
              visibilityTime: 5000,
              autoHide: true,
            });
          }
          
      } else {
          console.error('Error: Image URI is undefined');
          Toast.show({
              type: 'error',
              text1: 'Image Selection Error',
              text2: 'There was an issue selecting your image. Please try again.',
              position: 'top',
              visibilityTime: 5000,
              autoHide: true, 
          });
      }
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been successfully logged out.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'An error occurred while logging out.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a0dad" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, {height: HEADER_HEIGHT}]}>
        <View style={styles.headerLeft}>
          <Animated.View style={{ transform: [{ translateX: icon1TranslateX }] }}>
            <TouchableOpacity style={styles.headerIcon} onPress={handleLogout}>
              <MaterialIcons name="logout" size={28} color="#6a0dad" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateX: icon2TranslateX }] }}>
            <TouchableOpacity style={styles.headerIcon} onPress={openFriendsModal}>
              <MaterialIcons name="group" size={28} color="#6a0dad" />
              {friends.length >= 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{friends.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateX: icon3TranslateX }] }}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => console.log('Settings')}>
              <MaterialIcons name="settings" size={28} color="#6a0dad" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateX: icon4TranslateX }] }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')} 
            style={styles.headerIcon}
            accessible={true}
            accessibilityLabel="Open Notifications"
          >
            <Ionicons name="notifications-outline" size={28} color="#6a0dad" />
            {notifications.some(n => !n.isRead) && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{notifications.filter(n => !n.isRead).length}</Text>
              </View>
            )}
          </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.profilePictureContainer,
            {
              transform: [
                { scale: profileScale },
                { translateX: profileTranslateX },
                { translateY: profileTranslateY },
              ],
            },
          ]}
        >
          <Image 
            source={typeof profilePicture === 'string' ? { uri: profilePicture } : { uri: DEFAULT_PROFILE_PICTURE_URL }} 
            style={styles.profilePicture} 
            onError={(e) => {
              console.warn('Failed to load profile picture. Using default image.', e.nativeEvent.error);
              setProfilePicture(DEFAULT_PROFILE_PICTURE_URL);
            }}
          />
          <Animated.View style={{ opacity: editButtonOpacity }}>
            <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
              <MaterialIcons name="edit" size={14} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <Animated.Text
          style={[
            styles.username,
            {
              transform: [
                { scale: usernameScale },
                { translateX: usernameTranslateX },
                { translateY: usernameTranslateY },
              ],
            },
          ]}
        >
          {username}
        </Animated.Text>
      </Animated.View>
      
      <Animated.ScrollView
        contentContainerStyle={styles.mainContent}
        style={{ marginTop: 110 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={styles.searchBarContainer}>
          <MaterialIcons name="search" size={24} color="#6a0dad" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search for users"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearchInput}
          />
        </View>

        {searchQuery.trim() !== '' && (
          <View style={styles.dropdown}>
            {loadingUsers && <ActivityIndicator size="small" color="#6a0dad" />}
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => {/* handle user selection */}}>
                    <Image source={{ uri: item.profilePictureUrl || DEFAULT_PROFILE_PICTURE_URL }} style={styles.dropdownImage} />
                    <Text style={styles.dropdownText}>{item.username}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={styles.noUsersText}>No users found.</Text>
            )}
          </View>
        )}

        {searchQuery.trim() === '' && (
          <View style={styles.recentActivityContainer}>
            <Text style={styles.recentActivityTitle}>Recent Activity</Text>
            <RecentActivities />
          </View>
        )}
      </Animated.ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={friendsModalVisible}
        onRequestClose={closeFriendsModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Your Friends</Text>

            <View style={styles.modalSearchBarContainer}>
              <MaterialIcons name="search" size={24} color="#6a0dad" style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchBar}
                placeholder="Search Users"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={handleSearchInput}
                accessible={true}
                accessibilityLabel="Search Users"
              />
            </View>

            {loadingUsers && <ActivityIndicator size="large" color="#6a0dad" style={{ marginVertical: 10 }} />}
            {searchQuery.trim() !== '' ? (
              searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const relationshipStatus = getRelationshipStatus(item.id);
                    const friendshipId = item.friendshipId;

                    const renderButton = () => {
                      switch (relationshipStatus) {
                        case 'friends':
                          return (
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => {
                                const friendship = friends.find(f => f.friendUserId === item.id);
                                if (friendship) {
                                  handleRemoveFriend(friendship.friendshipId);
                                } else {
                                  Toast.show({
                                    type: 'error',
                                    text1: 'Error',
                                    text2: 'Friendship data not found.',
                                    position: 'top',
                                    visibilityTime: 5000,
                                    autoHide: true,
                                  });
                                }
                              }}
                              accessible={true}
                              accessibilityLabel={`Remove ${item.username} from friends`}
                            >
                              <Text style={styles.buttonText}>Remove Friend</Text>
                            </TouchableOpacity>
                          );
                        case 'pendingSent':
                          return (
                            <TouchableOpacity
                              style={styles.pendingButton}
                              accessible={false}
                              accessibilityLabel={`Cancel friend request to ${item.username}`}
                            >
                              <Text style={styles.buttonText}>Pending</Text>
                            </TouchableOpacity>
                          );
                        case 'pendingReceived':
                          return (
                            <View style={styles.pendingContainer}>
                              <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={() => handleAcceptRequest(friendshipId, item.id)}
                                accessible={true}
                                accessibilityLabel={`Accept friend request from ${item.username}`}
                              >
                                <Text style={styles.buttonText}>Accept</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={() => handleRejectRequest(friendshipId, item.id)}
                                accessible={true}
                                accessibilityLabel={`Reject friend request from ${item.username}`}
                              >
                                <Text style={styles.buttonText}>Reject</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        default:
                          return (
                            <TouchableOpacity
                              style={styles.addButton}
                              onPress={() => handleAddFriend(item.id)} 
                              accessible={true}
                              accessibilityLabel={`Add ${item.username} as a friend`}
                            >
                              <Text style={styles.buttonText}>Add Friend</Text>
                            </TouchableOpacity>
                          );
                      }
                    };

                    return (
                      <View style={styles.searchResultItem}>
                        <Image
                          source={{ uri: item.profilePictureUrl || DEFAULT_PROFILE_PICTURE_URL }}
                          style={styles.searchResultImage}
                        />
                        <Text style={styles.searchResultName}>{item.username}</Text>
                        {renderButton()}
                      </View>
                    );
                  }}
                />
              ) : (
                <Text style={styles.noUsersText}>No users found.</Text>
              )
            ) : (
              friends.length > 0 ? (
                <FlatList
                  data={friends}
                  keyExtractor={(item) => item.friendshipId}
                  renderItem={({ item }) => (
                    <View style={styles.friendItem}>
                      <Image
                        source={{ uri: item.profilePictureUrl || DEFAULT_PROFILE_PICTURE_URL }}
                        style={styles.friendImage}
                      />
                      <Text style={styles.friendName}>{item.username}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveFriend(item.friendshipId)}
                        accessible={true}
                        accessibilityLabel={`Remove ${item.username} from friends`}
                      >
                        <Text style={styles.buttonText}>Remove Friend</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              ) : (
                <Text style={styles.noUsersText}>No friends found.</Text>
              )
            )}

            <TouchableOpacity 
              onPress={closeFriendsModal} 
              style={styles.closeButton}
              accessible={true}
              accessibilityLabel="Close Friends Modal"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
