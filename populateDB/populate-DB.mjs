import dotenv from "dotenv";
dotenv.config();

import fs from 'fs/promises';
import path from 'path';
import { db } from "./config/firebaseConfig.mjs";
import { collection, addDoc } from "firebase/firestore";

// Paths to the JSON files
const exercisesFolder = './exercises';
const strengthMuscleGroups = [
  'abdominals', 'abductors', 'adductors', 'biceps', 'calves',
  'chest', 'forearms', 'glutes', 'hamstrings', 'lats',
  'lower_back', 'middle_back', 'neck', 'quadriceps', 'traps', 'triceps'
];
const exerciseTypes = ['cardio', 'stretching']; // These types are separate from strength

// Function to load exercises from a JSON file
async function loadExercisesFromFile(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Function to populate Firestore with strength exercises by muscle group
async function populateStrengthExercises() {
  try {
    for (const muscleGroup of strengthMuscleGroups) {
      const filePath = path.join(exercisesFolder, `${muscleGroup}.json`);
      try {
        const exercises = await loadExercisesFromFile(filePath);
        const muscleGroupCollection = collection(db, `exercise_type/strength/${muscleGroup}`);

        // Add each exercise in the muscle group to Firestore
        for (const exercise of exercises) {
          await addDoc(muscleGroupCollection, exercise);
        }
        console.log(`Strength exercises for ${muscleGroup} populated successfully in Firestore.`);
      } catch (error) {
        console.error(`Error loading or populating exercises for ${muscleGroup}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Error populating Firestore for strength exercises:", error);
  }
}

// Function to populate Firestore with cardio and stretching exercises
async function populateCardioAndStretchingExercises() {
  try {
    for (const type of exerciseTypes) {
      const filePath = path.join(exercisesFolder, `${type}.json`);
      try {
        const exercises = await loadExercisesFromFile(filePath);
        const typeCollection = collection(db, `exercise_type/${type}`);

        // Add each exercise of the type to Firestore
        for (const exercise of exercises) {
          await addDoc(typeCollection, exercise);
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

// Main function to run the population functions
async function main() {
  await populateStrengthExercises();
  await populateCardioAndStretchingExercises();
}

main();
