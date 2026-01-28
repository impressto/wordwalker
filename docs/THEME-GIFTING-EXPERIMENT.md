# Random Theme Gifting Experiment

## Overview

WordWalker now includes an A/B testing experiment that randomly gifts themes to new users to measure the impact of themes on user engagement and stickiness.

## How It Works

### For New Users

When a user visits WordWalker for the first time:

1. **Detection**: System detects this is their first visit (no `wordwalker-initialized` flag in localStorage)
2. **Random Selection**: A random theme is selected from all available purchasable themes
3. **Theme Gift**: The selected theme is:
   - Added to their `ownedThemes` array
   - Set as their active theme
   - Tracked in localStorage for analytics
4. **Initialization**: User is marked as initialized with a timestamp

### For Existing Users

- No changes - they keep their current themes and settings
- The experiment only affects brand new users

## Experiment Groups

Users are automatically segmented into these groups:

| Group | Description | How to Identify |
|-------|-------------|-----------------|
| `theme-gift` | New users who received a random theme | Has `wordwalker-gifted-theme` in localStorage |
| `control` | New users who got default theme only | Initialized but no gifted theme |
| `existing-user` | Users from before this feature | No init timestamp |

## Technical Implementation

### Files Created

- **`src/utils/themeGifting.js`** - Core gifting logic and utilities

### Files Modified

- **`src/hooks/useCharacterAndTheme.js`** - Added theme gifting on initialization

### Key Functions

```javascript
// Check if first-time user
isFirstTimeUser() // Returns boolean

// Gift a random theme
giftRandomTheme(currentOwnedThemes) // Returns { giftedTheme, updatedOwnedThemes }

// Get user's experiment group
getUserExperimentGroup() // Returns 'theme-gift', 'control', or 'existing-user'

// Get gifted theme info
getGiftedThemeInfo() // Returns { theme, timestamp, experimentGroup } or null
```

## Data Tracking

### localStorage Keys

**New Keys:**
- `wordwalker-initialized` - Flag indicating user has been initialized (value: 'true')
- `wordwalker-init-timestamp` - ISO timestamp of first initialization
- `wordwalker-gifted-theme` - JSON object with gift data

**Existing Keys (unchanged):**
- `wordwalker-owned-themes` - Array of theme IDs
- `wordwalker-current-theme` - Currently active theme ID

### Gift Data Structure

```json
{
  "theme": "hong-kong",
  "timestamp": "2026-01-09T10:30:00.000Z",
  "experimentGroup": "theme-gift"
}
```

## Analytics Integration

### Measuring Stickiness

To measure the experiment's impact, track these metrics by experiment group:

1. **Retention Metrics**
   - Day 1, 7, 30 retention rates
   - Session frequency
   - Session duration

2. **Engagement Metrics**
   - Questions answered per session
   - Categories completed
   - Points earned

3. **Feature Usage**
   - Theme shop visits
   - Additional theme purchases
   - Theme switching frequency

### Google Tag Manager

The experiment data is automatically pushed to the GTM data layer when the app loads:

```javascript
// In src/utils/gtm.js
import { getUserExperimentGroup, getGiftedThemeInfo } from './themeGifting';

export const initializeDataLayer = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      experiment_group: getUserExperimentGroup(),
      gifted_theme: getGiftedThemeInfo()?.theme || null
    });
  }
};

// Called automatically in PathCanvas.jsx on component mount
```

You can access these values in GTM as data layer variables:
- Variable Name: `experiment_group` (returns: 'theme-gift', 'control', or 'existing-user')
- Variable Name: `gifted_theme` (returns: theme ID or null)

### Example Analytics Code

```javascript
import { 
  getUserExperimentGroup, 
  getGiftedThemeInfo 
} from './utils/themeGifting';

// Track experiment group on page load
const experimentGroup = getUserExperimentGroup();
console.log('User Experiment Group:', experimentGroup);

// Get gifted theme details if applicable
if (experimentGroup === 'theme-gift') {
  const giftInfo = getGiftedThemeInfo();
  console.log('Gifted Theme:', giftInfo.theme);
  console.log('Gift Timestamp:', giftInfo.timestamp);
}
```

## Testing the Feature

