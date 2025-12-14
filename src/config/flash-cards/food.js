/**
 * Flash Cards Configuration - Food Category
 * 
 * Defines flash card content and settings for the food category
 * Each card maps to a question ID from the food questions
 */

export const foodFlashCardsConfig = {
  // Total number of cards in the sprite sheet
  totalCards: 10,
  
  // Sprite sheet dimensions
  spriteWidth: 3600,
  spriteHeight: 240,
  
  // Canvas display size
  canvasWidth: 360,
  canvasHeight: 240,
  
  // Offset adjustments (if cards aren't perfectly aligned in sprite)
  offsetX: 0,
  offsetY: 0,
  
  // Spacing between cards in sprite (if there's padding)
  cardSpacing: 0,
  
  // Flash card data: Maps card indices to question IDs
  // These are the featured vocabulary items shown in flash cards
  cards: [
    { questionId: 'food_001' }, // la sandía - the watermelon
    { questionId: 'food_002' }, // el plátano - the banana
    { questionId: 'food_003' }, // la manzana - the apple
    { questionId: 'food_004' }, // la naranja - the orange
    { questionId: 'food_009' }, // la piña - the pineapple
    { questionId: 'food_036' }, // la pizza - the pizza
    { questionId: 'food_037' }, // la hamburguesa - the hamburger
    { questionId: 'food_039' }, // el taco - the taco
    { questionId: 'food_043' }, // el pollo - the chicken
    { questionId: 'food_069' }, // el helado - the ice cream
  ],
  
  // Category-specific text styling (optional - overrides defaults)
  text: {
    spanish: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#333',
      maxWidth: 320,
      lineHeight: 1.3,
    },
    english: {
      fontSize: 18,
      fontWeight: 'normal',
      color: '#666',
      maxWidth: 320,
      lineHeight: 1.2,
    },
    verticalSpacing: 15,
    topMargin: 60,
  },
  
  // Diamond animation (optional - overrides defaults)
  diamond: {
    animationSpeed: 0.008,
    fadeMin: 0.4,
    fadeMax: 1.0,
    size: 45,
    positionX: 30,
    positionY: 30,
  },
};
