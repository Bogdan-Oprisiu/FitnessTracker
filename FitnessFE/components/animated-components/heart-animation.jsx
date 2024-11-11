import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text } from 'react-native';

const AnimatedHeart = ({ heartRate }) => {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const beatAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scale, {
                    toValue: 1.3,
                    duration: 300,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ])
        );
        beatAnimation.start();

        return () => beatAnimation.stop();
    }, [scale, heartRate]);

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Text style={{ fontSize: 30, color: 'red' }}>❤️</Text>
        </Animated.View>
    );
};

export default AnimatedHeart;