/**
 * Game Settings Configuration
 * Centralized configuration for game mechanics and testing
 */

const gameSettings = {
  // Streak System Settings
  streak: {
    // Number of consecutive correct answers required to trigger streak bonus
    // Set to a lower number (e.g., 2 or 3) for easier testing
    bonusThreshold: 5,
    
    // Bonus points awarded when streak threshold is reached
    bonusPoints: 50,
    
    // Duration (in milliseconds) of the CSS fade-in/out animation
    animationDuration: 2500,
    
    // Duration (in milliseconds) to display the streak bonus notification
    // Should be >= animationDuration to ensure complete fade-out
    notificationDuration: 4000,
    
    // Extra pause duration (in milliseconds) when showing streak milestone
    // Added to base translation pause to give user time to see streak message
    extraPauseDuration: 1000,
    
    // Additional pause after notification for smooth transition
    // This is added to notificationDuration when pausing game animation
    pausePadding: 500,
    
    // Streak color thresholds and colors for the diamond that follows the walker
    // Each tier defines the minimum streak required and the color scheme
    colorTiers: [
      {
        minStreak: 0,
        name: 'Light Grey',
        primaryColor: '#818181ff',    // Light grey
        gradientColor: '#414141ff',   // Steel grey
      },
      {
        minStreak: 5,
        name: 'Light Blue',
        primaryColor: '#87CEEB',    // Light blue
        gradientColor: '#4682B4',   // Steel blue
      },
      {
        minStreak: 10,
        name: 'Green',
        primaryColor: '#00FF7F',    // Spring green
        gradientColor: '#00C853',   // Dark green
      },
      {
        minStreak: 15,
        name: 'Gold',
        primaryColor: '#FFD700',    // Gold
        gradientColor: '#FFA500',   // Orange
      },
      {
        minStreak: 20,
        name: 'Pink',
        primaryColor: '#ebb1b1ff',    // Pink
        gradientColor: '#cf5959ff',   // Light pink
      },
      {
        minStreak: 25,
        name: 'Purple',
        primaryColor: '#d28fd8ff',    // Purple
        gradientColor: '#6a22bbff',   // Dark Purple
      },
      {
        minStreak: 30,
        name: 'Red',
        primaryColor: '#ff4c4cff',    // Red
        gradientColor: '#b22222ff',   // Firebrick
      },
    ],
  },
  
  // Question Settings
  question: {
    // Base points for correct answers
    basePoints: 10,
  },

  // Parallax Layer Settings
  parallax: {
    // Parallax speed multipliers for each layer
    // Speed is relative to the main walker movement (1.0 = no parallax, 0.0 = no movement)
    // Lower values = farther away = less movement
    layerSpeeds: {
      layer1: 0.8,   // Foreground (closest) - fast movement
      layer2: 0.6,   // Mid-foreground
      layer3: 0.5,   // Mid layer
      layer4: 0.4,   // Mid-distant
      layer5: 0.3,   // Distant layer
      layer6: 0.15,  // Mountains (very far)
      layer7: 0.0,   // Sky/rear (infinite distance - no movement)
    },
  },
  
  // Other game settings can be added here as needed
};

/**
 * Get the color tier for a given streak count
 * @param {number} streak - Current streak count
 * @returns {object} Color tier object with primaryColor and gradientColor
 */
export const getStreakColorTier = (streak) => {
  const tiers = gameSettings.streak.colorTiers;
  
  // Find the highest tier that the streak qualifies for
  // Iterate in reverse to get the highest matching tier
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (streak >= tiers[i].minStreak) {
      return tiers[i];
    }
  }
  
  // Fallback to the first tier (should never happen if tier 0 exists)
  return tiers[0];
};

/**
 * Get the primary diamond color for a given streak
 * @param {number} streak - Current streak count
 * @returns {string} Hex color code
 */
export const getStreakColor = (streak) => {
  return getStreakColorTier(streak).primaryColor;
};

/**
 * Get the gradient color for a given streak
 * @param {number} streak - Current streak count
 * @returns {string} Hex color code
 */
export const getStreakGradientColor = (streak) => {
  return getStreakColorTier(streak).gradientColor;
};

export default gameSettings;
