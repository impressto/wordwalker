/**
 * Unified Answer Translations Index
 * Re-exports consolidated translations
 */

import { translations } from './answer_translations.js';

export { translations };

/**
 * Get translation for a Spanish word/phrase from a specific category
 * Note: Since all translations are now consolidated, category parameter is ignored.
 * This function is kept for backwards compatibility.
 * 
 * @param {string} spanish - The Spanish word or phrase
 * @param {string} category - The category name (ignored, kept for compatibility)
 * @returns {string|undefined} The English translation or undefined if not found
 * 
 * @example
 * getCategoryTranslation('el kiwi', 'food') // Returns: 'the kiwi'
 */
export function getCategoryTranslation(spanish, category) {
  return translations[spanish];
}

/**
 * Get translation for a Spanish word/phrase
 * @param {string} spanish - The Spanish word or phrase
 * @returns {string|undefined} The English translation or undefined if not found
 */
export function getTranslation(spanish) {
  return translations[spanish];
}

/**
 * Check if a translation exists
 * @param {string} spanish - The Spanish word or phrase
 * @returns {boolean} True if translation exists
 */
export function hasTranslation(spanish) {
  return spanish in translations;
}
