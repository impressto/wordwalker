<?php
/**
 * Export Deck Proxy
 * 
 * This proxy forwards export requests to the impressto.ca server
 * which has render.php for image rendering.
 * 
 * wordwalker.ca -> impressto.ca/flashcards/includes/export-deck.php
 */

// Allow CORS requests from wordwalker.ca
header('Access-Control-Allow-Origin: https://wordwalker.ca');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load configuration
$config = require_once __DIR__ . '/export-config.php';

// Extract config values
$exportServerUrl = $config['export_server']['url'];
$exportTimeout = $config['export_server']['timeout'];
$sharedSecret = $config['security']['shared_secret'];
$maxCards = $config['export_server']['max_cards'] ?? 100;

// Validate input
$format = $_POST['format'] ?? '';
$cardsJson = $_POST['cards'] ?? '[]';

if (!in_array($format, ['zip', 'pdf'])) {
    http_response_code(400);
    header('Content-Type: application/json');
    die(json_encode(['error' => 'Invalid format']));
}

$cardIds = json_decode($cardsJson, true);
if (empty($cardIds) || !is_array($cardIds)) {
    http_response_code(400);
    header('Content-Type: application/json');
    die(json_encode(['error' => 'No cards selected']));
}

if (count($cardIds) > $maxCards) {
    http_response_code(400);
    header('Content-Type: application/json');
    die(json_encode(['error' => "Too many cards. Maximum $maxCards cards per export."]));
}

// Prepare data to send to export server
$postData = [
    'format' => $format,
    'cards' => $cardsJson,
    // 'secret' => $sharedSecret,  // TEMPORARILY DISABLED for debugging
    'source_domain' => $_SERVER['HTTP_HOST'] ?? 'wordwalker.ca',
    'request_time' => time()
];

// Initialize cURL
$ch = curl_init($exportServerUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($postData),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => $exportTimeout,
    CURLOPT_HEADER => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2
]);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$error = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($error) {
    http_response_code(500);
    header('Content-Type: application/json');
    die(json_encode([
        'error' => 'Export service unavailable',
        'message' => 'Could not connect to export server',
        'details' => $error,
        'server' => $exportServerUrl
    ]));
}

// Separate headers and body
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

// Check if the export server returned an error
if ($httpCode !== 200) {
    error_log("Export server returned HTTP $httpCode: " . substr($responseBody, 0, 500));
    http_response_code($httpCode);
    
    // Forward the error response (should be JSON with debug info)
    header('Content-Type: application/json');
    echo $responseBody;
    exit;
}

// Forward the appropriate headers to the client
if ($format === 'zip') {
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="wordwalker-deck-' . date('Y-m-d') . '.zip"');
} else {
    header('Content-Type: text/html; charset=utf-8');
}

// Output the response body
echo $responseBody;
exit;

// Extract config values
$exportServerUrl = $config['export_server']['url'];
$exportTimeout = $config['export_server']['timeout'];
$sharedSecret = $config['security']['shared_secret'];
$maxCards = $config['export_server']['max_cards'] ?? 100;
$debug = $config['debug'] ?? false;

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('Method not allowed');
}

// Get the format and card IDs from the client
$format = $_POST['format'] ?? '';
$cardsJson = $_POST['cards'] ?? '[]';

// Validate input
if (!in_array($format, ['zip', 'pdf'])) {
    http_response_code(400);
    die('Invalid format');
}

$cardIds = json_decode($cardsJson, true);
if (empty($cardIds) || !is_array($cardIds)) {
    http_response_code(400);
    die('No cards selected');
}

// Limit number of cards
if (count($cardIds) > $maxCards) {
    http_response_code(400);
    die("Too many cards. Maximum $maxCards cards per export.");
}

// Prepare data to send to the export server
$postData = [
    'format' => $format,
    'cards' => $cardsJson,
    'secret' => $sharedSecret,
    'source_domain' => $_SERVER['HTTP_HOST'] ?? 'wordwalker.ca',
    'request_time' => time()
];

// Initialize cURL session
$ch = curl_init($exportServerUrl);

// Set cURL options
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($postData),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => $exportTimeout,
    CURLOPT_HTTPHEADER => [
        'User-Agent: WordWalker Export Proxy/1.0',
        'X-Export-Proxy: wordwalker.ca',
        'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown')
    ],
    // Get headers in the response
    CURLOPT_HEADER => true,
    // SSL verification (set to false for self-signed certs in development)
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2
]);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);

curl_close($ch);

// Handle errors
if ($error) {
    if ($debug) {
        error_log("Export proxy cURL error: " . $error);
    }
    http_response_code(500);
    die(json_encode([
        'error' => 'Export service unavailable',
        'message' => 'Could not connect to export server',
        'details' => $error,
        'server' => $exportServerUrl
    ]));
}

// Separate headers and body
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

// Check if the export server returned an error
if ($httpCode !== 200) {
    error_log("Export server returned HTTP $httpCode: " . substr($responseBody, 0, 500));
    http_response_code($httpCode);
    
    // Try to provide more helpful error info
    $errorInfo = [
        'error' => 'Export failed',
        'http_code' => $httpCode,
        'server' => $exportServerUrl,
        'message' => substr($responseBody, 0, 500)
    ];
    
    die(json_encode($errorInfo));
}

// Forward the appropriate headers to the client
if ($format === 'zip') {
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="wordwalker-deck-' . date('Y-m-d') . '.zip"');
} else {
    header('Content-Type: text/html; charset=utf-8');
}

// Output the response body
echo $responseBody;
exit;
