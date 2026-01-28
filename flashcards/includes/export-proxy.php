<?php
/**
 * Export Deck Proxy
 * 
 * Handles export requests by directly including export-deck.php.
 * Since both files are on the same server, no HTTP request is needed.
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

// Enable error reporting and logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Define local log file path
define('LOCAL_ERROR_LOG', __DIR__ . '/export-errors.log');

// Helper function to write to local log file
function writeToLocalLog($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message\n";
    file_put_contents(LOCAL_ERROR_LOG, $logEntry, FILE_APPEND | LOCK_EX);
}

// Custom error handler to catch all errors
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    $errorMsg = "Error [$errno]: $errstr in $errfile on line $errline";
    writeToLocalLog($errorMsg);
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

try {
    // Load configuration
    $config = require_once __DIR__ . '/export-config.php';
    
    if (!is_array($config)) {
        throw new Exception('Configuration file did not return an array');
    }

    // Extract config values
    $maxCards = $config['export_server']['max_cards'] ?? 100;

    // Check if request is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        header('Content-Type: application/json');
        die(json_encode(['error' => 'Method not allowed']));
    }

    // Validate input
    $format = $_POST['format'] ?? '';
    $cardsJson = $_POST['cards'] ?? '[]';

    if ($format !== 'pdf') {
        http_response_code(400);
        header('Content-Type: application/json');
        die(json_encode(['error' => 'Invalid format. Must be "pdf"']));
    }

    $cardIds = json_decode($cardsJson, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON in cards parameter: ' . json_last_error_msg());
    }
    
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

    // Verify export-deck.php exists
    $exportDeckPath = __DIR__ . '/export-deck.php';
    if (!file_exists($exportDeckPath)) {
        throw new Exception("Export handler not found at: $exportDeckPath");
    }
    
    // DEBUG CHECKPOINT 3 - PASSED
    // header('Content-Type: application/json');
    // die(json_encode(['debug' => 'Checkpoint 3: export-deck.php found', 'path' => $exportDeckPath]));

    // Since we're on the same server, directly include the export logic
    // The export-deck.php file will handle the rest and output the result
    require_once $exportDeckPath;

} catch (Throwable $e) {
    // Log the full error to local file
    writeToLocalLog('=== Export Proxy Error ===');
    writeToLocalLog('Message: ' . $e->getMessage());
    writeToLocalLog('File: ' . $e->getFile());
    writeToLocalLog('Line: ' . $e->getLine());
    writeToLocalLog('Stack trace: ' . $e->getTraceAsString());
    writeToLocalLog('Request: format=' . ($_POST['format'] ?? 'not set') . ', cards=' . ($_POST['cards'] ?? 'not set'));
    writeToLocalLog('========================');
    
    // Send detailed error response
    http_response_code(500);
    header('Content-Type: application/json');
    
    $errorResponse = [
        'error' => 'Export failed',
        'message' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine(),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Include more details if display_errors is on
    if (ini_get('display_errors')) {
        $errorResponse['trace'] = $e->getTraceAsString();
        $errorResponse['request'] = [
            'format' => $_POST['format'] ?? 'not set',
            'cards_count' => isset($cardIds) ? count($cardIds) : 'unknown',
            'method' => $_SERVER['REQUEST_METHOD']
        ];
    }
    
    echo json_encode($errorResponse, JSON_PRETTY_PRINT);
    exit;
} finally {
    // Restore the previous error handler
    restore_error_handler();
}
