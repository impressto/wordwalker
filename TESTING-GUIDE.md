# Game Settings Configuration Guide

## Testing the Streak Modal

To make it easier to test the streak bonus notification, you can adjust the streak threshold in the configuration file.

### Configuration File Location
`/src/config/gameSettings.js`

### Quick Testing Setup

**To test the streak modal quickly**, change the `bonusThreshold` value to a lower number:

```javascript
const gameSettings = {
  streak: {
    bonusThreshold: 2,  // Changed from 5 to 2 for easier testing
    bonusPoints: 50,
    notificationDuration: 4000,
  },
  // ...
};
```

### Available Streak Settings

- **`bonusThreshold`** (default: 5)
  - Number of consecutive correct answers required to trigger the streak bonus
  - Set to 2 or 3 for easier testing
  - Set back to 5 for production

- **`bonusPoints`** (default: 50)
  - Points awarded when the streak threshold is reached
  - Adjust this to test different bonus amounts

- **`notificationDuration`** (default: 4000)
  - Duration in milliseconds to display the streak bonus notification
  - 4000ms = 4 seconds
  - Adjust if you need more/less time to observe the modal

### Testing Workflow

1. Edit `/src/config/gameSettings.js`
2. Set `bonusThreshold: 2` (or your preferred number)
3. Run `yarn build` to rebuild the app
4. Load/reload the game
5. Answer 2 questions correctly in a row to see the streak modal
6. When finished testing, remember to set it back to 5 for production

### Note

All changes to this configuration require rebuilding the app with `yarn build` to take effect.
