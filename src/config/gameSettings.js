/**
 * Game Settings Configuration
 * Centralized configuration for game mechanics and testing
 */

const gameSettings = {
  // Streak System Settings
  streak: {
    // Number of consecutive correct answers required to trigger streak bonus
    // Set to a lower number (e.g., 2 or 3) for easier testing
    bonusThreshold: 2,
    
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
  },
  
  // Question Settings
  question: {
    // Base points for correct answers
    basePoints: 10,
  },
  
  // Other game settings can be added here as needed
};

export default gameSettings;
