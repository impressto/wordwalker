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
      usedQuestionIds: Array.from(gameState.usedQuestionIds || []),
      completedCategories: Array.from(gameState.completedCategories || []),
      correctFirstTryIds: Array.from(gameState.correctFirstTryIds || []),
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

  return {
    ...loadedState,
    usedQuestionIds: new Set(loadedState.usedQuestionIds || []),
    completedCategories: new Set(loadedState.completedCategories || []),
    correctFirstTryIds: new Set(loadedState.correctFirstTryIds || []),
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
