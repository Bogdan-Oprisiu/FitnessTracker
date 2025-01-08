import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Retrieve the API key from environment variables
const API_KEY = process.env.EXERCISES_API_KEY;

if (!API_KEY) {
  throw new Error("API key is missing. Please add it to your .env file.");
}

// List of muscle groups and exercise types as specified by the API
const muscleGroups = [
  'abdominals', 'abductors', 'adductors', 'biceps', 'calves',
  'chest', 'forearms', 'glutes', 'hamstrings', 'lats',
  'lower_back', 'middle_back', 'neck', 'quadriceps', 'traps', 'triceps'
];

const exerciseTypes = ['cardio', 'stretching'];

// Function to fetch exercises for a specific muscle group
async function fetchExercisesByMuscle(muscle) {
  const url = `https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`;
  const response = await fetch(url, {
    headers: { 'X-Api-Key': API_KEY }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch exercises for ${muscle}: ${response.statusText}`);
  }

  const exercises = await response.json();
  return exercises;
}

// Function to fetch exercises by type (e.g., "cardio", "stretching")
async function fetchExercisesByType(type) {
  const url = `https://api.api-ninjas.com/v1/exercises?type=${type}`;
  const response = await fetch(url, {
    headers: { 'X-Api-Key': API_KEY }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch exercises for ${type}: ${response.statusText}`);
  }

  const exercises = await response.json();
  return exercises.slice(0, 10); // Return only the first 10 exercises
}

// Function to save exercises to a JSON file
async function saveExercisesToFile(name, exercises) {
  const directory = './exercises';
  const filePath = path.join(directory, `${name}.json`);

  // Ensure the directory exists
  await fs.mkdir(directory, { recursive: true });

  // Write the exercises to the file
  await fs.writeFile(filePath, JSON.stringify(exercises, null, 2));
  console.log(`Saved ${exercises.length} exercises for ${name} to ${filePath}`);
}

// Main function to fetch and save exercises for both muscle groups and exercise types
async function main() {
  // Fetch and save exercises by muscle groups
  for (const muscle of muscleGroups) {
    try {
      const exercises = await fetchExercisesByMuscle(muscle);
      await saveExercisesToFile(muscle, exercises);
    } catch (error) {
      console.error(`Error processing muscle group ${muscle}:`, error.message);
    }
  }

  // Fetch and save exercises by types
  for (const type of exerciseTypes) {
    try {
      const exercises = await fetchExercisesByType(type);
      await saveExercisesToFile(type, exercises);
    } catch (error) {
      console.error(`Error processing exercise type ${type}:`, error.message);
    }
  }
}

main();
