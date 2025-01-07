import { StyleSheet } from "react-native";

const circleSize = 300;
const textContainerSize = 200;

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
  activeTime: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
    marginTop: 65,
    right: 10
  },  
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  circleContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, 
  },
  centeredTextContainer: {
    position: 'absolute',
    top: '50%',
    left: '47%',
    transform: [{ translateX: -125 }, { translateY: -125 }],
    width: 200,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  setProgress: {
    fontSize: 20,
    color: '#eee',
    textAlign: 'center',
  },
  nextSetButton: {
    backgroundColor: '#6a0dad',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 40,
    marginTop: 40,
  },
  nextSetButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  descriptionContainer: {
    maxHeight: 250,
    minHeight: 100,
    marginBottom: 30,
    paddingRight: 10,
    paddingLeft: 10,
    marginTop: 50
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
  takeABreakText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -150
  },
  restInstructions: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  restDuration: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  nextUp: {
    fontSize: 30,
    color: '#fff',
    marginTop: 25,
    textAlign: 'center'
  },
  proceedButton: {
    backgroundColor: '#6a0dad',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  setCounter: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
  },
  nextSetButton: {
    backgroundColor: '#6a0dad',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 40,
    marginTop: 20,
  },
  nextSetButtonText: {
    color: '#fff',
    fontSize: 18,
  },  
});
  
export default styles;