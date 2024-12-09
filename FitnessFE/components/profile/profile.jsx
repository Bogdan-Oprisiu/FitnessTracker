import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, FlatList, TextInput, ActivityIndicator, Animated } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { auth, db, storage } from '../config/firebase-config';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import styles from './profile.style';

export default function Profile() {
  const DEFAULT_PROFILE_PICTURE_URL = 'https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/defaultProfilePictures%2Fdefault-profile-picture.jpg?alt=media&token=YOUR_TOKEN';
  const navigation = useNavigation();
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [username, setUsername] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_HEIGHT = 60;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [HEADER_HEIGHT, HEADER_HEIGHT * 0.7],
    extrapolate: 'clamp',
  });

  const editButtonOpacity = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const user = {
    username: 'JohnDoe',
    profilePicture: 'https://via.placeholder.com/150', 
    friendsCount: 10,
    friendsList: [
      {
        id: '1',
        username: 'JaneSmith',
        profilePicture: 'https://via.placeholder.com/100',
      },
      {
        id: '2',
        username: 'MikeOxlong',
        profilePicture: 'https://via.placeholder.com/100',
      },
      {
        id: '3',
        username: 'AliceWonder',
        profilePicture: 'https://via.placeholder.com/100',
      },
    ],
  };

  const allUsers = [
    {
      id: '4',
      username: 'BobBuilder',
      profilePicture: 'https://via.placeholder.com/100',
    },
    {
      id: '5',
      username: 'CharlieBrown',
      profilePicture: 'https://via.placeholder.com/100',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      activity: 'Liked a post',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      activity: 'Commented on a photo',
      timestamp: 'Yesterday',
    },
    {
      id: '3',
      activity: 'Completed a workout',
      timestamp: '2 days ago',
    },
  ];

  const profileScale = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });
  
  const profileTranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, -550],
    extrapolate: 'clamp',
  });
  
  const profileTranslateY = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, -470],
    extrapolate: 'clamp',
  });

  const usernameScale = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  
  const usernameTranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, -125],
    extrapolate: 'clamp',
  });
  
  const usernameTranslateY = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, -290],
    extrapolate: 'clamp',
  });

  const icon1TranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, 190],
    extrapolate: 'clamp',
  });
  
  const icon2TranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, 140], 
    extrapolate: 'clamp',
  });
  
  const icon3TranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, 90], 
    extrapolate: 'clamp',
  });
  
  const icon4TranslateX = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, 40],
    extrapolate: 'clamp',
  });

  const openFriendsModal = () => {
    setFriendsModalVisible(true);
  };

  const closeFriendsModal = () => {
    setFriendsModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
    } else {
      const results = allUsers.filter((u) =>
        u.username.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  const addFriend = (username) => {
    Toast.show({
      type: 'success',
      text1: 'Friend Request Sent',
      text2: `You have sent a friend request to ${username}.`,
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setLoading(false);
          return;
        }

        const uid = currentUser.uid;

        const userDocRef = doc(db, 'users', uid);

        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUsername(userData.username);

          if (typeof userData.profilePictureUrl === 'string' && userData.profilePictureUrl.startsWith('http')) {
            setProfilePicture(userData.profilePictureUrl);
          } else {
            setProfilePicture(DEFAULT_PROFILE_PICTURE_URL);
            console.warn(`Invalid profilePictureUrl for user ${uid}. Using default image.`);
          }

          setFriendsCount(userData.friendsCount || 0);
        } 
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = async () => {
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
          
          try {
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
              throw new Error('No user is currently logged in.');
            }
            
            const userId = currentUser.uid;            
            const timestamp = Date.now();
            const fileExtension = imageUri.substring(imageUri.lastIndexOf('.') + 1);
            const fileName = `profile_${timestamp}.${fileExtension}`;
            const storageRef = ref(storage, `profilePictures/${userId}/${fileName}`);
            const response = await fetch(imageUri);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
              profilePictureUrl: downloadURL,
            });
            
            setProfilePicture(downloadURL);
            
            Toast.show({
              type: 'success',
              text1: 'Profile Picture Updated',
              text2: 'Your profile picture has been successfully updated.',
              position: 'top',
              visibilityTime: 5000,
              autoHide: true,
            });
            
          } catch (error) {
            console.error('Error uploading image:', error);
            Toast.show({
              type: 'error',
              text1: 'Upload Failed',
              text2: 'There was an error updating your profile picture. Please try again.',
              position: 'top',
              visibilityTime: 5000,
              autoHide: true,
            });
          }
          
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
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been successfully logged out.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'An error occurred while logging out.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a0dad" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { height: HEADER_HEIGHT }]}>
        <View style={styles.headerLeft}>
          <Animated.View style={{ transform: [{ translateX: icon1TranslateX }] }}>
            <TouchableOpacity style={styles.headerIcon} onPress={handleLogout}>
              <MaterialIcons name="logout" size={28} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateX: icon2TranslateX }] }}>
            <TouchableOpacity style={styles.headerIcon} onPress={openFriendsModal}>
              <MaterialIcons name="group" size={28} color="#fff" />
              {friendsCount >= 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>69</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateX: icon3TranslateX }] }}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => console.log('Settings')}>
              <MaterialIcons name="settings" size={28} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateX: icon4TranslateX }] }}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => console.log('Notifications')}>
              <Ionicons name="notifications" size={28} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.profilePictureContainer,
            {
              transform: [
                { scale: profileScale },
                { translateX: profileTranslateX },
                { translateY: profileTranslateY },
              ],
            },
          ]}
        >
          <Image 
            source={typeof profilePicture === 'string' ? { uri: profilePicture } : { uri: DEFAULT_PROFILE_PICTURE_URL }} 
            style={styles.profilePicture} 
            onError={(e) => {
              console.warn('Failed to load profile picture. Using default image.', e.nativeEvent.error);
              setProfilePicture(DEFAULT_PROFILE_PICTURE_URL);
            }}
          />
          <Animated.View style={{ opacity: editButtonOpacity }}>
            <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
              <MaterialIcons name="edit" size={14} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
        <Animated.Text
            style={[
              styles.username,
              {
                transform: [
                  { scale: usernameScale },
                  { translateX: usernameTranslateX },
                  { translateY: usernameTranslateY },
                ],
              },
            ]}
          >
            {username}
          </Animated.Text>
      </Animated.View>
          
      <Animated.ScrollView
        contentContainerStyle={styles.mainContent}
        style={{ marginTop: 110 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={styles.searchBarContainer}>
          <MaterialIcons name="search" size={24} color="#6a0dad" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search for users"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {searchQuery.trim() !== '' && (
          <View style={styles.dropdown}>
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => {/* handle user selection */}}>
                    <Image source={{ uri: item.profilePicture }} style={styles.dropdownImage} />
                    <Text style={styles.dropdownText}>{item.username}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={styles.noUsersText}>No users found.</Text>
            )}
          </View>
        )}

        {searchQuery.trim() === '' && (
          <>
          <View style={styles.recentActivityContainer}>
            <Text style={styles.recentActivityTitle}>Recent Activity</Text>
            <FlatList
              data={recentActivities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.activityItem}>
                  <Feather name="activity" size={20} color="#6a0dad" />
                  <View style={styles.activityTextContainer}>
                    <Text style={styles.activityText}>{item.activity}</Text>
                    <Text style={styles.activityTimestamp}>{item.timestamp}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.noActivitiesText}>No recent activities.</Text>
              }
            />
          </View>

          <View style={styles.recentActivityContainer}>
            <Text style={styles.recentActivityTitle}>Recent Activity</Text>
            <FlatList
              data={recentActivities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.activityItem}>
                  <Feather name="activity" size={20} color="#6a0dad" />
                  <View style={styles.activityTextContainer}>
                    <Text style={styles.activityText}>{item.activity}</Text>
                    <Text style={styles.activityTimestamp}>{item.timestamp}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.noActivitiesText}>No recent activities.</Text>
              }
            />
          </View>

          <View style={styles.recentActivityContainer}>
            <Text style={styles.recentActivityTitle}>Recent Activity</Text>
            <FlatList
              data={recentActivities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.activityItem}>
                  <Feather name="activity" size={20} color="#6a0dad" />
                  <View style={styles.activityTextContainer}>
                    <Text style={styles.activityText}>{item.activity}</Text>
                    <Text style={styles.activityTimestamp}>{item.timestamp}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.noActivitiesText}>No recent activities.</Text>
              }
            />
          </View>
          </>
        )}
      </Animated.ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={friendsModalVisible}
        onRequestClose={closeFriendsModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Your Friends</Text>

            <View style={styles.modalSearchBarContainer}>
              <MaterialIcons name="search" size={24} color="#6a0dad" style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchBar}
                placeholder="Search Users"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            {searchQuery.trim() !== '' && (
              <View style={styles.dropdown}>
                {searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.dropdownItem} onPress={() => {/* Handle user selection */}}>
                        <Image source={{ uri: item.profilePicture }} style={styles.dropdownImage} />
                        <Text style={styles.dropdownText}>{item.username}</Text>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text style={styles.noUsersText}>No users found.</Text>
                )}
              </View>
            )}

            {searchQuery.trim() === '' && (
              <FlatList
                data={user.friendsList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.friendItem}>
                    <Image
                      source={{ uri: item.profilePicture }}
                      style={styles.friendImage}
                    />
                    <Text style={styles.friendName}>{item.username}</Text>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}

            <TouchableOpacity onPress={closeFriendsModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
