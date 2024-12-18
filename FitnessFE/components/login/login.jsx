import { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, TextInput, TouchableOpacity, Image, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient";
import Toast from 'react-native-toast-message';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { getDoc, getDocs, doc, collection, query, where, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase-config';
import styles from "./login.style"

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const googleIcon = require('../../assets/images/google-icon.webp');
    const appleIcon = require('../../assets/images/apple-icon.png');
    const navigation = useNavigation();

    const loginWithCredentials = async () => {
        if (emailOrUsername === '' || password === '') {
            Toast.show({
                type: 'error',
                text1: 'Incomplete Information',
                text2: 'Please fill in all fields.',
                position: 'top',
                visibilityTime: 5000,
                autoHide: true, 
            });
            return;
        }

        let email = emailOrUsername;

        if (!email.includes('@')) {
            try {
                const usernamesRef = collection(db, 'users');
                const q = query(usernamesRef, where('username', '==', emailOrUsername.trim()));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    Toast.show({
                        type: 'error',
                        text1: 'Invalid username',
                        text2: "This username doesn't exist.",
                        position: 'top',
                        visibilityTime: 5000,
                        autoHide: true, 
                    });
                    return;
                }
                email = querySnapshot.docs[0].data().email;
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Error checking username',
                    text2: 'An error occurred. Please try again.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true, 
                });
                console.error('Error checking username:', error);
                return;
            }
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (user) {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              const userData = userDoc.data();
            }

            console.log(`Login successful. Welcome ${emailOrUsername}`);
            Toast.show({
                type: 'success',
                text1: 'Login Successful',
                text2: 'Welcome back!',
                position: 'top',
                visibilityTime: 5000,
                autoHide: true, 
            });
            navigation.navigate('MainTabs');
        } catch (error) {
            console.error('Error signing you in:', error.message);
            if (error.code === 'auth/invalid-email') {
                Toast.show({
                    type: 'error',
                    text1: 'Invalid Email',
                    text2: 'This email is invalid.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true, 
                });
            } else if (error.code === 'auth/invalid-credential') {
                Toast.show({
                    type: 'error',
                    text1: 'Invalid Credentials',
                    text2: 'The entered credentials are invalid.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true, 
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error signing in',
                    text2: 'An error occurred. Please try again.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true, 
                });
            }
        }
    }

    const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true
    })

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: Platform.select({
            web: '199396170118-ivstmkgg2shd5ep9m29pecgh7okf3ehh.apps.googleusercontent.com',
            android: '199396170118-mq12vcrupdc58lkeio5kvln5mv09nm1l.apps.googleusercontent.com',
            ios: '199396170118-tp7ubdn2fg2oo59qdqn2p7aes430sv70.apps.googleusercontent.com',
        }),
        redirectUri: redirectUri,
        scopes: ['profile', 'email'],        
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
    
            signInWithCredential(auth, credential)
                .then(async (userCredential) => {
                    const user = userCredential.user;
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    
                    if (!userDoc.exists()) {
                        await setDoc(doc(db, 'users', user.uid), {
                            email: user.email,
                            username: user.displayName.replace(/\s+/g, ''),
                            profilePictureUrl: user.photoURL,
                            username_lowercase: user.displayName.replace(/\s+/g, '').toLowerCase(),
                            weeklyGoal: 5
                        });
                    }
    
                    Toast.show({
                        type: 'success',
                        text1: 'Login Successful',
                        text2: 'Welcome back!',
                        position: 'top',
                        visibilityTime: 5000,
                        autoHide: true,
                    });
    
                    navigation.navigate('MainTabs');
                })
                .catch((error) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Google Sign-In Error',
                        text2: error.message,
                        position: 'top',
                        visibilityTime: 5000,
                        autoHide: true,
                    });
                    console.error('Google Sign-In Error:', error);
                });
        } else if (response?.type === 'dismiss') {
            Toast.show({
                type: 'error',
                text1: 'Session dismissed',
                text2: 'Please try again',
                position: 'top',
                visibilityTime: 5000,
                autoHide: true,
            });
        }
    }, [response]);    

    const loginWithGoogle = () => {
        if (request) {
            promptAsync({ useProxy: true });        
        } else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Google Sign-In request is still loading. Please try again.',
                position: 'top',
                visibilityTime: 5000,
                autoHide: true,
            });
        }
    };

    const loginWithApple = () => {

    }

    const onSignupPress = () => {
        navigation.navigate('Signup');
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#6a0dad', '#2c003e', '#1a1a1a']}
                style={styles.imageBackground}
            >
                <View style={styles.welcomeBackContainer}>
                    <Text style={styles.welcomeBackText}>Welcome Back!</Text>
                    <Text style={styles.continueWithText}>Continue with</Text>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#ccc"
                        value={emailOrUsername}
                        onChangeText={setEmailOrUsername}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#ccc"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                        autoComplete='off'  // to supress dashlane notis because they are annoying
                    />
                </View>
                <View style={styles.orContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>or</Text>
                    <View style={styles.line} />
                </View>
                <View style={styles.socialsContainer}>
                    <TouchableOpacity style={styles.socialButton} onPress={loginWithGoogle} >
                        <Image
                            source={googleIcon}
                            style={styles.socialIcon}
                        />
                        <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButton} onPress={loginWithApple} >
                        <Image
                            source={appleIcon}
                            style={styles.socialIcon}
                        />
                        <Text style={styles.socialText}>Apple</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={loginWithCredentials}>
                    <Text style={styles.submitButtonText}>Log In</Text>
                </TouchableOpacity>
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                        Forgot your password?{" "}
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Reset It</Text>
                        </TouchableOpacity>
                    </Text>
                    <Text style={styles.footerText}>
                        New here?{" "}
                        <TouchableOpacity onPress={onSignupPress}>
                            <Text style={styles.linkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </Text>
                </View>
            </LinearGradient>
        </View>
    );
}