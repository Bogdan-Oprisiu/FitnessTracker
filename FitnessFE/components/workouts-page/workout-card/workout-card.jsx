import React from 'react';
import { View, Text, StyleSheet, Touchable, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import styles from './workout-card.style';

export default function WorkoutCard({ name, exercises, duration, difficulty, type, onPress }) {

  const renderIcon = () => {
    if (type === 'strength') {
      return <FontAwesome5 name="dumbbell" size={18} color="#fff" />;
    } else if (type === 'cardio') {
      return <FontAwesome name="heartbeat" size={18} color="#fff" />;
    } else if (type === 'stretching') {
      return <MaterialIcons name="self-improvement" size={20} color="#fff" />;
    }
    return null;
  };

  const renderStars = () => {
    let starCount = 0;
    if (difficulty === 'Beginner') starCount = 1;
    else if (difficulty === 'Intermediate') starCount = 2;
    else if (difficulty === 'Advanced') starCount = 3;

    return (
      <View style={styles.starsContainer}>
        <Text style={styles.details}>Difficulty: </Text>
        {Array(starCount)
          .fill()
          .map((_, index) => (
            <FontAwesome key={index} name="star" size={16} color="#FFD700" style={styles.star} />
          ))}
      </View>
    );
  };


  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <LinearGradient
          colors={['#6a0dad', '#8e2de2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.iconContainer}>
            {renderIcon()}
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.details}>Exercises: {exercises}</Text>
          <Text style={styles.details}>Duration: {duration} mins</Text>

          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
        </LinearGradient>
    </TouchableOpacity>
  );
}
