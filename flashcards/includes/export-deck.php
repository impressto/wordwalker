<?php
/**
 * Export Deck Endpoint
 * 
 * Handles exporting flashcard decks as ZIP or PDF
 * 
 * SETUP REQUIRED:
 * 1. Run: composer install (to install spatie/browsershot)
 * 2. Install Node.js: https://nodejs.org/
 * 3. Install Puppeteer: npm install -g puppeteer
 * 4. Run test: php test-export-setup.php
 * 
 * See DECK-EXPORT-SETUP.md for detailed instructions
 * 
 * FEATURES:
 * - ZIP Export: Renders each flashcard as a high-quality JPG image (800x1000px @2x)
 * - PDF Export: Creates a printable 3-column layout of all cards
 * - Fallback: If Browsershot unavailable, exports HTML files instead
 * - Includes emoji images in the rendered output
 */

require_once __DIR__ . '/functions.php';

// Load configuration
$config = require_once __DIR__ . '/export-config.php';

// Extract config values
$sharedSecret = $config['security']['shared_secret'];
$allowedDomains = $config['security']['allowed_domains'];
$allowedIps = $config['security']['allowed_ips'] ?? [];
$renderConfig = $config['rendering'];
$nodeConfig = $config['nodejs'];
$debug = $config['debug'] ?? false;

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('Method not allowed');
}

// Validate shared secret for server-to-server calls
$providedSecret = $_POST['secret'] ?? '';
$sourceDomain = $_POST['source_domain'] ?? '';

// TEMPORARILY DISABLED for debugging
/*
if ($providedSecret !== $sharedSecret) {
    if ($debug) {
        error_log("Export denied: Invalid secret from " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    }
    http_response_code(403);
    // Add debug info to help diagnose the issue
    die(json_encode([
        'error' => 'Access denied',
        'debug' => [
            'expected_secret' => $sharedSecret,
            'provided_secret' => $providedSecret,
            'secrets_match' => ($providedSecret === $sharedSecret),
            'config_loaded' => true
        ]
    ]));
}
*/

// Optional: Validate source domain
if (!empty($sourceDomain) && !in_array($sourceDomain, $allowedDomains)) {
    if ($debug) {
        error_log("Export denied: Invalid source domain '$sourceDomain'");
    }
    http_response_code(403);
    die('Access denied');
}


// Optional: Validate IP address
if (!empty($allowedIps)) {
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? '';
    if (!in_array($clientIp, $allowedIps)) {
        if ($debug) {
            error_log("Export denied: Invalid IP '$clientIp'");
        }
        http_response_code(403);
        die('Access denied');
    }
}

// Get the format and card IDs
$format = $_POST['format'] ?? '';
$cardsJson = $_POST['cards'] ?? '[]';
$cardIds = json_decode($cardsJson, true);

if (!in_array($format, ['zip', 'pdf'])) {
    http_response_code(400);
    die('Invalid format');
}

if (empty($cardIds) || !is_array($cardIds)) {
    http_response_code(400);
    die('No cards selected');
}

// Load all questions from config files
$dataPath = __DIR__ . '/../../src/config/questions/';
$allQuestions = [];

$configFiles = glob($dataPath . '*.js');
foreach ($configFiles as $configFile) {
    $questions = parseQuestionsFromJS($configFile);
    foreach ($questions as $question) {
        $allQuestions[$question['id']] = $question;
    }
}

// Filter questions based on selected card IDs
$selectedQuestions = [];
foreach ($cardIds as $cardId) {
    if (isset($allQuestions[$cardId])) {
        $selectedQuestions[] = $allQuestions[$cardId];
    }
}

if (empty($selectedQuestions)) {
    http_response_code(404);
    die('No valid cards found');
}

// Load translations
require_once __DIR__ . '/translations.php';

// Handle export based on format
if ($format === 'zip') {
    exportAsZip($selectedQuestions);
} else {
    exportAsPdf($selectedQuestions);
}

/**
 * Export flashcards as ZIP file with JPG images
 */
