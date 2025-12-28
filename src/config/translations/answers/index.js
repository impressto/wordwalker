/**
 * Unified Answer Translations Index
 * Aggregates all category-based answer translations
 * 
 * This file provides both unified and category-specific translation access
 * to handle cases where the same Spanish word has different English translations
 * in different categories (e.g., "el kiwi" = "the kiwi" in food, "the kiwi bird" in plants_animals)
 */

import { foodAnswerTranslations } from './food.js';
import { shoppingAnswerTranslations } from './shopping.js';
import { entertainmentAnswerTranslations } from './entertainment.js';
import { accommodationAnswerTranslations } from './accommodation.js';
import { transportationAnswerTranslations } from './transportation.js';
import { directionsAnswerTranslations } from './directions.js';
import { medicalAnswerTranslations } from './medical.js';
import { greetingsAnswerTranslations } from './greetings.js';
import { numbersAnswerTranslations } from './numbers.js';
import { grammarAnswerTranslations } from './grammar.js';
import { recreationAnswerTranslations } from './recreation.js';
import { plantsAnimalsAnswerTranslations } from './plants_animals.js';
import { peopleAnswerTranslations } from './people.js';
import { dailyroutinesAnswerTranslations } from './daily_routines.js';
import { businessAnswerTranslations } from './business.js';
import { weatherAnswerTranslations } from './weather.js';

/**
 * Category-specific translations map
 * Allows direct access to translations by category name
 */
export const translationsByCategory = {
  food: foodAnswerTranslations,
  shopping: shoppingAnswerTranslations,
  entertainment: entertainmentAnswerTranslations,
  accommodation: accommodationAnswerTranslations,
  transportation: transportationAnswerTranslations,
  directions: directionsAnswerTranslations,
  medical: medicalAnswerTranslations,
  greetings: greetingsAnswerTranslations,
  numbers: numbersAnswerTranslations,
  grammar: grammarAnswerTranslations,
  recreation: recreationAnswerTranslations,
  plants_animals: plantsAnimalsAnswerTranslations,
  people: peopleAnswerTranslations,
  daily_routines: dailyroutinesAnswerTranslations,
  business: businessAnswerTranslations,
  weather: weatherAnswerTranslations,
};

/**
 * Combined translations object (for backward compatibility)
 * Maps Spanish words/phrases to their English equivalents
 * 
 * NOTE: Order matters! If multiple categories share the same Spanish key,
 * later entries will overwrite earlier ones. For example, "el kiwi" appears
 * in both plants_animals (bird) and food (fruit). Food comes last to ensure
 * the fruit translation takes precedence as the more common usage.
 * 
 * RECOMMENDED: Use getCategoryTranslation() instead for category-aware lookups.
 */
export const translations = {
  ...shoppingAnswerTranslations,
  ...entertainmentAnswerTranslations,
  ...accommodationAnswerTranslations,
  ...transportationAnswerTranslations,
  ...directionsAnswerTranslations,
  ...medicalAnswerTranslations,
  ...greetingsAnswerTranslations,
  ...numbersAnswerTranslations,
  ...grammarAnswerTranslations,
  ...recreationAnswerTranslations,
  ...plantsAnimalsAnswerTranslations,
  ...peopleAnswerTranslations,
  ...dailyroutinesAnswerTranslations,
  ...businessAnswerTranslations,
  ...weatherAnswerTranslations,
  ...foodAnswerTranslations,  // Moved to last to take precedence for shared keys like "el kiwi"
};

/**
 * Get translation for a Spanish word/phrase from a specific category
 * This is the RECOMMENDED way to get translations as it respects category context.
 * 
 * @param {string} spanish - The Spanish word or phrase
 * @param {string} category - The category name (e.g., 'food', 'plants_animals')
 * @returns {string|undefined} The English translation or undefined if not found
 * 
 * @example
 * getCategoryTranslation('el kiwi', 'food') // Returns: 'the kiwi'
 * getCategoryTranslation('el kiwi', 'plants_animals') // Returns: 'the kiwi bird'
 */
export function getCategoryTranslation(spanish, category) {
  if (!category) {
    return translations[spanish];
  }
  
  const categoryTranslations = translationsByCategory[category];
  if (!categoryTranslations) {
    // Fallback to combined translations if category not found
    return translations[spanish];
  }
  
  return categoryTranslations[spanish];
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
