import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    weekContainer: {
      backgroundColor: '#1a1a1a',
      borderRadius: 15,
      width: '90%',
      padding: 10,
      marginVertical: 20,
      alignSelf: 'center',
      height: 80
    },
    dayContainer: {
      alignItems: 'center',
      marginHorizontal: 9,
    },
    dayText: {
      color: '#fff',
      fontSize: 16,
      marginBottom: 5,
      fontWeight: '600',
    },
    circle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#6a0dad',
      justifyContent: 'center',
      alignItems: 'center',
    },
    completedCircle: {
      backgroundColor: '#6a0dad',
    },
});

export default styles;