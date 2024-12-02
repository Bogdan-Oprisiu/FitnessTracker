import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        padding: 20,
    },
    titleContainer: {
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 50,
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 30,
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 10,
    },
    titleInput: {
        fontSize: 30,
        color: '#fff',
        backgroundColor: '#333',
        borderRadius: 5,
        padding: 10,
        textAlign: 'center',
    },
    counter: {
        position: 'absolute',
        bottom: 33,
        right: 15,
        color: '#ccc',
        fontSize: 14,
    },
    inputWrapper: {
        position: 'relative',
        width: '80%',
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#444',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    exerciseText: {
        flex: 2,
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    exerciseSets: {
        flex: 1,
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
    editButton: {
        marginHorizontal: 5,
    },
    removeExerciseButton: {
        marginHorizontal: 5,
    },
    addExerciseButton: {
        backgroundColor: '#6a0dad',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    addExerciseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#6a0dad',
        fontWeight: 'bold',
    },
    dragHandle: {
        marginHorizontal: 8
    },
    reorderHintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    reorderHint: {
        marginTop: 20,
        fontSize: 14,
        fontStyle: 'italic',
        color: '#888',
        textAlign: 'center',
    },
    infoIcon: {
        marginRight: 5,
        marginTop: 20
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#111',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 20,
        color: '#fff'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        marginRight: 10,
        backgroundColor: '#f00',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    doneButton: {
        flex: 1,
        marginLeft: 10,
        backgroundColor: '#6a0dad',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default styles;