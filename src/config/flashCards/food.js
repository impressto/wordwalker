/**
 * Flash Cards - Food Category
 * 
 * Independent card content for the food category
 * Each card contains all necessary information (no dependency on questions data)
 */

export const foodFlashCards = [
  { 
    spanish: 'la sandía',
    english: 'the watermelon',
    background: 'food-1',      // Theme-specific background (e.g., nassau/food-1.png)
    emoji: '🍉',               // Use emoji instead of image file
    emotion: 'happy.png',
    spanishColor: '#FFFFFF',
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
      spanishColor: '#FFFFFF',
    // Optional: Custom emoji position
    // emojiPosition: { x: 270, y: 50, size: 100 },
  },
  { 
    spanish: 'la manzana',
    english: 'the apple',
    background: 'food-1',
    emoji: '🍎',
    emotion: 'confused.png',
      spanishColor: '#FFFFFF',
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
    background: 'food-1',
    emoji: '🍍',
    emotion: 'angry.png',
  },
  { 
    spanish: 'la pizza',
    english: 'the pizza',
    background: 'food-1',
    emoji: '🍕',
    emotion: 'sad.png',
  },
  { 
    spanish: 'la hamburguesa',
    english: 'the hamburger',
    background: 'food-1',
    emoji: '🍔',
    emotion: 'hurt.png',
  },
  { 
    spanish: 'el taco',
    english: 'the taco',
    background: 'food-1',
    emoji: '🌮',
    emotion: 'pleased.png',
  },
  { 
    spanish: 'el pollo',
    english: 'the chicken',
    background: 'food-1',
    emoji: '🍗',
    emotion: 'excited.png',
  },
  { 
    spanish: 'el helado',
    english: 'the ice cream',
    background: 'food-1',
    emoji: '🍦',
    emotion: 'afraid.png',
  },
];
