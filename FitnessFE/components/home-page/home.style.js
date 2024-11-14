import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  progressContainer: {
    alignItems: 'center',
    paddingTop: 25,
  },
  progressText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#6a0dad',
    marginTop: 20,
    fontWeight: '800'
  },
  button: {
    backgroundColor: '#6a0dad',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linearProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  progressDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
    marginTop: 50,
    paddingRight: 20,
    paddingLeft: 20
  },
  weeklyStats: {
    fontSize: 48,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  goalText: {
    fontSize: 18,
    color: '#fff',
    marginRight: 10,
    color: '#6a0dad',
    fontWeight: 'bold'
  },
  goalNumbers: {
    fontSize: 18,
    color: '#fff',
    marginRight: 10,
  },
  linearProgressBar: {
    flex: 1,
    marginHorizontal: 15,
  },
  calendarIcon: {
    marginLeft: 15,
  },
  extraContent: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  extraText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  weekProgressContainer: {
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    padding: 15,
    marginVertical: 20,
    alignSelf: 'center',
  },
  weekList: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  dayText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#808080',
    backgroundColor: 'transparent',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 800,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  calendarContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '90%',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#6a0dad',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },  
  widgetsContainer: {
    flex: 1,
    flexWrap: 'wrap',
    gap: 10,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },  
});