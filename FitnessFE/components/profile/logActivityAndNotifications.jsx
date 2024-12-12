import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase-config';

export const handleFriendRequestResponse = async (targetUserId, senderAction, targetAction, notificationType) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No user is currently logged in.');

    const currentUserId = currentUser.uid;

    const targetUserDoc = await getDoc(doc(db, 'users', targetUserId));
    const targetUsername = targetUserDoc.exists() ? targetUserDoc.data().username : 'Unknown User';

    const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
    const currentUsername = currentUserDoc.exists() ? currentUserDoc.data().username : 'Unknown User';

    let message = '';
    switch (notificationType) {
      case 'friendRequestReceived':
        message = `${currentUsername || 'A user'} sent you a friend request.`;
        break;
      case 'friendRequestAccepted':
        message = `${currentUsername} accepted your friend request.`;
        break;
      case 'friendRequestRejected':
        message = `${currentUsername} rejected your friend request.`;
        break;
      case 'friendRemoved':
        message = `${currentUsername} removed you from friends :(`;
        break;
      default:
        message = 'Content not available';
    }

    const notificationsRef = collection(db, 'users', targetUserId, 'notifications');
    await addDoc(notificationsRef, {
      type: notificationType,
      fromUserId: currentUserId,
      message: message,
      timestamp: serverTimestamp(),
      isRead: false,
    });

    const recentActivitiesRef = collection(db, 'users', currentUserId, 'recentActivities');
    await addDoc(recentActivitiesRef, {
      action: targetAction,
      targetUserId: targetUserId,
      targetUsername: targetUsername,
      timestamp: serverTimestamp(),
    });

    const senderRecentActivitiesRef = collection(db, 'users', targetUserId, 'recentActivities');

    await addDoc(senderRecentActivitiesRef, {
      action: senderAction,
      targetUserId: currentUserId,
      targetUsername: currentUsername,
      timestamp: serverTimestamp(),
    });

  } catch (error) {
    console.error('Error handling friend request response:', error);
  }
};
