# Google Tag Manager Setup Guide

This guide explains how to configure Google Tag Manager (GTM) to track user interactions in the WordWalker app.

## Overview

The WordWalker app sends the following events to GTM's dataLayer:

| Event Name | Description | Data Parameters |
|------------|-------------|-----------------|
| `category_selected` | Fired when user selects a category | `category_id`, `category_name` |
| `question_answered` | Fired when user answers a question | `category_id`, `category_name`, `correct`, `first_attempt`, `streak` |
| `category_completed` | Fired when user completes all questions in a category | `category_id`, `category_name`, `streak` |

### Experiment Tracking (New!)

The app also pushes experiment data to the dataLayer on initialization:

| Variable | Description | Possible Values |
|----------|-------------|-----------------|
| `experiment_group` | User's A/B test group for theme gifting | `'theme-gift'`, `'control'`, `'existing-user'` |
| `gifted_theme` | Theme ID gifted to new users (if applicable) | Theme ID (e.g., `'hong-kong'`) or `null` |

This data is automatically available for segmenting all events by experiment group. See [Step 1a](#step-1a-experiment-tracking-variables) for setup.

---

## Step 1: Create Data Layer Variables

Data Layer Variables allow you to capture the event parameters sent from the app.

### In your GTM Container:

1. Go to **Variables** → **User-Defined Variables** → **New**
2. Create the following variables (one at a time):

### Step 1a: Experiment Tracking Variables

These variables capture the A/B testing experiment data that's automatically pushed on page load.

#### Variable 1: Experiment Group
- **Variable Name**: `DL - Experiment Group`
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `experiment_group`
- **Data Layer Version**: Version 2

#### Variable 2: Gifted Theme
- **Variable Name**: `DL - Gifted Theme`
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `gifted_theme`
- **Data Layer Version**: Version 2

> **Use Case**: Add these variables to any tag to segment performance by experiment group (e.g., compare retention between users who received a gifted theme vs. control group).

### Step 1b: Event Data Variables

#### Variable 3: Category ID
- **Variable Name**: `DL - Category ID`
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `category_id`
- **Data Layer Version**: Version 2

#### Variable 4: Category Name
- **Variable Name**: `DL - Category Name`
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `category_name`
- **Data Layer Version**: Version 2

#### Variable 5: Correct Answer
- **Variable Name**: `DL - Correct`
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `correct`
- **Data Layer Version**: Version 2

#### Variable 6: First Attempt
- **Variable Name**: `DL - First Attempt`
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `first_attempt`
- **Data Layer Version**: Version 2

#### Variable 7: Streak
- **Variable Name**: `DL - Streak`
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `streak`
- **Data Layer Version**: Version 2

---

## Step 2: Create Custom Event Triggers

Triggers determine when your tags should fire.

### Trigger 1: Category Selected

1. Go to **Triggers** → **New**
2. Configure:
   - **Trigger Name**: `CE - Category Selected`
   - **Trigger Type**: Custom Event
   - **Event Name**: `category_selected`
   - **This trigger fires on**: All Custom Events
3. Save

### Trigger 2: Question Answered

1. Go to **Triggers** → **New**
2. Configure:
   - **Trigger Name**: `CE - Question Answered`
   - **Trigger Type**: Custom Event
   - **Event Name**: `question_answered`
   - **This trigger fires on**: All Custom Events
3. Save

### Trigger 3: Category Completed

1. Go to **Triggers** → **New**
2. Configure:
   - **Trigger Name**: `CE - Category Completed`
   - **Trigger Type**: Custom Event
   - **Event Name**: `category_completed`
   - **This trigger fires on**: All Custom Events
3. Save

---

## Step 3: Create Tags (Google Analytics 4)

These tags send the event data to Google Analytics 4.

### Tag 1: GA4 - Category Selected

1. Go to **Tags** → **New**
2. Configure Tag:
   - **Tag Name**: `GA4 - Category Selected`
   - **Tag Type**: Google Analytics: GA4 Event
   - **Configuration Tag**: Select your GA4 Configuration tag
   - **Event Name**: `category_selected`
   - **Event Parameters**:
     - Parameter Name: `category_id` → Value: `{{DL - Category ID}}`
     - Parameter Name: `category_name` → Value: `{{DL - Category Name}}`
     - Parameter Name: `experiment_group` → Value: `{{DL - Experiment Group}}`
     - Parameter Name: `gifted_theme` → Value: `{{DL - Gifted Theme}}`
3. Configure Triggering:
   - Select trigger: `CE - Category Selected`
4. Save

### Tag 2: GA4 - Question Answered

1. Go to **Tags** → **New**
2. Configure Tag:
   - **Tag Name**: `GA4 - Question Answered`
   - **Tag Type**: Google Analytics: GA4 Event
   - **Configuration Tag**: Select your GA4 Configuration tag
   - **Event Name**: `question_answered`
   - **Event Parameters**:
     - Parameter Name: `category_id` → Value: `{{DL - Category ID}}`
     - Parameter Name: `category_name` → Value: `{{DL - Category Name}}`
     - Parameter Name: `correct` → Value: `{{DL - Correct}}`
     - Parameter Name: `first_attempt` → Value: `{{DL - First Attempt}}`
     - Parameter Name: `streak` → Value: `{{DL - Streak}}`
     - Parameter Name: `experiment_group` → Value: `{{DL - Experiment Group}}`
     - Parameter Name: `gifted_theme` → Value: `{{DL - Gifted Theme}}`
3. Configure Triggering:
   - Select trigger: `CE - Question Answered`
4. Save

### Tag 3: GA4 - Category Completed

1. Go to **Tags** → **New**
2. Configure Tag:
   - **Tag Name**: `GA4 - Category Completed`
   - **Tag Type**: Google Analytics: GA4 Event
   - **Configuration Tag**: Select your GA4 Configuration tag
   - **Event Name**: `category_completed`
   - **Event Parameters**:
     - Parameter Name: `category_id` → Value: `{{DL - Category ID}}`
     - Parameter Name: `category_name` → Value: `{{DL - Category Name}}`
     - Parameter Name: `streak` → Value: `{{DL - Streak}}`
     - Parameter Name: `experiment_group` → Value: `{{DL - Experiment Group}}`
     - Parameter Name: `gifted_theme` → Value: `{{DL - Gifted Theme}}`
3. Configure Triggering:
   - Select trigger: `CE - Category Completed`
4. Save

---

## Step 4: Testing & Debugging

### Enable Preview Mode

1. In GTM, click **Preview** (top right)
2. Enter your website URL: `https://wordwalker.ca`
3. Click **Start** to open Tag Assistant

### Test Each Event

1. **Test Category Selection**:
   - Play the game and select a category
   - In Tag Assistant, verify:
     - Event `category_selected` appears
     - Variables contain correct category info
     - Associated tags fired successfully

2. **Test Question Answered**:
   - Answer a question (correctly and incorrectly)
   - In Tag Assistant, verify:
     - Event `question_answered` appears
     - `correct`, `first_attempt`, and `streak` values are captured
     - Associated tags fired

3. **Test Category Completed**:
   - Complete all questions in a category
   - In Tag Assistant, verify:
     - Event `category_completed` appears
     - Final streak value is captured
     - Associated tags fired

### Debug Console

Open browser console (F12) to see dataLayer pushes:
```javascript
// View all dataLayer events
console.log(window.dataLayer);
```

---

## Step 5: Publish Your Container

Once testing is complete:

1. Click **Submit** (top right in GTM)
2. Add a **Version Name**: e.g., "WordWalker Analytics v1.0"
3. Add **Version Description**: e.g., "Tracking category selections, question answers, and completions"
4. Click **Publish**

---

## Analytics Reports

### In Google Analytics 4

After events are flowing, you can create custom reports:

#### Most Popular Categories Report

1. Go to **Explore** → **Create a blank exploration**
2. **Dimensions**: Add `Event name`, `category_name`
3. **Metrics**: Add `Event count`
4. **Filters**: Event name = `category_selected`
5. Visualize as a bar chart to see which categories are most popular

#### Question Performance Report

1. Go to **Explore** → **Create a blank exploration**
2. **Dimensions**: Add `category_name`, `correct`, `first_attempt`
3. **Metrics**: Add `Event count`
4. **Filters**: Event name = `question_answered`
5. Analyze correct vs incorrect answers by category

#### Streak Analysis

1. Go to **Explore** → **Create a blank exploration**
2. **Dimensions**: Add `category_name`, `streak`
3. **Metrics**: Add `Event count`
4. **Filters**: Event name = `category_completed`
5. See which categories users achieve highest streaks

#### Experiment Group Analysis (Theme Gifting A/B Test)

1. Go to **Explore** → **Create a blank exploration**
2. **Dimensions**: Add `experiment_group`, `Event name`
3. **Metrics**: Add `Event count`, `User count`, `Sessions per user`
4. Compare engagement metrics between:
   - `theme-gift` (users who received a random theme)
   - `control` (users with default theme only)
   - `existing-user` (users from before experiment)
5. **Key Questions to Answer**:
   - Do users in `theme-gift` group answer more questions?
   - Is retention higher for users with gifted themes?
   - Do gifted theme users complete more categories?

---

## Event Reference

### Initialization (Automatic)

On app load, experiment data is automatically pushed to the dataLayer:

```javascript
// Pushed automatically in PathCanvas.jsx on mount
dataLayer.push({
  experiment_group: 'theme-gift',    // User's experiment group
  gifted_theme: 'hong-kong'          // Theme gifted (or null)
});
```

**Experiment Groups:**
- `'theme-gift'` - New users who received a random premium theme
- `'control'` - New users who only have default theme
- `'existing-user'` - Users from before the experiment feature

### Category Selected Event
```javascript
dataLayer.push({
  event: 'category_selected',
  category_id: 'food',        // ID from config
  category_name: 'Food'        // Display name
});
```

### Question Answered Event
```javascript
dataLayer.push({
  event: 'question_answered',
  category_id: 'greetings',
  category_name: 'Greetings',
  correct: true,               // true/false
  first_attempt: true,         // true/false
  streak: 5                    // Current streak number
});
```

### Category Completed Event
```javascript
dataLayer.push({
  event: 'category_completed',
  category_id: 'numbers',
  category_name: 'Numbers',
  streak: 10                   // Final streak achieved
});
```

---

## Troubleshooting

### Events Not Appearing in GTM Preview

1. Check browser console for errors
2. Verify GTM container ID matches: `GTM-PZM4VDRQ`
3. Ensure you're testing on the correct domain
4. Clear browser cache and reload

### Variables Show "undefined"

1. Verify Data Layer Variable names match exactly (case-sensitive)
2. Check that events are pushing data with correct parameter names
3. Use GTM Preview mode to inspect dataLayer object

### Tags Not Firing

1. Verify triggers are configured correctly
2. Check that trigger event names match exactly: `category_selected`, `question_answered`, `category_completed`
3. Ensure GA4 Configuration tag is set up and firing on All Pages

### Data Not Appearing in GA4

1. Allow 24-48 hours for data to fully process in GA4
2. Check real-time reports in GA4 for immediate verification
3. Verify GA4 Measurement ID is correct in your GA4 Configuration tag
4. Ensure ad blockers are disabled during testing

---

## Theme Gifting Experiment Tracking

### What Is This?

WordWalker includes an A/B test that randomly gifts premium themes to new users. The experiment data is automatically tracked in GTM so you can measure the impact on engagement and retention.

### How It Works

1. **On Page Load**: Experiment data is pushed to `dataLayer`
2. **All Events Include**: `experiment_group` and `gifted_theme` parameters
3. **Segmentation**: Analyze any metric by experiment group

### Key Metrics to Track

| Metric | How to Measure | Expected Impact |
|--------|----------------|-----------------|
| **Retention** | Compare returning users by `experiment_group` | +10-20% for theme-gift group |
| **Engagement** | Questions answered per user (first 7 days) | +15% for theme-gift group |
| **Category Completion** | `category_completed` events by group | Higher for theme-gift group |
| **Session Length** | Average session duration by group | Longer for theme-gift group |

### Creating Experiment Reports in GA4

#### 1. Retention by Experiment Group

```
Dimensions: experiment_group, Date
Metrics: Active users, New users, Returning users
Time Range: Last 30 days
```

Compare day 1, 7, and 30 retention between groups.

#### 2. Engagement by Experiment Group

```
Dimensions: experiment_group
Metrics: 
  - Events per user
  - Sessions per user
  - Average session duration
Custom Metric: question_answered events per user
```

#### 3. Theme Impact Analysis

```
Dimensions: gifted_theme, experiment_group
Metrics: Event count, User count
Filter: experiment_group = 'theme-gift'
```

See which gifted themes correlate with highest engagement.

### Testing the Experiment Tracking

1. **Clear localStorage**: `localStorage.clear()`
2. **Reload page** as new user
3. **Open GTM Preview**: Check dataLayer contains `experiment_group` and `gifted_theme`
4. **Answer questions**: Verify events include experiment parameters
5. **Check GA4 Real-time**: See events with experiment dimensions

### Related Documentation

- [Theme Gifting Experiment Guide](THEME-GIFTING-EXPERIMENT.md) - Full experiment documentation
- [Theme Gifting Quick Reference](THEME-GIFTING-QUICK-REF.md) - Testing and configuration

---

## Additional Tracking Opportunities

You can extend tracking by adding more events in `/src/utils/gtm.js`:

- Character/theme purchases
- Flash card usage
- Game mode changes (multichoice vs flashcard)
- Hint usage
- Audio playback
- PWA install events

The `trackEvent()` utility function makes it easy to add new tracking points throughout the app.
