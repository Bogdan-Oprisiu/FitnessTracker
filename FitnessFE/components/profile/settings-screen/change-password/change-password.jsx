import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../../../config/firebase-config';
import { handleActivityTracker } from '../../logActivityAndNotifications';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        Alert.alert('Error', 'User not authenticated.');
        setLoading(false);
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Alert.alert('Success', 'Password updated successfully.');

      handleActivityTracker('You updated your password');
    } catch (error) {
      console.error('Error changing password:', error);
      let message = 'Failed to update password.';
      if (error.code === 'auth/wrong-password') {
        message = 'Current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        message = 'New password is too weak.';
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Change Password</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Current Password"
        placeholderTextColor="#ccc"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="New Password"
        placeholderTextColor="#ccc"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        placeholderTextColor="#ccc"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      
      <TouchableOpacity style={styles.updateButton} onPress={handleChangePassword} disabled={loading}>
            {loading ? (
                <Text style={styles.buttonState}>Updating...</Text>
            ) : (
                <Text style={styles.buttonState}>Update Password</Text>
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

export default ChangePassword;
