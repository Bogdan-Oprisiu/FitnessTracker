import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import Chat from './chat'; 
import Generator from './workout-generator';

const Tab = createMaterialTopTabNavigator();

export default function GymBuddyTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Chat"
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName;
          if (route.name === 'Chat') {
            iconName = 'chat';
          } else if (route.name === 'Generator') {
            iconName = 'dumbbell';
          }
          return <MaterialCommunityIcons name={iconName} color={color} size={24} />;
        },
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#6a0dad',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: { backgroundColor: '#6a0dad' },
        tabBarStyle: styles.tabBar,
      })}
    >
      <Tab.Screen name="Chat" component={Chat} />
      <Tab.Screen name="Generator" component={Generator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#000',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
});
