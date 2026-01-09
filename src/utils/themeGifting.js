/**
 * Theme Gifting Utilities
 * Randomly gifts themes to new users for A/B testing stickiness experiments
 */

import { getShopThemes } from '../config/themeShopConfig';

/**
 * Check if this is the user's first visit
 * @returns {boolean} True if first visit
 */
export const isFirstTimeUser = () => {
  return !localStorage.getItem('wordwalker-initialized');
};

/**
 * Mark user as initialized (not first time anymore)
 */
export const markUserInitialized = () => {
  localStorage.setItem('wordwalker-initialized', 'true');
  localStorage.setItem('wordwalker-init-timestamp', new Date().toISOString());
};

/**
 * Randomly select a theme from available themes (excluding default)
 * @returns {string|null} Theme ID or null if no themes to gift
 */
export const selectRandomTheme = () => {
  const themes = getShopThemes();
  
  // Get only purchasable themes (exclude default, get enabled themes)
  const giftableThemes = themes.filter(t => 
    t.id !== 'default' && t.enabled && t.cost > 0
  );
  
  if (giftableThemes.length === 0) {
    return null;
  }
  
  // Select random theme
  const randomIndex = Math.floor(Math.random() * giftableThemes.length);
  return giftableThemes[randomIndex].id;
};

/**
 * Gift a random theme to the user
 * Tracks the gift for analytics purposes
 * @param {string[]} currentOwnedThemes - Current owned themes array
 * @returns {Object} Result object with giftedTheme and updatedOwnedThemes
 */
export const giftRandomTheme = (currentOwnedThemes = ['default']) => {
  const giftedTheme = selectRandomTheme();
  
  if (!giftedTheme) {
    return {
      giftedTheme: null,
      updatedOwnedThemes: currentOwnedThemes,
    };
  }
  
  // Add gifted theme to owned themes if not already owned
  const updatedOwnedThemes = currentOwnedThemes.includes(giftedTheme)
    ? currentOwnedThemes
    : [...currentOwnedThemes, giftedTheme];
  
  // Track gift for analytics
  const giftData = {
    theme: giftedTheme,
    timestamp: new Date().toISOString(),
    experimentGroup: 'theme-gift',
  };
  localStorage.setItem('wordwalker-gifted-theme', JSON.stringify(giftData));
  
  return {
    giftedTheme,
    updatedOwnedThemes,
  };
};

/**
 * Get information about any gifted theme (for analytics)
 * @returns {Object|null} Gift data or null if no gift
 */
export const getGiftedThemeInfo = () => {
  const giftDataStr = localStorage.getItem('wordwalker-gifted-theme');
  if (!giftDataStr) {
    return null;
  }
  
  try {
    return JSON.parse(giftDataStr);
  } catch (error) {
    return null;
  }
};

/**
 * Check if user received a gifted theme
 * @returns {boolean} True if user has a gifted theme
 */
export const hasGiftedTheme = () => {
  return getGiftedThemeInfo() !== null;
};

/**
 * Get user's experiment group (for analytics segmentation)
 * @returns {string} 'theme-gift' if received gift, 'control' if not, 'existing' if not new user
 */
export const getUserExperimentGroup = () => {
  if (!localStorage.getItem('wordwalker-initialized')) {
    return 'new-user-pending';
  }
  
  if (hasGiftedTheme()) {
    return 'theme-gift';
  }
  
  // Check if user was initialized before theme gifting feature
  const initTimestamp = localStorage.getItem('wordwalker-init-timestamp');
  if (!initTimestamp) {
    return 'existing-user';
  }
  
  return 'control';
};
