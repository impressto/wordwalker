# Grammar Audio File Renaming - Summary

## Overview
Changed the naming strategy for grammar audio files from using question IDs to using the `correctAnswer` values. This allows the audio files to be reused across different components, particularly in the SearchDialog.

## What Changed

### 1. Audio Files Renamed
- **Old format**: `audio-samples/grammar/grammar_001.mp3` (using question ID)
- **New format**: `audio-samples/grammar/yo.mp3` (using correctAnswer)

**Statistics:**
- Total questions in grammar.js: 200
- Audio files renamed: 109 (files 110-200 didn't exist yet)
- Duplicate correctAnswers handled with suffixes (_2, _3, etc.)

**Examples of duplicates:**
- `es.mp3`, `es_2.mp3`, `es_3.mp3` (answer "es" used 3 times)
- `está.mp3`, `está_2.mp3`, `está_3.mp3` (answer "está" used 3 times)
- `para.mp3`, `para_2.mp3`, `para_3.mp3`, `para_4.mp3`, `para_5.mp3` (answer "para" used 5 times)
- `por.mp3`, `por_2.mp3`, `por_3.mp3`, `por_4.mp3`, `por_5.mp3` (answer "por" used 5 times)

### 2. Code Updated

#### src/utils/pronunciationAudio.js
- Updated `getAudioUrl()` method to use `question.correctAnswer` instead of `question.id`
- Updated file header comments to reflect new naming convention
- Changed validation to check for `correctAnswer` instead of `id`

#### src/config/audioConfig.js
- Updated comments to reflect new file naming pattern

#### test-pronunciation.html
- Updated test file's `getAudioUrl()` method to match production code

### 3. Files Created

#### rename-grammar-audio.js
A utility script that:
- Reads grammar.js and extracts id → correctAnswer mappings
- Identifies duplicate correctAnswers and handles them with suffixes
- Renames all existing audio files
- Creates a mapping file for reference

#### grammar-audio-rename-map.json
A JSON file documenting:
- All renamed files (old name → new name mapping)
- List of duplicate answers and their occurrence counts
- Useful for reference and potential rollback

## Benefits

1. **Reusability**: Audio files can now be used in SearchDialog and other components that only have access to the Spanish word (correctAnswer), not the question ID
2. **Better semantics**: Filenames are now meaningful (`yo.mp3` instead of `grammar_001.mp3`)
3. **Easier maintenance**: No need to look up question IDs to find the right audio file
4. **Future-proof**: Adding audio to dictionary search becomes straightforward

## Duplicate Handling

When multiple questions share the same `correctAnswer`, files are named with numeric suffixes:
- First occurrence: `{answer}.mp3`
- Second occurrence: `{answer}_2.mp3`
- Third occurrence: `{answer}_3.mp3`
- And so on...

Total duplicates found: 16 different answers with multiple occurrences

## Testing Recommendations

1. Test that audio playback still works in the TranslationOverlay
2. Verify that the pronunciation button appears for questions with audio files
3. Test with questions that have duplicate correctAnswers
4. Consider adding audio playback to SearchDialog now that filenames are semantic

## Files Modified
- `/src/utils/pronunciationAudio.js`
- `/src/config/audioConfig.js`
- `/test-pronunciation.html`

## Files Created
- `/rename-grammar-audio.js` (utility script)
- `/grammar-audio-rename-map.json` (mapping reference)

## Note on Missing Files
Questions grammar_110 through grammar_200 (91 files) don't have audio files yet. When these are created, they should follow the new naming convention using the `correctAnswer` value.
