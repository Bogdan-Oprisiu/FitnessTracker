import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        paddingTop: 50,
    },
    backgroundOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        resizeMode: 'cover',
    },
    blurView: {
        ...StyleSheet.absoluteFillObject,
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 30,
    },
    title: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerIconButton: {
        position: 'absolute',
        backgroundColor: '#ffffff20',
        marginLeft: 30,
        marginTop: -15,
        padding: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    statsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50
    },
    combinedWidget: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        marginBottom: 20,
    },
    bpmChartContainer: {
        alignItems: 'center',
    },
    bpmContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    bpmTextContainer: {
        alignItems: 'center',
        marginRight: 20,
    },
    bpmLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    bpmValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FF6347',
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
        alignItems: 'center',
    },
    pieChartContainer: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        marginBottom: 20,
    },
    chartTitle: {
        color: '#ccc',
        fontSize: 18,
        marginBottom: 10,
    },
    lineChartContainer: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        marginBottom: 20,
    },
    lineChart: {
        borderRadius: 16,
        paddingBottom: 20,
    },
    noDataText: {
        color: '#A9A9A9',
        fontSize: 16,
        marginTop: 10,
    },
});

export default styles;
