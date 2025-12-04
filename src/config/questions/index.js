/**
 * Questions Index - Combines all category questions
 * This file imports questions from individual category files
 */

import { foodQuestions } from './food.js';
import { shoppingQuestions } from './shopping.js';
import { entertainmentQuestions } from './entertainment.js';
import { accommodationQuestions } from './accommodation.js';
import { transportationQuestions } from './transportation.js';
import { directionsQuestions } from './directions.js';
import { emergenciesQuestions } from './emergencies.js';
import { greetingsQuestions } from './greetings.js';
import { numbersQuestions } from './numbers.js';
import { grammarQuestions } from './grammar.js';
import { beachQuestions } from './beach.js';
import { animalsQuestions } from './animals.js';
import { peopleQuestions } from './people.js';
import { dailyRoutinesQuestions } from './daily_routines.js';

// Export individual category questions
export {
  foodQuestions,
  shoppingQuestions,
  entertainmentQuestions,
  accommodationQuestions,
  transportationQuestions,
  directionsQuestions,
  emergenciesQuestions,
  greetingsQuestions,
  numbersQuestions,
  grammarQuestions,
  beachQuestions,
  animalsQuestions,
  peopleQuestions,
  dailyRoutinesQuestions,
};

/**
 * Combined questions array from all categories
 */
export const questions = [
  ...foodQuestions,
  ...shoppingQuestions,
  ...entertainmentQuestions,
  ...accommodationQuestions,
  ...transportationQuestions,
  ...directionsQuestions,
  ...emergenciesQuestions,
  ...greetingsQuestions,
  ...numbersQuestions,
  ...grammarQuestions,
  ...beachQuestions,
  ...animalsQuestions,
  ...peopleQuestions,
  ...dailyRoutinesQuestions,
];

/**
 * Helper function to get questions by category
 * @param {string} category - The category to filter by
 * @returns {Array} Array of questions in that category
 */
export const getQuestionsByCategory = (category) => {
  return questions.filter(q => q.category === category);
};

/**
 * Helper function to get a random question from a category
 * @param {string} category - The category to pick from
 * @returns {Object|null} A random question object, or null
 */
export const getRandomQuestionByCategory = (category) => {
  const categoryQuestions = getQuestionsByCategory(category);
  if (categoryQuestions.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
  return categoryQuestions[randomIndex];
};

/**
 * Helper function to get a random question from a category, excluding already used questions
 * and questions that have been answered correctly in the past
 * @param {string} category - The category to pick from
 * @param {Object} usedQuestionIds - Object tracking used questions by category (numeric IDs only)
 * @param {Object} correctAnswersByCategory - Object tracking questions answered correctly by category (numeric IDs only)
 * @returns {Object|null} A random unused question object, or null if all questions used
 */
export const getRandomUnusedQuestionByCategory = (
  category, 
  usedQuestionIds = {},
  correctAnswersByCategory = {}
) => {
  const categoryQuestions = getQuestionsByCategory(category);
  const usedThisSession = usedQuestionIds[category] || [];
  const answeredCorrectly = correctAnswersByCategory[category] || [];
  
  // Combine both sets of excluded IDs
  const excludedIds = new Set([...usedThisSession, ...answeredCorrectly]);
  
  const availableQuestions = categoryQuestions.filter(q => {
    const numericId = parseInt(q.id.split('_')[1], 10);
    return !excludedIds.has(numericId);
  });
  
  if (availableQuestions.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};

/**
 * Helper function to get all question IDs in a category
 * @param {string} category - The category to get IDs from
 * @returns {Array} Array of numeric question IDs (without category prefix)
 */
export const getQuestionIdsByCategory = (category) => {
  return getQuestionsByCategory(category).map(q => {
    return parseInt(q.id.split('_')[1], 10);
  });
};

/**
 * Helper function to shuffle answer options
 * @param {Array} options - The array of answer options
 * @returns {Array} Shuffled array of options
 */
export const shuffleOptions = (options) => {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
