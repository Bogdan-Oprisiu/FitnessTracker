import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
      padding: 10,
    },
    exerciseCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#333',
      padding: 15,
      marginBottom: 10,
      borderRadius: 5,
    },
    exerciseName: {
      color: '#fff',
      fontSize: 16,
    },
    addButton: {
      backgroundColor: '#6a0dad',
      paddingVertical: 5,
      paddingHorizontal: 15,
      borderRadius: 5,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 14,
    },
});

export default styles;