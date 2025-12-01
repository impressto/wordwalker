# Character Shop Implementation - WordWalker

## Overview
Added a character shop system that allows players to purchase different character skins using points earned during gameplay.

## Features

### 1. **Clickable Points Display**
- The points display box at the bottom of the screen is now clickable
- Clicking it opens the Character Shop dialog
- Enhanced with hover effects for better UX

### 2. **Character Shop Dialog**
- Shows available characters (Default Walker and Blue Boy)
- Displays current points available for purchase
- For each character shows:
  - Character preview image
  - Name and description
  - Cost in points
  - Current ownership status (Owned/Not Owned)
  - Action button (Buy, Select, or Already Selected)

### 3. **Character Purchase System**
- Players can purchase "Blue Boy" character for 50 points
- Default character is free to use
- Points are automatically deducted from total on purchase
- After purchase, character can be toggled between owned characters without additional cost

### 4. **Character Persistence**
- Owned characters are saved to localStorage
- Current selected character is saved to localStorage
- Survives page reloads and app restarts

### 5. **Character Selection**
- Click "Select" or purchased character action button to switch characters
- Walker sprite immediately updates when character is selected
- Only one character active at a time

## Files Modified

### New Files Created:
1. **`src/components/CharacterShop.jsx`**
   - React component for character shop UI
   - Handles character display, purchase logic, and selection
   - Responsive grid layout

2. **`src/components/CharacterShop.css`**
   - Styling for character shop dialog
   - Responsive design for mobile and desktop
   - Animations and hover states

### Files Updated:
1. **`src/components/PathCanvas.jsx`**
   - Added character state management
   - Added walker sprite sheet loading for multiple characters
   - Added character selection and purchase handlers
   - Integrated CharacterShop component
   - Integrated shop opening handler with ScoreDisplay

2. **`src/components/ScoreDisplay.jsx`**
   - Made points box clickable
   - Added onOpenShop callback prop
   - Added cursor pointer and hover effects
   - Maintains pause state when opening shop

## How It Works

### Character Management
- Characters are defined with ID, name, sprite file, cost, and description
- Currently supports: "default" and "blue" characters
- Character variants are preloaded on component mount
- Walker sprite sheet switches based on selected character

### Game Flow
1. Player clicks the points display box
2. Game pauses and CharacterShop dialog opens
3. Player can:
   - Browse available characters
   - Purchase new characters (if they have enough points)
   - Select between owned characters
   - Close shop to resume game
4. Selected character's sprite immediately becomes the active walker

### Persistence
- `wordwalker-owned-characters`: JSON array of owned character IDs
- `wordwalker-current-character`: ID of currently selected character
- Also uses existing `wordwalker-volume` localStorage key

## Adding New Characters

To add a new character:

1. Create a sprite sheet image: `public/images/walkers/walker-{characterid}.png`
2. Update `CharacterShop.jsx` character definitions
3. Update `PathCanvas.jsx` characterFiles object in walker loading code
4. Adjust CSS if needed for different sprite dimensions

Example sprite sheet format:
- Width: 1400px (6 frames × 233px each)
- Height: 600px (2 rows × 300px each)
  - Row 1: Walking animation (6 frames)
  - Row 2: Victory animation (6 frames)

## Testing

To test the feature:
1. Build: `yarn build`
2. Start dev server: `yarn dev`
3. Click on the "Points: XX" display at the bottom
4. Character Shop dialog opens
5. Purchase "Blue Boy" with 50 points
6. Select between characters
7. Close dialog - game resumes with new character

## Game Pausing
When the Character Shop opens, the game automatically pauses. Closing the shop resumes the game.
