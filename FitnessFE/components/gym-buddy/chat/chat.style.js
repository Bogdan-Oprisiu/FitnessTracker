import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    header: {  
      marginTop: 50,
      backgroundColor: '#000',
    },
    chatText: {
      fontSize: 24,
      color: '#fff',
      textAlign: 'center',
      marginBottom: 5
    },
    infoContainer : {
      flexDirection: 'row',
      marginBottom: 10,
      justifyContent: 'center'
    },
    infoIcon: {
      marginRight: 5,
    },
    infoText: {
      color: '#ccc',
      textAlign: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 18,
      color: '#888',
      textAlign: 'center',
    },    
    chatContainer: {
      padding: 10,
    },
    messageBubble: {
      marginVertical: 5,
      padding: 10,
      borderRadius: 10,
      maxWidth: '80%',
    },
    userBubble: {
      backgroundColor: '#6a0dad',
      alignSelf: 'flex-end',
    },
    aiBubble: {
      backgroundColor: '#555',
      alignSelf: 'flex-start',
    },
    messageText: {
      fontSize: 16,
      color: '#fff',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      marginTop: 10,
      backgroundColor: '#000',
    },
    input: {
      flex: 1,
      color: '#fff',
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginRight: 10,
    },
    sendButton: {
      paddingVertical: 10,
      paddingHorizontal: 10,
    },
});

export default styles;