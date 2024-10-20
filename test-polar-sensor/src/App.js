import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';

function App() {
    const [heartRate, setHeartRate] = useState(null);
    const [heartRateData, setHeartRateData] = useState([]); // Stores last 5 minutes of heart rate
    const [labels, setLabels] = useState([]); // Labels for the chart (time intervals)

    // Function to connect to Polar Verity Sense sensor
    const connectToSensor = async () => {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service']
            });
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService('heart_rate');
            const characteristic = await service.getCharacteristic('heart_rate_measurement');

            // Listen to changes in heart rate data
            characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', handleHeartRateChanged);
        } catch (error) {
            console.error('Error connecting to sensor:', error);
        }
    };

    // Function to handle heart rate data
    const handleHeartRateChanged = (event) => {
        const value = event.target.value;
        const heartRateValue = value.getUint8(1);
        setHeartRate(heartRateValue);
        updateHeartRateData(heartRateValue);
    };

    // Update the heart rate data for the last 5 minutes (in 30-second intervals)
    const updateHeartRateData = (newHeartRate) => {
        setHeartRateData((prevData) => {
            const newData = [...prevData, newHeartRate];
            if (newData.length > 10) {
                newData.shift(); // Keep only the last 10 entries (5 minutes with 30s intervals)
            }
            return newData;
        });

        // Update the labels (e.g., show the time intervals for the last 5 minutes)
        setLabels((prevLabels) => {
            const newLabels = [...prevLabels, new Date().toLocaleTimeString()];
            if (newLabels.length > 10) {
                newLabels.shift();
            }
            return newLabels;
        });
    };

    // Chart configuration for heart rate
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Heart Rate (bpm)',
                data: heartRateData,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
            },
        ],
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                min: 40, // Assuming heart rate won't go below 40 bpm
                max: 200, // Assuming a maximum heart rate
            },
            x: {
                title: {
                    display: true,
                    text: 'Time (last 5 minutes)',
                },
            },
        },
    };

    return (
        <div className="App">
            <h1>Polar Sensor App</h1>
            <button onClick={connectToSensor}>Connect to Polar Sensor</button>
            {heartRate && <p>Current Heart Rate: {heartRate} bpm</p>}
            
            <h2>Heart Rate over the last 5 minutes</h2>
            <Line data={data} options={options} />
        </div>
    );
}

export default App;
