/**
 * Theme Management Utilities
 * Functions to manage and switch between parallax themes
 */

import { getTheme, getThemeIds, themeExists } from '../config/parallaxThemes';

/**
 * Set the current active theme
 * Stores the theme preference in localStorage
 * @param {string} themeId - The theme identifier
 * @returns {boolean} True if theme was successfully set, false if theme doesn't exist
 */
export const setActiveTheme = (themeId) => {
  if (!themeExists(themeId)) {
    return false;
  }
  
  localStorage.setItem('wordwalker-current-theme', themeId);
  return true;
};

/**
 * Get the currently active theme ID
 * @returns {string} The current theme ID
 */
export const getActiveTheme = () => {
  return localStorage.getItem('wordwalker-current-theme') || 'default';
};

/**
 * Get the current theme configuration
 * @returns {object} The current theme configuration
 */
export const getCurrentThemeConfig = () => {
  const themeId = getActiveTheme();
  return getTheme(themeId);
};

/**
 * Get all available themes as an array for UI selection
 * @returns {array} Array of themes with id, name, and description
 */
export const getThemesList = () => {
  return getThemeIds().map(themeId => {
    const theme = getTheme(themeId);
    return {
      id: themeId,
      name: theme.name,
      description: theme.description,
    };
  });
};

/**
 * Validate theme before applying
 * Checks if all required properties exist
 * @param {string} themeId - The theme identifier
 * @returns {object} Validation result with isValid and messages
 */
export const validateTheme = (themeId) => {
  const result = {
    isValid: true,
    messages: [],
  };
  
  if (!themeExists(themeId)) {
    result.isValid = false;
    result.messages.push(`Theme "${themeId}" does not exist`);
    return result;
  }
  
  const theme = getTheme(themeId);
  
  // Check required properties
  const requiredProps = ['name', 'imagePath', 'layerPositions', 'layerSpeeds', 'positioning'];
  for (const prop of requiredProps) {
    if (!(prop in theme)) {
      result.isValid = false;
      result.messages.push(`Missing required property: ${prop}`);
    }
  }
  
  // Check layer positions for all required layers
  const requiredLayers = ['layer1', 'layer2', 'layer3', 'layer4', 'layer5', 'layer6', 'layer7'];
  for (const layer of requiredLayers) {
    if (!(layer in theme.layerPositions)) {
      result.isValid = false;
      result.messages.push(`Missing layer position for ${layer}`);
    }
    if (!(layer in theme.layerSpeeds)) {
      result.isValid = false;
      result.messages.push(`Missing layer speed for ${layer}`);
    }
  }
  
  return result;
};

export default {
  setActiveTheme,
  getActiveTheme,
  getCurrentThemeConfig,
  getThemesList,
  validateTheme,
};
