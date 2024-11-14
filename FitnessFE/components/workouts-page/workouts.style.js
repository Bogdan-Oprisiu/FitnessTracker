import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  addWorkoutButton: {
    backgroundColor: '#6a0dad',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '95%'
  },
  addWorkoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  yourWorkoutsText: {
    position: 'absolute',
    top: 80,                             
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
});

export default styles;
