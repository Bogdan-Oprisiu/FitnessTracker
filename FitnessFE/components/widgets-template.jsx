import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Widget({ title, iconName, fullWidth = false, onPress }) {
  return (
    <TouchableOpacity style={[styles.widgetContainer, fullWidth && styles.fullWidthContainer]} onPress={onPress}>
      <MaterialIcons name={iconName} size={48} color="#6a0dad" />
      <Text style={styles.widgetText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  widgetContainer: {
    width: width * 0.43,
    padding: 20,
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 5,
  },
  fullWidthContainer: {
    width: width * 0.9,
  },
  widgetText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
  },
});
