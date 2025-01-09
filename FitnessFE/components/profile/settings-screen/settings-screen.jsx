import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import ChangeWeeklyGoal from './change-weekly-goal/change-weekly-goal';
import ChangeUsername from './change-username/change-username';
import ChangePassword from './change-password/change-password';
import DeleteAccount from './delete-account/delete-account';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back to main tabs"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#6a0dad" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

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
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#6a0dad',
    textAlign: 'center',
    flex: 1,
  },
});

export default SettingsScreen;
