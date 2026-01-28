/**
 * Flash Cards Configuration
 * 
 * Unified configuration for all flash card categories
 * Flash cards now dynamically generated from questions data
 */

import { getQuestionsByCategory } from './questionsLoader.js';
import { getCategoryTranslation } from './translationsLoader.js';

/**
 * FEATURE FLAG: Enable/Disable Flash Cards
 * Set to false to disable flash cards feature globally
 * Useful for testing or temporarily disabling the feature
 */
export const FLASH_CARDS_ENABLED = false;

/**
 * Available emotions for character expressions
 * Used when no emotion is specified for a question
 */
const AVAILABLE_EMOTIONS = [
  'afraid',
  'anxious',
  'calm',
  'confused',
  'determined',
  'disgusted',
  'excited',
  'happy',
  'hurt',
  'neutral',
  'pleased',
  'sad',
  'surprised'
];

/**
 * Get a random emotion from available emotions
 * @returns {string} Random emotion name (without .png extension)
 */
const getRandomEmotion = () => {
  return AVAILABLE_EMOTIONS[Math.floor(Math.random() * AVAILABLE_EMOTIONS.length)];
};

/**
 * Unified Flash Cards Configuration
 * This configuration applies to ALL categories
 */
export const flashCardsConfig = {
  // Canvas display size
  canvasWidth: 400,
  canvasHeight: 240,
  
  // Character image dimensions (all character images are 220x220)
  characterWidth: 220,
  characterHeight: 220,
  characterScale: 0.8, // Scale factor for character display (0.8 = 80% of original size)
  
  // Available characters for random selection
  availableCharacters: ['asuka', 'emma', 'steamboatwillie', 'elvis'],
  
  // Default assets for dynamic card generation
  defaultCharacter: 'emma',
  defaultEmotion: 'happy.png',
  
  // Text rendering configuration
  text: {
    // Text alignment configuration
    align: 'center', // 'left', 'right', or 'center'
    leftMargin: 20, // Margin from edge (pixels from left when text is left-aligned, from right when right-aligned)
    
    // Spanish text configuration (main text)
    spanish: {
      fontSize: 34,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#FFFFFF',
      maxWidth: 350, // Max width before wrapping (adjusted for 380px canvas)
      lineHeight: 1.0, // Reduced to minimize gap with English text
    },
    // English text configuration (translation below)
    english: {
      fontSize: 25,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      color: '#4caf50',
      maxWidth: 350, // Adjusted to match Spanish
      lineHeight: 1.2,
    },
    // Vertical spacing
    verticalSpacing: 1, // Space between Spanish and English text
    // Top margin for text
    topMargin: 7, // Reduced to move text closer to top
  },
  
  // Speech bubble configuration (for usage examples)
  speechBubble: {
    size: 55, // Size of the clickable area (in pixels)
    offsetX: -20, // Horizontal offset from character edge when character is on RIGHT (reversed layout)
    offsetXLeft: -50, // Horizontal offset from character edge when character is on LEFT (normal layout)
    offsetY: 20, // Vertical offset from character top (negative = above character)
    imageScale: 1.5, // Scale multiplier for the speech bubble image relative to size
    earIconOffsetY: -5, // Fine-tune vertical position of ear icon (positive = down, negative = up)    
    opacity: 0.7 // Transparency of speech bubble (0 = fully transparent, 1 = fully opaque)
  },
  
  // Theme-specific text color overrides
  // Allows customizing English translation color per theme for better visibility
  themeColors: {
    default: {
      english: '#99f7ef', // Green - matches config above
    },
    jamaica: {
      english: '#FFD700', // Gold - stands out against Jamaica's vibrant colors
    },
    'hong-kong': {
      english: '#ecc09c', // Coral red - contrasts with Hong Kong cityscape
    },
    'dia-de-los-muertos': {
      english: '#e1b0ee', // Dark turquoise - pops against Day of the Dead colors
    },
    paris: {
      english: '#4244a3', // Deep pink - contrasts with Paris romantic tones
    },
    nassau: {
      english: '#FFE66D', // Light yellow - visible against Nassau's tropical blues
    },
  },  
    
};

