import dotenv from 'dotenv';
import { db } from './config/firebaseConfig.mjs'; 
import { collection, getDocs, query, where } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import readline from 'readline';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

// Function to get user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (queryText) => {
  return new Promise((resolve) => rl.question(queryText, resolve));
};

async function fetchExercises(focusAreas, difficulty) {
  const exercises = [];
  for (const focus of focusAreas) {
    // Use collection() and pass db as the first argument
    const focusCollection = collection(db, `exercise_type/strength/${focus}`);
    const exerciseQuery = query(focusCollection, where('difficulty', '==', difficulty));
    const snapshot = await getDocs(exerciseQuery);

    snapshot.forEach((doc) => {
      exercises.push(doc.data());
    });
  }
  return exercises;
}


// Generate workout plan using Gemini
async function generateWorkout(focusAreas, difficulty, duration, exercises) {
  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = gemini.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      candidateCount: 1,
      stopSequences: [],
      maxOutputTokens: 500,
      temperature: 0.7,
    },
  });

  const prompt = `
    Create a ${duration}-minute workout plan focusing on ${focusAreas.join(', ')}.
    Difficulty: ${difficulty}.
    Include warm-up, main exercises, and cool-down.
    Exercises available:
    ${JSON.stringify(exercises)}.
  `;

  const result = await model.generateContent(prompt);

  return result.response.text();
}

// Main function to execute the workflow
async function main() {
  try {
    // Step 1: Get user input
    const focusAreasInput = await askQuestion('Enter focus areas (comma-separated, e.g., chest, back): ');
    const difficulty = await askQuestion('Enter difficulty level (beginner, intermediate, advanced): ');
    const duration = await askQuestion('Enter workout duration in minutes: ');

    const focusAreas = focusAreasInput.split(',').map((area) => area.trim());
    const parsedDuration = parseInt(duration, 10);

    // Step 2: Fetch exercises from Firestore
    const exercises = await fetchExercises(focusAreas, difficulty);
    if (exercises.length === 0) {
      console.log('No exercises found for the given criteria.');
      rl.close();
      return;
    }

    // Step 3: Generate the workout plan
    const workoutPlan = await generateWorkout(focusAreas, difficulty, parsedDuration, exercises);

    // Step 4: Save the workout plan to a JSON file
    const fileName = `workoutPlan_${Date.now()}.json`;
    await fs.writeFile(fileName, JSON.stringify({ workoutPlan }, null, 2));
    console.log(`Workout plan saved to ${fileName}`);

    rl.close();
  } catch (error) {
    console.error('Error generating workout plan:', error);
    rl.close();
  }
}

main();
