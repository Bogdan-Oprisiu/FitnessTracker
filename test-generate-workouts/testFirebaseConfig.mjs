import { db } from './config/firebaseConfig.mjs';
import { collection, getDocs } from 'firebase/firestore';

async function testFirebase() {
  try {
    const testCollectionName = 'exercise_type/cardio/beginner'; // Replace with your Firestore path
    const testCollection = collection(db, testCollectionName);
    const snapshot = await getDocs(testCollection);

    if (snapshot.empty) {
      console.log(`No documents found in the collection: ${testCollectionName}`);
    } else {
      console.log(`Documents in the collection: ${testCollectionName}`);
      snapshot.forEach((doc) => {
        console.log(`ID: ${doc.id}, Data:`, doc.data());
      });
    }
  } catch (error) {
    console.error('Error testing Firebase configuration:', error);
  }
}

testFirebase();
