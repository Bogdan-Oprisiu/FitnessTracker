import { doc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp, increment, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase-config';
import { handleFriendRequestResponse } from './logActivityAndNotifications';
import { logRecentActivity } from './activity-logger';
import Toast from 'react-native-toast-message';


export const acceptFriendRequest = async (friendshipId, fromUserId) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('No user is currently logged in.');
        }
    
        const friendshipRef = doc(db, 'friendships', friendshipId);
  
        const friendshipDoc = await getDoc(friendshipRef);
        if (!friendshipDoc.exists()) {
          throw new Error('Friendship document does not exist.');
        }
        const data = friendshipDoc.data();
        const currentUserId = auth.currentUser.uid;
        const friendUserId = data.user1 === currentUserId ? data.user2 : data.user1;
    
        const friendDoc = await getDoc(doc(db, 'users', friendUserId));
        const friendUsername = friendDoc.exists() ? friendDoc.data().username : 'Unknown User';
    
        const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
        const currentUsername = currentUserDoc.exists() ? currentUserDoc.data().username : 'Unknown User';
  
      await updateDoc(friendshipRef, {
        status: 'accepted',
        respondedAt: serverTimestamp(),
      });
  
      const currentUserDocRef = doc(db, 'users', currentUserId);
      const friendUserDocRef = doc(db, 'users', friendUserId);
  
      await updateDoc(currentUserDocRef, {
        friendsCount: increment(1),
      });
  
      await updateDoc(friendUserDocRef, {
        friendsCount: increment(1),
      });
  
      const friendsRefCurrent = collection(db, 'users', currentUserId, 'friends');
      await addDoc(friendsRefCurrent, {
        friendId: friendUserId,
        since: serverTimestamp(),
      });
  
      const friendsRefFriend = collection(db, 'users', friendUserId, 'friends');
      await addDoc(friendsRefFriend, {
        friendId: currentUserId,
        since: serverTimestamp(),
      });
  
      await handleFriendRequestResponse(
        fromUserId, 
        `${currentUsername} Accepted Your Friend Request`,
        `Accepted Friend Request from ${friendUsername}`,  
        'friendRequestAccepted'
      );
      await logRecentActivity(currentUserId, 'Friend Request Accepted', friendUserId, friendUsername);
      await logRecentActivity(friendUserId, 'Friend Request Accepted', currentUserId, currentUsername);
  
      Toast.show({
        type: 'success',
        text1: 'Friend Request Accepted',
        text2: 'You are now friends.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not accept friend request. Please try again.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
  };


  export const rejectFriendRequest = async (friendshipId, fromUserId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently logged in.');
      }
  
      const friendshipRef = doc(db, 'friendships', friendshipId);

      const friendshipDoc = await getDoc(friendshipRef);
      if (!friendshipDoc.exists()) {
        throw new Error('Friendship document does not exist.');
      }
      const data = friendshipDoc.data();
      const currentUserId = auth.currentUser.uid;
      const friendUserId = data.user1 === currentUserId ? data.user2 : data.user1;
  
      const friendDoc = await getDoc(doc(db, 'users', friendUserId));
      const friendUsername = friendDoc.exists() ? friendDoc.data().username : 'Unknown User';
  
      const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
      const currentUsername = currentUserDoc.exists() ? currentUserDoc.data().username : 'Unknown User';

      await handleFriendRequestResponse(
        fromUserId, 
        `${currentUsername} Rejected Your Friend Request`, 
        `Rejected Friend Request from ${friendUsername}`, 
        'friendRequestRejected'
        );

      await logRecentActivity(currentUserId, 'Friend Request Rejected', friendUserId, friendUsername);
      await logRecentActivity(friendUserId, 'Friend Request Rejected', currentUserId, currentUsername);

      await deleteDoc(friendshipRef);

      Toast.show({
        type: 'info',
        text1: 'Friend Request Rejected',
        text2: 'You have rejected this friend request.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not reject friend request. Please try again.',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
      });
    }
};
