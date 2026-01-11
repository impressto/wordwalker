<?php
/**
 * Flash Cards Static Page
 * 
 * Displays 9 flash cards per page from a specified category (3x3 grid)
 * URL format: flashcards.php?category=business&page=1
 * 
 * This page extracts data from JavaScript config files and presents them
 * as static HTML for SEO and accessibility purposes.
 */

// Load helper functions
require_once __DIR__ . '/includes/functions.php';

// Configuration
$cardsPerPage = 9;
$dataPath = __DIR__ . '/../src/config/questions/';

// Categories mapping (must match categories.js)
$categories = [
    'food' => [
        'name' => 'Food and Dining',
        'displayName' => 'Comida y Restaurantes',
        'description' => 'Learn food, dining, and restaurant vocabulary',
        'emoji' => '🍕'
    ],
    'recreation' => [
        'name' => 'Recreation',
        'displayName' => 'Recreación',
        'description' => 'Learn leisure, beach, and outdoor activity vocabulary',
        'emoji' => '⚽'
    ],
    'transportation' => [
        'name' => 'Transportation',
        'displayName' => 'Transporte',
        'description' => 'Learn transportation and travel vocabulary',
        'emoji' => '🚌'
    ],
    'accommodation' => [
        'name' => 'Accommodation',
        'displayName' => 'Alojamiento',
        'description' => 'Learn accommodation and lodging vocabulary',
        'emoji' => '🏨'
    ],
    'shopping' => [
        'name' => 'Shopping',
        'displayName' => 'Compras',
        'description' => 'Learn shopping and clothing vocabulary',
        'emoji' => '🛒'
    ],
    'people' => [
        'name' => 'People & Relationships',
        'displayName' => 'Gente y Relaciones',
        'description' => 'Learn family, professions, and describing people',
        'emoji' => '👨‍👩‍👧'
    ],
    'daily_routines' => [
        'name' => 'Daily Routines',
        'displayName' => 'Rutinas Diarias',
        'description' => 'Learn daily activities and reflexive verbs',
        'emoji' => '⏰'
    ],
    'grammar' => [
        'name' => 'Grammar',
        'displayName' => 'Gramática',
        'description' => 'Learn Spanish grammar, verb conjugations, and sentence structure',
        'emoji' => '📚'
    ],
    'plants_animals' => [
        'name' => 'Plants and Animals',
        'displayName' => 'Plantas y Animales',
        'description' => 'Learn plant and animal names and characteristics',
        'emoji' => '🐾'
    ],
    'environment' => [
        'name' => 'Weather & Environment',
        'displayName' => 'Clima y Medio Ambiente',
        'description' => 'Learn weather, climate, and environmental vocabulary',
        'emoji' => '🌍'
    ],
    'business' => [
        'name' => 'Work and Business',
        'displayName' => 'Negocios y Trabajo',
        'description' => 'Learn business, work, and office vocabulary',
        'emoji' => '💼'
    ],
    'medical' => [
        'name' => 'Medical & Emergencies',
        'displayName' => 'Médico y Emergencias',
        'description' => 'Learn medical and emergency vocabulary',
        'emoji' => '🏥'
    ],
    'entertainment' => [
        'name' => 'Entertainment',
        'displayName' => 'Entretenimiento',
        'description' => 'Learn entertainment and hobby vocabulary',
        'emoji' => '🎬'
    ],
    'numbers' => [
        'name' => 'Numbers, Dates & Time',
        'displayName' => 'Números, Fechas y Hora',
        'description' => 'Learn numbers, dates, times, and calendar vocabulary',
        'emoji' => '🔢'
    ],
    'greetings' => [
        'name' => 'Greetings & Conversations',
        'displayName' => 'Saludos y Conversaciones',
        'description' => 'Learn greetings, farewells, and common conversation phrases',
        'emoji' => '👋'
    ],
    'directions' => [
        'name' => 'Places and Directions',
        'displayName' => 'Lugares y Direcciones',
        'description' => 'Learn sightseeing & landmarks vocabulary',
        'emoji' => '🧭'
    ]
];

// Start session for randomization persistence
session_start();

// Get parameters from URL
$categoryParam = isset($_GET['category']) ? trim($_GET['category']) : '';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$shuffle = isset($_GET['shuffle']) ? (bool)$_GET['shuffle'] : false;
$reset = isset($_GET['reset']) ? (bool)$_GET['reset'] : false;

