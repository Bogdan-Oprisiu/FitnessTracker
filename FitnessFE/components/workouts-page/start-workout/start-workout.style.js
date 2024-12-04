import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'black',
    position: 'relative'
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
    paddingRight: 5
  },
  workoutDescription: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
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
    textAlign: 'center',
  },
  pulseContainer: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeText: {
    color: '#6a0dad',
    fontSize: 14,
    fontWeight: '600',
  },
  exercisesContainer: {
    paddingHorizontal: 20,
    marginTop: -250,
  },
  exercisesScrollView: {
    maxHeight: 600,
  },
  exerciseCard: {
    flexDirection: 'column',
    backgroundColor: '#444',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  exerciseSets: {
    fontSize: 14,
    color: '#ccc',
  },
  editModeDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  startWorkoutContainerScrolled: {
    alignItems: 'center',
  },
  startWorkoutButton: {
    backgroundColor: '#6a0dad',
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
  },
  startWorkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dropdownContent: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#666',
  },
  descriptionWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#666',
  },
  descriptionScrollView: {
    flex: 1, 
    marginBottom: 10,
    maxHeight: 160,
  },
  descriptionContent: {
    paddingBottom: 10,
    paddingLeft: 7,
    paddingRight: 7
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#aaa',
    lineHeight: 22,
    textAlign: 'justify',
  },
  fixedButtonContainer: {
    justifyContent: 'flex-end',
  },
  videoLinkButton: {
    backgroundColor: '#6a0dad',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  videoLinkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startArrow: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 50,
  },  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6a0dad',
    fontWeight: 'bold',
  },
  reorderButton: {
    backgroundColor: '#6a0dad',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  reorderButtonText: {
    color: '#fff', 
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'flex-start',
  },
});

export default styles;
