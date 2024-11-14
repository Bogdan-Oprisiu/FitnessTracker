import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function StartWorkout({ route, navigation }) {
  const { workout } = route.params; // Get workout data from navigation parameters

  const handleStartWorkout = () => {
    console.log('Starting workout:', workout.name);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {/* Display the workout image */}
        <Image
          source={{ uri: workout.image || 'https://example.com/default-image.jpg' }} // Fallback image if none is provided
          style={styles.workoutImage}
        />
        <LinearGradient
          colors={['transparent', 'black']}
          style={styles.imageGradient}
        />
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageContainer: {
    flex: 2,
    position: 'relative',
  },
  workoutImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
