import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
      padding: 10,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000'
    },
    loadingText: {
      marginTop: 20,
      fontSize: 16,
      color: '#6a0dad',
      fontWeight: 'bold',
    },
    title: {
      color: '#fff',
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      marginTop: 50
    },
    exerciseCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
    },
    exerciseInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    exerciseName: {
        color: '#fff',
        fontSize: 16,
        flexWrap: 'wrap',
        maxWidth: '90%',
        paddingRight: 10
    },
    addButton: {
        backgroundColor: '#6a0dad',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 10,
    },
    disabledButton: {
        backgroundColor: '#555',
    },      
    addButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    selectCircle: {
        marginRight: 10,
    },
    multipleSelectionCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    doneButton: {
        backgroundColor: '#6a0dad',
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 10,
        borderRadius: 5,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    videoLink: {
        color: '#6a0dad',
        textDecorationLine: 'underline',
        fontSize: 16,
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: '#6a0dad',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },   
    setModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    setsModalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'space-between',
        gap: 5
    },
    setModalContent: {
        width: '80%',
        backgroundColor: '#111',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    setModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#fff',
        textAlign: 'center',
    },
    setInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    confirmButton: {
        backgroundColor: '#6a0dad',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
        width: '50%',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
        width: '50%',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },  
    infoTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    infoText: {
        marginTop: 20,
        fontSize: 14,
        fontStyle: 'italic',
        color: '#888',
        textAlign: 'center',
    },
    infoIcon: {
        marginRight: 5,
        marginTop: 20
    }
});

export default styles;