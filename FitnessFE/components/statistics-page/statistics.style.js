import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 20,
    },
    connectButton: {
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    currentBpmWidget: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        width: '90%',
    },
    bpmContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bpmTextContainer: {
        alignItems: 'center',
        marginRight: 50,
    },
    bpmLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff'
    },
    bpmValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6347',
    },
    
    chartWidget: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '90%',
    },
    chartTitle: {
        color: '#A9A9A9',
        fontSize: 16,
        marginBottom: 10,
    },
    chart: {
        borderRadius: 10,
    },
    resetButton: {
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
});

export default styles;
