/**
 * Test script for theme gifting functionality
 * Run in browser console to test the gifting logic
 */

// Test 1: Check if isFirstTimeUser works
console.log('=== Test 1: First Time User Detection ===');
localStorage.removeItem('wordwalker-initialized');
const result1 = isFirstTimeUser();
console.log('Before initialization:', result1); // Should be true

markUserInitialized();
const result2 = isFirstTimeUser();
console.log('After initialization:', result2); // Should be false

// Test 2: Check theme selection
console.log('\n=== Test 2: Random Theme Selection ===');
const theme1 = selectRandomTheme();
console.log('Selected theme:', theme1); // Should be one of the purchasable themes

// Test 3: Gift a theme
console.log('\n=== Test 3: Gift Random Theme ===');
localStorage.removeItem('wordwalker-gifted-theme');
localStorage.setItem('wordwalker-owned-themes', JSON.stringify(['default']));

const giftResult = giftRandomTheme(['default']);
console.log('Gift result:', giftResult);
console.log('Gifted theme:', giftResult.giftedTheme);
console.log('Updated owned themes:', giftResult.updatedOwnedThemes);

// Test 4: Check gift info
console.log('\n=== Test 4: Gift Info ===');
const giftInfo = getGiftedThemeInfo();
console.log('Gift info:', giftInfo);

// Test 5: Check experiment groups
console.log('\n=== Test 5: Experiment Groups ===');
console.log('Has gifted theme:', hasGiftedTheme());
console.log('Experiment group:', getUserExperimentGroup());

// Test 6: Simulate new user flow
console.log('\n=== Test 6: Full New User Flow ===');
console.log('Step 1: Clear all data (simulate new user)');
localStorage.clear();

console.log('Step 2: Check if first time user');
console.log('Is first time:', isFirstTimeUser()); // Should be true

console.log('Step 3: Gift theme');
const newUserGift = giftRandomTheme(['default']);
console.log('Gifted:', newUserGift.giftedTheme);

console.log('Step 4: Mark initialized');
markUserInitialized();

console.log('Step 5: Check state');
console.log('Is first time now:', isFirstTimeUser()); // Should be false
console.log('Experiment group:', getUserExperimentGroup()); // Should be 'theme-gift'

// Test 7: Verify persistence
console.log('\n=== Test 7: Verify Persistence ===');
console.log('localStorage keys:');
console.log('- initialized:', localStorage.getItem('wordwalker-initialized'));
console.log('- init timestamp:', localStorage.getItem('wordwalker-init-timestamp'));
console.log('- gifted theme:', localStorage.getItem('wordwalker-gifted-theme'));

console.log('\n✅ All tests completed!');
console.log('\nTo test in the app:');
console.log('1. Clear localStorage: localStorage.clear()');
console.log('2. Reload the page: window.location.reload()');
console.log('3. Check console for: "🎁 Welcome! You\'ve been gifted..."');
console.log('4. Open theme shop to see your gifted theme');
