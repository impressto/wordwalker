# Language Toggle Feature

## Overview
The flashcards page now includes a language toggle that allows users to switch the interface language between English and Spanish. This is an experimental feature that translates the UI elements while keeping the flashcard content unchanged.

## Implementation Details

### Files Created/Modified

1. **`/flashcards/includes/translations.php`** (NEW)
   - Contains all interface translations for English and Spanish
   - Provides helper functions:
     - `getTranslations($lang)` - Returns translation array for specified language
     - `getCurrentLanguage()` - Gets current language from session/URL
     - `t($key, $lang)` - Helper to get a translated string

2. **`/flashcards/index.php`** (MODIFIED)
   - Added `require_once` for translations.php
   - Added language toggle button in header
   - Updated all UI text to use `t()` translation function
   - Added `lang` parameter to all URL links to preserve language across page navigation
   - Added JavaScript toggle function

3. **`/flashcards/assets/flashcards.css`** (MODIFIED)
   - Added styles for `.language-toggle` and `.language-toggle-btn`
   - Responsive design for mobile devices

## How It Works

1. **Language Selection**:
   - User clicks the language toggle button (shows "Español" when English, "English" when Spanish)
   - JavaScript function adds/updates `?lang=es` or `?lang=en` URL parameter
   - Page reloads with new language

2. **Language Persistence**:
   - Language preference is stored in PHP session
   - All links preserve the `lang` parameter in URL
   - Works across pagination, category selection, and search

3. **Translated Elements**:
   - Page headers and titles
   - Category selector text
   - Search placeholder and buttons
   - Pagination controls (Previous, Next, First, Last, Page X of Y)
   - Flash card count messages
   - Error messages (no results, no cards available)
   - Links (report error, learn more, share cards, back to app)
   - Shuffle controls
   - Auto-play audio label

4. **Untranslated Elements** (by design):
   - Category names (remain bilingual: English name with Spanish displayName)
   - Flash card content (Spanish questions and English answers)
   - Audio and pronunciation features

## Usage

### For Users:
1. Visit the flashcards page
2. Click the language toggle button in the top-right corner (or center on mobile)
3. Interface switches between English and Spanish
4. Language persists as you navigate between pages and categories

### For Developers:

To add a new translatable string:

1. Add the key-value pairs to both 'en' and 'es' arrays in `translations.php`:
```php
'en' => [
    'my_new_key' => 'English text',
    ...
],
'es' => [
    'my_new_key' => 'Texto en español',
    ...
]
```

2. Use in PHP:
```php
<?php echo t('my_new_key'); ?>
```

3. Always add `&lang=<?php echo $currentLang; ?>` to any new links to preserve language.

## Testing

Test the feature by:
1. Loading `/flashcards/index.php?category=business`
2. Toggle language and verify all UI text changes
3. Navigate to different pages and verify language persists
4. Try category selection and verify language persists
5. Test search functionality with language toggle
6. Test on mobile devices for responsive design

## Next Steps

Future enhancements could include:
1. **Card Content Toggle**: Allow flipping which language appears on front/back of cards
2. **Browser Storage**: Store preference in localStorage for longer persistence
3. **Auto-detect**: Use browser language preference as default
4. **More Languages**: Add support for additional languages
5. **Audio Labels**: Translate "Play audio" and "Play example" tooltips

## URL Parameters

- `lang=en` - Display interface in English (default)
- `lang=es` - Display interface in Spanish
- Works with existing parameters: `category`, `page`, `shuffle`, `search`

Example: `?category=business&page=2&lang=es&shuffle=1`
