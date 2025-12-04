/**
 * Game State Persistence Utilities
 * 
 * Provides functions for saving and loading game state to/from localStorage
 * This allows users to resume their game session after closing the app
 */

const STORAGE_KEY = 'wordwalker-game-state';
const AUTOSAVE_INTERVAL = 5000; // Auto-save every 5 seconds

/**
 * Get the persisted game state from localStorage
 * @returns {Object|null} The saved game state or null if none exists
 */
export const loadGameState = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const state = JSON.parse(savedState);
      return state;
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
  return null;
};

/**
 * Save the current game state to localStorage
 * @param {Object} gameState - The game state object to save
 */
export const saveGameState = (gameState) => {
  try {
    // Convert Sets to Arrays for JSON serialization
    const serializableState = {
      ...gameState,
      usedQuestionIds: gameState.usedQuestionIds || {}, // Now an object organized by category
      completedCategories: Array.from(gameState.completedCategories || []),
      correctFirstTryIds: gameState.correctFirstTryIds || {}, // Now an object organized by category
      correctAnswersByCategory: gameState.correctAnswersByCategory || {}, // Persistent tracking across sessions
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

/**
 * Clear the saved game state from localStorage
 */
export const clearGameState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};

/**
 * Check if there is a saved game state
 * @returns {boolean} True if a saved game state exists
 */
export const hasSavedGameState = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Failed to check saved game state:', error);
    return false;
  }
};

/**
 * Convert the loaded game state back to the proper format
 * (restore Sets from Arrays)
 * @param {Object} loadedState - The state loaded from localStorage
 * @returns {Object} The state with proper data types
 */
export const convertLoadedState = (loadedState) => {
  if (!loadedState) return null;

  // Ensure forkCategories is a valid object with choice1-4 keys
  const defaultForkCategories = { 
    choice1: 'food', 
    choice2: 'shopping', 
    choice3: 'entertainment', 
    choice4: 'accommodation' 
  };
  
  const forkCategories = loadedState.forkCategories;
  // Validate that forkCategories has all required keys, otherwise use defaults
  const validForkCategories = (
    forkCategories && 
    typeof forkCategories === 'object' && 
    forkCategories.choice1 && 
    forkCategories.choice2 && 
    forkCategories.choice3 && 
    forkCategories.choice4
  ) ? forkCategories : defaultForkCategories;

  return {
    ...loadedState,
    usedQuestionIds: loadedState.usedQuestionIds || {}, // Now an object organized by category
    completedCategories: new Set(loadedState.completedCategories || []),
    correctFirstTryIds: loadedState.correctFirstTryIds || {}, // Now an object organized by category
    correctAnswersByCategory: loadedState.correctAnswersByCategory || {}, // Restore category-based correct answer tracking
    forkCategories: validForkCategories, // Validate fork categories
  };
};

/**
 * Extract game state from component state
 * Returns only the game data that should be persisted
 * @param {Object} componentState - The component state
 * @returns {Object} The game state to persist
 */
export const extractGameState = (componentState) => {
  return {
    totalPoints: componentState.totalPoints,
    streak: componentState.streak,
    selectedPath: componentState.selectedPath,
    checkpointsAnswered: componentState.checkpointsAnswered,
    usedQuestionIds: componentState.usedQuestionIds,
    completedCategories: componentState.completedCategories,
    forkCategories: componentState.forkCategories,
    soundEnabled: componentState.soundEnabled,
    volume: componentState.volume,
    correctAnswersByCategory: componentState.correctAnswersByCategory, // Persistent learning data
    // Include position data for visual resume
    offsetRef: componentState.offsetRef,
    velocityRef: componentState.velocityRef,
    walkerFrameRef: componentState.walkerFrameRef,
  };
};

/**
 * Create a resume dialog options object
 * @returns {Object} Options for the resume dialog
 */
export const getResumeDialogOptions = () => {
  return {
    title: 'Resume Game?',
    message: 'Would you like to resume your previous game or start fresh?',
    resumeButtonText: 'Resume',
    newGameButtonText: 'New Game',
  };
};
