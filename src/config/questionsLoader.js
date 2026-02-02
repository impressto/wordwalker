/**
 * Lazy Loading Questions Configuration
 * 
 * This module provides functions to dynamically load question categories on-demand,
 * significantly reducing the initial bundle size while maintaining full functionality.
 * 
 * Categories are loaded only when needed and cached in memory after first load.
 */

// Cache for loaded categories
const categoryCache = new Map();

// Cache for the base question utilities
let questionsModule = null;

/**
 * Load the base questions module (utilities, categories metadata)
 * This is lightweight and loads immediately with the app
 */
export async function loadQuestionsBase() {
  if (!questionsModule) {
    const module = await import('./questions/categories.js');
    questionsModule = module;
  }
  return questionsModule;
}

/**
 * Dynamically import a specific category's questions
 * @param {string} categoryId - The category identifier (e.g., 'food', 'shopping')
 * @returns {Promise<Array>} Array of questions for that category
 */
/**
 * Load questions for a specific category with difficulty filtering
 * @param {string} categoryId - The category identifier
 * @returns {Promise<Array>} Array of question objects filtered by difficulty
 */
export async function loadCategoryQuestions(categoryId) {
  // Return from cache if already loaded
  if (categoryCache.has(categoryId)) {
    const cachedQuestions = categoryCache.get(categoryId);
    // Apply difficulty filter to cached questions
    return applyDifficultyFilter(cachedQuestions);
  }

  let questions;
  
  // Dynamic import based on category ID
  switch (categoryId) {
    case 'food':
      questions = (await import('./questions/food.js')).foodQuestions;
      break;
    case 'shopping':
      questions = (await import('./questions/shopping.js')).shoppingQuestions;
      break;
    case 'entertainment':
      questions = (await import('./questions/entertainment.js')).entertainmentQuestions;
      break;
    case 'accommodation':
      questions = (await import('./questions/accommodation.js')).accommodationQuestions;
      break;
    case 'transportation':
      questions = (await import('./questions/transportation.js')).transportationQuestions;
      break;
    case 'directions':
      questions = (await import('./questions/directions.js')).directionsQuestions;
      break;
    case 'medical':
      questions = (await import('./questions/medical.js')).medicalQuestions;
      break;
    case 'greetings':
      questions = (await import('./questions/greetings.js')).greetingsQuestions;
      break;
    case 'numbers':
      questions = (await import('./questions/numbers.js')).numbersQuestions;
      break;
    case 'grammar':
      questions = (await import('./questions/grammar.js')).grammarQuestions;
      break;
    case 'recreation':
      questions = (await import('./questions/recreation.js')).recreationQuestions;
      break;
    case 'plants_animals':
      questions = (await import('./questions/plants_animals.js')).plantsAnimalsQuestions;
      break;
    case 'people':
      questions = (await import('./questions/people.js')).peopleQuestions;
      break;
    case 'daily_routines':
      questions = (await import('./questions/daily_routines.js')).dailyRoutinesQuestions;
      break;
    case 'business':
      questions = (await import('./questions/business.js')).businessQuestions;
      break;
    case 'environment':
      questions = (await import('./questions/environment.js')).environmentQuestions;
      break;
    default:
      throw new Error(`Unknown category: ${categoryId}`);
  }

  // Cache the loaded questions (unfiltered)
  categoryCache.set(categoryId, questions);
  
  // Return filtered questions based on difficulty
  return applyDifficultyFilter(questions);
}

/**
 * Apply difficulty filter to questions based on localStorage setting
 * @param {Array} questions - Array of question objects
 * @returns {Array} Filtered array of questions
 */
function applyDifficultyFilter(questions) {
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

  // Apply difficulty filter
  if (difficulty === 'easy') {
    // Easy mode: only easy questions
    return questions.filter(q => q.difficulty === 'easy');
  } else if (difficulty === 'medium') {
    // Medium mode: easy + medium questions
    return questions.filter(q => 
      q.difficulty === 'easy' || q.difficulty === 'medium'
    );
  }
  
  // Hard mode (default): all questions
  return questions;
}

/**
 * Load all question categories (for preloading or offline support)
 * @returns {Promise<Map>} Map of all loaded categories
 */
export async function preloadAllCategories() {
  const categoryIds = [
    'food', 'shopping', 'entertainment', 'accommodation', 'transportation',
    'directions', 'medical', 'greetings', 'numbers', 'grammar', 'recreation',
    'plants_animals', 'people', 'daily_routines', 'business', 'environment'
  ];

  await Promise.all(
    categoryIds.map(id => loadCategoryQuestions(id))
  );

  return categoryCache;
}

/**
 * Get questions for a category (loading if necessary)
 * @param {string} categoryId - The category identifier
 * @returns {Promise<Array>} Array of questions
 */
export async function getQuestionsByCategory(categoryId) {
  return await loadCategoryQuestions(categoryId);
}

/**
 * Get a random question from a category
 * @param {string} categoryId - The category identifier
 * @returns {Promise<Object>} Random question from that category
 */
export async function getRandomQuestionByCategory(categoryId) {
  const questions = await loadCategoryQuestions(categoryId);
  if (!questions || questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Get a random unused question from a category
 * @param {string} categoryId - The category identifier
 * @param {Array<string>} usedQuestionIds - Array of already used question IDs
 * @returns {Promise<Object|null>} Random unused question or null if all used
 */
/**
 * Get a random unused question from a category
 * @param {string} categoryId - The category identifier
 * @param {Object} usedQuestionIds - Object mapping category to array of used question IDs
 * @param {Object} correctAnswersByCategory - Object mapping category to array of correctly answered question IDs
 * @returns {Promise<Object|null>} A random unused question or null if none available
 */
export async function getRandomUnusedQuestionByCategory(categoryId, usedQuestionIds = {}, correctAnswersByCategory = {}) {
  const questions = await loadCategoryQuestions(categoryId);
  if (!questions || questions.length === 0) return null;

  const usedThisSession = usedQuestionIds[categoryId] || [];
  const answeredCorrectly = correctAnswersByCategory[categoryId] || [];
  
  // Combine both sets of excluded IDs
  const excludedIds = new Set([...usedThisSession, ...answeredCorrectly]);

  const unusedQuestions = questions.filter(q => {
    if (!q || !q.id) return false;
    
    // Extract numeric ID as string to match the format stored in tracking arrays
    const parts = q.id.split('_');
    const numericId = parts[parts.length - 1];
    return !excludedIds.has(numericId);
  });
  
  if (unusedQuestions.length === 0) return null;
  
  return unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
}

/**
 * Get count of unmastered questions in a category
 * @param {string} categoryId - The category identifier
 * @param {Array<string>} masteredIds - Array of mastered question IDs
 * @returns {Promise<number>} Count of unmastered questions
 */
export async function getUnmasteredQuestionCount(categoryId, masteredIds = []) {
  const questions = await loadCategoryQuestions(categoryId);
  if (!questions) return 0;
  return questions.filter(q => !masteredIds.includes(q.id)).length;
}

/**
 * Get all question IDs for a category
 * @param {string} categoryId - The category identifier
 * @returns {Promise<Array<string>>} Array of question IDs
 */
export async function getQuestionIdsByCategory(categoryId) {
  const questions = await loadCategoryQuestions(categoryId);
  if (!questions) return [];
  return questions.map(q => q.id);
}

/**
 * Shuffle options array (utility function)
 * @param {Array} options - Array of options to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleOptions(options) {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Re-export category utilities (these are lightweight metadata)
export { getAllCategoryIds, getCategoryById, categories } from './questions/categories.js';