// Parse multiple categories (comma-separated)
$selectedCategories = [];
if (!empty($categoryParam)) {
    $categoryList = explode(',', $categoryParam);
    foreach ($categoryList as $cat) {
        $cat = trim($cat);
        if (isset($categories[$cat])) {
            $selectedCategories[] = $cat;
        }
    }
}

// Default to 'business' if no valid categories
if (empty($selectedCategories)) {
    $selectedCategories = ['business'];
}

// Create category key for session/display
$categoryKey = implode(',', $selectedCategories);

// Handle shuffle reset
if ($reset && $shuffle) {
    $seedKey = 'shuffle_seed_' . $categoryKey;
    unset($_SESSION[$seedKey]);
    // Redirect to remove reset parameter
    header("Location: ?category=" . urlencode($categoryKey) . "&page=1&shuffle=1");
    exit;
}

// Load answer translations
$answerTranslationsFile = __DIR__ . '/../src/config/translations/answers/answer_translations.js';
$answerTranslations = parseAnswerTranslations($answerTranslationsFile);

// Load example translations
$translationsFile = __DIR__ . '/../src/config/translations/example_translations.js';
$exampleTranslations = parseExampleTranslations($translationsFile);

// Load questions from all selected categories
$allQuestions = [];
foreach ($selectedCategories as $cat) {
    $categoryFile = $dataPath . $cat . '.js';
    $questions = parseQuestionsFromJS($categoryFile);
    
    // Tag each question with its source category for display
    foreach ($questions as &$question) {
        $question['sourceCategory'] = $cat;
        $question['sourceCategoryInfo'] = $categories[$cat];
    }
    
    $allQuestions = array_merge($allQuestions, $questions);
}

// Handle randomization with persistent seed per user per category combination
if ($shuffle) {
    // Generate or retrieve shuffle seed for this category combination
    $seedKey = 'shuffle_seed_' . $categoryKey;
    
    if (!isset($_SESSION[$seedKey])) {
        // Create a new random seed for this user/category combination
        $_SESSION[$seedKey] = mt_rand();
    }
    
    // Use the seed to shuffle consistently
    mt_srand($_SESSION[$seedKey]);
    shuffle($allQuestions);
    mt_srand(); // Reset random seed
}

$totalQuestions = count($allQuestions);
$totalPages = ceil($totalQuestions / $cardsPerPage);

// Adjust page if out of bounds
if ($page > $totalPages && $totalPages > 0) {
    $page = $totalPages;
}

// Get questions for current page
$startIndex = ($page - 1) * $cardsPerPage;
$questionsOnPage = array_slice($allQuestions, $startIndex, $cardsPerPage);

// SEO metadata for multiple categories
if (count($selectedCategories) === 1) {
    $categoryInfo = $categories[$selectedCategories[0]];
    $pageTitle = "Spanish {$categoryInfo['name']} Flash Cards - Page {$page} | WordWalker";
    $pageDescription = "{$categoryInfo['description']}. Learn Spanish vocabulary with interactive flash cards. Page {$page} of {$totalPages}.";
} else {
    $categoryNames = array_map(function($cat) use ($categories) {
        return $categories[$cat]['name'];
    }, $selectedCategories);
    $categoriesText = implode(', ', $categoryNames);
    $pageTitle = "Spanish Flash Cards - {$categoriesText} - Page {$page} | WordWalker";
    $pageDescription = "Learn Spanish vocabulary across multiple categories: {$categoriesText}. Page {$page} of {$totalPages}.";
}
$canonicalUrl = "https://wordwalker.ca/flashcards.php?category={$categoryKey}&page={$page}";

