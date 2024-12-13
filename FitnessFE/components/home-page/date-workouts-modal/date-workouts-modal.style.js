import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: '#1a1a1a',
      borderRadius: 10,
      padding: 20,
      width: '95%',
      maxHeight: '90%',
      flex: 1
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#6a0dad',
      textAlign: 'center',
      marginBottom: 20,
    },
    tabViewContainer: {
      flex: 1,
    },
    tabContainer: {
      flex: 1,
      padding: 10,
    },
    workoutCard: {
      backgroundColor: '#333',
      borderRadius: 8,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 2,
    },
    workoutName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ccc',
    },
    workoutDescription: {
      fontSize: 14,
      color: '#777',
      marginTop: 5,
    },
    workoutDetails: {
      fontSize: 12,
      color: '#888',
      marginTop: 5,
    },
    separator: {
      height: 1,
      backgroundColor: '#333',
      marginVertical: 5,
    },
    noWorkoutsText: {
      fontSize: 16,
      color: '#888',
      textAlign: 'center',
      marginTop: 20,
    },
    errorText: {
      fontSize: 16,
      color: 'red',
      textAlign: 'center',
      marginTop: 20,
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: '#6a0dad',
      borderWidth: 1,
      borderRadius: 25,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginTop: 15,
      marginBottom: 10,
    },
    searchIcon: {
      marginRight: 5,
    },
    searchBar: {
      flex: 1,
      height: 40,
      color: '#ccc',
    },
    searchResultsList: {
      maxHeight: 200,
      backgroundColor: '#1a1a1a',
      borderRadius: 8,
      marginBottom: 10,
    },
    friendItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderBottomColor: '#333',
      borderBottomWidth: 1,
    },
    friendImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
      backgroundColor: '#ccc',
    },
    friendItemText: {
      fontSize: 16,
      color: '#ccc',
    },
    selectedFriendContainer: {
      marginTop: 10,
    },
    selectedFriendTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#6a0dad',
      marginBottom: 10,
      textAlign: 'center',
    },
    clearFriendButton: {
      marginTop: 10,
      backgroundColor: '#ff4d4d',
      padding: 10,
      borderRadius: 8,
      alignSelf: 'center',
      width: '100%'
    },
    clearFriendButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    closeButton: {
      marginTop: 10,
      backgroundColor: '#6a0dad',
      padding: 10,
      borderRadius: 8,
      alignSelf: 'center',
      width: '100%'
    },
    closeButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center'
    },
});

export default styles;