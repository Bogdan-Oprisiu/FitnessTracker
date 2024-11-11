import React, { createContext, useContext, useState, useEffect } from 'react';
import { BleManager } from 'react-native-ble-plx';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';

const HeartRateContext = createContext();
const bleManager = new BleManager(); // singleton instance of BleManager

export const useHeartRate = () => useContext(HeartRateContext);

export const HeartRateProvider = ({ children }) => {
    const [heartRate, setHeartRate] = useState(0);
    const [heartRateData, setHeartRateData] = useState(Array(10).fill(0));
    const [labels, setLabels] = useState(Array(10).fill(''));
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [heartRateCharacteristic, setHeartRateCharacteristic] = useState(null);

    useEffect(() => {
        return () => {
            disconnectFromSensor();
            bleManager.stopDeviceScan();
        };
    }, []);

    const requestBluetoothPermissions = async () => {
        if (Platform.OS === 'android') {
            const locationPermission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            const bluetoothScan = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
            const bluetoothConnect = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);

            return (
                locationPermission === RESULTS.GRANTED &&
                bluetoothScan === RESULTS.GRANTED &&
                bluetoothConnect === RESULTS.GRANTED
            );
        }
        return true;
    };

    const connectToSensor = async (retryCount = 3) => {
        if (connectedDevice) {
            console.warn("Device is already connected.");
            return;
        }

        const hasPermissions = await requestBluetoothPermissions();
        if (!hasPermissions) {
            console.error('Permissions denied');
            return;
        }

        try {
            bleManager.stopDeviceScan();
            console.log("Starting device scan...");

            bleManager.startDeviceScan(
                null,
                { allowDuplicates: false },
                async (error, scannedDevice) => {
                    if (error) {
                        console.error("Error scanning for devices:", error);
                        return;
                    }

                    if (scannedDevice && scannedDevice.name === 'Polar Sense B2245D2F') {
                        console.log("Device found:", scannedDevice.name);
                        bleManager.stopDeviceScan();

                        try {
                            const device = await scannedDevice.connect();
                            setConnectedDevice(device);
                            console.log("Device connected successfully.");

                            await device.discoverAllServicesAndCharacteristics();

                            const services = await device.services();
                            const heartRateService = services.find(
                                (service) => service.uuid === '0000180d-0000-1000-8000-00805f9b34fb'
                            );

                            if (heartRateService) {
                                const characteristics = await heartRateService.characteristics();
                                const characteristic = characteristics.find(
                                    (characteristic) =>
                                        characteristic.uuid === '00002a37-0000-1000-8000-00805f9b34fb'
                                );

                                if (characteristic) {
                                    setHeartRateCharacteristic(characteristic);
                                    characteristic.monitor((error, monitoredCharacteristic) => {
                                        if (error) {
                                            console.error('Error monitoring characteristic:', error);
                                            return;
                                        }
                                        handleHeartRateChanged(monitoredCharacteristic);
                                    });
                                } else {
                                    throw new Error('Heart rate characteristic not found');
                                }
                            } else {
                                throw new Error('Heart rate service not found');
                            }
                        } catch (connectionError) {
                            console.error('Error connecting to sensor:', connectionError);
                            setConnectedDevice(null);

                            if (retryCount > 0) {
                                console.warn(`Retrying connection... Attempts left: ${retryCount}`);
                                setTimeout(() => connectToSensor(retryCount - 1), 2000);
                            } else {
                                console.error('Failed to connect after multiple attempts.');
                            }
                        }
                    }
                }
            );
        } catch (error) {
            console.error('Error connecting to sensor:', error);
        }
    };

    const disconnectFromSensor = async () => {
        if (!connectedDevice) {
            console.warn("No device connected.");
            return;
        }

        try {
            if (heartRateCharacteristic) {
                await heartRateCharacteristic.monitor(null);
                setHeartRateCharacteristic(null);
            }

            await connectedDevice.cancelConnection();
            setConnectedDevice(null);
            resetHeartRateData();
            console.log("Device disconnected and data reset.");
        } catch (error) {
            if (error.message.includes('is not connected')) {
                console.warn("Device already disconnected.");
            } else {
                console.error("Error disconnecting device:", error);
            }
        }
    };

    const handleHeartRateChanged = (characteristic) => {
        if (!characteristic.value) {
            console.error("No value received from characteristic");
            setHeartRate(0);
            return;
        }

        const data = Buffer.from(characteristic.value, 'base64');
        const flags = data[0];
        const is16Bit = (flags & 0x01) !== 0;

        let heartRateValue;
        if (is16Bit) {
            heartRateValue = data.readUInt16LE(1);
        } else {
            heartRateValue = data[1];
        }

        if (heartRateValue > 30 && heartRateValue < 220) {
            setHeartRate(heartRateValue);
            updateHeartRateData(heartRateValue);
        } else {
            console.warn("Received unrealistic heart rate value:", heartRateValue);
            setHeartRate(0);
        }
    };

    const updateHeartRateData = (newHeartRate) => {
        setHeartRateData((prevData) => {
            const newData = [...prevData.slice(1), newHeartRate || 0];
            return newData;
        });

        setLabels((prevLabels) => {
            const newLabels = [...prevLabels, new Date().toLocaleTimeString()];
            if (newLabels.length > 10) newLabels.shift();
            return newLabels;
        });
    };

    const resetHeartRateData = () => {
        setHeartRate(0);
        setHeartRateData(Array(10).fill(0));
        setLabels(Array(10).fill(''));
    };

    return (
        <HeartRateContext.Provider value={{ heartRate, heartRateData, labels, connectToSensor, disconnectFromSensor }}>
            {children}
        </HeartRateContext.Provider>
    );
};
