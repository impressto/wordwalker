/**
 * Parallax Themes Configuration
 * Defines different parallax scene themes with their positioning and speed settings
 * Each theme can have different vertical positions for layers to account for different artwork
 * 
 * usePathImages: Set to false if parallax-layer2 already includes the path artwork.
 *                This prevents loading separate path.png and path-fork.png files.
 */

const parallaxThemes = {
  // Default theme - original forest scene
  default: {
    name: 'Default Forest',
    description: 'Original forest landscape',
    imagePath: 'default',
    // Whether to use separate path.png and path-fork.png images
    // Set to false if parallax-layer2 already includes the path
    usePathImages: true,
    // Canvas background colors for fallback when layer images aren't loaded
    canvasColors: {
      aboveHorizon: '#7c8799',  // Light blue sky
      belowHorizon: '#717d3d',  // Dark green ground
    },
    // Layer positions (Y coordinate adjustments from base positions)
    // These are offsets from the calculated horizon and path positions
    layerPositions: {
      layer1: 0,      // Foreground grass - no adjustment
      layer2: 0,      // Grass/midground - no adjustment
      layer3: -10,    // Bushes - position relative to path (removed hardcoded -20, kept +10 offset = -10 net)
      layer4: -115,    // trees - position relative to horizon (removed hardcoded -15, kept -100 = -115 net)
      layer5: -70,    // pine tree - position relative to horizon (removed hardcoded -30, kept -40 = -70 net)
      layer6: -30,      // Mountains - at horizon
      layer7: 0,      // Sky/rear - no adjustment
    },
    // Parallax speed multipliers for each layer
    // Speed is relative to the main walker movement (1.0 = no parallax, 0.0 = no movement)
    // Lower values = farther away = less movement
    layerSpeeds: {
      layer1: 1.4,    // Foreground (closest) - fastest movement
      layer2: 1.0,    // Mid-foreground
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
      pathYOffset: 25,        // Additional Y offset for path tiles only (independent of layers)
      belowHorizonStart: 0.4, // Where to start rendering belowHorizon color (0.5 = center, 0.75 = 75% down)
      checkpointYPosition: 0.4, // Checkpoint vertical position on path (0.0 = top, 0.5 = center, 1.0 = bottom)
    },
    // Layer 2 vertical stretch control (for grass/street level)
    // 1.0 = full stretch from path to bottom of canvas
    // 0.5 = half stretch (use original image height, no stretching)
    // Values > 1.0 = extra stretch beyond canvas height
    layer2StretchFactor: 0.8,
    // Layer 2 vertical offset (moves layer up/down from path top)
    // Positive value = move down, negative = move up
    layer2OffsetY: 30,
    
    // Flash card mini parallax configuration
    // These settings control how parallax layers appear in the smaller flash card display
    flashCardParallax: {
      // Vertical positioning offsets for each layer (in pixels)
      // Positive values move layers down, negative values move them up
      layerOffsets: {
        layer3: 80,   // Bushes - move down to be more visible
        layer4: 40,   // Trees - move down slightly
        layer5: 0,   // Far trees - move down slightly
        layer6: 10,   // Mountains - move down slightly
        layer7: 0,    // Sky - no offset
      },
      // Layer speeds for flash card parallax (optional override of theme speeds)
      // Lower values = slower movement (farther away)
      layerSpeeds: {
        layer3: 0.5,   // Bushes - foreground
        layer4: 0.4,   // Trees
        layer5: 0.2,   // Far trees
        layer6: 0.1,  // Mountains
        layer7: 0.0,   // Sky - no movement
      },
      // Scale adjustment for better fit in smaller canvas
      scaleAdjustment: 0.3,
      // Layer 7 (background) scale multiplier (width coverage)
      layer7Scale: 3.75,
      // Horizon adjustment (0.0 to 1.0, proportion of canvas height)
      horizonY: 0.5, // Middle of canvas for flash cards
    },
  },

  // Jamaica theme - tropical beach scene
  'jamaica': {
    name: 'Jamaica Beach',
    description: 'Tropical beach landscape',
    imagePath: 'jamaica',
    // Whether to use separate path.png and path-fork.png images
    usePathImages: true,
    // Canvas background colors for fallback when layer images aren't loaded
    canvasColors: {
      aboveHorizon: '#c0e3eb',  // Light blue tropical sky
      belowHorizon: '#fae19e',  // Sandy beach color
    },
    // Layer positions for Jamaica theme
    layerPositions: {
      layer1: 0,      // Foreground - sand dune
      layer2: 0,      // beach level
      layer3: -20,    // unbrellas
      layer4: 95,      // surf
      layer5: -20,      // cruise ship
      layer6: 20,      // mountains
      layer7: 0,      // Sky/rear
    },
    layerSpeeds: {
      layer1: 1.4,    // Foreground (closest) - fastest movement
      layer2: 1.0,    // Mid-foreground
      layer3: 0.4,    // Mid layer
      layer4: 0.2,    // Mid-distant
      layer5: 0.13,    // Distant layer
      layer6: 0.1,   // Background
      layer7: 0.0,    // Static background
    },
    positioning: {
      horizonY: 0.35,        // Horizon at water line
      pathTopOffset: 0.55,   // Path on sand
      pathTopAdditional: 90,
      pathYOffset: 20,        // Additional Y offset for path tiles only (independent of layers)
      belowHorizonStart: 0.5, // Where to start rendering belowHorizon color (0.5 = center, 0.75 = 75% down)
      checkpointYPosition: 0.45, // Checkpoint vertical position on path (0.0 = top, 0.5 = center, 1.0 = bottom)
    },
    // Layer 2 vertical stretch control
    layer2StretchFactor: 0.8,
    // Layer 2 vertical offset
    layer2OffsetY: 30,
    
    // Flash card mini parallax configuration for Jamaica theme
    flashCardParallax: {
      layerOffsets: {
        layer3: 80,   // Umbrellas - move down more for beach scene
        layer4: 15,   // Surf
        layer5: -10,   // Cruise ship
        layer6: 10,   // Mountains
        layer7: 0,    // Sky
      },

      layerSpeeds: {
        layer3: 0.8,   // Umbrellas - move down more for beach scene
        layer4: 0.3,   // Surf
        layer5: 0.25,   // Cruise ship
        layer6: 0.06,  // Mountains
        layer7: 0.0,   // Sky
      },

      scaleAdjustment: 0.25,
      layer7Scale: 4.375,
      horizonY: 0.5,
    },
  },

  // Hong Kong theme - urban/harbor scene
  'hong-kong': {
    name: 'Hong Kong Harbor',
    description: 'Urban harbor landscape',
    imagePath: 'hong-kong',
    // Whether to use separate path.png and path-fork.png images
    usePathImages: false,
    // Canvas background colors for fallback when layer images aren't loaded
    canvasColors: {
      aboveHorizon: '#f9b858',  // Light blue sky for harbor
      belowHorizon: '#ac8062',  // Dark gray-green for urban ground
    },
    // Layer positions for Hong Kong theme - may need different vertical positioning
    // These values should be adjusted based on the actual Hong Kong artwork
    layerPositions: {
      layer1: 0,      // Foreground - adjust as needed
      layer2: 0,      // Grass/street level - adjust as needed
      layer3: -50,    // Buildings/structures - adjust as needed
      layer4: -100,   // Mid-distant buildings - adjust as needed
      layer5:  -60,    // high rises in the distance - adjust as needed
      layer6: 90,   // mountains- adjust as needed
      layer7: 0,      // Sky/rear - adjust as needed
    },
    layerSpeeds: {
      layer1: 1.4,    // Foreground (closest) - fastest movement
      layer2: 1.0,    // Mid-foreground
      layer3: 0.6,    // Mid layer
      layer4: 0.4,    // Mid-distant
      layer5: 0.3,    // Distant layer
      layer6: 0.1,   // Background
      layer7: 0.0,    // Static background
    },
    positioning: {
      horizonY: 0.35,        // Adjust based on Hong Kong artwork
      pathTopOffset: 0.55,
      pathTopAdditional: 90,
      pathYOffset: 0,        // Additional Y offset for path tiles only (independent of layers)
      belowHorizonStart: 0.4, // Where to start rendering belowHorizon color (0.5 = center, 0.75 = 75% down)
      checkpointYPosition: 0.45, // Checkpoint vertical position on path (0.0 = top, 0.5 = center, 1.0 = bottom)
    },
    // Layer 2 vertical stretch control
    layer2StretchFactor: 0.6,
    // Layer 2 vertical offset (moves layer up/down from path top)
    layer2OffsetY: 50,
    
    // Flash card mini parallax configuration for Hong Kong theme
    flashCardParallax: {
      layerOffsets: {
        layer3: 85,   // Buildings - adjust for urban scene
        layer4: 75,   // Mid-distant buildings
        layer5: 45,   // High rises
        layer6: 40,   // Mountains
        layer7: 0,    // Sky
      },

      layerSpeeds: {
        layer3: 0.7,   // Buildings - adjust for urban scene
        layer4: 0.5,   // Mid-distant buildings
        layer5: 0.3,   // High rises
        layer6: 0.1,  // Mountains
        layer7: 0.0,   // Sky - no movement
      },
      
      scaleAdjustment: 0.25,
          layer7Scale: 7.5,
      horizonY: 0.5,
    },
  },



  // Día de los Muertos theme - Day of the Dead celebration
  'dia-de-los-muertos': {
    name: 'Día de los Muertos',
    description: 'Day of the Dead celebration',
    imagePath: 'dia-de-los-muertos',
    // Whether to use separate path.png and path-fork.png images
    usePathImages: true,
    // Canvas background colors for fallback when layer images aren't loaded
    canvasColors: {
      aboveHorizon: '#39486a',  // dark blue
      belowHorizon: '#a38780', // sidewalk color
    },
    // Layer positions for Día de los Muertos theme
    layerPositions: {
      layer1: 0,      // Foreground - marigolds/flowers
      layer2: 0,      // Ground level
      layer3: -60,    // Altars/decorations
      layer4: -50,     // buildings
      layer5: 60,    // grave yard
      layer6: 40,      // mountains
      layer7: -30,      // Sky/rear
    },
    layerSpeeds: {
      layer1: 1.4,    // Foreground - marigolds/flowers
      layer2: 1.0,    // Ground level
      layer3: 0.5,    // Altars/decorations
      layer4: 0.4,    // buildings
      layer5: 0.25,    // grave yard
      layer6: 0.15,   // mountains
      layer7: 0.0,    // Static background/sky
    },
    positioning: {
      horizonY: 0.35,        // Horizon positioning
      pathTopOffset: 0.55,   // Path top as proportion of canvas height
      pathTopAdditional: 90, // Additional pixel offset for path top
      pathYOffset: 20,        // Additional Y offset for path tiles only (independent of layers)
      belowHorizonStart: 0.4, // Where to start rendering belowHorizon color (0.5 = center, 0.75 = 75% down)
      checkpointYPosition: 0.45, // Checkpoint vertical position on path (0.0 = top, 0.5 = center, 1.0 = bottom)
    },
    // Layer 2 vertical stretch control
    layer2StretchFactor: 0.8,
    // Layer 2 vertical offset
    layer2OffsetY: 30,
    
    // Flash card mini parallax configuration for Día de los Muertos theme
    flashCardParallax: {
      layerOffsets: {
        layer3: 70,   // Altars/decorations
        layer4: 30,   // Buildings
        layer5: -10,   // Graveyard
        layer6: 20,   // Mountains
        layer7: 20,    // Sky
      },

      layerSpeeds: {
        layer3: 0.8,   // Altars/decorations
        layer4: 0.5,   // Buildings
        layer5: 0.3,   // Graveyard
        layer6: 0.1,  // Mountains
        layer7: 0.0,   // Night sky - no movement
      },

      scaleAdjustment: 0.4,
        layer7Scale: 1.75,
      horizonY: 0.5,
    },
  },

  // Paris theme - Parisian cityscape
  'paris': {
    name: 'Paris',
    description: 'Iconic Parisian cityscape',
    imagePath: 'paris',
    // Whether to use separate path.png and path-fork.png images
    usePathImages: false,
    // Canvas background colors for fallback when layer images aren't loaded
    canvasColors: {
      aboveHorizon: '#4c99cc',  // Light blue sky
      belowHorizon: '#245da3',  // dark water near sidewalk
    },
    // Layer positions for Paris theme
    layerPositions: {
      layer1: 0,      // fence with flowers
      layer2: 20,      // street
      layer3: -40,    // sidewalk with tables and musicians
      layer4: 30,     // river with boats
      layer5: -100,    // buildings on far bank
      layer6: -30,    // eiffel tower and otherbackground buildings
      layer7: 0,      // Sky/rear
    },
    layerSpeeds: {
      layer1: 1.4,    // fence with flowers (closest) - fastest movement
      layer2: 1.0,    // street
      layer3: 0.57,    // sidewalk with tables and musicians
      layer4: 0.4,    // river with boats
      layer5: 0.3,    // buildings on far bank
      layer6: 0.15,   // eiffel tower and otherbackground buildings
      layer7: 0.0,    // Static background/sky
    },
    positioning: {
      horizonY: 0.35,        // Horizon positioning
      pathTopOffset: 0.55,   // Path top as proportion of canvas height
      pathTopAdditional: 90, // Additional pixel offset for path top
      pathYOffset: 0,        // Additional Y offset for path tiles only (independent of layers)
      belowHorizonStart: 0.4, // Where to start rendering belowHorizon color (0.5 = center, 0.75 = 75% down)
      checkpointYPosition: 0.45, // Checkpoint vertical position on path (0.0 = top, 0.5 = center, 1.0 = bottom)
    },
    // Layer 2 vertical stretch control
    layer2StretchFactor: 0.8,
    // Layer 2 vertical offset
    layer2OffsetY: 30,
    
    // Flash card mini parallax configuration for Paris theme
    flashCardParallax: {
      layerOffsets: {
        layer3: 85,   // Sidewalk with tables
        layer4: 40,   // River with boats
        layer5: 30,   // Buildings on far bank
        layer6: 30,   // Eiffel tower
        layer7: 0,    // Sky
      },
       layerSpeeds: {
        layer3: 0.8,   // Sidewalk with tables
        layer4: 0.5,   // River with boats
        layer5: 0.3,   // Buildings on far bank
        layer6: 0.1,  // Eiffel tower
        layer7: 0.0,   // Sky - no movement
      },
      scaleAdjustment: 0.3,
        layer7Scale: 2.875,
      horizonY: 0.5,
    },
  },

  // Nassau theme - Pirates burying treasure on beach at night in the Bahamas
  'nassau': {
    name: 'Nassau Nights',
    description: 'Pirates bury treasure at night',
    imagePath: 'nassau',
    // Whether to use separate path.png and path-fork.png images
    usePathImages: false,
    // Canvas background colors for fallback when layer images aren't loaded
    canvasColors: {
      aboveHorizon: '#324d5c',  // ocean 
      belowHorizon: '#54622f',  // sandy beach at night
    },
    // Layer positions for Nassau theme
    layerPositions: {
      layer1: 0,      // Foreground - beach elements
      layer2: -15,      // pathway
      layer3: -15,    // pirates burying treasure
      layer4: 120,    // shoreline
      layer5: -140,    // ship
      layer6: 160,    // Ocean/horizon
      layer7: 0,      // Night sky/stars
    },
    layerSpeeds: {
      layer1: 1.4,    // Foreground (closest) - fastest movement
      layer2: 1.0,    // Beach sand level
      layer3: 0.5,    // Pirates/treasure
      layer4: 0.4,   // shoreline
      layer5: 0.2,   // ship
      layer6: 0.13,    // Ocean/horizon
      layer7: 0.0,    // Static night sky
    },
    positioning: {
      horizonY: 0.35,        // Horizon at ocean line
      pathTopOffset: 0.55,   // Path on sandy beach
      pathTopAdditional: 90, // Additional pixel offset for path top
      pathYOffset: 20,       // Additional Y offset for path tiles only
      belowHorizonStart: 0.4, // Where to start rendering belowHorizon color (0.5 = center, 0.75 = 75% down)
      checkpointYPosition: 0.4, // Checkpoint vertical position on path (0.0 = top, 0.5 = center, 1.0 = bottom)
    },
    // Layer 2 vertical stretch control
    layer2StretchFactor: 0.8,
    // Layer 2 vertical offset
    layer2OffsetY: 30,
    
    // Flash card mini parallax configuration for Nassau theme
    flashCardParallax: {
      layerOffsets: {
        layer3: 60,   // Pirates burying treasure
        layer4: 20,   // Shoreline
        layer5: -10,   // Ship
        layer6: 40,   // Ocean/horizon
        layer7: 0,    // Night sky
      },

      layerSpeeds: {
        layer3: 0.8,   // Pirates burying treasure
        layer4: 0.3,   // Shoreline
        layer5: 0.2,   // Ship
        layer6: 0.1,  // Ocean/horizon
        layer7: 0.0,   // Night sky - no movement
      },

      scaleAdjustment: 0.4,
      layer7Scale: 2.75,
      horizonY: 0.5,
    },
  },

  // Add more themes below following the same structure
  // Template for new theme:
  // 'theme-id': {
  //   name: 'Theme Display Name',
  //   description: 'Short description',
  //   imagePath: 'folder-name-in-public/images/themes/',
  //   usePathImages: true, // Set to false if parallax-layer2 already includes the path
  //   canvasColors: { /* ... */ },
  //   layerPositions: { /* ... */ },
  //   layerSpeeds: { /* ... */ },
  //   positioning: { /* ... */ },
  //   layer2StretchFactor: 0.8,
  //   layer2OffsetY: 30,
  //   flashCardParallax: {
  //     layerOffsets: {
  //       layer3: 50,
  //       layer4: 30,
  //       layer5: 20,
  //       layer6: 10,
  //       layer7: 0,
  //     },
  //     scaleAdjustment: 1.0,
  //     horizonY: 0.5,
  //   },
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