// Read version from package.json
$packageJson = json_decode(file_get_contents(__DIR__ . '/../package.json'), true);
$version = $packageJson['version'] ?? '1.0.0';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-PZM4VDRQ');</script>
    <!-- End Google Tag Manager -->
    <meta charset="UTF-8" />
    
    <!-- SEO Optimization -->
    <link rel="canonical" href="<?php echo htmlspecialchars($canonicalUrl); ?>" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="WordWalker" />
    
    <!-- PWA Mobile Optimization -->
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#4CAF50" />
    <meta name="description" content="<?php echo htmlspecialchars($pageDescription); ?>" />
    <meta name="keywords" content="Spanish flashcards, learn Spanish, Spanish vocabulary, Spanish learning, Spanish pronunciation" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="<?php echo htmlspecialchars($canonicalUrl); ?>" />
    <meta property="og:title" content="<?php echo htmlspecialchars($pageTitle); ?>" />
    <meta property="og:description" content="<?php echo htmlspecialchars($pageDescription); ?>" />
    <meta property="og:image" content="https://wordwalker.ca/dist/images/word-walker.jpg" />
    <meta property="og:image:alt" content="WordWalker Spanish Flash Cards" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:site_name" content="WordWalker" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="<?php echo htmlspecialchars($canonicalUrl); ?>" />
    <meta property="twitter:title" content="<?php echo htmlspecialchars($pageTitle); ?>" />
    <meta property="twitter:description" content="<?php echo htmlspecialchars($pageDescription); ?>" />
    <meta property="twitter:image" content="https://wordwalker.ca/dist/images/word-walker.jpg" />
    <meta property="twitter:image:alt" content="WordWalker Spanish Flash Cards" />
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="dist/manifest.json" />
    
    <!-- Favicon files -->
    <link rel="icon" type="image/x-icon" href="https://wordwalker.ca/dist/favicon.ico" />
    <link rel="icon" type="image/svg+xml" href="https://wordwalker.ca/dist/favicon.svg" />
    <link rel="icon" type="image/png" sizes="96x96" href="https://wordwalker.ca/dist/favicon-96x96.png" />
    <link rel="apple-touch-icon" href="https://wordwalker.ca/dist/apple-touch-icon.png" />
    
    <!-- PWA Icons (large sizes for app install) -->
    <link rel="icon" type="image/png" sizes="192x192" href="https://wordwalker.ca/dist/images/icon-192x192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="https://wordwalker.ca/dist/images/icon-512x512.png" />
    
    <title><?php echo htmlspecialchars($pageTitle); ?></title>
    
    <!-- External Stylesheet -->
    <link rel="stylesheet" href="assets/flashcards.css">
