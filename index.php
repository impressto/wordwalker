<?php
// Read version from package.json for cache busting
$packageJson = json_decode(file_get_contents(__DIR__ . '/package.json'), true);
$version = $packageJson['version'] ?? '1.0.0';
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    
    <!-- PWA Mobile Optimization -->
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#4CAF50" />
    <meta name="description" content="Learn Spanish vocabulary while walking through beautiful landscapes!" />
    <meta name="keywords" content="WordWalker, Spanish, learning, vocabulary, educational game, language" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://impressto.ca/wordwalker/" />
    <meta property="og:title" content="WordWalker - Learn Spanish Vocabulary" />
    <meta property="og:description" content="Learn Spanish vocabulary while walking through beautiful landscapes! An educational language learning game." />
    <meta property="og:image" content="https://impressto.ca/wordwalker/dist/images/word-walker.jpg" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://impressto.ca/wordwalker/" />
    <meta property="twitter:title" content="WordWalker - Learn Spanish Vocabulary" />
    <meta property="twitter:description" content="Learn Spanish vocabulary while walking through beautiful landscapes! An educational language learning game." />
    <meta property="twitter:image" content="https://impressto.ca/wordwalker/dist/images/word-walker.jpg" />
    
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
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    
    <title>WordWalker - Learn Spanish Vocabulary</title>
    <link rel="stylesheet" href="dist/assets/index.css?v=<?php echo $version; ?>">
    
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
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="wordwalk-game-root">
      <div id="root"></div>
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
