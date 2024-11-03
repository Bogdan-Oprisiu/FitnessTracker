import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    profilePictureContainer: {
        position: 'relative',
        top: 125,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    profilePicture: {
        width: 170,
        height: 170,
        borderRadius: 85,
        borderColor: 'black',
        borderWidth: 3,
    },
    editButton: {
        position: 'absolute',
        right: 5,
        bottom: 5,
        backgroundColor: 'rgba(0, 0, 0, 1)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        marginTop: 175,
        width: "80%",
        gap: 5
    },
    input: {
        padding: 15,
        borderRadius: 25,
        marginBottom: 15,
        borderColor: "#555",
        backgroundColor: '#555',
        borderWidth: 1,
        color: "white",
    },
    submitButton: {
        backgroundColor: "#6a0dad",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 40,
        width: '80%',
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    footerContainer: {
        marginTop: 40,
        alignItems: "center",
    },
    footerText: {
        color: "white",
        fontSize: 16,
    },
    linkText: {
        color: "#6a0dad",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
});

export default styles;
