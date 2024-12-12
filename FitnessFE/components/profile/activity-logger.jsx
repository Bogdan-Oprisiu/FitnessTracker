import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase-config';

export const logRecentActivity = async (userId, action, targetUserId, targetUsername) => {
  try {
    const recentActivitiesRef = collection(db, 'users', userId, 'recentActivities');

    const q = query(recentActivitiesRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.size > 5) {
      const excessDocs = snapshot.docs.slice(5);
      const batch = writeBatch(db);
      excessDocs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error logging recent activity:', error);
  }
};
