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
require_once __DIR__ . '/includes/search_functions.php';
require_once __DIR__ . '/includes/translations.php';

// Get current language
$currentLang = getCurrentLanguage();

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
        'name' => 'Numbers, Colors & Time',
        'displayName' => 'Números, Colores y Hora',
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
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get parameters from URL
$categoryParam = isset($_GET['category']) ? trim($_GET['category']) : '';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$reset = isset($_GET['reset']) ? (bool)$_GET['reset'] : false;
$searchTerm = isset($_GET['search']) ? trim($_GET['search']) : '';

// Parse multiple categories (comma-separated)
$selectedCategories = [];
$searchAllCategories = false;

if ($categoryParam === 'all') {
    // Search all categories
    $searchAllCategories = true;
    $selectedCategories = array_keys($categories);
} elseif (!empty($categoryParam)) {
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

// Track total before filtering for proper messaging
$totalQuestionsBeforeSearch = count($allQuestions);

// Filter questions based on search term
$allQuestions = filterQuestionsBySearch($allQuestions, $searchTerm, $answerTranslations);

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
if ($searchAllCategories) {
    $pageTitle = "Spanish Flash Cards - All Categories - Page {$page} | WordWalker";
    $pageDescription = "Learn Spanish vocabulary across all categories. Browse all available flash cards. Page {$page} of {$totalPages}.";
} elseif (count($selectedCategories) === 1) {
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
$canonicalUrl = "https://wordwalker.ca/flashcards/?category={$categoryKey}&page={$page}";

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
    
    <!-- Organization Schema for Google Logo -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "WordWalker Spanish",
      "url": "https://wordwalker.ca",
      "logo": "https://wordwalker.ca/images/wordalker-logo-720-720.png"
    }
    </script>
    
    <!-- html2canvas Library for Image Export -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    
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
        
        <!-- Language Toggle -->
        <div class="language-toggle" style="position: absolute; top: 100px; right: 20px; z-index: 100;">
            <button onclick="toggleLanguage('<?php echo $currentLang; ?>')" class="language-toggle-btn" 
                    aria-label="<?php echo t('language'); ?>"
                    title="<?php echo t('language'); ?>">
                <span class="lang-icon">🌐</span>
                <span class="lang-text"><?php echo $currentLang === 'en' ? t('switch_to_spanish') : t('switch_to_english'); ?></span>
            </button>
        </div>
        
        <header>

   
      

            <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin: 20px auto;">
                <img src="https://impressto.ca/wordwalker/public/images/walkers/walker-dog-avatar.png" alt="Dog walker character" width="100" height="100" class="walker-avatar" style="max-width: 100px; height: auto;">
                <img src="https://impressto.ca/wordwalker/images/wordwalker-flashcards-logo-<?php echo $currentLang; ?>.png" alt="WordWalker Flash Cards" width="400" height="120" class="flashcards-logo" style="max-width: 400px; height: auto;">
                <img src="https://impressto.ca/wordwalker/public/images/walkers/walker-default-avatar.png" alt="Default walker character" width="60" height="60" class="walker-avatar" style="max-width: 60px; height: auto;">
            </div>
            <?php if ($searchAllCategories): ?>
                <h1 class="category-name"><?php echo t('all_categories'); ?></h1>
                <div class="category-description"><?php echo t('all_categories_desc'); ?></div>
            <?php elseif (count($selectedCategories) === 1): ?>
                <?php $categoryInfo = $categories[$selectedCategories[0]]; ?>
                <div class="category-emoji">
                    <img src="https://impressto.ca/wordwalker/dist/images/categories/<?php echo urlencode($selectedCategories[0]); ?>.png" 
                         alt="<?php echo htmlspecialchars($categoryInfo['name']); ?>" 
                         width="120" height="120"
                         onerror="this.style.display='none'">
                </div>
                <h1 class="category-name"><?php echo htmlspecialchars(t('category_' . $selectedCategories[0])); ?></h1>
                <div class="category-description"><?php echo htmlspecialchars(t('category_' . $selectedCategories[0] . '_desc')); ?></div>
            <?php else: ?>
                <h1 class="category-name"><?php echo t('multiple_categories'); ?></h1>
                <div class="category-description">
                    <?php 
                    $names = array_map(function($cat) {
                        return t('category_' . $cat);
                    }, $selectedCategories);
                    echo htmlspecialchars(implode(' • ', $names));
                    ?>
                </div>
            <?php endif; ?>
        </header>
        
        <div class="category-selector">
            <div class="category-selector-header">
                <h3><?php echo t('choose_categories'); ?> <span style="font-size: 0.85em; color: #666;"><?php echo t('click_to_toggle'); ?></span></h3>
                <button class="category-toggle-btn" onclick="toggleCategories()" aria-label="<?php echo t('select_categories'); ?>">
                    <span class="toggle-text"><?php echo t('select_categories'); ?></span>
                    <span class="toggle-icon">▼</span>
                </button>
            </div>
            <div class="category-links" id="category-links">
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
                    <a href="?category=<?php echo urlencode($newCategoryParam); ?>&page=1&lang=<?php echo $currentLang; ?>" 
                       class="<?php echo $isSelected ? 'active' : ''; ?>">
                        <?php if ($isSelected): ?>
                            <span class="category-check">✓</span>
                        <?php endif; ?>
                        <img src="https://impressto.ca/wordwalker/dist/images/categories/<?php echo urlencode($catId); ?>.png" 
                             alt="<?php echo htmlspecialchars(t('category_' . $catId)); ?>" 
                             class="category-icon"
                             onerror="this.style.display='none'">
                        <span><?php echo htmlspecialchars(t('category_' . $catId)); ?></span>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>
        
        <?php if ($totalQuestionsBeforeSearch === 0): ?>
            <!-- No cards exist in this category at all -->
            <div class="no-questions">
                <h2><?php echo t('no_cards'); ?></h2>
                <p><?php echo t('no_cards_text'); ?></p>
            </div>
        <?php else: ?>
            <div id="flashcards-start"></div>
            
            <!-- Search Box -->
            <div class="search-container">
                <form method="get" action="" class="search-form">
                    <input type="hidden" name="category" value="<?php echo htmlspecialchars($searchAllCategories ? 'all' : $categoryKey); ?>" id="category-input">
                    <input type="hidden" name="shuffle" value="<?php echo $shuffle ? '1' : '0'; ?>">
                    <input type="hidden" name="lang" value="<?php echo htmlspecialchars($currentLang); ?>">
                    <div class="search-input-wrapper">
                        <input 
                            type="text" 
                            name="search" 
                            id="search-input"
                            placeholder="<?php echo t('search_placeholder'); ?>" 
                            value="<?php echo htmlspecialchars($searchTerm); ?>"
                            class="search-input"
                        >
                        <?php if (!empty($searchTerm)): ?>
                            <a href="?category=<?php echo urlencode($searchAllCategories ? 'all' : $categoryKey); ?>&page=1<?php echo $shuffle ? '&shuffle=1' : ''; ?>&lang=<?php echo $currentLang; ?>" 
                               class="search-clear" 
                               title="<?php echo t('clear_search'); ?>"
                               aria-label="<?php echo t('clear_search'); ?>">✕</a>
                        <?php endif; ?>
                    </div>
                    <div class="search-controls">
                        <label class="search-all-checkbox">
                            <input type="checkbox" 
                                   id="search-all-categories" 
                                   name="search_all" 
                                   value="1"
                                   <?php echo $searchAllCategories ? 'checked' : ''; ?>
                                   onchange="document.getElementById('category-input').value = this.checked ? 'all' : '<?php echo htmlspecialchars($categoryKey); ?>';">
                            <span><?php echo t('search_all_categories'); ?></span>
                        </label>
                        <button type="submit" class="search-button"><?php echo t('search_button'); ?></button>
                    </div>
                </form>
                <?php if (!empty($searchTerm)): ?>
                    <div class="search-results-info">
                        <?php 
                        if ($searchAllCategories) {
                            echo getSearchResultsSummary($totalQuestions, $searchTerm) . ' ' . t('across_all_categories');
                        } else {
                            echo getSearchResultsSummary($totalQuestions, $searchTerm);
                        }
                        ?>
                    </div>
                <?php endif; ?>
            </div>
            
            <?php if (empty($questionsOnPage)): ?>
                <!-- Search returned no results -->
                <div class="no-questions">
                    <h2><?php echo t('no_results'); ?></h2>
                    <p><?php echo t('no_results_text'); ?> "<strong><?php echo htmlspecialchars($searchTerm); ?></strong>". <?php echo t('try_different'); ?> <a href="?category=<?php echo urlencode($categoryKey); ?>&page=1<?php echo $shuffle ? '&shuffle=1' : ''; ?>&lang=<?php echo $currentLang; ?>"><?php echo t('clear_the_search'); ?></a>.</p>
                </div>
            <?php else: ?>
            <div class="shuffle-controls">
                <a href="?category=<?php echo urlencode($categoryKey); ?>&page=1&shuffle=1&reset=1&lang=<?php echo $currentLang; ?>" 
                   onclick="return confirm('<?php echo t('shuffle_confirm'); ?>');" 
                   class="shuffle-btn">
                    <?php echo t('new_shuffle'); ?>
                </a>
                <?php if ($currentLang === 'en'): ?>
                <label class="autoplay-control">
                    <input type="checkbox" id="autoplay-toggle" onchange="toggleAutoplay()">
                    <span><?php echo t('autoplay_audio'); ?></span>
                </label>
                <?php endif; ?>
            </div>
            
            <div class="page-info">
                <strong><?php echo t('page_of'); ?> <?php echo $page; ?> <?php echo t('of'); ?> <?php echo $totalPages; ?></strong>
                (<?php echo $totalQuestions; ?> <?php echo t('total_cards'); ?>)
            </div>
            
            <div class="flashcards-grid">
                <?php foreach ($questionsOnPage as $index => $question): ?>
                    <?php
                    // Swap question and translation when interface is in Spanish
                    if ($currentLang === 'es' && !empty($question['translation'])) {
                        $displayQuestion = $question['translation'];
                        $displayTranslation = $question['question'];
                    } else {
                        $displayQuestion = $question['question'];
                        $displayTranslation = !empty($question['translation']) ? $question['translation'] : null;
                    }
                    ?>
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
                                             alt="<?php echo htmlspecialchars($displayQuestion); ?>"
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
                                    <?php echo htmlspecialchars($displayQuestion); ?>
                                </div>
                                
                                <?php if (!empty($question['hint']) && !empty($question['hintIsQuestion']) && $currentLang === 'en'): ?>
                                    <div class="flashcard-question-hint">
                                        <?php echo htmlspecialchars($question['hint']); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <div class="flip-instruction"><?php echo t('flip_instruction'); ?></div>
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
                                             alt="<?php echo htmlspecialchars($displayQuestion); ?>"
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
                                    <?php echo htmlspecialchars($displayQuestion); ?>
                                </div>
                                
                                <?php if ($displayTranslation): ?>
                                    <div class="flashcard-translation">
                                        <?php echo htmlspecialchars($displayTranslation); ?>
                                    </div>
                                <?php endif; ?>
                        
                        <div class="flashcard-answer<?php echo isset($question['emotion']) ? ' emotion-' . htmlspecialchars($question['emotion']) : ''; ?>">
                            <div class="flashcard-answer-content">
                                <?php 
                                // Get the translation for the correct answer
                                $answerTranslation = isset($answerTranslations[$question['correctAnswer']]) 
                                    ? $answerTranslations[$question['correctAnswer']] 
                                    : null;
                                
                                // Swap answer and translation when interface is in Spanish
                                if ($currentLang === 'es' && !empty($answerTranslation)) {
                                    $displayAnswer = $answerTranslation;
                                    $displayAnswerTranslation = $question['correctAnswer'];
                                } else {
                                    $displayAnswer = $question['correctAnswer'];
                                    $displayAnswerTranslation = $answerTranslation;
                                }
                                ?>
                                <span>✓ <?php echo htmlspecialchars($displayAnswer); ?></span>
                                <?php if (!empty($displayAnswerTranslation)): ?>
                                    <span class="flashcard-answer-translation"><?php echo htmlspecialchars($displayAnswerTranslation); ?></span>
                                <?php endif; ?>
                            </div>
                            <?php 
                            $questionCategory = $question['sourceCategory'] ?? $selectedCategories[0];
                            $answerAudio = getAnswerAudioPath($question['correctAnswer'], $questionCategory);
                            if ($answerAudio && $currentLang === 'en'): ?>
                                <button class="audio-player" 
                                        onclick="playAudio('<?php echo htmlspecialchars($answerAudio); ?>')"
                                        title="Play pronunciation"
                                        aria-label="Play pronunciation of answer"></button>
                            <?php endif; ?>
                        </div>
                        
                        <?php if (!empty($question['hint']) && $currentLang === 'en'): ?>
                            <div class="flashcard-hint">
                                <strong>💡 Hint:</strong> <?php echo htmlspecialchars($question['hint']); ?>
                            </div>
                        <?php endif; ?>
                        
                        <?php if (!empty($question['usageExample'])): ?>
                            <?php 
                            $questionCategory = $question['sourceCategory'] ?? $selectedCategories[0];
                            $exampleAudio = getExampleAudioPath($question['usageExample'], $questionCategory);
                            
                            // Check for translation in the exampleTranslations array
                            $exampleTranslation = isset($exampleTranslations[$question['usageExample']]) 
                                ? $exampleTranslations[$question['usageExample']] 
                                : (isset($question['exampleTranslation']) ? $question['exampleTranslation'] : null);
                            
                            // Swap example and translation when interface is in Spanish
                            if ($currentLang === 'es' && !empty($exampleTranslation)) {
                                $displayExample = $exampleTranslation;
                                $displayExampleTranslation = $question['usageExample'];
                            } else {
                                $displayExample = $question['usageExample'];
                                $displayExampleTranslation = $exampleTranslation;
                            }
                            ?>
                            <div class="flashcard-example"<?php if ($exampleAudio && $currentLang === 'en'): ?> onclick="event.stopPropagation(); playAudio('<?php echo htmlspecialchars($exampleAudio); ?>');" style="cursor: pointer;" title="<?php echo t('play_example'); ?>"<?php endif; ?>>
                                <div class="flashcard-example-content">
                                    <span><strong><?php echo t('example_label'); ?></strong> <?php echo htmlspecialchars($displayExample); ?></span>
                                    <?php if (!empty($displayExampleTranslation)): ?>
                                        <span class="flashcard-example-translation"><?php echo htmlspecialchars($displayExampleTranslation); ?></span>
                                    <?php endif; ?>
                                </div>
                                <?php if ($exampleAudio && $currentLang === 'en'): ?>
                                    <button class="example-audio-player" 
                                            onclick="event.stopPropagation(); playAudio('<?php echo htmlspecialchars($exampleAudio); ?>')"
                                            title="<?php echo t('play_example'); ?>"
                                            aria-label="<?php echo t('play_example'); ?>"></button>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                        
                                <?php if (!empty($question['difficulty'])): ?>
                                    <span class="flashcard-difficulty difficulty-<?php echo htmlspecialchars($question['difficulty']); ?>">
                                        <?php echo t('difficulty_' . strtolower($question['difficulty'])); ?>
                                    </span>
                                <?php endif; ?>
                                
                                <!-- Watermark (hidden by default, shown only during image capture) -->
                                <div class="flashcard-watermark">wordwalker.ca/flashcards</div>
                            </div>
                        </div>
                        
                        <button class="download-card-btn" onclick="downloadCardImage(this)" title="<?php echo t('download_card_image'); ?>" aria-label="<?php echo t('download_card_image'); ?>">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                            <span class="download-text"><?php echo t('save_image'); ?></span>
                        </button>
                    </article>
                <?php endforeach; ?>
            </div>
            
            <!-- Pagination -->
            <nav class="pagination" role="navigation" aria-label="Flash cards pagination">
                <?php 
                $shuffleParam = $shuffle ? '&shuffle=1' : '';
                $searchParam = getSearchParam($searchTerm);
                $langParam = '&lang=' . $currentLang;
                ?>
                <!-- Previous/Next group (shown first on mobile) -->
                <div class="pagination-prev-next">
                    <?php if ($page > 1): ?>
                        <a href="?category=<?php echo urlencode($categoryKey); ?>&page=<?php echo $page - 1; ?><?php echo $shuffleParam . $searchParam . $langParam; ?>#flashcards-start"><?php echo t('previous'); ?></a>
                    <?php else: ?>
                        <span class="disabled"><?php echo t('previous'); ?></span>
                    <?php endif; ?>
                    
                    <?php if ($page < $totalPages): ?>
                        <a href="?category=<?php echo urlencode($categoryKey); ?>&page=<?php echo $page + 1; ?><?php echo $shuffleParam . $searchParam . $langParam; ?>#flashcards-start"><?php echo t('next'); ?></a>
                    <?php else: ?>
                        <span class="disabled"><?php echo t('next'); ?></span>
                    <?php endif; ?>
                </div>
                
                <!-- First/Current/Last group (shown second on mobile) -->
                <div class="pagination-position">
                    <?php if ($page > 1): ?>
                        <a href="?category=<?php echo urlencode($categoryKey); ?>&page=1<?php echo $shuffleParam . $searchParam . $langParam; ?>#flashcards-start"><?php echo t('first'); ?></a>
                    <?php else: ?>
                        <span class="disabled"><?php echo t('first'); ?></span>
                    <?php endif; ?>
                    
                    <span class="current-page"><?php echo t('page_of'); ?> <?php echo $page; ?> <?php echo t('of'); ?> <?php echo $totalPages; ?></span>
                    
                    <?php if ($page < $totalPages): ?>
                        <a href="?category=<?php echo urlencode($categoryKey); ?>&page=<?php echo $totalPages; ?><?php echo $shuffleParam . $searchParam . $langParam; ?>#flashcards-start"><?php echo t('last'); ?></a>
                    <?php else: ?>
                        <span class="disabled"><?php echo t('last'); ?></span>
                    <?php endif; ?>
                </div>
            </nav>
        <?php endif; ?>
        <?php endif; ?>
        
        <div class="links-container">
            <div class="feedback-link">
                <a href="/contact.php"><?php echo t('report_error'); ?></a>
            </div>
            
            <div class="about-link">
                <a href="/about.php"><?php echo t('learn_more'); ?></a>
            </div>
        </div>
        
        <!-- Social Sharing -->
        <div class="social-sharing">
            <h3><?php echo t('share_cards'); ?></h3>
            <p><?php echo t('share_text'); ?></p>
            <div class="social-buttons">
                <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode($canonicalUrl); ?>" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="social-btn facebook"
                   aria-label="Share on Facebook">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                </a>
                
                <a href="https://twitter.com/intent/tweet?url=<?php echo urlencode($canonicalUrl); ?>&text=<?php echo urlencode('Check out these Spanish flash cards on WordWalker!'); ?>" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="social-btn twitter"
                   aria-label="Share on Twitter">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter
                </a>
                
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo urlencode($canonicalUrl); ?>" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="social-btn linkedin"
                   aria-label="Share on LinkedIn">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                </a>
                
                <a href="https://wa.me/?text=<?php echo urlencode('Check out these Spanish flash cards on WordWalker: ' . $canonicalUrl); ?>" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="social-btn whatsapp"
                   aria-label="Share on WhatsApp">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                </a>
                
                <a href="mailto:?subject=<?php echo urlencode('Spanish Flash Cards - WordWalker'); ?>&body=<?php echo urlencode('Check out these Spanish flash cards: ' . $canonicalUrl); ?>" 
                   class="social-btn email"
                   aria-label="Share via Email">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Email
                </a>
            </div>
        </div>
        
        <div class="back-to-app">
            <a href="https://wordwalker.ca"><?php echo t('back_to_app'); ?></a>
        </div>
    </div>
    
    <!-- External JavaScript -->
    <script src="assets/flashcards.js"></script>
</body>
</html>
