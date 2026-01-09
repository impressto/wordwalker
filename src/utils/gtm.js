/**
 * Google Tag Manager utility functions
 * Provides consistent event tracking throughout the app
 */

import { getUserExperimentGroup, getGiftedThemeInfo } from './themeGifting';

/**
 * Initialize GTM data layer with experiment data
 * Call this once when the app loads
 */
export const initializeDataLayer = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      experiment_group: getUserExperimentGroup(),
      gifted_theme: getGiftedThemeInfo()?.theme || null
    });
  }
};

/**
 * Send an event to Google Tag Manager
 * @param {string} event - Event name
 * @param {Object} data - Additional event data
 */
export const trackEvent = (event, data = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event,
      ...data
    });
  }
};

/**
 * Track category selection
 * @param {string} categoryId - Category ID
 * @param {string} categoryName - Category display name
 */
export const trackCategorySelection = (categoryId, categoryName) => {
  trackEvent('category_selected', {
    category_id: categoryId,
    category_name: categoryName
  });
};

/**
 * Track question answer
 * @param {string} categoryId - Category ID
 * @param {string} categoryName - Category display name
 * @param {boolean} correct - Whether answer was correct
 * @param {boolean} firstAttempt - Whether this was first attempt
 * @param {number} streak - Current streak count
 */
export const trackQuestionAnswer = (categoryId, categoryName, correct, firstAttempt, streak) => {
  trackEvent('question_answered', {
    category_id: categoryId,
    category_name: categoryName,
    correct,
    first_attempt: firstAttempt,
    streak
  });
};

/**
 * Track category completion
 * @param {string} categoryId - Category ID
 * @param {string} categoryName - Category display name
 * @param {number} streak - Final streak count
 */
export const trackCategoryCompletion = (categoryId, categoryName, streak) => {
  trackEvent('category_completed', {
    category_id: categoryId,
    category_name: categoryName,
    streak
  });
};

/**
 * Track character/theme purchase
 * @param {string} type - 'character' or 'theme'
 * @param {string} id - Item ID
 * @param {number} cost - Item cost
 */
export const trackPurchase = (type, id, cost) => {
  trackEvent('purchase', {
    purchase_type: type,
    item_id: id,
    cost
  });
};

/**
 * Track flash cards usage
 * @param {string} categoryId - Category ID
 * @param {string} categoryName - Category display name
 * @param {string} action - 'opened' or 'completed'
 */
export const trackFlashCards = (categoryId, categoryName, action) => {
  trackEvent('flash_cards', {
    category_id: categoryId,
    category_name: categoryName,
    action
  });
};

/**
 * Track game mode change
 * @param {string} mode - 'multichoice' or 'flashcard'
 */
export const trackGameModeChange = (mode) => {
  trackEvent('game_mode_changed', {
    game_mode: mode
  });
};
