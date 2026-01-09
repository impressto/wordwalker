<?php
// Read version from package.json for cache busting
$packageJson = json_decode(file_get_contents(__DIR__ . '/package.json'), true);
$version = $packageJson['version'] ?? '1.0.0';

// Category metadata for SEO deep linking
$categories = [
    'food' => ['name' => 'Food & Dining', 'description' => 'Learn Spanish food vocabulary including fruits, vegetables, meals, and dining phrases', 'emoji' => '🍕'],
    'shopping' => ['name' => 'Shopping', 'description' => 'Master Spanish shopping vocabulary for stores, clothes, prices, and transactions', 'emoji' => '🛒'],
    'entertainment' => ['name' => 'Entertainment', 'description' => 'Learn Spanish entertainment vocabulary for movies, music, sports, and leisure activities', 'emoji' => '🎬'],
    'accommodation' => ['name' => 'Accommodation', 'description' => 'Study Spanish hotel and lodging vocabulary for bookings, rooms, and amenities', 'emoji' => '🏨'],
    'transportation' => ['name' => 'Transportation', 'description' => 'Learn Spanish transportation vocabulary for cars, buses, trains, and travel', 'emoji' => '🚌'],
    'directions' => ['name' => 'Directions', 'description' => 'Master Spanish direction vocabulary to navigate and give directions in Spanish', 'emoji' => '🧭'],
    'medical' => ['name' => 'Medical & Health', 'description' => 'Learn essential Spanish medical vocabulary for doctors, hospitals, and health', 'emoji' => '🏥'],
    'greetings' => ['name' => 'Greetings', 'description' => 'Master Spanish greetings, introductions, and common courtesy phrases', 'emoji' => '👋'],
    'numbers' => ['name' => 'Numbers', 'description' => 'Learn Spanish numbers, counting, and basic math vocabulary', 'emoji' => '🔢'],
    'grammar' => ['name' => 'Grammar', 'description' => 'Study essential Spanish grammar terms and language concepts', 'emoji' => '📚'],
    'recreation' => ['name' => 'Recreation', 'description' => 'Learn Spanish vocabulary for hobbies, sports, and recreational activities', 'emoji' => '⚽'],
    'plants_animals' => ['name' => 'Plants & Animals', 'description' => 'Master Spanish vocabulary for animals, pets, plants, and nature', 'emoji' => '🐾'],
    'environment' => ['name' => 'Environment', 'description' => 'Learn Spanish environmental vocabulary for nature, weather, and ecology', 'emoji' => '🌍'],
    'daily_routines' => ['name' => 'Daily Routines', 'description' => 'Study Spanish vocabulary for daily activities, schedules, and routines', 'emoji' => '⏰'],
    'people' => ['name' => 'People & Family', 'description' => 'Learn Spanish vocabulary for family members, relationships, and people', 'emoji' => '👨‍👩‍👧'],
    'emergencies' => ['name' => 'Emergencies', 'description' => 'Master essential Spanish emergency vocabulary for safety and urgent situations', 'emoji' => '🚨'],
    'business' => ['name' => 'Business', 'description' => 'Learn Spanish business vocabulary for work, office, and professional settings', 'emoji' => '💼'],
    'restaurant' => ['name' => 'Restaurant', 'description' => 'Study Spanish restaurant vocabulary for ordering food, menus, and dining out', 'emoji' => '🍽️']
];

// Check for category parameter in URL
$category = isset($_GET['category']) ? $_GET['category'] : null;
$categoryData = $category && isset($categories[$category]) ? $categories[$category] : null;

// Set page title and description based on category
$pageTitle = $categoryData 
    ? "Learn Spanish {$categoryData['name']} Vocabulary - WordWalker Flashcards" 
    : "WordWalker - Learn Spanish Vocabulary";
$pageDescription = $categoryData 
    ? "{$categoryData['description']}. Interactive flashcards with audio pronunciation. Free Spanish learning game." 
    : "Learn Spanish vocabulary through an interactive walking game! Master 2500+ words across 16 categories with audio pronunciation, flashcards, and themed landscapes. Free online Spanish learning game.";
$pageUrl = $categoryData 
    ? "https://wordwalker.ca/?category={$category}" 
    : "https://wordwalker.ca/";