/**
 * Get flash card configuration (always returns the unified config)
 * @param {string} category - The category ID (for compatibility)
 * @returns {Object} The unified flash cards configuration
 */
export const getFlashCardConfig = (category) => {
  return flashCardsConfig;
};

/**
 * Get flash card data for a specific card index
 * Now dynamically generated from questions data
 * @param {string} category - The category ID
 * @param {number} cardIndex - The index of the card (0-based)
 * @param {string} selectedCharacter - Optional character name to use (if not provided, uses default)
 * @param {string} theme - Optional theme name for color overrides (defaults to 'default')
 * @returns {Promise<Object|null>} Object with spanish text, english text, emoji, and image paths, or null if not found
 */
export const getFlashCardData = async (category, cardIndex, selectedCharacter = null, theme = 'default') => {
  // Get questions for this category
  const categoryQuestions = await getQuestionsByCategory(category);
  
  // Check if question exists at this index
  if (!categoryQuestions || cardIndex >= categoryQuestions.length) {
    return null;
  }
  
  const question = categoryQuestions[cardIndex];
  
  // Extract the correct answer as the Spanish text
  const spanish = question.correctAnswer;
  
  // Get English translation using the category-specific translation system
  const english = await getCategoryTranslation(spanish, category) || spanish;
  
  // Determine emotion to use:
  // 1. If question has emotion property, use it
  // 2. Otherwise, use a random emotion from available emotions
  // Expected format: "confused" (which maps to confused.png)
  const emotionFile = question.emotion 
    ? `${question.emotion}.png` 
    : `${getRandomEmotion()}.png`;
  
  // Use selected character if provided, otherwise use default
  const characterToUse = selectedCharacter || flashCardsConfig.defaultCharacter;
  
  // Get theme-specific color overrides
  const themeConfig = flashCardsConfig.themeColors[theme] || flashCardsConfig.themeColors.default;
  
  return {
    spanish: spanish,
    english: english,
    emoji: question.emoji, // Use the emoji from the question
    usageExample: question.usageExample, // Optional usage example
    emojiPosition: undefined, // Use default positioning
    textAlign: undefined, // Use default from config
    leftMargin: undefined,
    spanishColor: question.spanishColor, // Optional per-question override
    englishColor: question.englishColor || themeConfig.english, // Use question override, theme override, or default
    spanishPosition: undefined,
    englishPosition: undefined,
    // Image paths for dynamic composition
    images: {
      background: undefined,
      character: characterToUse,
      emotion: emotionFile,
      object: undefined,
    },
  };
};

/**
 * Get total number of cards for a category
 * Now based on the number of questions in the category
 * @param {string} category - The category ID
 * @returns {Promise<number>} Number of cards in the category
 */
export const getCategoryCardCount = async (category) => {
  const categoryQuestions = await getQuestionsByCategory(category);
  return categoryQuestions ? categoryQuestions.length : 0;
};

/**
 * Check if a category has flash cards configured
 * Now checks if category has questions
 * @param {string} category - The category ID
 * @returns {Promise<boolean>} True if category has questions and feature is enabled
 */
export const hasFlashCards = async (category) => {
  if (!FLASH_CARDS_ENABLED) {
    console.log('[Flash Cards] Feature is DISABLED globally');
    return false;
  }
  const categoryQuestions = await getQuestionsByCategory(category);
  const hasQuestions = categoryQuestions && categoryQuestions.length > 0;
  console.log(`[Flash Cards] Category "${category}" has questions: ${hasQuestions}, feature enabled: ${FLASH_CARDS_ENABLED}`);
  return hasQuestions;
};

/**
 * Get all categories that have flash cards configured
 * Now returns all categories that have questions
 * @returns {string[]} Array of category IDs (empty if feature is disabled)
 */
export const getFlashCardCategories = () => {
  if (!FLASH_CARDS_ENABLED) return [];
  // For now, return a static list of known categories
  // This could be improved by scanning all question categories
  return ['food', 'shopping', 'entertainment', 'accommodation', 'transportation', 
          'directions', 'medical', 'greetings', 'numbers', 'grammar', 
          'recreation', 'plants_animals', 'environment', 'daily_routines', 'people',
          'emergencies', 'business', 'restaurant'];
};
