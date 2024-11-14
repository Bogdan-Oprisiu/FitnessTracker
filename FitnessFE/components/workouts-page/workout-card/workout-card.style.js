import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    card: {
      width: '45%',
      backgroundColor: '#333',
      borderRadius: 10,
      height: 200,
      justifyContent: 'space-around',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    gradientBackground: {
      flex: 1,
      padding: 15,
      height: 100,
      justifyContent: 'space-around',
      borderRadius: 10,
    },
    iconContainer: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
    },
    details: {
      fontSize: 16,
      color: '#e0e0e0',
    },
    starsContainer: {
      flexDirection: 'row',
    },
    star: {
      marginRight: 3,
      marginTop: 3
    },
});

export default styles;