$pageKeywords = $categoryData 
    ? "Spanish {$categoryData['name']}, learn Spanish {$categoryData['name']} vocabulary, Spanish flashcards, Spanish pronunciation, Spanish learning game" 
    : "learn Spanish online, Spanish vocabulary game, Spanish learning app, language learning game, educational Spanish game, Spanish flashcards, Spanish pronunciation, free Spanish lessons, interactive Spanish learning, Spanish for beginners";
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
    <link rel="canonical" href="<?php echo $pageUrl; ?>" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="WordWalker" />
    
    <!-- PWA Mobile Optimization -->
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#4CAF50" />
    <meta name="description" content="<?php echo htmlspecialchars($pageDescription); ?>" />
    <meta name="keywords" content="<?php echo htmlspecialchars($pageKeywords); ?>" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="<?php echo $pageUrl; ?>" />
    <meta property="og:title" content="<?php echo htmlspecialchars($pageTitle); ?>" />
    <meta property="og:description" content="<?php echo htmlspecialchars($pageDescription); ?>" />
    <meta property="og:image" content="https://wordwalker.ca/dist/images/word-walker.jpg" />
    <meta property="og:image:alt" content="WordWalker Spanish Learning Game Screenshot" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:site_name" content="WordWalker" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="<?php echo $pageUrl; ?>" />
    <meta property="twitter:title" content="<?php echo htmlspecialchars($pageTitle); ?>" />
    <meta property="twitter:description" content="<?php echo htmlspecialchars($pageDescription); ?>" />
    <meta property="twitter:image" content="https://wordwalker.ca/dist/images/word-walker.jpg" />
    <meta property="twitter:image:alt" content="WordWalker Spanish Learning Game Screenshot" />
    
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
    
    <!-- Apple Mobile Web App -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-fullscreen" />
    <meta name="apple-mobile-web-app-title" content="WordWalker" />
    <link rel="apple-touch-icon" sizes="192x192" href="dist/images/icon-192x192.png" />
    <link rel="apple-touch-icon" sizes="512x512" href="dist/images/icon-512x512.png" />
    
    <!-- Performance & SEO - Resource Hints -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://www.googletagmanager.com" />
    <link rel="dns-prefetch" href="https://www.google-analytics.com" />
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    
    <title><?php echo htmlspecialchars($pageTitle); ?></title>
    <link rel="stylesheet" href="dist/assets/index.css?v=<?php echo $version; ?>">
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-RW57KFP7PK"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-RW57KFP7PK');
    </script>

    <!-- Structured Data (JSON-LD) for SEO -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "<?php echo $categoryData ? "WordWalker - {$categoryData['name']}" : "WordWalker"; ?>",
      "url": "<?php echo $pageUrl; ?>",
      "description": "<?php echo htmlspecialchars($pageDescription); ?>",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web Browser, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": "Impressto",
        "url": "https://impressto.ca/"
      },
      "inLanguage": ["en", "es"],
      "keywords": "<?php echo htmlspecialchars($pageKeywords); ?>",
      "screenshot": "https://wordwalker.ca/dist/images/word-walker.jpg",
      "softwareVersion": "<?php echo $version; ?>",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "50435",
        "bestRating": "5",
        "worstRating": "1"
      },
      "featureList": [
        "200+ Spanish vocabulary words",
        "18 themed categories",
        "Audio pronunciation",
        "Interactive flashcards",
        "Progress tracking",
        "Offline support",
        "Multiple character themes",
        "Background music and themes"
      ]<?php if ($categoryData): ?>,
      "educationalLevel": "Beginner to Intermediate",
      "teaches": "Spanish <?php echo $categoryData['name']; ?> Vocabulary"
      <?php endif; ?>
    }
    </script>

    <style>
        /* Prevent scrolling and ensure fullscreen on mobile */
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
           /* overflow: hidden; messed up edge gradient */
            position: fixed;
            touch-action: none;
            -webkit-overflow-scrolling: touch;
            background-color: #000000;
        }
        
        /* Sunken gradient effect on app container edges */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 600px;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            box-shadow: 
              inset 10px 0 10px -10px rgba(0, 0, 0, 0.95), 
              inset -10px 0 10px -10px rgba(0, 0, 0, 0.95);
        }
        
        #wordwalk-game-root, #root {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        /* Hide address bar on mobile browsers */
        @media screen and (max-width: 768px) {
            html {
                height: 100vh;
                height: -webkit-fill-available;
            }
            body {
                min-height: 100vh;
                min-height: -webkit-fill-available;
            }
        }
        
        /* Back to Arcade link */
        .back-to-arcade {
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 10001;
            background: rgba(0, 0, 0, 0.7);
            color: #4CAF50;
            padding: 8px 12px;
            border-radius: 6px;
            text-decoration: none;
            font-family: 'Quicksand', sans-serif;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: background 0.3s, transform 0.2s;
        }
        .back-to-arcade:hover {
            background: rgba(76, 175, 80, 0.2);
            transform: scale(1.05);
        }
        
        /* Hide Arcade link on mobile */
        @media screen and (max-width: 768px) {
            .back-to-arcade {
                display: none;
            }
        }
    </style>
  </head>
  <body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PZM4VDRQ"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    <a href="https://impressto.ca/games.php" class="back-to-arcade">
        <span class="material-icons" style="font-size: 18px;">arrow_back</span>
        Arcade
    </a>
    <noscript>
      <h1>WordWalker - Learn Spanish Vocabulary</h1>
      <p>You need to enable JavaScript to run this interactive Spanish learning game.</p>
      <p>WordWalker helps you master Spanish vocabulary through an engaging walking adventure with audio pronunciation and flashcards.</p>
    </noscript>
    
    <!-- SEO Content for Crawlers -->
    <div id="wordwalk-game-root">
      <div id="root">
        <!-- This content will be replaced by React but helps SEO crawlers -->
        <main style="display: none;">
          <?php if ($categoryData): ?>
          <h1>Learn Spanish <?php echo htmlspecialchars($categoryData['name']); ?> Vocabulary <?php echo $categoryData['emoji']; ?></h1>
          <h2>Interactive Spanish <?php echo htmlspecialchars($categoryData['name']); ?> Flashcards</h2>
          <p><?php echo htmlspecialchars($categoryData['description']); ?>. Practice with audio pronunciation and interactive flashcards in the WordWalker Spanish learning game.</p>
          
          <h3>Study Spanish <?php echo htmlspecialchars($categoryData['name']); ?> Words</h3>
          <p>Master essential Spanish <?php echo strtolower($categoryData['name']); ?> vocabulary through our interactive flashcard system. Each word includes:</p>
          <ul>
            <li>Native Spanish pronunciation audio</li>
            <li>English translation</li>
            <li>Interactive flashcard practice</li>
            <li>Visual learning aids</li>
            <li>Progress tracking</li>
          </ul>
          
          <h3>How to Practice <?php echo htmlspecialchars($categoryData['name']); ?> Vocabulary</h3>
          <p>Click on the category to start learning Spanish <?php echo strtolower($categoryData['name']); ?> words. Listen to the pronunciation, study the flashcards, and test your knowledge. Track your progress as you master each word.</p>
          
          <p><a href="https://wordwalker.ca/">← Back to all Spanish vocabulary categories</a></p>
          <?php else: ?>
          <h1>WordWalker - Interactive Spanish Vocabulary Learning Game</h1>
          <h2>Learn Spanish Through Gaming</h2>
          <p>Master Spanish vocabulary with WordWalker, a free interactive educational game featuring over 200 Spanish words across 18 categories. Perfect for beginners and intermediate learners.</p>
          
          <h3>Key Features</h3>
          <ul>
            <li>200+ Spanish vocabulary words with English translations</li>
            <li>Audio pronunciation for every word</li>
            <li>Interactive flashcard system</li>
            <li>18 themed categories: Greetings, Numbers, Food, Transportation, Environment, and more</li>
            <li>Beautiful parallax themed landscapes</li>
            <li>Progress tracking and achievements</li>
            <li>Works offline as a Progressive Web App (PWA)</li>
            <li>Multiple character themes to unlock</li>
          </ul>
          
          <h3>Learning Categories</h3>
          <ul>
            <?php foreach ($categories as $catId => $catData): ?>
            <li><a href="?category=<?php echo $catId; ?>"><?php echo $catData['emoji']; ?> <?php echo htmlspecialchars($catData['name']); ?></a> - <?php echo htmlspecialchars($catData['description']); ?></li>
            <?php endforeach; ?>
          </ul>
          
          <h3>How It Works</h3>
          <p>Walk through beautiful landscapes while answering Spanish vocabulary questions. Each correct answer moves your character forward. Use flashcards to study before playing, listen to native pronunciation, and track your progress as you master new words.</p>
          
          <h3>Perfect for Spanish Learners</h3>
          <p>Whether you're just starting to learn Spanish or looking to expand your vocabulary, WordWalker makes language learning fun and engaging. Play for free in your web browser or install as an app on your mobile device.</p>
          <?php endif; ?>
        </main>
      </div>
    </div>
    <script type="module" src="dist/assets/vendor.js?v=<?php echo $version; ?>"></script>
    <script type="module" src="dist/assets/index.js?v=<?php echo $version; ?>"></script>
    
    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js')
                    .then(registration => {
                        // Check for updates every 60 seconds
                        setInterval(() => {
                            registration.update();
                        }, 60000);
                        
                        // Handle service worker updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // Optionally show a notification to the user
                                    // You could add a toast notification here
                                }
                            });
                        });
                    })
                    .catch(() => {
                        // Service Worker registration failed
                    });
            });
            
            // Handle service worker controller changes
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                // Optionally reload the page when a new service worker takes control
                // window.location.reload();
            });
        }
        
        // Install prompt for PWA
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // You could show an install button here
        });
        
        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
        });
    </script>
  </body>
</html>
