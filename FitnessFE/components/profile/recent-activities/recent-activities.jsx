import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebase-config';
import styles from './recent-activities.style';

const RecentActivities = () => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const recentActivitiesRef = collection(db, 'users', currentUser.uid, 'recentActivities');
    const q = query(recentActivitiesRef, orderBy('timestamp', 'desc'), limit(5));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activities = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        activities.push({
          id: docSnap.id,
          action: data.action,
          targetUserId: data.targetUserId,
          targetUsername: data.targetUsername,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        });
      });
      setRecentActivities(activities);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching recent activities:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.activityItem}>
      <Text style={styles.actionText}>{item.action}</Text>
      <Text style={styles.timestampText}>{item.timestamp.toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a0dad" />
      </View>
    );
  }

  if (recentActivities.length === 0) {
    return (
      <View style={styles.noActivitiesContainer}>
        <Text style={styles.noActivitiesText}>No recent activities.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recentActivities}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />
  );
};

export default RecentActivities;
