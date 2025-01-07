import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../config/firebase-config';
import Toast from 'react-native-toast-message';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoadingNotifications(false);
      return;
    }

    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = [];
      snapshot.forEach((doc) => {
        fetchedNotifications.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(fetchedNotifications);
      setLoadingNotifications(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not fetch notifications. Please try again.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
      setLoadingNotifications(false);
    });

    return () => unsubscribe();
  }, []);

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
        text2: 'Could not mark notifications as read. Please try again.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };

  return { notifications, loadingNotifications, markNotificationsAsRead };
};

export default useNotifications;
