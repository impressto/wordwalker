<?php
/**
 * Flash Cards Helper Functions
 * 
 * Contains all PHP utility functions for parsing and processing
 * flashcard data from JavaScript config files.
 */

/**
 * Parse example translations from JavaScript file
 */
function parseExampleTranslations($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }
    
    $content = file_get_contents($filePath);
    $translations = [];
    
    // Find the exampleTranslations object (handles both }; and } endings)
    if (preg_match('/exampleTranslations\s*=\s*\{(.*?)\};?/s', $content, $match)) {
        $objContent = $match[1];
        
        // Extract key-value pairs: "Spanish": "English"
        preg_match_all('/"([^"]+)":\s*"([^"]+)"/s', $objContent, $matches, PREG_SET_ORDER);
        
        foreach ($matches as $match) {
            $spanish = $match[1];
            $english = $match[2];
            // Handle escaped quotes
            $spanish = str_replace('\\"', '"', $spanish);
            $english = str_replace('\\"', '"', $english);
            $translations[$spanish] = $english;
        }
    }
    
    return $translations;
}

/**
 * Parse answer translations from JavaScript file
 */
function parseAnswerTranslations($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }
    
    $content = file_get_contents($filePath);
    $translations = [];
    
    // Find the translations object (handles both }; and } endings)
    if (preg_match('/translations\s*=\s*\{(.*?)\};?/s', $content, $match)) {
        $objContent = $match[1];
        
        // Extract key-value pairs: "Spanish": "English"
        preg_match_all('/"([^"]+)":\s*"([^"]+)"/s', $objContent, $matches, PREG_SET_ORDER);
        
        foreach ($matches as $match) {
            $spanish = $match[1];
            $english = $match[2];
            // Handle escaped quotes
            $spanish = str_replace('\\"', '"', $spanish);
            $english = str_replace('\\"', '"', $english);
            $translations[$spanish] = $english;
        }
    }
    
    return $translations;
}

/**
 * Get the image path for an emoji based on category
 */
function getEmojiImagePath($emoji, $category) {
    if (substr($emoji, -4) !== '.png') {
        return null; // Not an image file
    }
    
    // Map categories to their image folders
    $categoryFolders = [
        'food' => 'food',
        'recreation' => 'recreation',
        'transportation' => 'transportation',
        'accommodation' => 'accommodation',
        'shopping' => 'shopping',
        'people' => 'people',
        'daily_routines' => 'daily_routines',
        'grammar' => 'grammar',
        'plants_animals' => 'plants_animals',
        'environment' => 'environment',
        'business' => 'business',
        'medical' => 'medical',
        'entertainment' => 'entertainment',
        'numbers' => 'numbers',
        'greetings' => 'greetings',
        'directions' => 'directions'
    ];
    
    $folder = isset($categoryFolders[$category]) ? $categoryFolders[$category] : 'food';
    return "https://wordwalker.ca/dist/images/objects/{$folder}/{$emoji}";
}

/**
 * Sanitize text for audio filename (removes ? ! and trailing periods)
 */
function sanitizeForAudioFilename($text) {
    // Remove question marks, exclamation marks
    $text = str_replace(['¿', '?', '¡', '!'], '', $text);
    $text = trim($text);
    // Remove trailing period (audio files don't include the final period before .mp3)
    $text = rtrim($text, '.');
    return $text;
}

/**
 * Get audio path for answer
 */
function getAnswerAudioPath($answer, $category) {
    $sanitized = sanitizeForAudioFilename($answer);
    $audioPath = __DIR__ . "/../../audio-samples/answers/{$category}/{$sanitized}.mp3";
    
    if (file_exists($audioPath)) {
        return "../audio-samples/answers/{$category}/" . rawurlencode($sanitized) . ".mp3";
    }
    return null;
}

/**
 * Get audio path for usage example
 */
