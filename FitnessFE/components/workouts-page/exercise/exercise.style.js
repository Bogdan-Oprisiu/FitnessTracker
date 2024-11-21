import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  exerciseCounter: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    position: 'absolute',
    top: 60,
    left: 20,
  },
  heartRateDisplay: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row'
  },
  heartRateText: {
    fontSize: 30,
    color: '#fff',
    marginRight: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  exerciseName: {
    fontSize: 52,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
  },
  descriptionContainer: {
    maxHeight: 300,
    minHeight: 100,
    marginBottom: 30,
    paddingRight: 10,
    paddingLeft: 10
  },
  exerciseDescription: {
    fontSize: 20,
    color: '#ccc',
    lineHeight: 25,
    textAlign: 'justify',
    marginBottom: 20,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  videoLinkButton: {
    backgroundColor: '#6a0dad',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  videoLinkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrowButtonLeft: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButtonRight: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
  
export default styles;