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
    
    // Duration (in milliseconds) to display the streak bonus notification
    notificationDuration: 4000,
  },
  
  // Question Settings
  question: {
    // Base points for correct answers
    basePoints: 10,
  },
  
  // Other game settings can be added here as needed
};

export default gameSettings;
