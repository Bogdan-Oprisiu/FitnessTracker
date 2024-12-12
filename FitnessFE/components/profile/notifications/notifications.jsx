import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../config/firebase-config';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  getDocs,
  writeBatch, 
  orderBy 
} from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import styles from './notifications.style';
import { acceptFriendRequest, rejectFriendRequest } from '../respondToFriendRequest';

const Notifications = () => {
  const DEFAULT_PROFILE_PICTURE_URL = 'https://via.placeholder.com/150';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('New');
  const userCache = useRef({});

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    let q;

    if (selectedTab === 'New') {
      q = query(
        notificationsRef,
        where('isRead', '==', false),
        orderBy('timestamp', 'desc')
      );
    } else {
      q = query(
        notificationsRef,
        orderBy('timestamp', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedNotifications = [];

      const fromUserIds = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fromUserIds.push(data.fromUserId);
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
        const fromUserId = data.fromUserId;
        const fromUser = userMap[fromUserId];

        fetchedNotifications.push({
          id: docSnap.id,
          type: data.type,
          fromUserId: fromUserId,
          message: data.message,
          timestamp: data.timestamp,
          isRead: data.isRead || false,
          fromUsername: fromUser ? fromUser.username : 'Unknown User',
          fromProfilePictureUrl: fromUser ? fromUser.profilePictureUrl : DEFAULT_PROFILE_PICTURE_URL,
        });
      });

      setNotifications(fetchedNotifications);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not fetch notifications.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedTab]);

  const markNotificationsAsRead = async (notificationIds) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const batch = writeBatch(db);

    notificationIds.forEach((id) => {
      const notificationRef = doc(db, 'users', currentUser.uid, 'notifications', id);
      batch.update(notificationRef, { isRead: true });
    });

    try {
      await batch.commit();
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not mark notifications as read.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };

  const handleTabSelect = (tab) => {
    setSelectedTab(tab);
    if (tab === 'New') {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const unreadIds = unreadNotifications.map(n => n.id);
      if (unreadIds.length > 0) {
        markNotificationsAsRead(unreadIds);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'friendRequestReceived':
        return <Ionicons name="person-add" size={24} color="#6a0dad" />;
      case 'friendRequestAccepted':
        return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
      case 'friendRequestRejected':
        return <Ionicons name="close-circle" size={24} color="#F44336" />;
      case 'friendRemoved':
        return <Ionicons name="close-circle" size={24} color="#F44336" />;
      default:
        return <Ionicons name="notifications" size={24} color="#6a0dad" />;
    }
  };

  const handleAccept = async (notification) => {
    Alert.alert(
      'Accept Friend Request',
      `Do you want to accept the friend request from ${notification.fromUsername}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: async () => {
            try {
              const friendshipsRef = collection(db, 'friendships');
              const q = query(
                friendshipsRef,
                where('user1', '==', notification.fromUserId),
                where('user2', '==', auth.currentUser.uid),
                where('status', '==', 'pending')
              );
              const querySnapshot = await getDocs(q);
              if (querySnapshot.empty) {
                throw new Error('No pending friendship request found.');
              }
              const friendshipDoc = querySnapshot.docs[0];
              const friendshipId = friendshipDoc.id;

              await acceptFriendRequest(friendshipId, notification.fromUserId);

              await markNotificationsAsRead([notification.id]);

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
          },
        },
      ]
    );
  };

  const handleReject = async (notification) => {
    Alert.alert(
      'Reject Friend Request',
      `Do you want to reject the friend request from ${notification.fromUsername}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          onPress: async () => {
            try {
              const friendshipsRef = collection(db, 'friendships');
              const q = query(
                friendshipsRef,
                where('user1', '==', notification.fromUserId),
                where('user2', '==', auth.currentUser.uid),
                where('status', '==', 'pending')
              );
              const querySnapshot = await getDocs(q);
              if (querySnapshot.empty) {
                throw new Error('No pending friendship request found.');
              }
              const friendshipDoc = querySnapshot.docs[0];
              const friendshipId = friendshipDoc.id;

              await rejectFriendRequest(friendshipId, notification.fromUserId);

              await markNotificationsAsRead([notification.id]);

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
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.isRead ? styles.readCard : styles.unreadCard]} 
      onPress={() => handleNotificationPress(item)}
      accessible={true}
      accessibilityLabel={`View details of notification from ${item.fromUsername}`}
    >
      <View style={styles.iconContainer}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTimestamp}>
          {item.timestamp?.toDate().toLocaleString()}
        </Text>
      </View>
      {item.type === 'friendRequestReceived' && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAccept(item)}
            accessible={true}
            accessibilityLabel={`Accept friend request from ${item.fromUsername}`}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(item)}
            accessible={true}
            accessibilityLabel={`Reject friend request from ${item.fromUsername}`}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSeparator = () => (
    <View style={styles.separator} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'New' && styles.activeTab]}
          onPress={() => handleTabSelect('New')}
          accessible={true}
          accessibilityLabel="View New Notifications"
        >
          <Text style={[styles.tabText, selectedTab === 'New' && styles.activeTabText]}>New</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'All' && styles.activeTab]}
          onPress={() => handleTabSelect('All')}
          accessible={true}
          accessibilityLabel="View All Notifications"
        >
          <Text style={[styles.tabText, selectedTab === 'All' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6a0dad" />
        </View>
      ) : (
        notifications.length === 0 ? (
          <View style={styles.noNotificationsContainer}>
            <Text style={styles.noNotificationsText}>
              {selectedTab === 'New' ? 'No new notifications.' : 'No notifications available.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={styles.listContainer}
          />
        )
      )}
    </View>
  );
};

export default Notifications;