function getExampleAudioPath($example, $category) {
    $sanitized = sanitizeForAudioFilename($example);
    $audioPath = __DIR__ . "/../../audio-samples/examples/{$category}/{$sanitized}.mp3";
    
    if (file_exists($audioPath)) {
        return "../audio-samples/examples/{$category}/" . rawurlencode($sanitized) . ".mp3";
    }
    return null;
}

/**
 * Parse JavaScript file to extract questions array
 */
function parseQuestionsFromJS($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }
    
    $content = file_get_contents($filePath);
    $questions = [];
    
    // Find the array definition and extract the content between [ and ]
    if (preg_match('/Questions\s*=\s*\[(.*)\];/s', $content, $arrayMatch)) {
        $arrayContent = $arrayMatch[1];
        
        // Split by objects - look for patterns like },\s*{ (with optional comments in between)
        // First, temporarily replace the closing of one object and opening of next
        // This pattern handles optional whitespace and comments between } and {
        $arrayContent = preg_replace('/\},\s*(?:\/\/[^\n]*\n\s*)*\{/', '}|||{', $arrayContent);
        $objectStrings = explode('|||', $arrayContent);
        
        foreach ($objectStrings as $objectString) {
            $question = [];
            
            // Extract id
            if (preg_match('/id:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $idMatch)) {
                $question['id'] = $idMatch[1];
            }
            
            // Extract emoji
            if (preg_match('/emoji:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $emojiMatch)) {
                $question['emoji'] = $emojiMatch[1];
            }
            
            // Extract category
            if (preg_match('/category:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $categoryMatch)) {
                $question['category'] = $categoryMatch[1];
            }
            
            // Extract question text (handles Spanish characters and nested quotes)
            if (preg_match('/question:\s*[\'"](.+?)[\'"],/s', $objectString, $qMatch)) {
                $question['question'] = str_replace(["\\'", '\\"'], ["'", '"'], $qMatch[1]);
            }
            
            // Extract translation (handles nested quotes)
            if (preg_match('/translation:\s*[\'"](.+?)[\'"],/s', $objectString, $tMatch)) {
                $question['translation'] = str_replace(["\\'", '\\"'], ["'", '"'], $tMatch[1]);
            }
            
            // Extract correct answer
            if (preg_match('/correctAnswer:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $aMatch)) {
                $question['correctAnswer'] = $aMatch[1];
            }
            
            // Extract hint (handles nested quotes)
            if (preg_match('/hint:\s*[\'"](.+?)[\'"],/s', $objectString, $hMatch)) {
                $question['hint'] = str_replace(["\\'", '\\"'], ["'", '"'], $hMatch[1]);
            }
            
            // Extract hintIsQuestion
            if (preg_match('/hintIsQuestion:\s*(true|false)/', $objectString, $hiqMatch)) {
                $question['hintIsQuestion'] = ($hiqMatch[1] === 'true');
            }
            
            // Extract usage example (handles nested quotes)
            if (preg_match('/usageExample:\s*[\'"](.+?)[\'"],/s', $objectString, $uMatch)) {
                $question['usageExample'] = str_replace(["\\'", '\\"'], ["'", '"'], $uMatch[1]);
            }
            
            // Extract example translation (handles nested quotes)
            if (preg_match('/exampleTranslation:\s*[\'"](.+?)[\'"],/s', $objectString, $etMatch)) {
                $question['exampleTranslation'] = str_replace(["\\'", '\\"'], ["'", '"'], $etMatch[1]);
            }
            
            // Extract difficulty
            if (preg_match('/difficulty:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $dMatch)) {
                $question['difficulty'] = $dMatch[1];
            }
            
            // Extract emotion
            if (preg_match('/emotion:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $eMatch)) {
                $question['emotion'] = $eMatch[1];
            }
            
            if (isset($question['id']) && isset($question['question'])) {
                $questions[] = $question;
            }
        }
    }
    
    return $questions;
}
