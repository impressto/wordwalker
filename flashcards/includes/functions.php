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
    
    // Find the exampleTranslations object
    if (preg_match('/exampleTranslations\s*=\s*\{(.*?)\};/s', $content, $match)) {
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
    
    // Find the translations object
    if (preg_match('/translations\s*=\s*\{(.*?)\};/s', $content, $match)) {
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
        'daily_routines' => 'routines',
        'grammar' => 'grammar',
        'plants_animals' => 'animals',
        'environment' => 'environment',
        'business' => 'business',
        'medical' => 'medical',
        'entertainment' => 'entertainment',
        'numbers' => 'numbers',
        'greetings' => 'greetings',
        'directions' => 'directions'
    ];
    
    $folder = isset($categoryFolders[$category]) ? $categoryFolders[$category] : 'food';
    return "https://impressto.ca/wordwalker/dist/images/objects/{$folder}/{$emoji}";
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
        
        // Split by objects - look for patterns like },\s*{
        // First, temporarily replace the closing of one object and opening of next
        $arrayContent = preg_replace('/\},\s*\{/', '}|||{', $arrayContent);
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
            
            // Extract question text (handles Spanish characters)
            if (preg_match('/question:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $qMatch)) {
                $question['question'] = $qMatch[1];
            }
            
            // Extract translation
            if (preg_match('/translation:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $tMatch)) {
                $question['translation'] = $tMatch[1];
            }
            
            // Extract correct answer
            if (preg_match('/correctAnswer:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $aMatch)) {
                $question['correctAnswer'] = $aMatch[1];
            }
            
            // Extract hint
            if (preg_match('/hint:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $hMatch)) {
                $question['hint'] = $hMatch[1];
            }
            
            // Extract usage example
            if (preg_match('/usageExample:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $uMatch)) {
                $question['usageExample'] = $uMatch[1];
            }
            
            // Extract example translation
            if (preg_match('/exampleTranslation:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $etMatch)) {
                $question['exampleTranslation'] = $etMatch[1];
            }
            
            // Extract difficulty
            if (preg_match('/difficulty:\s*[\'"]([^\'"]+)[\'"]/', $objectString, $dMatch)) {
                $question['difficulty'] = $dMatch[1];
            }
            
            if (isset($question['id']) && isset($question['question'])) {
                $questions[] = $question;
            }
        }
    }
    
    return $questions;
}
