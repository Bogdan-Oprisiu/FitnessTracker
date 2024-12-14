import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import ChangeWeeklyGoal from './change-weekly-goal/change-weekly-goal';
import ChangeUsername from './change-username/change-username';
import ChangePassword from './change-password/change-password';
import DeleteAccount from './delete-account/delete-account';

const SettingsScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <ChangeWeeklyGoal />
      
      <ChangeUsername />
      
      <ChangePassword />
      
      <DeleteAccount />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 35,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    color: '#6a0dad',
    textAlign: 'center'
  },
});

export default SettingsScreen;
