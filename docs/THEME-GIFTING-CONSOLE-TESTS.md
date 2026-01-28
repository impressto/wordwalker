# Theme Gifting - Console Testing Guide

## Quick Test Commands

Copy and paste these into your browser console to test the theme gifting feature.

### Test 1: Simulate New User

```javascript
// Clear all data to simulate new user
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cleared all storage. Reload page to test gifting.');
window.location.reload();
```

### Test 2: Check Gifted Theme

```javascript
// After reload, check what theme was gifted
const giftData = JSON.parse(localStorage.getItem('wordwalker-gifted-theme'));
if (giftData) {
  console.log('🎁 Gifted Theme:', giftData.theme);
  console.log('📅 Gifted On:', new Date(giftData.timestamp).toLocaleString());
  console.log('🧪 Experiment Group:', giftData.experimentGroup);
} else {
  console.log('❌ No theme was gifted');
}
```

### Test 3: Check Owned Themes

```javascript
// See all themes you own
const ownedThemes = JSON.parse(localStorage.getItem('wordwalker-owned-themes'));
console.log('🎨 Owned Themes:', ownedThemes);
```

### Test 4: Check Current Active Theme

```javascript
// See which theme is currently active
const currentTheme = localStorage.getItem('wordwalker-current-theme');
console.log('✨ Active Theme:', currentTheme);
```

### Test 5: View Experiment Status

```javascript
// Full experiment status (requires app loaded)
if (window.experimentAnalytics) {
  window.experimentAnalytics.showStatus();
} else {
  console.log('⚠️ Analytics not loaded yet. Try after app loads.');
}
```

### Test 6: Check All Experiment Data

```javascript
// View all localStorage keys related to experiment
console.log('📊 Experiment Data:');
console.log('- Initialized:', localStorage.getItem('wordwalker-initialized'));
console.log('- Init Timestamp:', localStorage.getItem('wordwalker-init-timestamp'));
console.log('- Gifted Theme:', localStorage.getItem('wordwalker-gifted-theme'));
console.log('- Owned Themes:', localStorage.getItem('wordwalker-owned-themes'));
console.log('- Current Theme:', localStorage.getItem('wordwalker-current-theme'));
```

### Test 7: Multiple New Users (Testing Distribution)

```javascript
// Test multiple new users to see distribution
const results = [];

for (let i = 0; i < 10; i++) {
  localStorage.clear();
  
  // Simulate the gifting logic
  const themes = [
    { id: 'hong-kong', cost: 200 },
    { id: 'jamaica', cost: 400 },
    { id: 'dia-de-los-muertos', cost: 600 },
    { id: 'paris', cost: 800 },
    { id: 'nassau', cost: 1000 }
  ];
  
  const giftableThemes = themes.filter(t => t.cost > 0);
  const randomIndex = Math.floor(Math.random() * giftableThemes.length);
  const selectedTheme = giftableThemes[randomIndex].id;
  
  results.push(selectedTheme);
}

console.log('🎲 Distribution Test (10 users):');
console.log(results);

// Count occurrences
const counts = {};
results.forEach(theme => {
  counts[theme] = (counts[theme] || 0) + 1;
});

console.log('\n📊 Theme Distribution:');
Object.entries(counts).forEach(([theme, count]) => {
  console.log(`  ${theme}: ${count}/10 (${count * 10}%)`);
});
```

### Test 8: Reset and Test Again

```javascript
// Reset everything to test multiple times
localStorage.removeItem('wordwalker-initialized');
localStorage.removeItem('wordwalker-init-timestamp');
localStorage.removeItem('wordwalker-gifted-theme');
localStorage.setItem('wordwalker-owned-themes', '["default"]');
localStorage.setItem('wordwalker-current-theme', 'default');

console.log('🔄 Reset complete. Reload to test gifting again.');
// Don't auto-reload so you can see the message
```

### Test 9: Check Experiment Group

