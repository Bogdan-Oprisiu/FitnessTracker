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
    welcomeBackContainer: {
        marginTop: 150,
        alignItems: 'center',
        gap: 10
    },
    welcomeBackText: {
        fontSize: 40,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    continueWithText: {
        fontSize: 20,
        color: '#777'
    },
    inputContainer: {
        marginTop: 30,
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
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
        width: '80%',
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#777'
      },
    orText: {
        marginHorizontal: 10,
        color: '#777',
        fontSize: 20
    },
    socialsContainer: { 
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 25,
        marginBottom: 15,
        width: '80%',
        justifyContent: 'center',
    },
    socialIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    socialText: {
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        backgroundColor: "#6a0dad",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 50,
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
        gap: 20
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
