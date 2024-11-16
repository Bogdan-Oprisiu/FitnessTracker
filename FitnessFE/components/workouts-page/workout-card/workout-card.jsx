import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import styles from './workout-card.style';

export default function WorkoutCard({ name, exercises, duration, difficulty, type, onPress, onLongPress, showIcons, onDelete, onEdit }) {
  const renderIcon = () => {
    switch (type) {
      case 'strength':
        return <MaterialIcons name="fitness-center" size={24} color="#fff" />;
      case 'cardio':
        return <MaterialIcons name="directions-run" size={24} color="#fff" />;
      case 'stretching':
        return <MaterialIcons name="self-improvement" size={24} color="#fff" />;
      default:
        return null;
    }
  };

  const renderStars = () => {
    let starCount = 0;
    if (difficulty === 'Beginner') starCount = 1;
    else if (difficulty === 'Intermediate') starCount = 2;
    else if (difficulty === 'Advanced') starCount = 3;

    return (
      <View style={styles.starsContainer}>
        <Text style={styles.cardDetails}>Difficulty: </Text>
        {Array(starCount)
          .fill()
          .map((_, index) => (
            <FontAwesome key={index} name="star" size={16} color="#FFD700" style={styles.star} />
          ))}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#6a0dad', '#8e2de2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.iconContainer}>{renderIcon()}</View>
        {showIcons && (
          <View style={styles.iconsOverlay}>
            <TouchableOpacity onPress={onDelete} style={styles.icon}>
              <MaterialIcons name="remove-circle" size={24} color="red" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onEdit} style={styles.icon}>
              <MaterialIcons name="edit" size={24} color="yellow" />
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.cardDetails}>Exercises: {exercises}</Text>
        <Text style={styles.cardDetails}>Duration: {duration} mins</Text>

        <View style={styles.starsContainer}>
          {renderStars()}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
