/**
 * Question Tracking Utilities
 * 
 * Provides functions for tracking which questions have been asked
 * and managing category completion status
 */

import { getQuestionsByCategory } from '../config/questions';

/**
 * Get the total number of questions in a category
 * @param {string} category - The category to check
 * @returns {number} The total number of questions in that category
 */
export const getCategoryQuestionCount = (category) => {
  return getQuestionsByCategory(category).length;
};

/**
 * Check if a category is complete (all questions have been used)
 * @param {string} category - The category to check
 * @param {Object} usedQuestionIds - Object tracking used questions by category
 * @returns {boolean} True if all questions in the category have been used
 */
export const isCategoryCompleted = (category, usedQuestionIds = {}) => {
  const totalQuestions = getCategoryQuestionCount(category);
  const usedInCategory = (usedQuestionIds[category] || []).length;
  return usedInCategory >= totalQuestions;
};

/**
 * Get available categories (not completed)
 * @param {Set} completedCategories - Set of completed category names
 * @returns {Array} Array of available (not completed) category names
 */
export const getAvailableCategories = (allCategories, completedCategories = new Set()) => {
  return allCategories.filter(cat => !completedCategories.has(cat));
};

/**
 * Check if there are any available categories
 * @param {Array} allCategories - All available categories
 * @param {Set} completedCategories - Set of completed category names
 * @returns {boolean} True if at least one category is available
 */
export const hasAvailableCategories = (allCategories, completedCategories = new Set()) => {
  return getAvailableCategories(allCategories, completedCategories).length > 0;
};

/**
 * Get the number of completed categories
 * @param {Set} completedCategories - Set of completed category names
 * @returns {number} Number of completed categories
 */
export const getCompletedCategoryCount = (completedCategories = new Set()) => {
  return completedCategories.size;
};

/**
 * Reset all category completion tracking
 * Useful for starting a new game session
 * @returns {Set} Empty Set ready for new game
 */
export const resetCategoryTracking = () => {
  return new Set();
};

/**
 * Add a correctly answered question to the permanent category history
 * @param {string} questionId - The question ID
 * @param {string} category - The category name
 * @param {Object} correctAnswersByCategory - Current tracking object
 * @returns {Object} Updated tracking object
 */
export const addCorrectAnswer = (questionId, category, correctAnswersByCategory = {}) => {
  const updatedTracking = { ...correctAnswersByCategory };
  
  if (!updatedTracking[category]) {
    updatedTracking[category] = [];
  }
  
  // Store only the numeric ID without the category prefix (e.g., '031' instead of 'food_031')
  // This reduces storage by ~30-40%
  const numericId = questionId.split('_')[1] || questionId;
  
  // Avoid duplicates
  if (!updatedTracking[category].includes(numericId)) {
    updatedTracking[category].push(numericId);
  }
  
  return updatedTracking;
};

/**
 * Get all questions already answered correctly in a category
 * @param {string} category - The category name
 * @param {Object} correctAnswersByCategory - Tracking object
 * @returns {Array} Array of question IDs that were answered correctly
 */
export const getCorrectAnswersInCategory = (category, correctAnswersByCategory = {}) => {
  return correctAnswersByCategory[category] || [];
};

/**
 * Check if a specific question was answered correctly in the past
 * @param {string} questionId - The question ID (e.g., 'food_031')
 * @param {string} category - The category name
 * @param {Object} correctAnswersByCategory - Tracking object
 * @returns {boolean} True if the question was previously answered correctly
 */
export const isQuestionAnsweredCorrectly = (questionId, category, correctAnswersByCategory = {}) => {
  const categoryAnswers = correctAnswersByCategory[category] || [];
  // Extract numeric ID (e.g., '031' from 'food_031') since we store only numeric IDs
  const numericId = questionId.split('_')[1] || questionId;
  return categoryAnswers.includes(numericId);
};

/**
 * Get total count of questions answered correctly across all categories
 * @param {Object} correctAnswersByCategory - Tracking object
 * @returns {number} Total number of questions answered correctly
 */
export const getTotalCorrectAnswers = (correctAnswersByCategory = {}) => {
  return Object.values(correctAnswersByCategory).reduce((total, answers) => total + answers.length, 0);
};

/**
 * Get count of questions answered correctly in a specific category
 * @param {string} category - The category name
 * @param {Object} correctAnswersByCategory - Tracking object
 * @returns {number} Number of questions answered correctly in that category
 */
export const getCategoryCorrectAnswerCount = (category, correctAnswersByCategory = {}) => {
  return getCorrectAnswersInCategory(category, correctAnswersByCategory).length;
};

/**
 * Reset correct answers for a specific category (useful for practice mode)
 * @param {string} category - The category name
 * @param {Object} correctAnswersByCategory - Current tracking object
 * @returns {Object} Updated tracking object without that category
 */
export const resetCategoryCorrectAnswers = (category, correctAnswersByCategory = {}) => {
  const updatedTracking = { ...correctAnswersByCategory };
  delete updatedTracking[category];
  return updatedTracking;
};

/**
 * Add a question ID to the correctFirstTryIds set (session-scoped)
 * Stores only numeric IDs to reduce storage: 'food_031' -> '031'
 * @param {string} questionId - The question ID (e.g., 'food_031')
 * @param {Set} correctFirstTryIds - Current Set of first-try correct IDs
 * @returns {Set} Updated Set with numeric ID added
 */
export const addToCorrectFirstTry = (questionId, correctFirstTryIds = new Set()) => {
  // Extract numeric ID to reduce storage by ~60% (less critical for session data, but consistent)
  const numericId = questionId.split('_')[1] || questionId;
  return new Set([...correctFirstTryIds, numericId]);
};

