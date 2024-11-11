import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyProgress({ onPress }) {
  const [completedWorkouts, setCompletedWorkouts] = useState(['Mon', 'Thu', 'Sun']);

  const renderDayItem = ({ item }) => {
    const isCompleted = completedWorkouts.includes(item);
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

const styles = StyleSheet.create({
  weekContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    width: '90%',
    padding: 10,
    marginVertical: 20,
    alignSelf: 'center',
    height: 80
  },
  dayContainer: {
    alignItems: 'center',
    marginHorizontal: 9,
  },
  dayText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6a0dad',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCircle: {
    backgroundColor: '#6a0dad',
  },
});
