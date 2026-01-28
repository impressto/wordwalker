# Flash Cards Feature - Implementation Summary

## Overview
An experimental flash cards feature has been added to WordWalker. When players complete a category with an active streak, they are offered the opportunity to review flash cards before proceeding to the next category selection.

## Feature Details

### Trigger Condition
- Flash cards are offered **only** when a player:
  1. Completes all checkpoints in a category
  2. Has an active streak (streak > 0)
  3. Is in the **food** category (experimental limitation)

### User Flow
1. Player completes the food category with a streak
2. **Flash Cards Offer Dialog** appears asking if they want to review flash cards
3. Player can choose:
   - **"Yes, Show Me!"** - Proceeds to flash cards
   - **"No, Thanks"** - Skips to category selector
4. If accepted, **Flash Cards Dialog** shows 10 interactive cards
5. Player can:
   - Click cards to flip them (front/back view)
   - Navigate with Previous/Next buttons
   - Skip the entire set at any time
   - Finish when all cards are reviewed
6. After completion or skip, player proceeds to category selector

## Technical Implementation

### Components Created

#### 1. FlashCardsOfferDialog.jsx
- Located: `src/components/FlashCardsOfferDialog.jsx`
- Purpose: Asks player if they want to see flash cards
- Props:
  - `streak`: Number - Current streak value
  - `onAccept`: Function - Called when player accepts
  - `onDecline`: Function - Called when player declines
- Styling: `FlashCardsOfferDialog.css`

#### 2. FlashCardsDialog.jsx
- Located: `src/components/FlashCardsDialog.jsx`
- Purpose: Displays interactive flash cards
- Props:
  - `category`: String - Category ID (e.g., "food")
  - `onComplete`: Function - Called when all cards reviewed or skipped
- Features:
  - Extracts individual cards from sprite sheet
  - Click-to-flip interaction
  - Navigation controls (Previous/Next)
  - Progress indicator (Card X of 10)
  - Skip option
- Styling: `FlashCardsDialog.css`

### Flash Card Image Format
- **Location**: `public/images/flash-cards/{category}/flash-cards-1.png`
- **Dimensions**: 3400px wide × 250px high
- **Layout**: 10 cards tiled horizontally
- **Individual Card Size**: 340px × 250px
- **Current Implementation**: Only `food` category has flash cards

### Sprite Extraction
The FlashCardsDialog component uses CSS background positioning to extract individual cards:
```javascript
const cardWidth = 3400 / 10; // 340px per card
const spriteOffsetX = -(currentCardIndex * cardWidth);
```

This allows efficient use of a single image file instead of 10 separate files.

### Integration Points

#### Modified Files

1. **PathCanvas.jsx**
   - Added flash cards state management
   - Added flash cards dialog components to render tree
   - Added handlers for accept/decline/complete actions
   - Imports: `FlashCardsOfferDialog`, `FlashCardsDialog`

2. **useAnswerHandling.js**
   - Modified `handleCategoryCompletion()` to check streak
   - Added logic to show flash cards offer instead of immediate category selector
   - Only triggers for 'food' category in experimental phase
   - Accepts new state setters: `setShowFlashCardsOffer`, `setCategoryForFlashCards`, `setStreakAtCompletion`

### State Management

New state variables in PathCanvas:
```javascript
const [showFlashCardsOffer, setShowFlashCardsOffer] = useState(false);
const [showFlashCards, setShowFlashCards] = useState(false);
const [categoryForFlashCards, setCategoryForFlashCards] = useState(null);
const [streakAtCompletion, setStreakAtCompletion] = useState(0);
```

## User Experience

### Visual Design
- **Color Scheme**: Purple gradient background (667eea → 764ba2)
- **Animations**: 
  - Smooth slide-in entrance
  - 3D flip effect for cards
  - Bouncing icon in offer dialog
- **Responsive**: Adapts to mobile screens
- **Accessibility**: Clear buttons with hover effects

### Interaction
- Intuitive click-to-flip cards
- Clear progress tracking
- Flexible navigation (can skip or go back)
- Non-blocking (can skip entire feature)

## Future Enhancements

### To Expand This Feature:
1. **Add More Categories**: Create flash card images for other categories
2. **Dynamic Card Count**: Support different numbers of cards per category
3. **Multiple Sets**: Support multiple flash card sets per category
4. **Text Overlays**: Add text translations on card flip
5. **Audio Integration**: Play pronunciation when cards are flipped
6. **Streak Threshold**: Only show after reaching specific streak milestones
7. **Progress Tracking**: Remember which cards have been reviewed
8. **Customization**: Let users choose when to see flash cards

### Adding Flash Cards to Other Categories:
1. Create flash card image: `public/images/flash-cards/{category}/flash-cards-1.png`
2. Format: 3400px × 250px with 10 cards
3. Update condition in `useAnswerHandling.js`:
   ```javascript
   // Change from:
   if (streak > 0 && currentCategory === 'food') {
   
   // To support multiple categories:
   const flashCardCategories = ['food', 'animals', 'numbers'];
   if (streak > 0 && flashCardCategories.includes(currentCategory)) {
   ```

## Testing

### To Test the Feature:
1. Start a new game
2. Select the "Food" category
3. Answer all checkpoint questions correctly (maintain streak)
4. Complete the category
5. Flash cards offer should appear
6. Test both accept and decline paths
7. When viewing flash cards, test:
   - Clicking to flip cards
   - Previous/Next navigation
   - Skip button
   - Finish button

### Edge Cases Handled:
- No flash cards shown if streak is 0
- Only shows for food category currently
- Properly pauses game during flash card review
- Resumes normal flow after completion or skip

## Files Modified
- ✅ `src/components/PathCanvas.jsx`
- ✅ `src/hooks/useAnswerHandling.js`

## Files Created
- ✅ `src/components/FlashCardsOfferDialog.jsx`
- ✅ `src/components/FlashCardsOfferDialog.css`
- ✅ `src/components/FlashCardsDialog.jsx`
- ✅ `src/components/FlashCardsDialog.css`

## Asset Requirements
- ✅ `public/images/flash-cards/food/flash-cards-1.png` (already exists)

## Status
✅ **Implementation Complete**
- Feature is fully functional
- Ready for testing
- Experimental phase: food category only
- Can be expanded to other categories as needed
