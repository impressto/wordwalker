#!/usr/bin/env php
<?php
/**
 * Generate Sitemap Entries for Flash Cards Pages
 * 
 * This script generates XML sitemap entries for all flash card pages
 * Run this script to update sitemap.xml with flash card URLs
 * 
 * Usage: php generate-flashcard-sitemap.php
 */

// Configuration
$dataPath = __DIR__ . '/src/config/questions/';
$baseUrl = 'https://wordwalker.ca';
$cardsPerPage = 9;

// Categories (must match flashcards.php)
$categories = [
    'food', 'recreation', 'transportation', 'accommodation', 'shopping',
    'people', 'daily_routines', 'grammar', 'plants_animals', 'environment',
    'business', 'medical', 'entertainment', 'numbers', 'greetings', 'directions'
];

/**
 * Count questions in a JavaScript file
 */
function countQuestionsInFile($filePath) {
    if (!file_exists($filePath)) {
        return 0;
    }
    
    $content = file_get_contents($filePath);
    
    // Count occurrences of "id:" which indicates a question object
    preg_match_all('/id:\s*[\'"][\w_]+[\'"]/', $content, $matches);
    
    return count($matches[0]);
}

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n\n";

echo "  <!-- Flash Cards Static Pages -->\n";

foreach ($categories as $category) {
    $categoryFile = $dataPath . $category . '.js';
    $questionCount = countQuestionsInFile($categoryFile);
    
    if ($questionCount === 0) {
        echo "  <!-- Category '$category': No questions found -->\n";
        continue;
    }
    
    $totalPages = ceil($questionCount / $cardsPerPage);
    echo "  <!-- Category '$category': $questionCount questions, $totalPages pages -->\n";
    
    for ($page = 1; $page <= $totalPages; $page++) {
        $url = "{$baseUrl}/flashcards.php?category={$category}&page={$page}";
        
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($url) . "</loc>\n";
        echo "    <changefreq>monthly</changefreq>\n";
        echo "    <priority>0.6</priority>\n";
        echo "  </url>\n";
    }
    
    echo "\n";
}

echo "</urlset>\n";

// Output summary to stderr
$totalUrls = 0;
foreach ($categories as $category) {
    $categoryFile = $dataPath . $category . '.js';
    $questionCount = countQuestionsInFile($categoryFile);
    if ($questionCount > 0) {
        $totalPages = ceil($questionCount / $cardsPerPage);
        $totalUrls += $totalPages;
    }
}

fwrite(STDERR, "\nGenerated sitemap entries for $totalUrls flash card pages across " . count($categories) . " categories.\n");
fwrite(STDERR, "To add these to your sitemap.xml, run:\n");
fwrite(STDERR, "  php generate-flashcard-sitemap.php >> sitemap.xml\n");
fwrite(STDERR, "Or save to a separate file:\n");
fwrite(STDERR, "  php generate-flashcard-sitemap.php > flashcards-sitemap.xml\n");