```javascript
// Determine which experiment group you're in
const hasInit = localStorage.getItem('wordwalker-initialized');
const hasGift = localStorage.getItem('wordwalker-gifted-theme');
const hasTimestamp = localStorage.getItem('wordwalker-init-timestamp');

if (!hasInit) {
  console.log('👤 Experiment Group: NEW USER (not yet initialized)');
} else if (hasGift) {
  console.log('🎁 Experiment Group: THEME-GIFT');
} else if (hasTimestamp) {
  console.log('🎮 Experiment Group: CONTROL');
} else {
  console.log('👴 Experiment Group: EXISTING USER');
}
```

### Test 10: Verify Theme Is Actually Owned

```javascript
// Check if the gifted theme is in the owned themes list
const giftData = JSON.parse(localStorage.getItem('wordwalker-gifted-theme'));
const ownedThemes = JSON.parse(localStorage.getItem('wordwalker-owned-themes'));

if (giftData && ownedThemes) {
  const isOwned = ownedThemes.includes(giftData.theme);
  if (isOwned) {
    console.log('✅ Gifted theme IS in owned themes list');
  } else {
    console.log('❌ ERROR: Gifted theme NOT in owned themes list');
  }
} else {
  console.log('⚠️ No gift data or owned themes data');
}
```

## Expected Results

### After First Visit (New User)
1. Console shows: `🎁 Welcome! You've been gifted the "[theme-name]" theme!`
2. `wordwalker-initialized` = `"true"`
3. `wordwalker-init-timestamp` = ISO timestamp
4. `wordwalker-gifted-theme` = JSON with theme data
5. `wordwalker-owned-themes` = `["default", "[gifted-theme]"]`
6. `wordwalker-current-theme` = `"[gifted-theme]"`

### After Reload (Existing User)
- No new gift
- Same theme stays active
- No console message about gifting

## Troubleshooting

### No Theme Gifted
**Check:**
```javascript
// Are there any giftable themes?
const themes = [
  { id: 'hong-kong', enabled: true, cost: 200 },
  { id: 'jamaica', enabled: true, cost: 400 },
  { id: 'dia-de-los-muertos', enabled: true, cost: 600 },
  { id: 'paris', enabled: true, cost: 800 },
  { id: 'nassau', enabled: true, cost: 1000 }
];

const giftable = themes.filter(t => t.enabled && t.cost > 0);
console.log('Giftable themes:', giftable.length);
```

### Gift Not Persisting
**Check:**
```javascript
// Is localStorage working?
try {
  localStorage.setItem('test', 'works');
  const test = localStorage.getItem('test');
  localStorage.removeItem('test');
  console.log('localStorage:', test === 'works' ? '✅ Working' : '❌ Not working');
} catch (e) {
  console.log('❌ localStorage error:', e.message);
}
```

### Already Initialized
**Reset:**
```javascript
// Force reset to test again
localStorage.removeItem('wordwalker-initialized');
console.log('Reset complete. Refresh to test gifting.');
```

## Integration Testing

### After Deploying to Production

```javascript
// Check production deployment
console.log('Environment:', import.meta.env.MODE);
console.log('Base URL:', import.meta.env.BASE_URL);

// Verify theme images load
const testTheme = 'hong-kong';
const img = new Image();
img.onload = () => console.log(`✅ Theme ${testTheme} images accessible`);
img.onerror = () => console.log(`❌ Theme ${testTheme} images NOT accessible`);
img.src = `${import.meta.env.BASE_URL}images/themes/${testTheme}/scene.jpg`;
```

## Continuous Monitoring

### Track Gift Rate

```javascript
// Count gifted users vs total users (run periodically)
// This would be done server-side with analytics

// Client-side approximation:
const hasGift = localStorage.getItem('wordwalker-gifted-theme');
console.log('This user has gift:', !!hasGift);
```

---

## Quick Commands Summary

| Command | Purpose |
|---------|---------|
| `localStorage.clear()` | Clear all data |
| `JSON.parse(localStorage.getItem('wordwalker-gifted-theme'))` | Check gift |
| `window.experimentAnalytics.showStatus()` | View status |
| `localStorage.removeItem('wordwalker-initialized')` | Reset for re-test |

---

**Tip:** Keep this file open in a browser tab for easy copy-pasting during testing!
