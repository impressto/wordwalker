<?php
// Read version from package.json for cache busting
$packageJson = json_decode(file_get_contents(__DIR__ . '/package.json'), true);
$version = $packageJson['version'] ?? '1.0.0';
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    
    <!-- SEO Optimization -->
    <link rel="canonical" href="https://wordwalker.ca/" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="WordWalker" />
    
    <!-- PWA Mobile Optimization -->
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#4CAF50" />
    <meta name="description" content="Learn Spanish vocabulary through an interactive walking game! Master 200+ words across 14 categories with audio pronunciation, flashcards, and themed landscapes. Free online Spanish learning game." />
    <meta name="keywords" content="learn Spanish online, Spanish vocabulary game, Spanish learning app, language learning game, educational Spanish game, Spanish flashcards, Spanish pronunciation, free Spanish lessons, interactive Spanish learning, Spanish for beginners" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://wordwalker.ca/" />
    <meta property="og:title" content="WordWalker - Learn Spanish Vocabulary Through Interactive Gaming" />
    <meta property="og:description" content="Master Spanish vocabulary with 200+ words across 14 categories. Features audio pronunciation, flashcards, and beautiful themed landscapes. Start learning Spanish free!" />
    <meta property="og:image" content="https://wordwalker.ca/dist/images/word-walker.jpg" />
    <meta property="og:image:alt" content="WordWalker Spanish Learning Game Screenshot" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:site_name" content="WordWalker" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://wordwalker.ca/" />
    <meta property="twitter:title" content="WordWalker - Learn Spanish Vocabulary Through Interactive Gaming" />
    <meta property="twitter:description" content="Master Spanish vocabulary with 200+ words across 14 categories. Features audio pronunciation, flashcards, and beautiful themed landscapes. Start learning Spanish free!" />
    <meta property="twitter:image" content="https://wordwalker.ca/dist/images/word-walker.jpg" />
    <meta property="twitter:image:alt" content="WordWalker Spanish Learning Game Screenshot" />
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="dist/manifest.json" />
    
    <!-- Favicon files -->
    <link rel="icon" type="image/x-icon" href="https://impressto.ca/wordwalker/dist/favicon.ico" />
    <link rel="icon" type="image/svg+xml" href="https://impressto.ca/wordwalker/dist/favicon.svg" />
    <link rel="icon" type="image/png" sizes="96x96" href="https://impressto.ca/wordwalker/dist/favicon-96x96.png" />
    <link rel="apple-touch-icon" href="https://impressto.ca/wordwalker/dist/apple-touch-icon.png" />
    
    <!-- PWA Icons (large sizes for app install) -->
    <link rel="icon" type="image/png" sizes="192x192" href="https://impressto.ca/wordwalker/dist/images/icon-192x192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="https://impressto.ca/wordwalker/dist/images/icon-512x512.png" />
    
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
    
    <title>WordWalker - Learn Spanish Vocabulary</title>
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
      "name": "WordWalker",
      "url": "https://wordwalker.ca/",
      "description": "Learn Spanish vocabulary through an interactive walking game with audio pronunciation, flashcards, and themed landscapes.",
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
      "keywords": "Spanish learning, vocabulary game, language education, Spanish flashcards, pronunciation practice",
      "screenshot": "https://wordwalker.ca/dist/images/word-walker.jpg",
      "softwareVersion": "<?php echo $version; ?>",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150",
        "bestRating": "5",
        "worstRating": "1"
      },
      "featureList": [
        "200+ Spanish vocabulary words",
        "14 themed categories",
        "Audio pronunciation",
        "Interactive flashcards",
        "Progress tracking",
        "Offline support",
        "Multiple character themes",
        "Background music and themes"
      ]
    }
    </script>

    <style>
        /* Prevent scrolling and ensure fullscreen on mobile */
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: fixed;
            touch-action: none;
            -webkit-overflow-scrolling: touch;
            background-color: #000000;
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
          <h1>WordWalker - Interactive Spanish Vocabulary Learning Game</h1>
          <h2>Learn Spanish Through Gaming</h2>
          <p>Master Spanish vocabulary with WordWalker, a free interactive educational game featuring over 200 Spanish words across 14 categories. Perfect for beginners and intermediate learners.</p>
          
          <h3>Key Features</h3>
          <ul>
            <li>200+ Spanish vocabulary words with English translations</li>
            <li>Audio pronunciation for every word</li>
            <li>Interactive flashcard system</li>
            <li>14 themed categories: Greetings, Numbers, Food, Transportation, Weather, and more</li>
            <li>Beautiful parallax themed landscapes</li>
            <li>Progress tracking and achievements</li>
            <li>Works offline as a Progressive Web App (PWA)</li>
            <li>Multiple character themes to unlock</li>
          </ul>
          
          <h3>Learning Categories</h3>
          <p>Study Spanish vocabulary across diverse topics including daily routines, restaurant phrases, shopping, medical terms, entertainment, recreation, animals, accommodation, directions, grammar, and people.</p>
          
          <h3>How It Works</h3>
          <p>Walk through beautiful landscapes while answering Spanish vocabulary questions. Each correct answer moves your character forward. Use flashcards to study before playing, listen to native pronunciation, and track your progress as you master new words.</p>
          
          <h3>Perfect for Spanish Learners</h3>
          <p>Whether you're just starting to learn Spanish or looking to expand your vocabulary, WordWalker makes language learning fun and engaging. Play for free in your web browser or install as an app on your mobile device.</p>
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
