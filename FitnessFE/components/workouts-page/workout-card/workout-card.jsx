import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import styles from './workout-card.style';

export default function WorkoutCard({ name, exercises, difficulty, type, onPress, onLongPress, showIcons, onDelete, onEdit }) {
  const actionBarHeight = useRef(new Animated.Value(0)).current;
  const contentShift = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(actionBarHeight, {
        toValue: showIcons ? 50 : 0,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(contentShift, {
        toValue: name.length > 13 && showIcons ? -50 : name.length <= 13 && showIcons ? -25 : 0,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [showIcons]);

  const renderIcon = () => {
    switch (type) {
      case 'strength':
        return <MaterialIcons name="fitness-center" size={24} color="#fff" />;
      case 'cardio':
        return <FontAwesome name="heartbeat" size={24} color="#fff" />;
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
        <Animated.View style={{ transform: [{ translateY: contentShift }]}}>
          <View style={styles.iconContainer}>{renderIcon()}</View>
          <Text style={styles.cardTitle}>{name}</Text>
          <Text style={styles.cardDetails}>Exercises: {exercises}</Text>
          <View style={styles.starsContainer}>{renderStars()}</View>
        </Animated.View>

        <Animated.View
          style={[
            styles.actionBar,
            {
              height: actionBarHeight,
              opacity: showIcons ? 1 : 0,
            },
          ]}
        >
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <MaterialIcons name="remove-circle" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <MaterialIcons name="edit" size={24} color="yellow" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