function exportAsZip($questions) {
    global $config;
    
    // Check if required libraries are available
    if (!extension_loaded('zip')) {
        http_response_code(500);
        die('ZIP extension not available');
    }
    
    $renderConfig = $config['rendering'];
    $renderService = $config['render'];
    $debug = $config['debug'] ?? false;
    
    // Create temporary directory for images
    $tempDir = sys_get_temp_dir() . '/wordwalker_deck_' . uniqid();
    if (!mkdir($tempDir, 0777, true)) {
        http_response_code(500);
        die('Could not create temporary directory');
    }
    
    // Generate images for each card
    $index = 1;
    $errors = [];
    
    foreach ($questions as $question) {
        $html = generateFlashcardHTML($question, $index);
        $filename = sprintf('%03d_%s', $index, sanitizeFilename($question['question']));
        
        // Use render.php service to convert HTML to image
        try {
            $imagePath = $tempDir . '/' . $filename . '.' . $renderConfig['format'];
            $imageData = renderHtmlToImage($html, $renderConfig, $renderService);
            
            if ($imageData !== false) {
                file_put_contents($imagePath, $imageData);
            } else {
                throw new Exception('Failed to render image');
            }
                
        } catch (Exception $e) {
            // Fallback to HTML if image generation fails
            $errors[] = "Card #$index: " . $e->getMessage();
            file_put_contents($tempDir . '/' . $filename . '.html', $html);
        }
        
        $index++;
    }
    
    // Create README
    $readme = "WordWalker Flashcard Deck Export\n\n";
    $readme .= "Total Cards: " . count($questions) . "\n";
    $readme .= "Export Date: " . date('Y-m-d H:i:s') . "\n";
    $readme .= "Format: JPG Images\n\n";
    $readme .= "Your flashcards have been exported as high-quality JPG images.\n";
    $readme .= "You can print these or use them in presentations, study materials, etc.\n\n";
    
    if (!empty($errors)) {
        $readme .= "\nErrors encountered:\n";
        $readme .= implode("\n", $errors) . "\n\n";
    }
    
    $readme .= "Visit wordwalker.ca for more free Spanish learning resources!\n";
    file_put_contents($tempDir . '/README.txt', $readme);
    
    // Create ZIP file
    $zipPath = sys_get_temp_dir() . '/wordwalker_deck_' . uniqid() . '.zip';
    $zip = new ZipArchive();
    
    if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        http_response_code(500);
        die('Could not create ZIP file');
    }
    
    // Add all files to ZIP
    $files = scandir($tempDir);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            $zip->addFile($tempDir . '/' . $file, $file);
        }
    }
    
    $zip->close();
    
    // Send the ZIP file
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="wordwalker-deck-' . date('Y-m-d') . '.zip"');
    header('Content-Length: ' . filesize($zipPath));
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: 0');
    
    readfile($zipPath);
    
    // Clean up
    array_map('unlink', glob($tempDir . '/*'));
    rmdir($tempDir);
    unlink($zipPath);
    
    exit;
}

/**
 * Export flashcards as PDF with 3-column layout
 */
function exportAsPdf($questions) {
    // For PDF generation, we'll use TCPDF or similar library
    // For now, create a simple HTML version that can be printed to PDF
    
    $html = '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>WordWalker Flashcard Deck</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4CAF50;
        }
        
        .header h1 {
            color: #4CAF50;
            font-size: 2em;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 1em;
        }
        
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            min-height: 250px;
            page-break-inside: avoid;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .card-number {
            color: #999;
            font-size: 0.85em;
            margin-bottom: 8px;
        }
        
        .card-question {
            font-size: 1.1em;
            color: #333;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .card-answer {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 12px;
        }
        
        .card-answer-text {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .card-translation {
            font-size: 0.95em;
            opacity: 0.95;
        }
        
        .card-example {
            background: #f7fafc;
            padding: 12px;
            border-radius: 6px;
            font-size: 0.9em;
            color: #555;
            margin-top: 10px;
        }
        
        .card-example strong {
            color: #4CAF50;
        }
        
        .card-difficulty {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75em;
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
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #666;
        }
        
        @media print {
            body {
                padding: 10px;
            }
            
            .cards-grid {
                gap: 15px;
            }
            
            .card {
                padding: 15px;
                min-height: 220px;
            }
        }
        
        @page {
            margin: 1cm;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>WordWalker Flashcard Deck</h1>
        <p>' . count($questions) . ' Cards | Generated on ' . date('F j, Y') . ' | wordwalker.ca</p>
    </div>
    
    <div class="cards-grid">';
    
    $index = 1;
    foreach ($questions as $question) {
        $answer = isset($question['answer']) ? $question['answer'] : '';
        $answerTranslation = isset($question['answerTranslation']) ? $question['answerTranslation'] : '';
        $example = isset($question['example']) ? $question['example'] : '';
        $exampleTranslation = isset($question['exampleTranslation']) ? $question['exampleTranslation'] : '';
        $difficulty = isset($question['difficulty']) ? $question['difficulty'] : '';
        
        $html .= '<div class="card">';
        $html .= '<div class="card-number">#' . $index . '</div>';
        $html .= '<div class="card-question">' . htmlspecialchars($question['question']) . '</div>';
        $html .= '<div class="card-answer">';
        $html .= '<div class="card-answer-text">' . htmlspecialchars($answer) . '</div>';
        if ($answerTranslation) {
            $html .= '<div class="card-translation">' . htmlspecialchars($answerTranslation) . '</div>';
        }
        $html .= '</div>';
        
        if ($example) {
            $html .= '<div class="card-example">';
            $html .= '<strong>Example:</strong> ' . htmlspecialchars($example);
            if ($exampleTranslation) {
                $html .= '<br><em>' . htmlspecialchars($exampleTranslation) . '</em>';
            }
            $html .= '</div>';
        }
        
        if ($difficulty) {
            $html .= '<span class="card-difficulty difficulty-' . strtolower($difficulty) . '">' . ucfirst($difficulty) . '</span>';
        }
        
        $html .= '</div>';
        $index++;
    }
    
    $html .= '</div>
    
    <div class="footer">
        <p><strong>100% Free Spanish Learning at wordwalker.ca</strong></p>
        <p>Print this page to PDF using your browser\'s print function (Ctrl+P or Cmd+P)</p>
    </div>
</body>
</html>';
    
    // Use render.php service to convert HTML to PDF
    global $config;
    $renderService = $config['render'];
    
    $ch = curl_init($renderService['url']);
    
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'mode' => 'html',
            'html' => $html,
            'format' => 'pdf',
            'width' => 1200,
            'height' => 1600
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => $renderService['timeout'],
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error || $httpCode !== 200) {
        http_response_code(500);
        die('PDF generation failed: ' . $error);
    }
    
    // Parse JSON response
    $result = json_decode($response, true);
    
    if (!$result || !isset($result['success']) || !$result['success']) {
        http_response_code(500);
        die('PDF generation failed: Invalid response');
    }
    
    // Get the PDF URL
    $pdfUrl = 'https://impressto.ca' . $result['url'];
    
    // Fetch the PDF file
    $ch = curl_init($pdfUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    $pdfData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error || $httpCode !== 200 || empty($pdfData)) {
        http_response_code(500);
        die('Failed to fetch generated PDF');
    }
    
    // Send the PDF file
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="wordwalker-deck-' . date('Y-m-d') . '.pdf"');
    header('Content-Length: ' . strlen($pdfData));
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: 0');
    
    echo $pdfData;
    exit;
}

