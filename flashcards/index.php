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

// Determine shuffle state - default to true for first-time visitors
$seedKey = 'shuffle_seed_' . $categoryKey;
if (isset($_GET['shuffle'])) {
    // Explicit shuffle parameter from URL takes precedence
    $shuffle = (bool)$_GET['shuffle'];
} else {
    // Default to shuffled for new visitors (no seed in session)
    $shuffle = true;
}

// Handle shuffle reset
if ($reset && $shuffle) {
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
    <link rel="manifest" href="../dist/manifest.json" />
    
    <!-- Favicon files -->
    <link rel="icon" type="image/x-icon" href="https://wordwalker.ca/dist/favicon.ico" />
    <link rel="icon" type="image/svg+xml" href="https://wordwalker.ca/dist/favicon.svg" />
    <link rel="icon" type="image/png" sizes="96x96" href="https://wordwalker.ca/dist/favicon-96x96.png" />
    <link rel="apple-touch-icon" href="https://wordwalker.ca/dist/apple-touch-icon.png" />
    
    <!-- PWA Icons (large sizes for app install) -->
    <link rel="icon" type="image/png" sizes="192x192" href="https://wordwalker.ca/dist/images/icon-192x192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="https://wordwalker.ca/dist/images/icon-512x512.png" />
    
    <title><?php echo htmlspecialchars($pageTitle); ?></title>
    
    <!-- Structured Data / Schema.org -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "EducationalOccupationalProgram",
        "name": "WordWalker Spanish Flash Cards",
        "description": "Interactive Spanish language learning flash cards with audio pronunciation",
        "provider": {
            "@type": "Organization",
            "name": "WordWalker",
            "url": "https://wordwalker.ca"
        },
        "educationalLevel": "Beginner to Intermediate",
        "teaches": "Spanish Language",
        "inLanguage": ["en", "es"]
    }
    </script>
    
    <!-- External Stylesheet -->
    <link rel="stylesheet" href="assets/flashcards.css">
    <style>
        .github-corner { position: absolute; top: 0; right: 0; z-index: 1000; }
        .github-corner svg { fill: #4CAF50; color: #fff; }
        .github-corner:hover .octo-arm { animation: octocat-wave 560ms ease-in-out; }
        @keyframes octocat-wave { 0%, 100% { transform: rotate(0); } 20%, 60% { transform: rotate(-25deg); } 40%, 80% { transform: rotate(10deg); } }
        @media (max-width: 500px) { .github-corner:hover .octo-arm { animation: none; } .github-corner .octo-arm { animation: octocat-wave 560ms ease-in-out; } }
        .container { position: relative; }
    </style>
</head>
<body>
    <div class="container">
        <a href="https://github.com/impressto/wordwalker" class="github-corner" aria-label="Fork me on GitHub" target="_blank" rel="noopener noreferrer">
            <svg width="80" height="80" viewBox="0 0 250 250" aria-hidden="true">
                <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
                <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
                <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>
            </svg>
        </a>
        <header>

   
      

            <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin: 20px auto;">
                <img src="https://impressto.ca/wordwalker/public/images/walkers/walker-dog-avatar.png" alt="Dog walker character" width="100" height="100" style="max-width: 100px; height: auto;">
                <img src="https://impressto.ca/wordwalker/flashcards-logo.png" alt="WordWalker Flash Cards" width="400" height="120" style="max-width: 400px; height: auto;">
                <img src="https://impressto.ca/wordwalker/public/images/walkers/walker-default-avatar.png" alt="Default walker character" width="60" height="60" style="max-width: 60px; height: auto;">
            </div>
            <?php if (count($selectedCategories) === 1): ?>
                <?php $categoryInfo = $categories[$selectedCategories[0]]; ?>
                <div class="category-emoji">
                    <img src="https://impressto.ca/wordwalker/dist/images/categories/<?php echo urlencode($selectedCategories[0]); ?>.png" 
                         alt="<?php echo htmlspecialchars($categoryInfo['name']); ?>" 
                         width="120" height="120"
                         onerror="this.style.display='none'">
                </div>
                <h1 class="category-name" lang="es"><?php echo htmlspecialchars($categoryInfo['displayName']); ?></h1>
                <div class="category-description"><?php echo htmlspecialchars($categoryInfo['description']); ?></div>
            <?php else: ?>
                <h1 class="category-name">Multiple Categories</h1>
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
                <a href="?category=<?php echo urlencode($categoryKey); ?>&page=1&shuffle=1&reset=1" 
                   onclick="return confirm('Reset shuffle order for this category?');" 
                   class="shuffle-btn">
                    🔄 New Shuffle Order
                </a>
                <label class="autoplay-control">
                    <input type="checkbox" id="autoplay-toggle" onchange="toggleAutoplay()">
                    <span>🔊 Auto-play audio</span>
                </label>
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
                                <span lang="es">✓ <?php echo htmlspecialchars($question['correctAnswer']); ?></span>
                                <?php 
                                // Get the translation for the correct answer
                                $answerTranslation = isset($answerTranslations[$question['correctAnswer']]) 
                                    ? $answerTranslations[$question['correctAnswer']] 
                                    : null;
                                
                                if (!empty($answerTranslation)): ?>
                                    <span class="flashcard-answer-translation" lang="en"><?php echo htmlspecialchars($answerTranslation); ?></span>
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
                                    <span lang="es"><strong>Example:</strong> <?php echo htmlspecialchars($question['usageExample']); ?></span>
                                    <?php 
                                    // Check for translation in the exampleTranslations array
                                    $translation = isset($exampleTranslations[$question['usageExample']]) 
                                        ? $exampleTranslations[$question['usageExample']] 
                                        : (isset($question['exampleTranslation']) ? $question['exampleTranslation'] : null);
                                    
                                    if (!empty($translation)): ?>
                                        <span class="flashcard-example-translation" lang="en"><?php echo htmlspecialchars($translation); ?></span>
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
        
        <div class="feedback-link">
            <a href="/contact.php">💬 Found a translation error or have a suggestion? Let us know!</a>
        </div>
        
        <div class="about-link">
            <a href="/about.php">📖 Learn more about WordWalker and our mission</a>
        </div>
        
        <div class="back-to-app">
            <a href="https://wordwalker.ca">🎮 Try the WordWalker Game (Learning Spanish for Kids)</a>
        </div>
    </div>
    
    <!-- External JavaScript -->
    <script src="assets/flashcards.js"></script>
</body>
</html>
