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
    paddingTop: 75,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6a0dad',
    marginTop: 20,
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
  goalText: {
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
});
