import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
      padding: 10,
    },
    muscleGroupCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    muscleGroupText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
  
export default styles;