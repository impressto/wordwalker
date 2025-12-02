/**
 * Parallax Themes Configuration
 * Defines different parallax scene themes with their positioning and speed settings
 * Each theme can have different vertical positions for layers to account for different artwork
 */

const parallaxThemes = {
  // Default theme - original forest scene
  default: {
    name: 'Default Forest',
    description: 'Original forest landscape',
    imagePath: 'default',
    // Layer positions (Y coordinate adjustments from base positions)
    // These are offsets from the calculated horizon and path positions
    layerPositions: {
      layer1: 0,      // Foreground grass - no adjustment
      layer2: 0,      // Grass/midground - no adjustment
      layer3: 10,    // Bushes - 20 pixels up from calculated position
      layer4: 0,    // trees - 15 pixels up
      layer5: -60,    // pine tree - 30 pixels up
      layer6: -30,      // Mountains - at horizon
      layer7: 0,      // Sky/rear - no adjustment
    },
    // Parallax speed multipliers for each layer
    // Speed is relative to the main walker movement (1.0 = no parallax, 0.0 = no movement)
    // Lower values = farther away = less movement
    layerSpeeds: {
      layer1: 0.8,    // Foreground (closest) - fast movement
      layer2: 0.6,    // Mid-foreground
      layer3: 0.5,    // Mid layer
      layer4: 0.4,    // Mid-distant
      layer5: 0.3,    // Distant layer
      layer6: 0.15,   // Mountains (very far)
      layer7: 0.0,    // Sky/rear (infinite distance - no movement)
    },
    // Horizon and path positioning
    positioning: {
      horizonY: 0.35,        // Horizon line as proportion of canvas height
      pathTopOffset: 0.55,   // Path top as proportion of canvas height
      pathTopAdditional: 90, // Additional pixel offset for path top
    },
    // Layer 2 vertical stretch control (for grass/street level)
    // 1.0 = full stretch from path to bottom of canvas
    // 0.5 = half stretch (use original image height, no stretching)
    // Values > 1.0 = extra stretch beyond canvas height
    layer2StretchFactor: 0.8,
    // Layer 2 vertical offset (moves layer up/down from path top)
    // Positive value = move down, negative = move up
    layer2OffsetY: 30,
  },

  // Hong Kong theme - urban/harbor scene
  'hong-kong': {
    name: 'Hong Kong Harbor',
    description: 'Urban harbor landscape',
    imagePath: 'hong-kong',
    // Layer positions for Hong Kong theme - may need different vertical positioning
    // These values should be adjusted based on the actual Hong Kong artwork
    layerPositions: {
      layer1: 0,      // Foreground - adjust as needed
      layer2: 0,      // Grass/street level - adjust as needed
      layer3: -20,    // Buildings/structures - adjust as needed
      layer4: -140,   // Mid-distant buildings - adjust as needed
      layer5: -50,    // Distant skyline - adjust as needed
      layer6: 120,   // monuntains- adjust as needed
      layer7: -100,      // Sky/rear - adjust as needed
    },
    layerSpeeds: {
      layer1: 0.8,    // Foreground
      layer2: 0.6,    // Mid-foreground
      layer3: 0.6,    // Mid layer
      layer4: 0.4,    // Mid-distant
      layer5: 0.3,    // Distant layer
      layer6: 0.15,   // Background
      layer7: 0.0,    // Static background
    },
    positioning: {
      horizonY: 0.35,        // Adjust based on Hong Kong artwork
      pathTopOffset: 0.55,
      pathTopAdditional: 90,
    },
    // Layer 2 vertical stretch control
    layer2StretchFactor: 0.6,
    // Layer 2 vertical offset (moves layer up/down from path top)
    layer2OffsetY: 50,
  },

  // Jamaica theme - tropical beach scene
  'jamaica': {
    name: 'Jamaica Beach',
    description: 'Tropical beach landscape',
    imagePath: 'jamaica',
    // Layer positions for Jamaica theme
    layerPositions: {
      layer1: 0,      // Foreground - sand dune
      layer2: 0,      // beach level
      layer3: -40,    // unbrellas
      layer4: 40,      // surf
      layer5: 0,      // cruise ship
      layer6: 0,      // mountains
      layer7: 0,      // Sky/rear
    },
    layerSpeeds: {
      layer1: 0.8,    // Foreground
      layer2: 0.6,    // Mid-foreground
      layer3: 0.5,    // Mid layer
      layer4: 0.4,    // Mid-distant
      layer5: 0.3,    // Distant layer
      layer6: 0.15,   // Background
      layer7: 0.0,    // Static background
    },
    positioning: {
      horizonY: 0.35,        // Horizon at water line
      pathTopOffset: 0.55,   // Path on sand
      pathTopAdditional: 90,
    },
    // Layer 2 vertical stretch control
    layer2StretchFactor: 0.8,
    // Layer 2 vertical offset
    layer2OffsetY: 30,
  },

  // Add more themes below following the same structure
  // Template for new theme:
  // 'theme-id': {
  //   name: 'Theme Display Name',
  //   description: 'Short description',
  //   imagePath: 'folder-name-in-public/images/themes/',
  //   layerPositions: { /* ... */ },
  //   layerSpeeds: { /* ... */ },
  //   positioning: { /* ... */ },
  // }
};

/**
 * Get a specific theme configuration
 * @param {string} themeId - The theme identifier
 * @returns {object} Theme configuration object
 */
export const getTheme = (themeId) => {
  const theme = parallaxThemes[themeId];
  if (!theme) {
    console.warn(`Theme "${themeId}" not found. Using default theme.`);
    return parallaxThemes.default;
  }
  return theme;
};

/**
 * Get all available theme IDs
 * @returns {string[]} Array of theme IDs
 */
export const getThemeIds = () => {
  return Object.keys(parallaxThemes);
};

/**
 * Get all theme configurations
 * @returns {object} All themes with their configurations
 */
export const getAllThemes = () => {
  return parallaxThemes;
};

/**
 * Check if a theme exists
 * @param {string} themeId - The theme identifier
 * @returns {boolean} True if theme exists
 */
export const themeExists = (themeId) => {
  return themeId in parallaxThemes;
};

export default parallaxThemes;
