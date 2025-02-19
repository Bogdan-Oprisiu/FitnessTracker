import { useState, useRef, useEffect } from 'react';
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, TouchableOpacity, Image, TextInput, Animated } from "react-native";
import { auth, db, storage } from '../../config/firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message'; 
import Login from '../login/login';
import styles from "./signup.style";

const Signup = () => {
    const defaultProfilePicture = require('../../assets/images/default-profile-picture.jpg');
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const signupFadeAnim = useRef(new Animated.Value(1)).current;


    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSignup = async () => {
        try {
            if (username === '' || email === '' || password === '' || confirmPassword === '') {
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

            if (username.includes('@')) {
                Toast.show({
                    type: 'error',
                    text1: 'Invalid Username',
                    text2: 'Username cannot contain "@" symbol.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true, 
                });
                return;
            }

            if (!validateEmail(email)) {
                Toast.show({
                    type: 'error',
                    text1: 'Invalid Email',
                    text2: 'Please enter a valid email.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true,
                  });
                  
                return;
            }

            if (password !== confirmPassword) {
                Toast.show({
                    type: 'error',
                    text1: 'Password Mismatch',
                    text2: 'Passwords do not match.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true, 
                });
                return;
            }

            const usernamesRef = collection(db, 'users');
            const q = query(usernamesRef, where('username', '==', username));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                Toast.show({
                    type: 'error',
                    text1: 'Username Taken',
                    text2: 'Please choose a different username.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true, 
                });
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('User signed up:', user);

            let profilePictureUrl = defaultProfilePicture;
            if (profilePicture) {
                const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
                const img = await fetch(profilePicture);
                const bytes = await img.blob();
                await uploadBytes(profilePicRef, bytes);
                profilePictureUrl = await getDownloadURL(profilePicRef);
            }

            await setDoc(doc(db, 'users', user.uid), {
                username,
                email,
                profilePictureUrl,
            });

            Toast.show({
                type: 'success',
                text1: 'Signup Successful',
                text2: 'Welcome to our community!',
                position: 'top',
                visibilityTime: 5000,
                autoHide: true, 
            });

        } catch (error) {
            console.error('Error signing up:', error.message);
            if (error.code === 'auth/email-already-in-use') {
                Toast.show({
                    type: 'error',
                    text1: 'Email Already in Use',
                    text2: 'This email is already registered.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true, 
                });
            } else if (error.code === 'auth/weak-password') {
                Toast.show({
                    type: 'error',
                    text1: 'Weak Password',
                    text2: 'Please choose a stronger password.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true, 
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Signup Error',
                    text2: 'An error occurred. Please try again.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true, 
                });
            }
        }
    };

    const selectFromGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (!permissionResult.granted) {
            Toast.show({
                type: 'error',
                text1: 'Permission Denied',
                text2: 'We need permission to access your gallery.',
                position: 'top',
                visibilityTime: 5000,
                autoHide: true, 
            });
            return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
    
        if (!result.canceled) {

            const imageUri = result.uri || (result.assets && result.assets[0].uri);
            
            if (imageUri) {
                setProfilePicture(imageUri);
            } else {
                console.error('Error: Image URI is undefined');
                Toast.show({
                    type: 'error',
                    text1: 'Image Selection Error',
                    text2: 'There was an issue selecting your image. Please try again.',
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true, 
                });
            }
        }
    };
    

    const onLoginPress = () => {
        Animated.timing(signupFadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            setShowLogin(true);
        });
    };

    if (showLogin) {
        return <Login />;
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#6a0dad', '#2c003e', '#1a1a1a']}
                style={styles.imageBackground}
            >
                <View style={styles.profilePictureContainer}>
                    <Image source={profilePicture ? { uri: profilePicture } : defaultProfilePicture} style={styles.profilePicture} />
                    <TouchableOpacity style={styles.editButton} onPress={selectFromGallery}>
                        <Icon name="edit" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#ccc"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#ccc"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#ccc"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#ccc"
                        secureTextEntry={true}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSignup}>
                    <Text style={styles.submitButtonText}>Sign Up</Text>
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                        Already have an account?{" "}
                        <TouchableOpacity onPress={onLoginPress}>
                            <Text style={styles.linkText}>Log In</Text>
                        </TouchableOpacity>
                    </Text>
                </View>
            </LinearGradient>
        </View>
    );
};

export default Signup;