/**
 * Check if a question was answered correctly on first try (session-scoped)
 * @param {string} questionId - The question ID (e.g., 'food_031')
 * @param {Set} correctFirstTryIds - Set of first-try correct IDs (numeric only)
 * @returns {boolean} True if the question was answered correctly on first try this session
 */
export const isFirstTryCorrect = (questionId, correctFirstTryIds = new Set()) => {
  const numericId = questionId.split('_')[1] || questionId;
  return correctFirstTryIds.has(numericId);
};

/**
 * Get count of questions answered correctly on first try
 * @param {Set} correctFirstTryIds - Set of first-try correct IDs
 * @returns {number} Number of first-try correct questions
 */
export const getFirstTryCorrectCount = (correctFirstTryIds = new Set()) => {
  return correctFirstTryIds.size;
};

/**
 * Add a question to the used questions by category
 * @param {string} questionId - The question ID (e.g., 'food_031')
 * @param {string} category - The category name
 * @param {Object} usedQuestionIds - Current tracking object organized by category
 * @returns {Object} Updated tracking object
 */
export const addUsedQuestion = (questionId, category, usedQuestionIds = {}) => {
  const updatedUsed = { ...usedQuestionIds };
  
  if (!updatedUsed[category]) {
    updatedUsed[category] = [];
  }
  
  // Store only numeric ID (e.g., '031' instead of 'food_031')
  const numericId = questionId.split('_')[1] || questionId;
  
  // Avoid duplicates
  if (!updatedUsed[category].includes(numericId)) {
    updatedUsed[category].push(numericId);
  }
  
  return updatedUsed;
};

/**
 * Check if a question has been used in the current session
 * @param {string} questionId - The question ID (e.g., 'food_031')
 * @param {string} category - The category name
 * @param {Object} usedQuestionIds - Tracking object organized by category
 * @returns {boolean} True if the question was used this session
 */
export const isQuestionUsed = (questionId, category, usedQuestionIds = {}) => {
  const categoryUsed = usedQuestionIds[category] || [];
  const numericId = questionId.split('_')[1] || questionId;
  return categoryUsed.includes(numericId);
};

/**
 * Get used questions in a specific category
 * @param {string} category - The category name
 * @param {Object} usedQuestionIds - Tracking object organized by category
 * @returns {Array} Array of numeric IDs used in that category
 */
export const getUsedQuestionsInCategory = (category, usedQuestionIds = {}) => {
  return usedQuestionIds[category] || [];
};

/**
 * Reset used questions for a specific category
 * @param {string} category - The category name
 * @param {Object} usedQuestionIds - Current tracking object
 * @returns {Object} Updated tracking object with that category cleared
 */
export const resetCategoryUsedQuestions = (category, usedQuestionIds = {}) => {
  const updatedUsed = { ...usedQuestionIds };
  delete updatedUsed[category];
  return updatedUsed;
};

/**
 * Get total count of used questions across all categories
 * @param {Object} usedQuestionIds - Tracking object organized by category
 * @returns {number} Total number of questions used this session
 */
export const getTotalUsedQuestions = (usedQuestionIds = {}) => {
  return Object.values(usedQuestionIds).reduce((total, used) => total + used.length, 0);
};

/**
 * Add a question to first-try correct by category (session-scoped)
 * @param {string} questionId - The question ID (e.g., 'food_031')
 * @param {string} category - The category name
 * @param {Object} correctFirstTryIds - Current tracking object organized by category
 * @returns {Object} Updated tracking object
 */
export const addToFirstTryByCategory = (questionId, category, correctFirstTryIds = {}) => {
  const updatedFirstTry = { ...correctFirstTryIds };
  
  if (!updatedFirstTry[category]) {
    updatedFirstTry[category] = [];
  }
  
  // Store only numeric ID (e.g., '031' instead of 'food_031')
  const numericId = questionId.split('_')[1] || questionId;
  
  // Avoid duplicates
  if (!updatedFirstTry[category].includes(numericId)) {
    updatedFirstTry[category].push(numericId);
  }
  
  return updatedFirstTry;
};

/**
 * Check if a question was answered correctly on first try
 * @param {string} questionId - The question ID (e.g., 'food_031')
 * @param {string} category - The category name
 * @param {Object} correctFirstTryIds - Tracking object organized by category
 * @returns {boolean} True if the question was answered correctly on first try
 */
export const isFirstTryCorrectByCategory = (questionId, category, correctFirstTryIds = {}) => {
  const categoryFirstTry = correctFirstTryIds[category] || [];
  const numericId = questionId.split('_')[1] || questionId;
  return categoryFirstTry.includes(numericId);
};

/**
 * Get first-try correct questions in a specific category
 * @param {string} category - The category name
 * @param {Object} correctFirstTryIds - Tracking object organized by category
 * @returns {Array} Array of numeric IDs answered correctly on first try
 */
export const getFirstTryCorrectInCategory = (category, correctFirstTryIds = {}) => {
  return correctFirstTryIds[category] || [];
};

/**
 * Get total count of questions answered correctly on first try across all categories
 * @param {Object} correctFirstTryIds - Tracking object organized by category
 * @returns {number} Total number of first-try correct questions
 */
export const getTotalFirstTryCorrect = (correctFirstTryIds = {}) => {
  return Object.values(correctFirstTryIds).reduce((total, firstTry) => total + firstTry.length, 0);
};

/**
 * Reset first-try correct questions for a specific category
 * @param {string} category - The category name
 * @param {Object} correctFirstTryIds - Current tracking object
 * @returns {Object} Updated tracking object with that category cleared
 */
export const resetCategoryFirstTryCorrect = (category, correctFirstTryIds = {}) => {
  const updatedFirstTry = { ...correctFirstTryIds };
  delete updatedFirstTry[category];
  return updatedFirstTry;
};
