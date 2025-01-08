import dotenv from "dotenv";
dotenv.config();

import fs from 'fs/promises';
import path from 'path';
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Paths to the JSON files
const exercisesFolder = './exercises';
const exerciseTypes = ['cardio', 'stretching']; // Only cardio and stretching

// Function to load exercises from a JSON file
async function loadExercisesFromFile(filePath, type) {
  const data = await fs.readFile(filePath, 'utf8');
  const parsedData = JSON.parse(data);
  return parsedData[type]; // Access the array within the key
}

// Populate Firestore with cardio and stretching exercises organized by level
async function populateCardioAndStretchingExercises() {
  try {
    for (const type of exerciseTypes) {
      const filePath = path.join(exercisesFolder, `${type}.json`);
      try {
        const exercises = await loadExercisesFromFile(filePath, type);
        const levels = ["beginner", "intermediate", "advanced"];

        // Add each exercise categorized by level
        for (const exercise of exercises) {
          const level = exercise.difficulty || "beginner";  // Default to "beginner" if level is missing
          if (!levels.includes(level)) continue;  // Skip invalid levels

          await setDoc(doc(db, `exercise_type/${type}/${level}`, exercise.name), exercise);
          console.log(`Added ${exercise.name} to ${type}/${level} collection`);
        }
        console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} exercises populated successfully in Firestore.`);
      } catch (error) {
        console.error(`Error loading or populating exercises for ${type}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Error populating Firestore for cardio and stretching exercises:", error);
  }
}

// Main function to run the population function
async function main() {
  await populateCardioAndStretchingExercises();
}

main();
