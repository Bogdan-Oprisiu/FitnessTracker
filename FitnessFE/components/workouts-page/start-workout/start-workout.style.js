import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'black',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 600,
  },
  workoutImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  workoutName: {
    fontSize: 50,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#6a0dad',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  pulseContainer: {
    alignItems: 'center',
    marginTop: 75,
  },
  swipeText: {
    color: '#6a0dad',
    fontSize: 14,
    fontWeight: '600',
  },
  exercisesContainer: {
    paddingHorizontal: 20,
    marginTop: -250,
    paddingBottom: 40,
  },
  exercisesScrollView: {
    maxHeight: 600,
  },
  exerciseCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
  },
  exerciseText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#ccc',
  },
  startWorkoutContainerScrolled: {
    alignItems: 'center',
    marginTop: 30,
  },
  startWorkoutButton: {
    backgroundColor: '#6a0dad',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width:'100%',
  },
  startWorkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
});

export default styles;

