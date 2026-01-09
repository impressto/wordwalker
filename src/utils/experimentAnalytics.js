/**
 * Analytics Helper for Theme Gifting Experiment
 * Use this to track and measure the impact of theme gifting on user behavior
 */

import { 
  getUserExperimentGroup, 
  getGiftedThemeInfo,
  hasGiftedTheme 
} from '../utils/themeGifting';

/**
 * Get experiment context for analytics events
 * @returns {Object} Analytics context object
 */
export const getExperimentContext = () => {
  const experimentGroup = getUserExperimentGroup();
  const giftInfo = getGiftedThemeInfo();
  
  return {
    experimentGroup,
    hasGiftedTheme: hasGiftedTheme(),
    giftedTheme: giftInfo?.theme || null,
    giftTimestamp: giftInfo?.timestamp || null,
  };
};

/**
 * Track session start with experiment data
 * Call this when the app loads
 */
export const trackSessionStart = () => {
  const context = getExperimentContext();
  
  console.log('📊 Session Start - Experiment Context:', context);
  
  // Example: Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', 'session_start', {
      experiment_group: context.experimentGroup,
      gifted_theme: context.giftedTheme,
      has_gifted_theme: context.hasGiftedTheme,
    });
  }
  
  // Example: Send to custom analytics
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'session_start',
      experimentGroup: context.experimentGroup,
      giftedTheme: context.giftedTheme,
    });
  }
  
  return context;
};

/**
 * Track question answered with experiment data
 * @param {boolean} correct - Whether answer was correct
 * @param {boolean} firstAttempt - Whether this was first attempt
 * @param {string} category - Question category
 */
export const trackQuestionAnswered = (correct, firstAttempt, category) => {
  const context = getExperimentContext();
  
  const eventData = {
    correct,
    firstAttempt,
    category,
    experimentGroup: context.experimentGroup,
    giftedTheme: context.giftedTheme,
  };
  
  console.log('📊 Question Answered:', eventData);
  
  if (window.gtag) {
    window.gtag('event', 'question_answered', eventData);
  }
};

/**
 * Track category completion with experiment data
 * @param {string} category - Completed category
 * @param {number} score - Score in category
 * @param {number} questionsAnswered - Number of questions answered
 */
export const trackCategoryCompletion = (category, score, questionsAnswered) => {
  const context = getExperimentContext();
  
  const eventData = {
    category,
    score,
    questionsAnswered,
    experimentGroup: context.experimentGroup,
    giftedTheme: context.giftedTheme,
  };
  
  console.log('📊 Category Completed:', eventData);
  
  if (window.gtag) {
    window.gtag('event', 'category_completed', eventData);
  }
};

/**
 * Track theme shop visit with experiment data
 */
export const trackThemeShopVisit = () => {
  const context = getExperimentContext();
  
  const eventData = {
    experimentGroup: context.experimentGroup,
    giftedTheme: context.giftedTheme,
  };
  
  console.log('📊 Theme Shop Visit:', eventData);
  
  if (window.gtag) {
    window.gtag('event', 'theme_shop_visit', eventData);
  }
};

/**
 * Track theme purchase with experiment data
 * @param {string} themeId - Purchased theme ID
 * @param {number} cost - Theme cost in points
 */
export const trackThemePurchase = (themeId, cost) => {
  const context = getExperimentContext();
  
  const eventData = {
    themeId,
    cost,
    experimentGroup: context.experimentGroup,
    giftedTheme: context.giftedTheme,
    isPurchasingGiftedTheme: context.giftedTheme === themeId,
  };
  
  console.log('📊 Theme Purchased:', eventData);
  
  if (window.gtag) {
    window.gtag('event', 'theme_purchase', eventData);
  }
};

/**
 * Track theme change with experiment data
 * @param {string} fromTheme - Previous theme ID
 * @param {string} toTheme - New theme ID
 */
export const trackThemeChange = (fromTheme, toTheme) => {
  const context = getExperimentContext();
  
  const eventData = {
    fromTheme,
    toTheme,
    experimentGroup: context.experimentGroup,
    giftedTheme: context.giftedTheme,
    isChangingToGifted: context.giftedTheme === toTheme,
  };
  
  console.log('📊 Theme Changed:', eventData);
  
  if (window.gtag) {
    window.gtag('event', 'theme_change', eventData);
  }
};

/**
 * Get retention cohort data
 * @returns {Object} Cohort information
 */
export const getRetentionCohort = () => {
  const context = getExperimentContext();
  const initTimestamp = localStorage.getItem('wordwalker-init-timestamp');
  
  if (!initTimestamp) {
    return null;
  }
  
  const initDate = new Date(initTimestamp);
  const now = new Date();
  const daysActive = Math.floor((now - initDate) / (1000 * 60 * 60 * 24));
  
  return {
    experimentGroup: context.experimentGroup,
    initDate: initDate.toISOString(),
    daysActive,
    cohortWeek: getWeekNumber(initDate),
  };
};

/**
 * Helper to get week number of year
 * @param {Date} date - Date to get week for
 * @returns {string} Year-Week (e.g., "2026-W02")
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

/**
 * Export user's experiment data for analysis
 * @returns {Object} Complete experiment data
 */
export const exportExperimentData = () => {
  const context = getExperimentContext();
  const cohort = getRetentionCohort();
  
  const data = {
    ...context,
    cohort,
    totalPoints: parseInt(localStorage.getItem('wordwalker-totalPoints') || '0'),
    currentTheme: localStorage.getItem('wordwalker-current-theme'),
    ownedThemes: JSON.parse(localStorage.getItem('wordwalker-owned-themes') || '["default"]'),
    initialized: localStorage.getItem('wordwalker-initialized'),
    initTimestamp: localStorage.getItem('wordwalker-init-timestamp'),
  };
  
  console.log('📊 Experiment Data Export:', data);
  return data;
};

/**
 * Console helper to view experiment status
 */
export const showExperimentStatus = () => {
  const data = exportExperimentData();
  const cohort = getRetentionCohort();
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Theme Gifting Experiment Status       ║');
  console.log('╚════════════════════════════════════════╝\n');
  console.log(`Experiment Group: ${data.experimentGroup}`);
  console.log(`Has Gifted Theme: ${data.hasGiftedTheme ? '✅ Yes' : '❌ No'}`);
  
  if (data.hasGiftedTheme) {
    console.log(`Gifted Theme: ${data.giftedTheme}`);
    console.log(`Gift Timestamp: ${data.giftTimestamp}`);
  }
  
  if (cohort) {
    console.log(`\nCohort: ${cohort.cohortWeek}`);
    console.log(`Days Active: ${cohort.daysActive}`);
  }
  
  console.log(`\nTotal Points: ${data.totalPoints}`);
  console.log(`Current Theme: ${data.currentTheme}`);
  console.log(`Owned Themes: ${data.ownedThemes.join(', ')}`);
  console.log('\n────────────────────────────────────────\n');
};

// Export for use in console
if (typeof window !== 'undefined') {
  window.experimentAnalytics = {
    getContext: getExperimentContext,
    trackSessionStart,
    trackQuestionAnswered,
    trackCategoryCompletion,
    trackThemeShopVisit,
    trackThemePurchase,
    trackThemeChange,
    exportData: exportExperimentData,
    showStatus: showExperimentStatus,
  };
}
