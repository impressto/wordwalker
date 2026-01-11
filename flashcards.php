<?php
/**
 * Legacy Redirect - flashcards.php
 * 
 * Redirects old flashcards.php URLs to the new /flashcards/ location
 * Preserves query parameters (category, page, etc.)
 */

// Build the new URL with query parameters
$queryString = $_SERVER['QUERY_STRING'] ?? '';
$newUrl = 'https://impressto.ca/wordwalker/flashcards' . ($queryString ? '?' . $queryString : '');

// Send 301 Permanent Redirect
header('HTTP/1.1 301 Moved Permanently');
header('Location: ' . $newUrl);
exit();
