import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { doc, getDoc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { handleActivityTracker } from '../../logActivityAndNotifications';
import { db, auth } from '../../../config/firebase-config';

const ChangeUsername = () => {
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentUsername = async () => {
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
          setCurrentUsername(data.username || '');
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        Alert.alert('Error', 'Failed to fetch current username.');
      }
    };

    fetchCurrentUsername();
  }, []);

  const handleChangeUsername = async () => {
    const trimmedUsername = newUsername.trim();

    if (trimmedUsername.length < 3) {
      Alert.alert('Invalid Input', 'Username must be at least 3 characters long.');
      return;
    }

    setLoading(true);

    try {
      const usernamesRef = collection(db, 'users');
      const q = query(usernamesRef, where('username', '==', trimmedUsername));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert('Username Taken', 'This username is already in use. Please choose another one.');
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { username: trimmedUsername });
      await updateDoc(userDocRef, { username_lowercase: trimmedUsername.toLowerCase() })

      setCurrentUsername(trimmedUsername);
      setNewUsername('');
      Alert.alert('Success', 'Username updated successfully.');

      handleActivityTracker(`Changed your username to ${newUsername}`)
    } catch (error) {
      console.error('Error updating username:', error);
      Alert.alert('Error', 'Failed to update username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Change Username</Text>
      <Text style={styles.label}>Current Username:</Text>
      <Text style={styles.currentUsername}>{currentUsername}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new username"
        placeholderTextColor="#ccc"
        value={newUsername}
        onChangeText={setNewUsername}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.updateButton} onPress={handleChangeUsername} disabled={loading}>
            {loading ? (
                <Text style={styles.buttonState}>Updating...</Text>
            ) : (
                <Text style={styles.buttonState}>Update Username</Text>
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
  label: {
    fontSize: 14,
    color: '#ccc',
  },
  currentUsername: {
    fontSize: 16,
    marginBottom: 10,
    color: '#aaa',
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

export default ChangeUsername;
