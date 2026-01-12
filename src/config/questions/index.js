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
import { medicalQuestions } from './medical.js';
import { greetingsQuestions } from './greetings.js';
import { numbersQuestions } from './numbers.js';
import { grammarQuestions } from './grammar.js';
import { recreationQuestions } from './recreation.js';
import { plantsAnimalsQuestions } from './plants_animals.js';
import { peopleQuestions } from './people.js';
import { dailyRoutinesQuestions } from './daily_routines.js';
import { businessQuestions } from './business.js';
import { environmentQuestions } from './environment.js';

// Import and re-export category utilities
export { categories, getAllCategoryIds, getCategoryById } from './categories.js';

// Export individual category questions
export {
  foodQuestions,
  shoppingQuestions,
  entertainmentQuestions,
  accommodationQuestions,
  transportationQuestions,
  directionsQuestions,
  medicalQuestions,
  greetingsQuestions,
  numbersQuestions,
  grammarQuestions,
  recreationQuestions,
  plantsAnimalsQuestions,
  peopleQuestions,
  dailyRoutinesQuestions,
  businessQuestions,
  environmentQuestions,
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
  ...medicalQuestions,
  ...greetingsQuestions,
  ...numbersQuestions,
  ...grammarQuestions,
  ...recreationQuestions,
  ...plantsAnimalsQuestions,
  ...peopleQuestions,
  ...dailyRoutinesQuestions,
  ...businessQuestions,
  ...environmentQuestions,
];

/**
 * Helper function to get questions by category
 * @param {string} category - The category to filter by
 * @returns {Array} Array of questions in that category, filtered by difficulty setting
 */
export const getQuestionsByCategory = (category) => {
  // Get difficulty setting from localStorage (default to 'hard' if not set)
  let difficulty = 'hard';
  try {
    const savedDifficulty = localStorage.getItem('gameDifficulty');
    if (savedDifficulty && ['easy', 'medium', 'hard'].includes(savedDifficulty)) {
      difficulty = savedDifficulty;
    }
  } catch (error) {
    console.error('Error loading difficulty setting:', error);
  }
  
  // Filter questions by category
  let categoryQuestions = questions.filter(q => q.category === category);
  
  // Apply difficulty filter
  if (difficulty === 'easy') {
    // Only easy questions
    categoryQuestions = categoryQuestions.filter(q => q.difficulty === 'easy');
  } else if (difficulty === 'medium') {
    // Easy and medium questions
    categoryQuestions = categoryQuestions.filter(q => 
      q.difficulty === 'easy' || q.difficulty === 'medium'
    );
  }
  // For 'hard', return all questions (no additional filtering needed)
  
  return categoryQuestions;
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
    // Skip questions without valid ID
    if (!q || !q.id) return false;
    
    // Extract numeric ID as string to match the format stored in tracking arrays
    // Split by underscore and get the last part (handles both 'daily_001' and 'plants_animals_001')
    const parts = q.id.split('_');
    const numericId = parts[parts.length - 1];
    return !excludedIds.has(numericId);
  });
  
  if (availableQuestions.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};

/**
 * Helper function to count unmastered questions in a category
 * @param {string} category - The category to check
 * @param {Object} usedQuestionIds - Object tracking used questions by category (numeric IDs only)
 * @param {Object} correctAnswersByCategory - Object tracking questions answered correctly by category (numeric IDs only)
 * @returns {number} Count of available unmastered questions
 */
export const getUnmasteredQuestionCount = (
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
    // Skip questions without valid ID
    if (!q || !q.id) return false;
    
    // Extract numeric ID as string to match the format stored in tracking arrays
    // Split by underscore and get the last part (handles both 'daily_001' and 'plants_animals_001')
    const parts = q.id.split('_');
    const numericId = parts[parts.length - 1];
    return !excludedIds.has(numericId);
  });
  
  return availableQuestions.length;
};

/**
 * Helper function to get all question IDs in a category
 * @param {string} category - The category to get IDs from
 * @returns {Array} Array of numeric question IDs (without category prefix)
 */
export const getQuestionIdsByCategory = (category) => {
  return getQuestionsByCategory(category)
    .filter(q => q && q.id) // Skip questions without valid ID
    .map(q => {
      // Split by underscore and get the last part (handles both 'daily_001' and 'plants_animals_001')
      const parts = q.id.split('_');
      return parseInt(parts[parts.length - 1], 10);
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
