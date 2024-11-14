import { StyleSheet } from "react-native";

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
    },
    bottomSection: {
      flex: 1,
      backgroundColor: 'black',
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    workoutName: {
      fontSize: 50,
      color: '#fff',
      fontWeight: 'bold',
      marginBottom: 50,
      marginTop: -150
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
    },
    pulseContainer: {
      position: 'absolute',
      bottom: 5,
      alignItems: 'center',
      alignSelf: 'center',
    },
    swipeText: {
      color: '#6a0dad',
      fontSize: 12,
      fontWeight: '600',
    },
  });

  export default styles;