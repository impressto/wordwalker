/**
 * Lazy Loading Translations Configuration
 * 
 * This module provides functions to dynamically load translations on-demand,
 * significantly reducing the initial bundle size.
 * 
 * Translations are loaded only when needed and cached in memory after first load.
 */

// Cache for loaded translations
let translationsCache = null;
let exampleTranslationsCache = null;

/**
 * Load answer translations
 * @returns {Promise<Object>} Translations object
 */
export async function loadTranslations() {
  if (!translationsCache) {
    const module = await import('./translations/answers/index.js');
    translationsCache = module.translations;
  }
  return translationsCache;
}

/**
 * Load example translations (for flash cards)
 * @returns {Promise<Object>} Example translations object
 */
export async function loadExampleTranslations() {
  if (!exampleTranslationsCache) {
    const module = await import('./translations/example_translations.js');
    exampleTranslationsCache = module.exampleTranslations;
  }
  return exampleTranslationsCache;
}

/**
 * Get translation for a Spanish word/phrase
 * @param {string} spanish - The Spanish word or phrase
 * @returns {Promise<string|undefined>} The English translation or undefined if not found
 */
export async function getTranslation(spanish) {
  const translations = await loadTranslations();
  return translations[spanish];
}

/**
 * Get translation for a Spanish word/phrase from a specific category
 * Note: Category parameter is ignored but kept for backwards compatibility
 * @param {string} spanish - The Spanish word or phrase
 * @param {string} category - The category name (ignored)
 * @returns {Promise<string|undefined>} The English translation or undefined if not found
 */
export async function getCategoryTranslation(spanish, category) {
  return await getTranslation(spanish);
}

/**
 * Check if a translation exists
 * @param {string} spanish - The Spanish word or phrase
 * @returns {Promise<boolean>} True if translation exists
 */
export async function hasTranslation(spanish) {
  const translations = await loadTranslations();
  return spanish in translations;
}

/**
 * Preload all translations (for offline support)
 * @returns {Promise<void>}
 */
export async function preloadAllTranslations() {
  await Promise.all([
    loadTranslations(),
    loadExampleTranslations()
  ]);
}

/**
 * Get the translations object (loads if not cached)
 * This is useful for components that need direct access to the full translations object
 * @returns {Promise<Object>} Complete translations object
 */
export async function getTranslationsObject() {
  return await loadTranslations();
}

/**
 * Get the example translations object (loads if not cached)
 * @returns {Promise<Object>} Complete example translations object
 */
export async function getExampleTranslationsObject() {
  return await loadExampleTranslations();
}
