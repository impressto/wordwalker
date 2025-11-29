# Hint System Documentation

## Overview

The hint system provides players with an optional English translation of Spanish questions, but at a cost. This creates a strategic decision point where players must weigh the risk of guessing incorrectly against the reward of earning full points.

## How It Works

### Basic Mechanics

1. **First Attempt Only**: The hint button only appears when the player is viewing a question for the first time (`firstAttempt = true`)

2. **Single Use**: Once clicked, the hint button becomes disabled and cannot be used again for that question (`hintUsed = true`)

3. **English Translation**: When activated, the hint displays the English translation of the Spanish question using the `questionTranslations` mapping

### Point System

#### Without Using Hint
- **Correct on First Try**: Full points (as specified in question config, e.g., 10 points)
- **Incorrect on First Try**: 0 points, streak reset, can retry
- **Correct on Retry**: 0 points (no penalty beyond losing the first-try bonus)

#### With Using Hint
- **Correct on First Try**: Half points (e.g., 5 points instead of 10)
- **Incorrect on First Try**: Lose half points from total score (e.g., -5 points penalty)
  - Note: Total score cannot go below 0
- **Correct on Retry**: 0 points

### Strategic Gamble

The hint creates a risk-reward scenario:

**Example with 10-point question:**

| Scenario | Outcome | Net Points |
|----------|---------|------------|
| No hint, correct guess | ✓ | +10 |
| No hint, wrong guess, correct retry | ✗ | 0 |
| Use hint, correct answer | ✓ | +5 |
| Use hint, wrong answer | ✗ | -5 |
| Use hint, wrong then correct | ✗ | -5 |

**Key Insight**: Using the hint guarantees you won't get full points, but protects against losing points IF you answer correctly. If you use the hint and still answer wrong, you lose points.

## Implementation Details

### State Management

```javascript
const [hintUsed, setHintUsed] = useState(false);
const [showHint, setShowHint] = useState(false);
```

- `hintUsed`: Tracks whether the hint button has been clicked
- `showHint`: Controls whether the English translation is displayed

### Point Calculation

```javascript
// Award points on correct first attempt
if (firstAttempt) {
  let pointsToAward = currentQuestion.points;
  
  if (hintUsed) {
    pointsToAward = Math.floor(currentQuestion.points / 2);
  }
  
  setTotalPoints(prevPoints => prevPoints + pointsToAward);
}

// Deduct points on incorrect first attempt with hint
if (firstAttempt && hintUsed) {
  const penalty = Math.floor(currentQuestion.points / 2);
  setTotalPoints(prevPoints => Math.max(0, prevPoints - penalty));
}
```

### UI Components

**Hint Button** (appears on first attempt only):
```javascript
<button onClick={onHintClick} disabled={hintUsed}>
  💡 Show English ({potentialPoints} pts)
</button>
```

**English Translation Display**:
```javascript
{showHint && questionTranslation && (
  <div>
    🇬🇧 {questionTranslation}
    Points reduced to {potentialPoints}
  </div>
)}
```

### Reset Logic

The hint state is reset when:
1. Loading a new question (`loadNewQuestion`)
2. Moving to the next checkpoint after correct answer
3. Starting a new category path

```javascript
setHintUsed(false);
setShowHint(false);
```

## User Experience

### Visual Feedback

1. **Button States**:
   - Available: Orange background (#FF9800), hover effect
   - Used: Gray background (#cccccc), disabled cursor

2. **Translation Display**:
   - Light orange background (#FFF3E0)
   - Orange border (#FF9800)
   - Shows reduced point value in red
   - Fade-in animation

3. **Point Indicator**: The button text dynamically shows potential points based on hint usage

### Player Psychology

The hint system encourages:
- **Confidence building**: Players can learn without harsh penalties
- **Risk assessment**: Deciding when to use hints vs. trusting their knowledge
- **Strategic play**: Conserving hints for harder questions
- **Learning reinforcement**: Seeing English translations helps retention

## Configuration

### Question Points

Points are defined per question in `questions.js`:
```javascript
{
  id: 1,
  question: "¿Cómo pides \"can I have a fork?\"",
  points: 10,
  // ...
}
```

### Translation Mapping

Translations are defined in `question-translations.js`:
```javascript
export const questionTranslations = {
  "¿Cómo pides \"can I have a fork?\"": "How do you ask 'can I have a fork?'",
  // ...
};
```

## Future Enhancements

Potential improvements to consider:

1. **Graduated Penalties**: Different penalty rates based on difficulty level
2. **Hint Variations**: Multiple hint types (translation, grammar hint, category hint)
3. **Hint Tracking**: Statistics on hint usage rates per player
4. **Adaptive Difficulty**: Adjust available hints based on player performance
5. **Hint Achievements**: Rewards for completing categories without using hints

## Testing Scenarios

1. Use hint, answer correctly → Should receive half points
2. Use hint, answer incorrectly → Should lose half points
3. Don't use hint, answer incorrectly, then correctly → Should receive 0 points
4. Use hint on 10-point question at 3 total points, answer incorrectly → Should go to 0 (not negative)
5. Hint button should disappear after first incorrect answer
6. Hint state should reset for each new question

## Related Files

- `/src/components/PathCanvas.jsx` - Main game logic and hint state management
- `/src/components/QuestionDialog.jsx` - Hint button and translation display
- `/src/config/question-translations.js` - English translations of all questions
- `/src/config/questions.js` - Question definitions with point values
