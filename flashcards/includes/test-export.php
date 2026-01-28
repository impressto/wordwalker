<?php
/**
 * Simple test file to verify export endpoint is reachable
 */

// Allow CORS
header('Access-Control-Allow-Origin: https://wordwalker.ca');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log to file
$logFile = __DIR__ . '/test-export.log';
$timestamp = date('Y-m-d H:i:s');
file_put_contents($logFile, "[$timestamp] Test request received\n", FILE_APPEND);
file_put_contents($logFile, "Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
file_put_contents($logFile, "POST data: " . print_r($_POST, true) . "\n", FILE_APPEND);
file_put_contents($logFile, "========================================\n", FILE_APPEND);

// Return success
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'Test endpoint working',
    'timestamp' => $timestamp,
    'method' => $_SERVER['REQUEST_METHOD'],
    'post' => $_POST
]);
