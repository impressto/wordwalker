# Flash Cards Text Rendering Feature

## Overview
The flash card system now renders text directly on the canvas instead of relying on PNG images with embedded text. This makes it much easier to reuse PNG images across different categories and languages.

## Key Changes

### 1. Canvas Text Rendering
Flash cards now draw two layers:
- **Background Image**: The PNG image from the sprite sheet (can be generic/reusable)
- **Text Overlay**: Spanish word/sentence (large, bold) + English translation (smaller, below)

### 2. Configuration Updates (`src/config/flashCardsConfig.js`)

#### Text Configuration
New text rendering settings in the default config:
```javascript
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
  verticalSpacing: 15,  // Space between Spanish and English
  topMargin: 60,        // Top margin for text
}
```

#### Card Data Mapping
Each category now includes a `cards` array that maps card indices to question IDs:
```javascript
food: {
  cards: [
    { questionId: 'food_001' }, // la sandía - the watermelon
    { questionId: 'food_002' }, // el plátano - the banana
    // ... 8 more cards
  ],
}
```

#### New Helper Functions

**`getFlashCardData(category, cardIndex, questionsData, answerTranslations)`**
- Retrieves Spanish text and English translation for a specific card
- Uses the question ID mapping to look up the correct answer
- Returns: `{ spanish: string, english: string, emoji: string }`

### 3. Component Updates (`src/components/FlashCardsDialog.jsx`)

#### Text Wrapping Function
New `drawWrappedText()` helper that:
- Wraps text to fit within maxWidth
- Centers text on canvas
- Returns total height of drawn text

#### Drawing Process
1. Load background image from sprite sheet
2. Draw image on canvas
3. Get card data (Spanish + English text)
4. Draw Spanish text (centered, large, bold)
5. Draw English text below (centered, smaller, lighter)
6. Draw animated streak diamond overlay

## Usage

### For Food Category (Already Configured)
The food category is ready to use with 10 cards mapped to popular vocabulary items:
- la sandía (watermelon)
- el plátano (banana)
- la manzana (apple)
- la naranja (orange)
- la piña (pineapple)
- la pizza (pizza)
- la hamburguesa (hamburger)
- el taco (taco)
- el pollo (chicken)
- el helado (ice cream)

### Adding New Categories

1. **Import question data and translations** in `FlashCardsDialog.jsx`:
```javascript
import { animalQuestions } from '../config/questions/animals';
import { animalAnswerTranslations } from '../config/translations/answers/animals';
```

2. **Update the data selection logic**:
```javascript
const questionsData = category === 'food' ? foodQuestions 
                    : category === 'animals' ? animalQuestions 
                    : [];
const answerTranslations = category === 'food' ? foodAnswerTranslations
                          : category === 'animals' ? animalAnswerTranslations
                          : {};
```

3. **Add category configuration** in `flashCardsConfig.js`:
```javascript
animals: {
  cards: [
    { questionId: 'animals_001' },
    { questionId: 'animals_002' },
    // ... 8 more
  ],
}
```

## Benefits

### 1. Reusable Images
- PNG images no longer need text embedded
- Same background images can be used for different languages
- Easier to create themed backgrounds

### 2. Easy Customization
- Change text size, color, font without editing images
- Adjust spacing and positioning via config
- Support for text wrapping on long phrases

### 3. Maintainability
- Text content comes from existing question/translation data
- No need to create separate flash card text files
- Consistent with the rest of the app's data structure

### 4. Flexibility
- Can easily add emoji or other visual elements
- Text styling can be different per category
- Easy to support RTL languages in the future

## Configuration Tips

### Text Positioning
Adjust `topMargin` to move text up/down:
```javascript
text: {
  topMargin: 80,  // More space from top
}
```

### Text Styling
Customize fonts and colors per category:
```javascript
food: {
  text: {
    spanish: {
      fontSize: 32,      // Larger Spanish text
      color: '#2c5f2d',  // Green for food
    },
  },
}
```

### Long Text Handling
The `maxWidth` setting controls when text wraps:
```javascript
text: {
  spanish: {
    maxWidth: 300,  // Narrower wrapping
  },
}
```

## Testing

To test the new text rendering:
1. Play the food category
2. Maintain a streak (answer questions correctly)
3. Complete the category
4. Flash cards will appear with text overlaid on the background images

Look for:
- Spanish text is clearly readable and properly centered
- English translation appears below in smaller font
- Text wraps properly if it's too long
- Text doesn't overlap with the streak diamond

## Future Enhancements

### Potential Improvements
1. **Dynamic font sizing**: Auto-adjust font size based on text length
2. **Background contrast**: Add semi-transparent background behind text for better readability
3. **Animation**: Fade in text or animate word appearance
4. **Emoji integration**: Show emoji alongside text
5. **Audio integration**: Add pronunciation audio playback
6. **Multi-language support**: Easy switching between different target languages

### Making Images Optional
If you want to use solid color backgrounds instead of images:
```javascript
// In drawCard(), replace image drawing with:
ctx.fillStyle = '#f0f0f0';  // Light gray background
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

## Technical Notes

### Canvas Rendering
- Text is drawn using canvas 2D context
- Shadow effects add subtle depth
- Text wrapping algorithm splits on word boundaries
- Center alignment ensures consistent appearance

### Performance
- Text is rendered on each animation frame (for diamond animation)
- No performance impact from text rendering
- Canvas operations are hardware-accelerated

### Browser Compatibility
- Works in all modern browsers with canvas support
- Fallback text rendering if custom fonts fail to load
