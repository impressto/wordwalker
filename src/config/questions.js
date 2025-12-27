/**
 * WordWalk Learning Questions Configuration
 * 
 * This file re-exports all questions and utilities from the modular questions directory.
 * Individual category questions are now organized in separate files for better maintainability.
 * 
 * Structure for each question:
 * {
 *   id: unique identifier
 *   emoji: unicode emoji character
 *   question: the question text to display
 *   options: array of 3-4 possible answers
 *   correctAnswer: the correct answer (must match one option exactly)
 *   hint: helpful clue (not the direct answer)
 *   points: points awarded for correct answer on first attempt
 *   category: topic category (food, shopping, entertainment, etc.)
 *   difficulty: easy, medium, hard
 * }
 */

// Export categories
export { 
  categories, 
  getAllCategoryIds, 
  getCategoryById 
} from './questions/categories.js';

// Export all questions and helper functions
export {
  questions,
  foodQuestions,
  shoppingQuestions,
  entertainmentQuestions,
  accommodationQuestions,
  transportationQuestions,
  directionsQuestions,
  emergenciesQuestions,
  greetingsQuestions,
  numbersQuestions,
  grammarQuestions,
  recreationQuestions,
  plantsAnimalsQuestions,
  getQuestionsByCategory,
  getRandomQuestionByCategory,
  getRandomUnusedQuestionByCategory,
  getUnmasteredQuestionCount,
  getQuestionIdsByCategory,
  shuffleOptions,
} from './questions/index.js';