### Test as New User

```javascript
// In browser console - clear all data to simulate new user
localStorage.clear();
sessionStorage.clear();
window.location.reload();

// Check what theme was gifted
JSON.parse(localStorage.getItem('wordwalker-gifted-theme'));

// Check experiment group
import { getUserExperimentGroup } from './utils/themeGifting';
console.log(getUserExperimentGroup()); // Should show 'theme-gift'
```

### Test as Existing User

```javascript
// Set initialized flag to simulate existing user
localStorage.setItem('wordwalker-initialized', 'true');
window.location.reload();

// No theme should be gifted
console.log(localStorage.getItem('wordwalker-gifted-theme')); // null
```

### Manual Testing Checklist

- [ ] New user receives a random theme
- [ ] Theme is automatically set as active
- [ ] Theme appears in owned themes list
- [ ] Gift data is stored in localStorage
- [ ] Existing users are not affected
- [ ] Refresh doesn't gift another theme
- [ ] Console shows gift confirmation message

## Configuring the Experiment

### Control Which Themes Can Be Gifted

Edit [themeShopConfig.js](../src/config/themeShopConfig.js):

```javascript
{
  id: 'hong-kong',
  name: 'Hong Kong Harbor',
  enabled: true,  // Set to false to exclude from gifts
  cost: 200,      // Themes with cost: 0 are not gifted
}
```

### Disable the Experiment

To turn off theme gifting, comment out the gifting effect in [useCharacterAndTheme.js](../src/hooks/useCharacterAndTheme.js):

```javascript
// Random theme gifting for new users (A/B testing experiment)
// useEffect(() => {
//   ... gifting code ...
// }, []);
```

## Expected Results

### Hypothesis

Giving new users a premium theme for free will:
- Increase perceived value of the app
- Provide variety from the start
- Encourage exploration of theme features
- Lead to higher retention and engagement

### Key Metrics to Watch

1. **Retention**
   - Compare 7-day retention: theme-gift vs control
   - Target: 10-20% improvement in retention

2. **Engagement**
   - Questions answered per user (first 7 days)
   - Target: 15% more questions answered

3. **Monetization (if applicable)**
   - Theme shop visit rate
   - Additional theme purchases
   - Hypothesis: Early exposure leads to more purchases later

## Experiment Timeline

| Phase | Duration | Goal |
|-------|----------|------|
| **Launch** | Day 0 | Deploy feature to production |
| **Data Collection** | 30 days | Collect user behavior data |
| **Initial Analysis** | Day 7 | Check early retention signals |
| **Full Analysis** | Day 30 | Measure 30-day retention impact |
| **Decision** | Day 35 | Keep, modify, or remove feature |

## Troubleshooting

### Users Not Getting Themes

**Check:**
1. Is `enabled: true` in themeShopConfig?
2. Does theme have `cost > 0`?
3. Are there any themes matching criteria?

### Same Theme Every Time

This is **expected** - gifting is random but determined at first visit. Each new user gets a random theme, but the same user always sees their gifted theme.

### Gift Not Persisting

**Check:**
1. localStorage is enabled
2. No browser extensions clearing storage
3. Not in private/incognito mode

## Future Enhancements

### Possible Improvements

1. **Weighted Random Selection**
   - Gift more expensive themes less frequently
   - Implement rarity tiers

2. **Personalized Gifting**
   - Based on user's device/OS
   - Based on time of day
   - Based on geographic location

3. **Multiple Gift Strategies**
   - Gift on first win instead of first visit
   - Gift after 5 questions answered
   - Progressive gifting (multiple gifts over time)

4. **A/B Test Variations**
   - Control: No gift (current default)
   - Variant A: Random theme gift
   - Variant B: Specific high-value theme
   - Variant C: Choice of 2 random themes

## Related Documentation

- [Theme Shop Guide](THEME-SHOP-GUIDE.md)
- [Parallax Themes Overview](PARALLAX-THEMES-OVERVIEW.md)
- [Game State Persistence](GAME-STATE-PERSISTENCE.md)

## Questions?

For questions or issues with the theme gifting experiment:
- Check the console for gift confirmation messages
- Review localStorage values
- Test with a cleared browser state