/**
 * Generate HTML for a single flashcard
 */
function generateFlashcardHTML($question, $index) {
    $answer = isset($question['answer']) ? $question['answer'] : '';
    $answerTranslation = isset($question['answerTranslation']) ? $question['answerTranslation'] : '';
    $example = isset($question['example']) ? $question['example'] : '';
    $exampleTranslation = isset($question['exampleTranslation']) ? $question['exampleTranslation'] : '';
    $difficulty = isset($question['difficulty']) ? $question['difficulty'] : '';
    
    $html = '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flashcard #' . $index . '</title>
    <style>
        body {
            margin: 0;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: white;
        }
        
        .flashcard {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border: 3px solid #4CAF50;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        
        .card-number {
            color: #999;
            font-size: 1em;
            margin-bottom: 15px;
        }
        
        .card-question {
            font-size: 1.4em;
            color: #333;
            margin-bottom: 25px;
            font-weight: 600;
        }
        
        .card-answer {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        
        .card-answer-text {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 12px;
        }
        
        .card-translation {
            font-size: 1.2em;
            opacity: 0.95;
        }
        
        .card-example {
            background: #f7fafc;
            padding: 20px;
            border-radius: 10px;
            font-size: 1.1em;
            color: #555;
            margin-top: 15px;
        }
        
        .card-example strong {
            color: #4CAF50;
        }
        
        .card-difficulty {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            margin-top: 15px;
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
        
        .watermark {
            text-align: center;
            margin-top: 30px;
            color: #999;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="flashcard">
        <div class="card-number">#' . $index . '</div>
        <div class="card-question">' . htmlspecialchars($question['question']) . '</div>
        <div class="card-answer">
            <div class="card-answer-text">' . htmlspecialchars($answer) . '</div>';
    
    if ($answerTranslation) {
        $html .= '<div class="card-translation">' . htmlspecialchars($answerTranslation) . '</div>';
    }
    
    $html .= '</div>';
    
    if ($example) {
        $html .= '<div class="card-example">';
        $html .= '<strong>Example:</strong> ' . htmlspecialchars($example);
        if ($exampleTranslation) {
            $html .= '<br><em>' . htmlspecialchars($exampleTranslation) . '</em>';
        }
        $html .= '</div>';
    }
    
    if ($difficulty) {
        $html .= '<span class="card-difficulty difficulty-' . strtolower($difficulty) . '">' . ucfirst($difficulty) . '</span>';
    }
    
    $html .= '<div class="watermark">wordwalker.ca/flashcards</div>
    </div>
</body>
</html>';
    
    return $html;
}

/**
 * Sanitize filename
 */
function sanitizeFilename($filename) {
    // Remove special characters and limit length
    $filename = preg_replace('/[^a-z0-9_\-]/i', '_', $filename);
    $filename = substr($filename, 0, 50);
    return $filename;
}

/**
 * Render HTML to image using Puppeteer HTTP endpoint
 */
function renderHtmlToImage($html, $renderConfig, $renderService) {
    // Post HTML directly to render.php service
    $ch = curl_init($renderService['url']);
    
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'mode' => 'html',
            'html' => $html,
            'download' => 1
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => $renderService['timeout'],
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error || $httpCode !== 200) {
        error_log("Render service failed: HTTP $httpCode, Error: $error");
        return false;
    }
    
    // Verify it's a valid JPEG (starts with JPEG magic bytes)
    if (substr($response, 0, 2) !== "\xFF\xD8") {
        error_log("Render service returned invalid JPEG data");
        return false;
    }
    
    return $response;
}
