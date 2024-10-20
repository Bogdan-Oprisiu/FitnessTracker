import React, { useState } from 'react';
import './App.css';

function App() {
    const [heartRate, setHeartRate] = useState(null);
    const [distance, setDistance] = useState(null);  // For tracking distance
    const [pace, setPace] = useState(null);          // For tracking pace

    // Function to connect to Polar Verity Sense sensor
    const connectToSensor = async () => {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service', 'cycling_speed_and_cadence'] // Optional services for distance and pace
            });
            const server = await device.gatt.connect();
            const heartRateService = await server.getPrimaryService('heart_rate');
            const heartRateCharacteristic = await heartRateService.getCharacteristic('heart_rate_measurement');

            // Listen to changes in heart rate data
            heartRateCharacteristic.startNotifications();
            heartRateCharacteristic.addEventListener('characteristicvaluechanged', handleHeartRateChanged);

            // Optionally, get data from other services/characteristics (if applicable)
            // Example: Cycling speed/cadence service for distance and pace
            const speedService = await server.getPrimaryService('cycling_speed_and_cadence');
            const speedCharacteristic = await speedService.getCharacteristic('csc_measurement');

            speedCharacteristic.startNotifications();
            speedCharacteristic.addEventListener('characteristicvaluechanged', handleSpeedChanged);
        } catch (error) {
            console.error('Error connecting to sensor:', error);
        }
    };

    // Function to handle heart rate data
    const handleHeartRateChanged = (event) => {
        const value = event.target.value;
        const heartRateValue = value.getUint8(1);
        setHeartRate(heartRateValue);
    };

    // Function to handle speed and distance data (cycling speed and cadence characteristic)
    const handleSpeedChanged = (event) => {
        const value = event.target.value;
        const speed = value.getUint16(1, true); // Speed in some units (adjust for your needs)
        const distanceValue = value.getUint32(3, true); // Distance covered (adjust based on service)
        const paceValue = calculatePace(speed); // Calculate pace based on speed

        setDistance(distanceValue);  // Set the distance
        setPace(paceValue);          // Set the pace
    };

    // Simple function to calculate pace from speed (this is just an example calculation)
    const calculatePace = (speed) => {
        if (!speed) return null;
        return (60 / speed).toFixed(2);  // Convert speed to pace (in minutes per km, assuming speed in km/h)
    };

    return (
        <div className="App">
            <h1>Polar Sensor App</h1>
            <button onClick={connectToSensor}>Connect to Polar Sensor</button>
            {heartRate && <p>Heart Rate: {heartRate} bpm</p>}
            {distance && <p>Distance: {distance} meters</p>}
            {pace && <p>Pace: {pace} min/km</p>}
        </div>
    );
}

export default App;
