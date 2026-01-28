/**
 * Flash Cards - Food Category
 * 
 * Independent card content for the food category
 * Each card contains all necessary information (no dependency on questions data)
 */

/**
 * Global values applied to all cards in this category
 * Individual cards can override these values
 */
export const foodGlobalValues = {
  spanishColor: '#FFFFFF',
  // englishColor: '#ff1313ff',
   background: 'food-2',
  // textAlign: 'left',
  // leftMargin: 20,
};

export const foodFlashCards = [
  { 
    spanish: 'la sandía',
    english: 'the watermelon',
    background: 'food-2',      // Theme-specific background (e.g., nassau/food-1.png)
    emoji: '🍉',               // Use emoji instead of image file
    emotion: 'pleased.png',
    // Optional: Custom emoji positioning and size
    // emojiPosition: { x: 260, y: 60, size: 96 },  // x, y in pixels, size in px
    // Optional: Use PNG image instead of emoji
    // object: 'la sandía.png',
    // Optional: Custom text alignment (overrides global config)
     textAlign: 'left',        // 'left' or 'right' (character & emoji auto-position on opposite side)
    // leftMargin: 30,           // Distance from edge (in pixels)
    // Optional: Custom text positioning
    // spanishPosition: { x: 180, y: 50 },  // x and y in pixels
    // englishPosition: { x: 180, y: 90 },
  },
  { 
    spanish: 'el plátano',
    english: 'the banana',
    background: 'food-2',
    emoji: '🍌',
    emotion: 'surprised.png',
    // Optional: Custom emoji position
    // emojiPosition: { x: 270, y: 50, size: 100 },
  },
  { 
    spanish: 'la manzana',
    english: 'the apple',
    background: 'food-2',
    emoji: '🍎',
    emotion: 'confused.png',
  },
  { 
    spanish: 'la naranja',
    english: 'the orange',
    background: 'food-2',
    emoji: '🍊',
    emotion: 'excited.png',
  },
  { 
    spanish: 'la piña',
    english: 'the pineapple',
    background: 'food-2',
    emoji: '🍍',
    emotion: 'pleased.png',
  },
  { 
    spanish: 'la pizza',
    english: 'the pizza',
    background: 'food-2',
    emoji: '🍕',
    emotion: 'pleased.png',
  },
  { 
    spanish: 'la hamburguesa',
    english: 'the hamburger',
    background: 'food-2',
    emoji: '🍔',
    emotion: 'hurt.png',
  },
  { 
    spanish: 'el taco',
    english: 'the taco',
    background: 'food-2',
    emoji: '🌮',
    emotion: 'pleased.png',
  },
  { 
    spanish: 'el pollo',
    english: 'the chicken',
    background: 'food-2',
    emoji: '🍗',
    emotion: 'excited.png',
  },
  { 
    spanish: 'el helado',
    english: 'the ice cream',
    background: 'food-2',
    emoji: '🍦',
    emotion: 'afraid.png',
  },
];
