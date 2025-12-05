/**
 * Unified Answer Translations Index
 * Aggregates all category-based answer translations
 * 
 * This file provides backward compatibility with the original
 * answer-translations.js structure while organizing translations
 * by category for better maintainability.
 */

import { foodAnswerTranslations } from './food.js';
import { shoppingAnswerTranslations } from './shopping.js';
import { entertainmentAnswerTranslations } from './entertainment.js';
import { accommodationAnswerTranslations } from './accommodation.js';
import { transportationAnswerTranslations } from './transportation.js';
import { directionsAnswerTranslations } from './directions.js';
import { emergenciesAnswerTranslations } from './emergencies.js';
import { greetingsAnswerTranslations } from './greetings.js';
import { numbersAnswerTranslations } from './numbers.js';
import { grammarAnswerTranslations } from './grammar.js';
import { beachAnswerTranslations } from './beach.js';
import { animalsAnswerTranslations } from './animals.js';
import { peopleAnswerTranslations } from './people.js';
import { dailyroutinesAnswerTranslations } from './daily_routines.js';
import { restaurantAnswerTranslations } from './restaurant.js';
import { weatherAnswerTranslations } from './weather.js';

/**
 * Combined translations object
 * Maps Spanish words/phrases to their English equivalents
 */
export const translations = {
  ...foodAnswerTranslations,
  ...shoppingAnswerTranslations,
  ...entertainmentAnswerTranslations,
  ...accommodationAnswerTranslations,
  ...transportationAnswerTranslations,
  ...directionsAnswerTranslations,
  ...emergenciesAnswerTranslations,
  ...greetingsAnswerTranslations,
  ...numbersAnswerTranslations,
  ...grammarAnswerTranslations,
  ...beachAnswerTranslations,
  ...animalsAnswerTranslations,
  ...peopleAnswerTranslations,
  ...dailyroutinesAnswerTranslations,
  ...restaurantAnswerTranslations,
  ...weatherAnswerTranslations,
};

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
