import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Screen1({ navigation }) {
    return (
        <View style={{flex: 1}}>
            <Text>This is Screen1</Text>
            <Button title='Go to Screen2' onPress={() => navigation.navigate('Screen2')} />
        </View>
    );
  }
  