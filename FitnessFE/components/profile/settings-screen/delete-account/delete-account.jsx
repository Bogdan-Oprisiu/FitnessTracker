import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../../config/firebase-config';
import { deleteDoc, doc, collection, query, where, getDocs, writeBatch, increment } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import Toast from 'react-native-toast-message';

const DeleteAccount = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => performDeleteAccount() 
        },
      ]
    );
  };

  const performDeleteAccount = async () => {
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        setLoading(false);
        return;
      }

      const userId = user.uid;

      const friendshipCollection = 'friendships';

      const usersCollection = 'users';

      const q1 = query(
        collection(db, friendshipCollection),
        where('user1', '==', userId)
      );

      const q2 = query(
        collection(db, friendshipCollection),
        where('user2', '==', userId)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);

      const allFriendships = [...snapshot1.docs, ...snapshot2.docs];

      if (allFriendships.length > 0) {
        const batch = writeBatch(db);

        const otherUserIds = [];

        allFriendships.forEach(docSnap => {
          const data = docSnap.data();
          const friendId = data.user1 === userId ? data.user2 : data.user1;
          otherUserIds.push(friendId);
          batch.delete(doc(db, friendshipCollection, docSnap.id));
        });

        const uniqueFriendIds = [...new Set(otherUserIds)];

        uniqueFriendIds.forEach(friendId => {
          const friendDocRef = doc(db, usersCollection, friendId);
          batch.update(friendDocRef, {
            friendsCount: increment(-1)
          });
        });

        await batch.commit();
      }

      const subcollectionsToDelete = ['completed_workouts', 'friends', 'notifications', 'recentActivities', 'personalized_workouts'];

      for (const subcollection of subcollectionsToDelete) {
        await deleteSubcollection(userId, subcollection);
      }

      const userDocRef = doc(db, 'users', userId);
      await deleteDoc(userDocRef);

      await deleteUser(user);

      Toast.show({
        type: 'success',
        text1: 'Account Deleted',
        text2: 'Your account has been deleted successfully.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });

      navigation.replace('Welcome');

    } catch (error) {
      console.error('Error deleting account:', error);
      let message = 'Failed to delete account.';
      
      if (error.code === 'auth/requires-recent-login') {
        message = 'Please re-authenticate and try again.';
      }

      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubcollection = async (userId, subcollectionName) => {
    const subcollectionRef = collection(db, 'users', userId, subcollectionName);
    const q = query(subcollectionRef);

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`No documents found in subcollection: ${subcollectionName}`);
      return;
    }

    const batch = writeBatch(db);

    snapshot.docs.forEach(docSnap => {
      batch.delete(doc(db, 'users', userId, subcollectionName, docSnap.id));
    });

    await batch.commit();

    console.log(`Deleted ${snapshot.size} documents from subcollection: ${subcollectionName}`);
  };


  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Danger Zone</Text>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={handleDeleteAccount} 
        disabled={loading}
      >
        {loading ? (
          <Text style={styles.buttonState}>Deleting...</Text>
        ) : (
          <Text style={styles.buttonState}>Delete Account</Text>
        )}
      </TouchableOpacity>
      <Toast />
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
    color: '#ff4d4d'
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
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

export default DeleteAccount;
