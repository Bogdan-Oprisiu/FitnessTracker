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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    textAndIconContainer: {
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
        paddingTop: 100
    },
    timeframeContainer: {
        backgroundColor: '#1E1E1E',
        paddingVertical: 20,
        paddingHorizontal: 20,
        width: '100%',
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
        zIndex: 10
      },
      timeframeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#6a0dad',
        borderRadius: 20,
        marginHorizontal: 5,
      },
      timeframeButtonSelected: {
        backgroundColor: '#1E90FF',
      },
      timeframeButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
      },
      timeframeButtonTextSelected: {
        fontWeight: 'bold',
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
        width: '100%',
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 10,
        marginBottom: 20,
    },
    lineChart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    chartTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
    },
    noDataText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#C2C2C',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        left: 40,
        top: 60
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDate: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 5,
    },
    modalValue: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default styles;
