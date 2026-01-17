<?php
/**
 * Search Functions
 * 
 * Contains search-related functionality for filtering flashcards
 * based on user search queries.
 */

/**
 * Filter questions array based on search term
 * 
 * Searches in both Spanish (correctAnswer) and English (translation) fields.
 * Uses case-insensitive, multi-byte safe string searching.
 * 
 * @param array $questions Array of question objects to filter
 * @param string $searchTerm Search term to filter by
 * @param array $answerTranslations Array mapping Spanish answers to English translations
 * @return array Filtered and re-indexed array of questions
 */
function filterQuestionsBySearch($questions, $searchTerm, $answerTranslations = []) {
    // Return all questions if no search term
    if (empty(trim($searchTerm))) {
        return $questions;
    }
    
    $searchTerm = trim($searchTerm);
    // Escape special regex characters and create word boundary pattern
    $escapedTerm = preg_quote($searchTerm, '/');
    // Pattern matches whole words only (case-insensitive, UTF-8)
    $pattern = '/\b' . $escapedTerm . '\b/iu';
    
    $filteredQuestions = array_filter($questions, function($question) use ($pattern, $answerTranslations) {
        // Search in Spanish correctAnswer (whole word match)
        $spanishMatch = preg_match($pattern, $question['correctAnswer']) === 1;
        
        // Search in English translation (whole word match)
        $englishTranslation = isset($answerTranslations[$question['correctAnswer']]) 
            ? $answerTranslations[$question['correctAnswer']] 
            : '';
        $englishMatch = !empty($englishTranslation) && 
                       preg_match($pattern, $englishTranslation) === 1;
        
        return $spanishMatch || $englishMatch;
    });
    
    // Re-index array after filtering (important for pagination)
    return array_values($filteredQuestions);
}

/**
 * Build search URL parameter string
 * 
 * Helper function to generate URL parameter for search term
 * 
 * @param string $searchTerm The search term
 * @return string URL parameter string (e.g., "&search=hello") or empty string
 */
function getSearchParam($searchTerm) {
    return !empty($searchTerm) ? '&search=' . urlencode($searchTerm) : '';
}

/**
 * Sanitize search term for display
 * 
 * Cleans and sanitizes search term for safe HTML output
 * 
 * @param string $searchTerm Raw search term
 * @return string Sanitized search term
 */
function sanitizeSearchTerm($searchTerm) {
    return htmlspecialchars(trim($searchTerm), ENT_QUOTES, 'UTF-8');
}

/**
 * Get search results summary text
 * 
 * Generates human-readable summary of search results
 * 
 * @param int $resultCount Number of results found
 * @param string $searchTerm The search term used
 * @return string HTML string with search results summary
 */
function getSearchResultsSummary($resultCount, $searchTerm) {
    $sanitizedTerm = sanitizeSearchTerm($searchTerm);
    $pluralSuffix = $resultCount !== 1 ? 's' : '';
    
    return sprintf(
        'Found <strong>%d</strong> card%s matching "<strong>%s</strong>"',
        $resultCount,
        $pluralSuffix,
        $sanitizedTerm
    );
}
