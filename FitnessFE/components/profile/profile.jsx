import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Modal, 
  FlatList, 
  TextInput, 
  ActivityIndicator,
  Animated, 
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { auth, db } from '../config/firebase-config';
import { getDoc, doc } from 'firebase/firestore';
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
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
    inputRange: [0, 100],
    outputRange: [1, 0.4],
    extrapolate: 'clamp',
  });
  
  const profileTranslateX = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -400],
    extrapolate: 'clamp',
  });
  
  const profileTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const icon1TranslateX = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 190],
    extrapolate: 'clamp',
  });
  
  const icon2TranslateX = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 140], 
    extrapolate: 'clamp',
  });
  
  const icon3TranslateX = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 90], 
    extrapolate: 'clamp',
  });
  
  const icon4TranslateX = scrollY.interpolate({
    inputRange: [0, 100],
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
      <Animated.View style={[styles.header, { height: HEADER_HEIGHT, opacity: headerOpacity }]}>
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
            <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Settings')}>
              <MaterialIcons name="settings" size={28} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateX: icon4TranslateX }] }}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications" size={28} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.mainContent}
        style={{ marginTop: 100 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
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
          <TouchableOpacity style={styles.editIcon} onPress={() => {/* edit functionality */}}>
            <MaterialIcons name="edit" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.username}>{username}</Text>

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
