import { useEffect, useState, useRef } from 'react';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase-config';
import Toast from 'react-native-toast-message';

const DEFAULT_PROFILE_PICTURE_URL = 'https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/defaultProfilePictures%2Fdefault-profile-picture.jpg?alt=media&token=YOUR_TOKEN';

const useFriends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const userCache = useRef({});
  const friendsMap = useRef(new Map());

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const friendshipsRef = collection(db, 'friendships');
    const q1 = query(
      friendshipsRef,
      where('status', '==', 'accepted'),
      where('user1', '==', currentUser.uid)
    );

    const q2 = query(
      friendshipsRef,
      where('status', '==', 'accepted'),
      where('user2', '==', currentUser.uid)
    );

    const processSnapshot = async (querySnapshot, isUser1) => {
      for (const change of querySnapshot.docChanges()) {
        const docSnap = change.doc;
        const data = docSnap.data();
        const friendshipId = docSnap.id;
        const friendUserId = isUser1 ? data.user2 : data.user1;

        if (change.type === 'added' || change.type === 'modified') {
          if (userCache.current[friendUserId]) {
            friendsMap.current.set(friendUserId, {
              friendshipId,
              friendUserId,
              ...userCache.current[friendUserId],
            });
          } else {
            try {
              const friendDoc = await getDoc(doc(db, 'users', friendUserId));
              if (friendDoc.exists()) {
                const friendData = friendDoc.data();
                const friendInfo = {
                  id: friendDoc.id,
                  username: friendData.username,
                  profilePictureUrl: friendData.profilePictureUrl || DEFAULT_PROFILE_PICTURE_URL,
                };
                userCache.current[friendUserId] = friendInfo;
                friendsMap.current.set(friendUserId, {
                  friendshipId,
                  friendUserId,
                  ...friendInfo,
                });
              } else {
                console.warn(`User with ID ${friendUserId} does not exist.`);
              }
            } catch (error) {
              console.error(`Error fetching user data for ID ${friendUserId}:`, error);
            }
          }
        } else if (change.type === 'removed') {
          friendsMap.current.delete(friendUserId);
        }
      }

      setFriends(Array.from(friendsMap.current.values()));
      setLoading(false);
    };

    const unsubscribe1 = onSnapshot(q1, (querySnapshot) => {
      processSnapshot(querySnapshot, true);
    }, (error) => {
      console.error('Error fetching friendships where user1 is current user:', error);
      setLoading(false);
    });

    const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
      processSnapshot(querySnapshot, false);
    }, (error) => {
      console.error('Error fetching friendships where user2 is current user:', error);
      setLoading(false);
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, []);

  return { friends, loading };
};

export default useFriends;
