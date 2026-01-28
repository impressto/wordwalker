/**
 * Category Rotation Utilities
 * 
 * Manages the rotation and selection of categories to ensure variety
 * in category presentation across multiple game sessions
 */

import { getAllCategoryIds } from '../config/questionsLoader';

/**
 * Generate new fork categories, prioritizing unpresented categories
 * @param {Set} completedCategories - Categories that have been completed
 * @param {Set} presentedCategories - Categories that have already been shown to the user
 * @param {string|null} excludeCategory - Category to exclude from selection (e.g., currently active)
 * @param {Set} additionalCompleted - Additional categories to treat as completed
 * @returns {Object} Object with choice1-4 keys mapping to category IDs
 */
export const generateNewForkCategories = (
  completedCategories = new Set(),
  presentedCategories = new Set(),
  excludeCategory = null,
  additionalCompleted = new Set()
) => {
  const allCategories = getAllCategoryIds();
  
  // Combine all completed categories
  const allCompletedCategories = new Set([...completedCategories, ...additionalCompleted]);
  
  // First priority: Get categories that haven't been presented yet and aren't completed
  let availableCategories = allCategories.filter(cat => 
    !allCompletedCategories.has(cat) && 
    cat !== excludeCategory &&
    !presentedCategories.has(cat)
  );
  
  // Second priority: If we don't have enough unpresented categories, include previously presented ones
  if (availableCategories.length < 4) {
    availableCategories = allCategories.filter(cat => 
      !allCompletedCategories.has(cat) && cat !== excludeCategory
    );
  }
  
  // Third priority: If still not enough (all categories completed), use all categories except current
  let categoriesToUse = availableCategories;
  if (availableCategories.length < 4) {
    categoriesToUse = allCategories.filter(cat => cat !== excludeCategory);
  }
  
  // Shuffle the final list for randomness
  const shuffled = [...categoriesToUse].sort(() => Math.random() - 0.5);
  
  // Return an object with choice1-4 keys (compatible with path choice system)
  return {
    choice1: shuffled[0] || 'food',
    choice2: shuffled[1] || 'shopping',
    choice3: shuffled[2] || 'entertainment',
    choice4: shuffled[3] || 'accommodation'
  };
};

/**
 * Check if presented categories should be reset (all available categories have been shown)
 * @param {Set} presentedCategories - Categories that have been presented
 * @param {Set} completedCategories - Categories that have been completed
 * @returns {boolean} True if presented categories should be reset
 */
export const shouldResetPresentedCategories = (
  presentedCategories = new Set(),
  completedCategories = new Set()
) => {
  const allCategories = getAllCategoryIds();
  const availableCategories = allCategories.filter(cat => !completedCategories.has(cat));
  
  // If all available categories have been presented, we should reset
  return availableCategories.every(cat => presentedCategories.has(cat));
};

/**
 * Get the new categories to add to presentedCategories
 * @param {Object} forkCategories - Object with choice1-4 keys
 * @returns {Array} Array of category IDs from the fork categories
 */
export const extractCategoryIds = (forkCategories) => {
  return Object.values(forkCategories);
};

/**
 * Initialize fork categories for a new game
 * @returns {Object} Object with choice1-4 keys mapping to randomly selected category IDs
 */
export const initializeForkCategories = () => {
  const allCategories = getAllCategoryIds();
  const shuffled = [...allCategories].sort(() => Math.random() - 0.5);
  
  return {
    choice1: shuffled[0] || 'food',
    choice2: shuffled[1] || 'shopping',
    choice3: shuffled[2] || 'entertainment',
    choice4: shuffled[3] || 'accommodation'
  };
};
