import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Screen2({ navigation }) {
    return (
        <View style={{flex: 1}}>
            <Text>This is Screen2</Text>
            <Button title='Go to Screen1' onPress={() => navigation.navigate('Screen1')} />
        </View>
    );
  }
  