import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import styles from './welcome.style';
import Signup from '../signup/signup';

export default function Welcome() {
    const [typedText, setTypedText] = useState('');
    const [isTyped, setIsTyped] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();

    useEffect(() => {
        if (!isTyped) {
            const slogan = "Healthy Body. Healthy Mind.\nStart your journey today.\nLet's set up your profile.";
            let index = 0;
            const typeCharacter = () => {
                if (index < slogan.length) {
                    setTypedText(slogan.slice(0, index + 1));
                    index++;
                    setTimeout(typeCharacter, 50);
                } else {
                    setIsTyped(true);
                }
            };
            typeCharacter();
        }
    }, [isTyped]);

    useEffect(() => {
        if (isTyped) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [isTyped]);

    const onGetStartedPress = () => {
        navigation.navigate('Signup');
    }
    

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#6a0dad', '#2c003e', '#1a1a1a']}
                style={styles.imageBackground}
            >
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Text style={styles.appName}>FitnessTracker</Text>
                </View>

                <View style={styles.sloganWrapper}>
                    <View style={styles.sloganContainer}>
                        <Text style={styles.ctaMessage}>{typedText}</Text>
                    </View>
                </View>

                <Animated.View style={[styles.actionButtonContainer, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onGetStartedPress}
                    >
                        <Text style={styles.actionButtonText}>Let's Get Started</Text>
                    </TouchableOpacity>
                </Animated.View>
            </LinearGradient>
        </View>
    );
};
