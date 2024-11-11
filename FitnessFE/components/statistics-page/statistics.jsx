import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useHeartRate } from '../heart-rate-provider';
import styles from './statistics.style';
import AnimatedHeart from '../animated-components/heart-animation';

export default function Statistics() {
    const { heartRate, heartRateData, labels, connectToSensor, disconnectFromSensor } = useHeartRate();
    const sanitizedHeartRateData = heartRateData.map((value) => 
        typeof value === 'number' && isFinite(value) ? value : 0
    );
    

    return (
        <LinearGradient
            colors={['#ffffff', '#000000']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Heart Rate Statistics</Text>
            </View>

            {heartRate === 0 && (
                <TouchableOpacity style={styles.connectButton} onPress={connectToSensor}>
                    <Text style={styles.buttonText}>Connect to Sensor</Text>
                </TouchableOpacity>
            )}
            
            {heartRate !== 0 && (
                <TouchableOpacity style={styles.connectButton} onPress={disconnectFromSensor}>
                    <Text style={styles.buttonText}>Disconnect from Sensor</Text>
                </TouchableOpacity>
            )}

            <View style={styles.currentBpmWidget}>
                <View style={styles.bpmContainer}>
                    <View style={styles.bpmTextContainer}>
                        <Text style={styles.bpmLabel}>Current BPM</Text>
                        <Text style={styles.bpmValue}>
                            {heartRate !== null && heartRate > 0 && heartRate < 300 ? `${heartRate} bpm` : `-- bpm`}
                        </Text>

                    </View>
                    <AnimatedHeart />
                </View>
            </View>

            <View style={styles.chartWidget}>
                <Text style={styles.chartTitle}>Heart Rate Updated Per Second</Text>
                <LineChart
                    data={{
                        labels: [],
                        datasets: [{ data: sanitizedHeartRateData }],
                    }}
                    width={300}
                    height={250}
                    chartConfig={{
                        backgroundGradientFrom: '#1E2923',
                        backgroundGradientTo: '#08130D',
                        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    }}
                    bezier
                    style={styles.chart}
                />
            </View>
        </LinearGradient>
    );
}