</head>
<body>
    <div class="container">
        <header>
            <img src="https://impressto.ca/wordwalker/flashcards-logo.png" alt="WordWalker Flash Cards" style="max-width: 400px; height: auto; margin: 0 auto 20px;">
            <?php if (count($selectedCategories) === 1): ?>
                <?php $categoryInfo = $categories[$selectedCategories[0]]; ?>
                <div class="category-emoji">
                    <img src="https://impressto.ca/wordwalker/dist/images/categories/<?php echo urlencode($selectedCategories[0]); ?>.png" 
                         alt="<?php echo htmlspecialchars($categoryInfo['name']); ?>" 
                         onerror="this.style.display='none'">
                </div>
                <div class="category-name"><?php echo htmlspecialchars($categoryInfo['displayName']); ?></div>
                <div class="category-description"><?php echo htmlspecialchars($categoryInfo['description']); ?></div>
            <?php else: ?>
                <div class="category-name">Multiple Categories</div>
                <div class="category-description">
                    <?php 
                    $names = array_map(function($cat) use ($categories) {
                        return $categories[$cat]['displayName'];
                    }, $selectedCategories);
                    echo htmlspecialchars(implode(' • ', $names));
                    ?>
                </div>
            <?php endif; ?>
        </header>
        
        <div class="category-selector">
            <h3>Choose Categories: <span style="font-size: 0.85em; color: #666;">(Click to add/remove)</span></h3>
            <div class="category-links">
                <?php foreach ($categories as $catId => $catInfo): 
                    $isSelected = in_array($catId, $selectedCategories);
                    
                    // Build new category list
                    if ($isSelected) {
                        // Remove this category
                        $newCategories = array_filter($selectedCategories, function($c) use ($catId) {
                            return $c !== $catId;
                        });
                        // If removing the last one, keep it selected
                        if (empty($newCategories)) {
                            $newCategories = [$catId];
                        }
                    } else {
                        // Add this category
                        $newCategories = array_merge($selectedCategories, [$catId]);
                    }
                    $newCategoryParam = implode(',', $newCategories);
                ?>
                    <a href="?category=<?php echo urlencode($newCategoryParam); ?>&page=1" 
                       class="<?php echo $isSelected ? 'active' : ''; ?>">
                        <?php if ($isSelected): ?>
                            <span class="category-check">✓</span>
                        <?php endif; ?>
                        <img src="https://impressto.ca/wordwalker/dist/images/categories/<?php echo urlencode($catId); ?>.png" 
                             alt="<?php echo htmlspecialchars($catInfo['name']); ?>" 
                             class="category-icon"
                             onerror="this.style.display='none'">
                        <span><?php echo htmlspecialchars($catInfo['name']); ?></span>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>
        
        <?php if (empty($questionsOnPage)): ?>
            <div class="no-questions">
                <h2>No flash cards available</h2>
                <p>There are no flash cards available for this category yet.</p>
            </div>
        <?php else: ?>
            <div id="flashcards-start"></div>
            
            <!-- Shuffle Controls -->
            <div class="shuffle-controls">
                <?php if ($shuffle): ?>
                    <span class="shuffle-status">🔀 Shuffled</span>
                    <a href="?category=<?php echo urlencode($categoryKey); ?>&page=1" class="shuffle-btn">
                        📋 Show Original Order
                    </a>
                    <a href="?category=<?php echo urlencode($categoryKey); ?>&page=1&shuffle=1&reset=1" 
                       onclick="return confirm('Reset shuffle order for this category?');" 
                       class="shuffle-btn">
                        🔄 New Shuffle Order
                    </a>
                <?php else: ?>
                    <a href="?category=<?php echo urlencode($categoryKey); ?>&page=1&shuffle=1" class="shuffle-btn">
                        🔀 Shuffle Cards
                    </a>
                <?php endif; ?>
            </div>
            
            <div class="page-info">
                <strong>Page <?php echo $page; ?> of <?php echo $totalPages; ?></strong>
                (<?php echo $totalQuestions; ?> total flash cards)
            </div>
            
            <div class="flashcards-grid">
                <?php foreach ($questionsOnPage as $index => $question): ?>
                    <article class="flashcard" onclick="flipCard(this)">
                        <div class="flashcard-inner">
                            <!-- Front of card (Question side) -->
                            <div class="flashcard-front">
                                <div class="flashcard-number">#<?php echo $startIndex + $index + 1; ?></div>
                                
                                <?php if (!empty($question['emoji'])): ?>
                                    <?php 
                                    $questionCategory = $question['sourceCategory'] ?? $selectedCategories[0];
                                    $emojiPath = getEmojiImagePath($question['emoji'], $questionCategory);
                                    if ($emojiPath): ?>
                                        <!-- Emoji is an image file -->
                                        <img src="<?php echo htmlspecialchars($emojiPath); ?>" 
                                             alt="<?php echo htmlspecialchars($question['question']); ?>"
                                             class="flashcard-emoji-img"
                                             onerror="this.style.display='none'">
                                    <?php else: ?>
                                        <!-- Emoji is unicode character -->
                                        <span class="flashcard-emoji">
                                            <?php echo htmlspecialchars($question['emoji']); ?>
                                        </span>
                                    <?php endif; ?>
                                <?php endif; ?>
                                
                                <div class="flashcard-question">
                                    <?php echo htmlspecialchars($question['question']); ?>
                                </div>
                                
                                <div class="flip-instruction">👆 Click to reveal answer</div>
                            </div>
                            
                            <!-- Back of card (Answer side) -->
                            <div class="flashcard-back">
                                <div class="flashcard-number">#<?php echo $startIndex + $index + 1; ?></div>
                                
                                <?php if (!empty($question['emoji'])): ?>
                                    <?php 
                                    $questionCategory = $question['sourceCategory'] ?? $selectedCategories[0];
                                    $emojiPath = getEmojiImagePath($question['emoji'], $questionCategory);
                                    if ($emojiPath): ?>
                                        <!-- Emoji is an image file -->
                                        <img src="<?php echo htmlspecialchars($emojiPath); ?>" 
                                             alt="<?php echo htmlspecialchars($question['question']); ?>"
                                             class="flashcard-emoji-img"
                                             onerror="this.style.display='none'">
                                    <?php else: ?>
                                        <!-- Emoji is unicode character -->
                                        <span class="flashcard-emoji">
                                            <?php echo htmlspecialchars($question['emoji']); ?>
                                        </span>
                                    <?php endif; ?>
                                <?php endif; ?>
                                
                                <div class="flashcard-question">
                                    <?php echo htmlspecialchars($question['question']); ?>
                                </div>
                                
                                <?php if (!empty($question['translation'])): ?>
                                    <div class="flashcard-translation">
                                        <?php echo htmlspecialchars($question['translation']); ?>
                                    </div>
                                <?php endif; ?>
                        
                        <div class="flashcard-answer">
                            <div class="flashcard-answer-content">
                                <span>✓ <?php echo htmlspecialchars($question['correctAnswer']); ?></span>
                                <?php 
                                // Get the translation for the correct answer
                                $answerTranslation = isset($answerTranslations[$question['correctAnswer']]) 
                                    ? $answerTranslations[$question['correctAnswer']] 
                                    : null;
                                
                                if (!empty($answerTranslation)): ?>
                                    <span class="flashcard-answer-translation"><?php echo htmlspecialchars($answerTranslation); ?></span>
                                <?php endif; ?>
                            </div>
                            <?php 
                            $questionCategory = $question['sourceCategory'] ?? $selectedCategories[0];
                            $answerAudio = getAnswerAudioPath($question['correctAnswer'], $questionCategory);
                            if ($answerAudio): ?>
                                <button class="audio-player" 
                                        onclick="playAudio('<?php echo htmlspecialchars($answerAudio); ?>')"
                                        title="Play pronunciation"
                                        aria-label="Play pronunciation of answer"></button>
                            <?php endif; ?>
                        </div>
                        
                        <?php if (!empty($question['hint'])): ?>
                            <div class="flashcard-hint">
                                <strong>💡 Hint:</strong> <?php echo htmlspecialchars($question['hint']); ?>
                            </div>
                        <?php endif; ?>
                        
                        <?php if (!empty($question['usageExample'])): ?>
                            <div class="flashcard-example">
                                <div class="flashcard-example-content">
                                    <span><strong>Example:</strong> <?php echo htmlspecialchars($question['usageExample']); ?></span>
                                    <?php 
                                    // Check for translation in the exampleTranslations array
                                    $translation = isset($exampleTranslations[$question['usageExample']]) 
                                        ? $exampleTranslations[$question['usageExample']] 
                                        : (isset($question['exampleTranslation']) ? $question['exampleTranslation'] : null);
                                    
                                    if (!empty($translation)): ?>
                                        <span class="flashcard-example-translation"><?php echo htmlspecialchars($translation); ?></span>
                                    <?php endif; ?>
                                </div>
                                <?php 
                                $questionCategory = $question['sourceCategory'] ?? $selectedCategories[0];
                                $exampleAudio = getExampleAudioPath($question['usageExample'], $questionCategory);
                                if ($exampleAudio): ?>
                                    <button class="example-audio-player" 
                                            onclick="playAudio('<?php echo htmlspecialchars($exampleAudio); ?>')"
                                            title="Play example"
                                            aria-label="Play example sentence"></button>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                        
                                <?php if (!empty($question['difficulty'])): ?>
                                    <span class="flashcard-difficulty difficulty-<?php echo htmlspecialchars($question['difficulty']); ?>">
                                        <?php echo strtoupper(htmlspecialchars($question['difficulty'])); ?>
                                    </span>
                                <?php endif; ?>
                            </div>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
            
            <!-- Pagination -->
            <nav class="pagination" role="navigation" aria-label="Flash cards pagination">
                <?php 
                $shuffleParam = $shuffle ? '&shuffle=1' : '';
                ?>
                <?php if ($page > 1): ?>
                    <a href="?category=<?php echo urlencode($categoryKey); ?>&page=1<?php echo $shuffleParam; ?>#flashcards-start">« First</a>
                    <a href="?category=<?php echo urlencode($categoryKey); ?>&page=<?php echo $page - 1; ?><?php echo $shuffleParam; ?>#flashcards-start">‹ Previous</a>
                <?php else: ?>
                    <span class="disabled">« First</span>
                    <span class="disabled">‹ Previous</span>
                <?php endif; ?>
                
                <span class="current-page">Page <?php echo $page; ?> of <?php echo $totalPages; ?></span>
                
                <?php if ($page < $totalPages): ?>
                    <a href="?category=<?php echo urlencode($categoryKey); ?>&page=<?php echo $page + 1; ?><?php echo $shuffleParam; ?>#flashcards-start">Next ›</a>
                    <a href="?category=<?php echo urlencode($categoryKey); ?>&page=<?php echo $totalPages; ?><?php echo $shuffleParam; ?>#flashcards-start">Last »</a>
                <?php else: ?>
                    <span class="disabled">Next ›</span>
                    <span class="disabled">Last »</span>
                <?php endif; ?>
            </nav>
        <?php endif; ?>
        
        <div class="back-to-app">
            <a href="https://wordwalker.ca">🎮 Try the WordWalker Game (Learning Spanish for Kids)</a>
        </div>
    </div>
    
    <!-- External JavaScript -->
    <script src="assets/flashcards.js"></script>
</body>
</html>
