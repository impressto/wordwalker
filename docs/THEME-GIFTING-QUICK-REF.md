# Theme Gifting Experiment - Quick Reference

## What Is This?

Randomly gift premium themes to new users to test if themes increase app stickiness and retention.

## How It Works

```
New User Visits
    ↓
First Visit Detected
    ↓
Random Theme Selected (e.g., "jamaica")
    ↓
Theme Added to Owned Themes
    ↓
Theme Set as Active Theme
    ↓
User Marked as Initialized
```

## Key Features

✅ Automatic detection of new users  
✅ Random theme selection from available themes  
✅ Instant gifting on first visit  
✅ Analytics tracking for A/B testing  
✅ No impact on existing users  

## Quick Commands

### Test as New User (Browser Console)
```javascript
// Simulate new user
localStorage.clear();
window.location.reload();

// Check what was gifted
JSON.parse(localStorage.getItem('wordwalker-gifted-theme'));
// Returns: { theme: "hong-kong", timestamp: "2026-01-09...", experimentGroup: "theme-gift" }

// Check owned themes
JSON.parse(localStorage.getItem('wordwalker-owned-themes'));
// Returns: ["default", "hong-kong"] (or other random theme)

// Check current theme
localStorage.getItem('wordwalker-current-theme');
// Returns: "hong-kong" (or other gifted theme)
```

### Check Experiment Group
```javascript
import { getUserExperimentGroup } from './utils/themeGifting';
console.log(getUserExperimentGroup());
// Returns: "theme-gift", "control", or "existing-user"
```

## localStorage Keys

| Key | Purpose | Example Value |
|-----|---------|---------------|
| `wordwalker-initialized` | First-time user flag | `"true"` |
| `wordwalker-init-timestamp` | When user first visited | `"2026-01-09T10:30:00.000Z"` |
| `wordwalker-gifted-theme` | Gift tracking data | `{"theme":"paris","timestamp":"...","experimentGroup":"theme-gift"}` |
| `wordwalker-owned-themes` | Themes user owns | `["default","paris"]` |
| `wordwalker-current-theme` | Active theme | `"paris"` |

## Experiment Groups

| Group | Description | Identifier |
|-------|-------------|------------|
| **theme-gift** | New users with gifted theme | Has `wordwalker-gifted-theme` |
| **control** | New users without gift | No `wordwalker-gifted-theme` |
| **existing-user** | Users from before feature | No `wordwalker-init-timestamp` |

## Metrics to Track

### Retention
- Day 1, 7, 30 retention by group
- Compare theme-gift vs control

### Engagement
- Questions answered per session
- Categories completed
- Session duration

### Feature Usage
- Theme shop visits
- Additional theme purchases
- Theme changes

## Configuration

### Exclude Theme from Gifting

Edit [themeShopConfig.js](../src/config/themeShopConfig.js):
```javascript
{
  id: 'nassau',
  name: 'Nassau Nights',
  enabled: false,  // ← Set to false to exclude
  cost: 1000,
}
```

### Disable Entire Experiment

In [useCharacterAndTheme.js](../src/hooks/useCharacterAndTheme.js):
```javascript
// Comment out this useEffect:
// useEffect(() => {
//   if (isFirstTimeUser()) {
//     ... gifting code ...
//   }
// }, []);
```

## Testing Checklist

- [ ] Clear localStorage and refresh
- [ ] New user gets a random theme
- [ ] Gifted theme is set as active
- [ ] Gift data stored in localStorage
- [ ] Console shows: "🎁 Welcome! You've been gifted..."
- [ ] Refresh doesn't gift another theme
- [ ] Existing users unaffected

## Troubleshooting

### No Theme Gifted
**Possible causes:**
- All themes are disabled or cost 0
- User already initialized
- localStorage disabled

**Solution:**
```javascript
// Check available themes
import { getShopThemes } from './config/themeShopConfig';
console.log(getShopThemes().filter(t => t.enabled && t.cost > 0));
```

### Same Theme Every Time
**This is expected!** Each user gets ONE random theme on first visit. The randomness is per-user, not per-visit.

### Gift Not Saving
**Check:**
- Private/incognito mode? (localStorage may not persist)
- Browser extension blocking storage?
- Try different browser

## Analytics Integration

### Send to Google Analytics

```javascript
import { getUserExperimentGroup, getGiftedThemeInfo } from './utils/themeGifting';

// On app load
gtag('event', 'experiment_group', {
  group: getUserExperimentGroup(),
  gifted_theme: getGiftedThemeInfo()?.theme || null
});
```

### Custom Event Tracking

```javascript
import { hasGiftedTheme, getGiftedThemeInfo } from './utils/themeGifting';

// Track if gifted theme leads to more engagement
if (hasGiftedTheme()) {
  const giftInfo = getGiftedThemeInfo();
  console.log(`User has gifted theme: ${giftInfo.theme}`);
  console.log(`Gifted on: ${giftInfo.timestamp}`);
}
```

## Expected Impact

### Hypothesis
Gifting themes increases:
- Perceived value (+)
- Visual variety (+)
- Feature discovery (+)
- User retention (+10-20%)
- Engagement (+15%)

### Measurement Timeline
- **Day 7**: Early retention signal
- **Day 30**: Full retention impact
- **Day 35**: Make decision (keep/modify/remove)

## File Locations

| File | Purpose |
|------|---------|
| [themeGifting.js](../src/utils/themeGifting.js) | Core gifting logic |
| [useCharacterAndTheme.js](../src/hooks/useCharacterAndTheme.js) | Hook integration |
| [THEME-GIFTING-EXPERIMENT.md](./THEME-GIFTING-EXPERIMENT.md) | Full documentation |

## Related Docs

- [Theme Shop Guide](THEME-SHOP-GUIDE.md)
- [Parallax Themes Overview](PARALLAX-THEMES-OVERVIEW.md)
- [Game State Persistence](GAME-STATE-PERSISTENCE.md)

---

**Need more details?** See [THEME-GIFTING-EXPERIMENT.md](./THEME-GIFTING-EXPERIMENT.md)
