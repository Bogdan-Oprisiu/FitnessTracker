import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { handleActivityTracker } from '../../logActivityAndNotifications';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase-config';

const ChangeWeeklyGoal = () => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentGoal = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'User not authenticated.');
          return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          setGoal(data.weeklyGoal ? data.weeklyGoal.toString() : '');
        }
      } catch (error) {
        console.error('Error fetching weekly goal:', error);
        Alert.alert('Error', 'Failed to fetch current weekly goal.');
      }
    };

    fetchCurrentGoal();
  }, []);

  const handleUpdateGoal = async () => {
    const goalNumber = parseInt(goal, 10);

    if (isNaN(goalNumber) || goalNumber < 1 || goalNumber > 30) {
      Alert.alert('Invalid Input', 'Please enter a number between 1 and 30.');
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { weeklyGoal: goalNumber });

      Alert.alert('Success', 'Weekly goal updated successfully.');

      handleActivityTracker(`Updated your weekly goal to ${goal} workouts/week`);
    } catch (error) {
      console.error('Error updating weekly goal:', error);
      Alert.alert('Error', 'Failed to update weekly goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Change Weekly Workout Goal</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter weekly goal (1-30)"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        value={goal}
        onChangeText={setGoal}
        maxLength={2}
      />
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateGoal} disabled={loading}>
            {loading ? (
                <Text style={styles.buttonState}>Updating...</Text>
            ) : (
                <Text style={styles.buttonState}>Update Weekly Goal</Text>
            )}
      </TouchableOpacity>    
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#eee'
  },
  input: {
    borderWidth: 1,
    borderColor: '#6a0dad',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#fff'
  },
  updateButton: {
    backgroundColor: '#6a0dad',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5
  },
  buttonState: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default ChangeWeeklyGoal;
