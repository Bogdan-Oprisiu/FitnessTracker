import dotenv from 'dotenv';
import { db } from './config/firebaseConfig.mjs';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';

dotenv.config();

// Fetch exercises from Firestore
async function fetchExercisesFromDatabase(type, muscleGroup = null, difficulty = null) {
  const exercises = [];

  try {
    if (type === 'cardio' || type === 'stretching') {
      const difficulties = difficulty ? [difficulty] : ['beginner', 'intermediate', 'advanced'];

      for (const level of difficulties) {
        const subCollection = collection(db, `exercise_type/${type}/${level}`);
        const snapshot = await getDocs(subCollection);

        snapshot.forEach((doc) => {
          exercises.push(doc.data());
        });
      }
    } else if (type === 'strength' && muscleGroup) {
      const strengthCollection = collection(db, `exercise_type/strength/${muscleGroup}`);
      const exerciseQuery = difficulty
        ? query(strengthCollection, where('difficulty', '==', difficulty))
        : strengthCollection;

      const snapshot = await getDocs(exerciseQuery);

      snapshot.forEach((doc) => {
        exercises.push(doc.data());
      });
    } else {
      console.error('Invalid type provided.');
    }

    if (exercises.length === 0) {
      console.log(`No exercises found for type: ${type}, muscle group: ${muscleGroup}, difficulty: ${difficulty}.`);
    }
  } catch (error) {
    console.error('Error fetching exercises:', error.message);
  }

  return exercises;
}

// Generate workout plan using Gemini
async function generateWorkout(focusAreas, difficulty, duration, exercises, includeWarmUp = true, includeStretching = true) {
  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = gemini.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      candidateCount: 1,
      stopSequences: [],
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
  });

  const prompt = `
    Create a structured ${duration}-minute workout plan focusing on ${focusAreas.join(', ')}.
    Difficulty: ${difficulty}.
    ${includeWarmUp ? 'Include a warm-up section.' : ''}
    Include the main workout section.
    ${includeStretching ? 'Include a cool-down section with stretching.' : ''}
    Use the following exercises:
    ${JSON.stringify(exercises)}.
    Return the response in JSON format with "warmUp", "mainWorkout", and "coolDown" sections.
  `;

  const result = await model.generateContent(prompt);

  let rawResponse = result.response.text();
  console.log('Raw Gemini Response:', rawResponse); // Debugging: Log raw response

  // Remove Markdown formatting
  rawResponse = rawResponse.replace(/```json|```/g, '').trim();

  // Clean specific invalid JSON issues
  rawResponse = rawResponse
    .replace(/(\d+)\s+each direction/g, '"$1 per direction"') // Fix "15 each direction"
    .replace(/(\d+)\s+each/g, '"$1 each"') // Fix "10 each"
    .replace(/"reps":\s?(\d+)-(\d+)/g, '"reps": {"min": $1, "max": $2}') // Fix "reps: 8-12"
    .replace(/(\w+):/g, '"$1":'); // Ensure property keys are quoted.

  try {
    return JSON.parse(rawResponse);
  } catch (error) {
    console.error('Error parsing Gemini response:', error.message);
    return { warmUp: [], mainWorkout: [], coolDown: [] }; // Fallback structure
  }
}

// Main function
async function main() {
  try {
    // Predefined parameters
    const focusAreas = ['chest', 'back'];
    const difficulty = 'beginner';
    const duration = 30;
    const includeWarmUp = true;
    const includeStretching = true;

    // Fetch exercises
    const strengthExercises = await fetchExercisesFromDatabase('strength', 'chest', difficulty);
    const cardioExercises = await fetchExercisesFromDatabase('cardio', null, difficulty);
    const stretchingExercises = await fetchExercisesFromDatabase('stretching', null, difficulty);

    const exercises = {
      strength: strengthExercises,
      cardio: cardioExercises,
      stretching: stretchingExercises,
    };

    // Generate the workout plan
    const workoutPlan = await generateWorkout(focusAreas, difficulty, duration, exercises, includeWarmUp, includeStretching);

    // Save the workout plan to a JSON file
    const fileName = `workoutPlan_${Date.now()}.json`;
    await fs.writeFile(fileName, JSON.stringify(workoutPlan, null, 2));
    console.log(`Workout plan saved to ${fileName}`);
  } catch (error) {
    console.error('Error generating workout plan:', error);
  }
}

main();
