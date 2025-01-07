import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './weekly-progress.style';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyProgress({ onPress, completedDays }) {
  const renderDayItem = ({ item }) => {
    const isCompleted = completedDays.includes(item);
    return (
      <View style={styles.dayContainer}>
        <Text style={styles.dayText}>{item}</Text>
        <View style={[styles.circle, isCompleted && styles.completedCircle]}>
          {isCompleted && <MaterialIcons name="check" size={20} color="#fff" />}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.weekContainer}>
      <TouchableOpacity onPress={onPress}>
        <FlatList
          data={daysOfWeek}
          renderItem={renderDayItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </TouchableOpacity>
    </View>
  );
}
