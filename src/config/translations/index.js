/**
 * Modular Question Translations
 * 
 * This file combines translations from individual category files.
 * To add a new category:
 * 1. Create a new file in src/config/translations/{category}.js
 * 2. Export an object with the pattern: export const {category}Translations = { ... }
 * 3. Import and spread it in the questionTranslations object below
 */

// Import category-specific translations
import { animalsTranslations } from './animals.js';
import { beachTranslations } from './beach.js';
import { peopleTranslations } from './people.js';
import { foodTranslations } from './food.js';
import { shoppingTranslations } from './shopping.js';
import { entertainmentTranslations } from './entertainment.js';
import { accommodationTranslations } from './accommodation.js';
import { transportationTranslations } from './transportation.js';
import { directionsTranslations } from './directions.js';
import { emergenciesTranslations } from './emergencies.js';
import { greetingsTranslations } from './greetings.js';
import { numbersTranslations } from './numbers.js';
import { grammarTranslations } from './grammar.js';
import { dailyRoutinesTranslations } from './daily_routines.js';
import { restaurantTranslations } from './restaurant.js';
import { weatherTranslations } from './weather.js';

/**
 * Combined question translations from all categories
 * 
 * ✅ = Completed with translations
 * ⏳ = File created, needs content extracted from old file
 */
export const questionTranslations = {
  // ✅ Completed categories
  ...animalsTranslations,
  ...beachTranslations,
  ...peopleTranslations,
  ...foodTranslations,
  
  // ⏳ TODO: Extract translations from question-translations.js
  ...shoppingTranslations,
  ...entertainmentTranslations,
  ...accommodationTranslations,
  ...transportationTranslations,
  ...directionsTranslations,
  ...emergenciesTranslations,
  ...greetingsTranslations,
  ...numbersTranslations,
  ...grammarTranslations,
  ...dailyRoutinesTranslations,
  ...restaurantTranslations,
  ...weatherTranslations,
};

/**
 * Get English translation for a Spanish question
 * @param {string} question - The Spanish question text
 * @returns {string} - The English translation, or the original if not found
 */
export function getQuestionTranslation(question) {
  return questionTranslations[question] || question;
}

/**
 * Check if a translation exists for a question
 * @param {string} question - The Spanish question text
 * @returns {boolean} - True if translation exists
 */
export function hasQuestionTranslation(question) {
  return question in questionTranslations;
}
