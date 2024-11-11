import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import Home from './home-page/home';
import Statistics from './statistics-page/statistics';
import Workouts from './workouts-page/workouts';
import Profile from './profile/profile';

const Tab = createMaterialTopTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Statistics') {
            iconName = 'chart-bar';
          } else if (route.name === 'Workouts') {
            iconName = 'dumbbell';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }
          return <MaterialCommunityIcons name={iconName} color={color} size={24} />;
        },
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#6a0dad',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: { backgroundColor: '#6a0dad' },
        tabBarStyle: {
            backgroundColor: '#000',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Statistics" component={Statistics} />
      <Tab.Screen name="Workouts" component={Workouts} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
