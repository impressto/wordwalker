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

// Configuration
$cardsPerPage = 9;
$dataPath = __DIR__ . '/src/config/questions/';

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
    $audioPath = __DIR__ . "/audio-samples/answers/{$category}/{$sanitized}.mp3";
    
    if (file_exists($audioPath)) {
        return "audio-samples/answers/{$category}/" . rawurlencode($sanitized) . ".mp3";
    }
    return null;
}

/**
 * Get audio path for usage example
 */
function getExampleAudioPath($example, $category) {
    $sanitized = sanitizeForAudioFilename($example);
    $audioPath = __DIR__ . "/audio-samples/examples/{$category}/{$sanitized}.mp3";
    
    if (file_exists($audioPath)) {
        return "audio-samples/examples/{$category}/" . rawurlencode($sanitized) . ".mp3";
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

// Get parameters from URL
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;

// Validate category
if (empty($category) || !isset($categories[$category])) {
    $category = 'business'; // Default category
}

$categoryInfo = $categories[$category];
$categoryFile = $dataPath . $category . '.js';

// Load questions from JavaScript file
$allQuestions = parseQuestionsFromJS($categoryFile);
$totalQuestions = count($allQuestions);
$totalPages = ceil($totalQuestions / $cardsPerPage);

// Adjust page if out of bounds
if ($page > $totalPages && $totalPages > 0) {
    $page = $totalPages;
}

// Get questions for current page
$startIndex = ($page - 1) * $cardsPerPage;
$questionsOnPage = array_slice($allQuestions, $startIndex, $cardsPerPage);

// SEO metadata
$pageTitle = "Spanish {$categoryInfo['name']} Flash Cards - Page {$page} | WordWalker";
$pageDescription = "{$categoryInfo['description']}. Learn Spanish vocabulary with interactive flash cards. Page {$page} of {$totalPages}.";
$canonicalUrl = "https://wordwalker.ca/flashcards.php?category={$category}&page={$page}";

// Read version from package.json
$packageJson = json_decode(file_get_contents(__DIR__ . '/package.json'), true);
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
    <meta name="keywords" content="Spanish flashcards, learn Spanish, Spanish vocabulary, <?php echo htmlspecialchars($categoryInfo['name']); ?>, Spanish learning, Spanish pronunciation" />
    
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
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
            color: #333;
            line-height: 1.6;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
        }
        
        header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4CAF50;
        }
        
        h1 {
            color: #4CAF50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .category-emoji {
            margin-bottom: 10px;
        }
        
        .category-emoji img {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }
        
        .category-name {
            color: #2E7D32;
            font-size: 1.8em;
            margin-bottom: 5px;
        }
        
        .category-description {
            color: #666;
            font-size: 1.1em;
        }
        
        .page-info {
            text-align: center;
            color: #666;
            font-size: 1.1em;
            margin-bottom: 30px;
        }
        
        #flashcards-start {
            scroll-margin-top: 20px;
        }
        
        .flashcards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .flashcard {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .flashcard:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        
        .flashcard-emoji {
            font-size: 2.5em;
            margin-bottom: 10px;
            display: block;
        }
        
        .flashcard-emoji-img {
            width: 80px;
            height: 80px;
            object-fit: contain;
            margin-bottom: 10px;
            display: block;
        }
        
        .flashcard-number {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(76, 175, 80, 0.2);
            color: #2E7D32;
            font-weight: bold;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.85em;
        }
        
        .flashcard-question {
            font-size: 1.3em;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 8px;
        }
        
        .flashcard-translation {
            font-size: 1em;
            color: #4a5568;
            margin-bottom: 15px;
            font-style: italic;
        }
        
        .flashcard-answer {
            background: #4CAF50;
            color: white;
            padding: 12px;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        
        .audio-player {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }
        
        .audio-player:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        .audio-player::before {
            content: '🔊';
            font-size: 16px;
        }
        
        .flashcard-hint {
            background: #e6f3ff;
            border-left: 4px solid #3182ce;
            padding: 10px;
            margin-top: 10px;
            border-radius: 4px;
            font-size: 0.9em;
            color: #2c5282;
        }
        
        .flashcard-hint strong {
            color: #2b6cb0;
        }
        
        .flashcard-example {
            background: #f7fafc;
            border-left: 4px solid #48bb78;
            padding: 10px;
            margin-top: 10px;
            border-radius: 4px;
            font-size: 0.9em;
            color: #2f855a;
            font-style: italic;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        
        .example-audio-player {
            background: rgba(72, 187, 120, 0.2);
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }
        
        .example-audio-player:hover {
            background: rgba(72, 187, 120, 0.3);
            transform: scale(1.1);
        }
        
        .example-audio-player::before {
            content: '🔊';
            font-size: 14px;
        }
        
        .flashcard-difficulty {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 600;
            margin-top: 10px;
        }
        
        .difficulty-easy {
            background: #c6f6d5;
            color: #22543d;
        }
        
        .difficulty-medium {
            background: #feebc8;
            color: #7c2d12;
        }
        
        .difficulty-hard {
            background: #fed7d7;
            color: #742a2a;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-top: 40px;
            flex-wrap: wrap;
        }
        
        .pagination a,
        .pagination span {
            display: inline-block;
            padding: 10px 16px;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: background 0.3s ease;
        }
        
        .pagination a:hover {
            background: #45a049;
        }
        
        .pagination .current-page {
            background: #2E7D32;
        }
        
        .pagination .disabled {
            background: #cbd5e0;
            color: #a0aec0;
            cursor: not-allowed;
        }
        
        .category-selector {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .category-selector h3 {
            color: #2d3748;
            margin-bottom: 15px;
        }
        
        .category-links {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .category-links a {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: white;
            color: #4CAF50;
            text-decoration: none;
            border-radius: 20px;
            border: 2px solid #4CAF50;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .category-links a:hover {
            background: #4CAF50;
            color: white;
        }
        
        .category-links a.active {
            background: #4CAF50;
            color: white;
        }
        
        .category-icon {
            width: 24px;
            height: 24px;
            object-fit: contain;
        }
        
        .back-to-app {
            text-align: center;
            margin-top: 30px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
        }
        
        .back-to-app a {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            font-size: 1.1em;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .back-to-app a:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
        }
        
        .no-questions {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        .no-questions h2 {
            color: #4CAF50;
            margin-bottom: 10px;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }
            
            h1 {
                font-size: 1.8em;
            }
            
            .category-name {
                font-size: 1.4em;
            }
            
            .flashcards-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <img src="https://impressto.ca/wordwalker/flashcards-logo.png" alt="WordWalker Flash Cards" style="max-width: 400px; height: auto; margin: 0 auto 20px;">
            <div class="category-emoji">
                <img src="https://impressto.ca/wordwalker/dist/images/categories/<?php echo urlencode($category); ?>.png" 
                     alt="<?php echo htmlspecialchars($categoryInfo['name']); ?>" 
                     onerror="this.style.display='none'">
            </div>
            <div class="category-name"><?php echo htmlspecialchars($categoryInfo['displayName']); ?></div>
            <div class="category-description"><?php echo htmlspecialchars($categoryInfo['description']); ?></div>
        </header>
        
        <div class="category-selector">
            <h3>Choose a Category:</h3>
            <div class="category-links">
                <?php foreach ($categories as $catId => $catInfo): ?>
                    <a href="?category=<?php echo urlencode($catId); ?>&page=1" 
                       class="<?php echo $catId === $category ? 'active' : ''; ?>">
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
            <div class="page-info">
                <strong>Page <?php echo $page; ?> of <?php echo $totalPages; ?></strong>
                (<?php echo $totalQuestions; ?> total flash cards)
            </div>
            
            <div class="flashcards-grid">
                <?php foreach ($questionsOnPage as $index => $question): ?>
                    <article class="flashcard">
                        <div class="flashcard-number">#<?php echo $startIndex + $index + 1; ?></div>
                        
                        <?php if (!empty($question['emoji'])): ?>
                            <?php 
                            $emojiPath = getEmojiImagePath($question['emoji'], $category);
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
                            <span>✓ <?php echo htmlspecialchars($question['correctAnswer']); ?></span>
                            <?php 
                            $answerAudio = getAnswerAudioPath($question['correctAnswer'], $category);
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
                                <span><strong>Example:</strong> <?php echo htmlspecialchars($question['usageExample']); ?></span>
                                <?php 
                                $exampleAudio = getExampleAudioPath($question['usageExample'], $category);
                                echo $exampleAudio;
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
                    </article>
                <?php endforeach; ?>
            </div>
            
            <!-- Pagination -->
            <nav class="pagination" role="navigation" aria-label="Flash cards pagination">
                <?php if ($page > 1): ?>
                    <a href="?category=<?php echo urlencode($category); ?>&page=1#flashcards-start">« First</a>
                    <a href="?category=<?php echo urlencode($category); ?>&page=<?php echo $page - 1; ?>#flashcards-start">‹ Previous</a>
                <?php else: ?>
                    <span class="disabled">« First</span>
                    <span class="disabled">‹ Previous</span>
                <?php endif; ?>
                
                <span class="current-page">Page <?php echo $page; ?> of <?php echo $totalPages; ?></span>
                
                <?php if ($page < $totalPages): ?>
                    <a href="?category=<?php echo urlencode($category); ?>&page=<?php echo $page + 1; ?>#flashcards-start">Next ›</a>
                    <a href="?category=<?php echo urlencode($category); ?>&page=<?php echo $totalPages; ?>#flashcards-start">Last »</a>
                <?php else: ?>
                    <span class="disabled">Next ›</span>
                    <span class="disabled">Last »</span>
                <?php endif; ?>
            </nav>
        <?php endif; ?>
        
        <div class="back-to-app">
            <a href="https://wordwalker.ca">🎮 Try the WordWalker Game</a>
        </div>
    </div>
    
    <script>
        // Audio player functionality
        let currentAudio = null;
        
        function playAudio(audioPath) {
            // Stop currently playing audio if any
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            
            // Create and play new audio
            currentAudio = new Audio(audioPath);
            currentAudio.play().catch(function(error) {
                console.error('Error playing audio:', error);
            });
        }
    </script>
</body>
</html>
