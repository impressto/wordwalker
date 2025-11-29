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
 * @param {Set} usedQuestionIds - Set of question IDs that have been used
 * @returns {boolean} True if all questions in the category have been used
 */
export const isCategoryCompleted = (category, usedQuestionIds = new Set()) => {
  const totalQuestions = getCategoryQuestionCount(category);
  const categoryQuestions = getQuestionsByCategory(category);
  const usedInCategory = categoryQuestions.filter(q => usedQuestionIds.has(q.id)).length;
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
