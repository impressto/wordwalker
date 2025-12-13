# Flash Cards Feature - Quick Reference

## When Does It Appear?
```
✅ Category: food
✅ Streak: > 0 (any active streak)
✅ Timing: After completing all checkpoints in the category
```

## User Flow Diagram
```
┌─────────────────────────────────────┐
│  Player completes food category    │
│  with an active streak              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  🎓 Flash Cards Offer Dialog        │
│                                     │
│  "Great Job!"                       │
│  "Would you like to review          │
│   some flash cards?"                │
│                                     │
│  [No, Thanks]  [Yes, Show Me! 📚]  │
└──────────┬───────────────┬──────────┘
           │               │
    Decline│               │Accept
           │               │
           ▼               ▼
    ┌──────────┐   ┌────────────────────┐
    │ Category │   │  Flash Cards View  │
    │ Selector │   │  (10 cards)        │
    └──────────┘   │  Click to flip     │
                   │  [< Prev] [Skip]   │
                   │          [Next >]  │
                   └─────────┬──────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │  Category        │
                   │  Selector        │
                   └──────────────────┘
```

## Flash Card Controls

### Navigation
- **Previous Button** (←): Go back one card (disabled on first card)
- **Next Button** (→): Advance to next card
- **Finish Button** (✓): Appears on last card instead of "Next"
- **Skip Button**: Exit flash cards at any time

### Interaction
- **Click on Card**: Flip to see back side
- **Click Again**: Flip back to front
- **Progress Display**: "Card X of 10" shown at top

## CSS Classes Reference

### FlashCardsOfferDialog
```css
.flash-cards-offer-dialog          /* Main container */
.offer-content                     /* Dialog content box */
.offer-icon                        /* Animated emoji */
.highlight                         /* Streak highlight box */
.offer-buttons                     /* Button container */
.btn-accept                        /* Accept button (green) */
.btn-decline                       /* Decline button (white) */
```

### FlashCardsDialog
```css
.flash-cards-dialog                /* Main container */
.flash-cards-content               /* Dialog content box */
.flash-card-container              /* 3D perspective container */
.flash-card                        /* Individual card */
.flash-card.flipped                /* Card in flipped state */
.flash-card-front                  /* Front face */
.flash-card-back                   /* Back face (rotated) */
.flash-card-image                  /* Sprite background */
.flash-cards-buttons               /* Navigation buttons */
```

## Sprite Sheet Extraction
```javascript
// Card dimensions
Total Width: 3400px
Total Height: 250px
Cards: 10
Card Width: 340px
Card Height: 250px

// CSS positioning formula
background-position: -(cardIndex × 340)px 0
background-size: 3400px 250px

// Example for card 3 (index 2):
background-position: -680px 0
```

## Key Code Snippets

### Check if Flash Cards Should Show
```javascript
// In useAnswerHandling.js - handleCategoryCompletion()
if (streak > 0 && currentCategory === 'food') {
  setCategoryForFlashCards(currentCategory);
  setStreakAtCompletion(streak);
  setShowFlashCardsOffer(true);
}
```

### Card Flip Logic
```javascript
// In FlashCardsDialog.jsx
const [isFlipped, setIsFlipped] = useState(false);
const handleFlip = () => {
  setIsFlipped(!isFlipped);
};

<div className={`flash-card ${isFlipped ? 'flipped' : ''}`} 
     onClick={handleFlip}>
  {/* Card faces */}
</div>
```

### Sprite Position Calculation
```javascript
const spriteWidth = 3400;
const totalCards = 10;
const cardWidth = spriteWidth / totalCards; // 340px
const spriteOffsetX = -(currentCardIndex * cardWidth);

style={{
  backgroundImage: `url(${flashCardImagePath})`,
  backgroundPosition: `${spriteOffsetX}px 0`,
  backgroundSize: `${spriteWidth}px ${spriteHeight}px`,
}}
```

## Adding Flash Cards to New Categories

### Step 1: Create Image
1. Create PNG file: 3400px × 250px
2. Place 10 card images horizontally
3. Save as: `public/images/flash-cards/{category}/flash-cards-1.png`

### Step 2: Update Code
```javascript
// In useAnswerHandling.js
const flashCardCategories = ['food', 'animals', 'numbers'];
if (streak > 0 && flashCardCategories.includes(currentCategory)) {
  // Show flash cards
}
```

### Step 3: Test
1. Play the category
2. Maintain a streak
3. Complete the category
4. Verify flash cards appear

## Responsive Breakpoints
```css
@media (max-width: 600px) {
  /* Mobile adjustments */
  .flash-card {
    width: 280px;
    height: 206px;
    transform: scale(0.82);
  }
  
  .offer-buttons,
  .flash-cards-buttons {
    flex-direction: column;
  }
}
```

## Troubleshooting

### Flash Cards Don't Appear
- ✅ Check if category is 'food'
- ✅ Verify player has active streak (> 0)
- ✅ Confirm all checkpoints completed
- ✅ Check console for errors

### Image Not Loading
- ✅ Verify file path: `public/images/flash-cards/food/flash-cards-1.png`
- ✅ Check image dimensions: 3400×250px
- ✅ Verify BASE_URL environment variable

### Cards Not Flipping
- ✅ Check CSS: `transform-style: preserve-3d`
- ✅ Verify `backface-visibility: hidden`
- ✅ Ensure click handler is attached

## Z-Index Hierarchy
```
FlashCards Dialogs: 2000
CharacterShop: 1500
PathChoice Dialog: 1010
Question Dialog: 1000
```
