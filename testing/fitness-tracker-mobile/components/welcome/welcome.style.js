import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeContainer: {
        marginTop: 150,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    appName: {
        fontSize: 42,
        color: '#FFFFE0',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
    },
    sloganWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    sloganContainer: {
        alignItems: 'center',
    },
    ctaMessage: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
    },
    actionButtonContainer: {
        marginBottom: 40,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: '#6a0dad',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default styles;
