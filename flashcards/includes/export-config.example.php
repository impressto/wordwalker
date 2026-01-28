<?php
/**
 * Export Configuration
 * 
 * Centralized configuration for the deck export feature
 */

return [
    // Export server configuration
    'export_server' => [
        'url' => 'https://impressto.ca/wordwalker/flashcards/includes/export-deck.php',
        'timeout' => 120, // seconds
        'max_cards' => 100, // Maximum cards per export
    ],
    
    // Render service (HTML to image)
    'render' => [
        'url' => 'https://impressto.ca/render.php',
        'timeout' => 30, // seconds per screenshot
    ],
    
    // Security settings
    'security' => [
        // IMPORTANT: Change this to a unique, random string
        // Generate with: php -r "echo bin2hex(random_bytes(32));"
        'shared_secret' => 'export_secret_2026',
        
        // Domains allowed to make export requests
        'allowed_domains' => [
            'impressto.ca',
            'wordwalker.ca',
            'www.wordwalker.ca',
            'localhost',
            '127.0.0.1'
        ],
        
        // IP whitelist (optional - leave empty to allow all)
        'allowed_ips' => [
            // Add your wordwalker.ca server IP here
            // '123.456.789.0',
        ],
    ],
    
    // Image rendering settings
    'rendering' => [
        'format' => 'jpg', // jpg or png
        'quality' => 90, // JPEG quality (1-100)
        'width' => 800,
        'height' => 1000,
        'scale' => 2, // Device scale factor (1 = normal, 2 = retina)
        'timeout' => 60, // Browsershot timeout per image
    ],
    
    // Node.js configuration (for impressto.ca server)
    'nodejs' => [
        'node_binary' => '/usr/bin/node',
        'npm_binary' => '/usr/bin/npm',
    ],
    
    // Development mode
    'debug' => false, // Set to true for verbose error logging
];
