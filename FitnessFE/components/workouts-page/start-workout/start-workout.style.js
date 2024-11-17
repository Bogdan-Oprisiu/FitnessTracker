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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  exerciseDuration: {
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
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ccc',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 15,
    textAlign: 'justify',
  },
  modalDuration: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
    marginBottom: 20,
  },
  videoLinkButton: {
    backgroundColor: '#6a0dad',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  videoLinkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#f44336',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;

