<?php
/**
 * Export Deck Endpoint
 * 
 * Handles exporting flashcard decks as PDF
 * 
 * FEATURES:
 * - PDF Export: Creates a printable 3-column layout of all cards
 * - Includes emoji images in the rendered output
 */

require_once __DIR__ . '/functions.php';

// Load configuration (use require instead of require_once to ensure we get the array)
// If already loaded by export-proxy.php, require_once would return true instead of the array
if (!isset($config)) {
    $config = require __DIR__ . '/export-config.php';
}

// Extract config values  
$renderConfig = $config['rendering'];
$nodeConfig = $config['nodejs'];
$debug = $config['debug'] ?? false;

// Note: Security checks are handled by export-proxy.php
// This file is now only called via direct include, not HTTP requests

// Get the format and card IDs
$format = $_POST['format'] ?? '';
$cardsJson = $_POST['cards'] ?? '[]';
$cardIds = json_decode($cardsJson, true);

if ($format !== 'pdf') {
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

// Load example translations
$exampleTranslationsFile = __DIR__ . '/../../src/config/translations/example_translations.js';
$exampleTranslations = parseExampleTranslations($exampleTranslationsFile);

// Export as PDF
exportAsPdf($selectedQuestions);

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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WordWalker Flashcard Deck</title>
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap");
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
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
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        .card-question-translation {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 15px;
            font-style: italic;
        }
        
        .card-answer {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 12px;
        }
        
        /* Emotion-based color variations */
        .card-answer.emotion-afraid { background: #9C27B0; }
        .card-answer.emotion-angry { background: #E53935; }
        .card-answer.emotion-anxious { background: #FF6F00; }
        .card-answer.emotion-calm { background: #0097A7; }
        .card-answer.emotion-confused { background: #8D6E63; }
        .card-answer.emotion-determined { background: #1976D2; }
        .card-answer.emotion-disgusted { background: #558B2F; }
        .card-answer.emotion-excited { background: #F57C00; }
        .card-answer.emotion-happy { background: #FDD835; color: #333; }
        .card-answer.emotion-hurt { background: #D32F2F; }
        .card-answer.emotion-neutral { background: #757575; }
        .card-answer.emotion-pleased { background: #7CB342; }
        .card-answer.emotion-sad { background: #5C6BC0; }
        .card-answer.emotion-surprised { background: #EC407A; }
        
        .card-hint {
            background: #fff9e6;
            border-left: 3px solid #ffc107;
            padding: 10px;
            margin-bottom: 12px;
            border-radius: 4px;
            font-size: 0.9em;
            color: #555;
        }
        
        .card-hint strong {
            color: #f57c00;
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
        global $exampleTranslations;
        
        $answer = isset($question['correctAnswer']) ? $question['correctAnswer'] : '';
        $answerTranslation = isset($question['answerTranslation']) ? $question['answerTranslation'] : '';
        $example = isset($question['usageExample']) ? $question['usageExample'] : '';
        // Look up example translation from the translations file
        $exampleTranslation = '';
        if ($example && isset($exampleTranslations[$example])) {
            $exampleTranslation = $exampleTranslations[$example];
        } elseif (isset($question['exampleTranslation'])) {
            $exampleTranslation = $question['exampleTranslation'];
        }
        $difficulty = isset($question['difficulty']) ? $question['difficulty'] : '';
        $emoji = isset($question['emoji']) ? $question['emoji'] : '';
        $category = isset($question['category']) ? $question['category'] : '';
        $translation = isset($question['translation']) ? $question['translation'] : '';
        $hint = isset($question['hint']) ? $question['hint'] : '';
        $emotion = isset($question['emotion']) ? $question['emotion'] : '';
        
        $html .= '<div class="card">';
        $html .= '<div class="card-number">#' . $index . '</div>';
        
        // Add emoji image or character if present
        if ($emoji) {
            // Check if emoji is a filename (contains .png, .jpg, etc) or an actual emoji character
            if (preg_match('/\.(png|jpg|jpeg|gif|svg)$/i', $emoji)) {
                // It's a filename, render as image
                if ($category) {
                    $emojiUrl = 'https://impressto.ca/wordwalker/dist/images/objects/' . $category . '/' . $emoji;
                    $html .= '<div style="text-align: center; margin-bottom: 15px;">';
                    $html .= '<img src="' . htmlspecialchars($emojiUrl) . '" alt="emoji" style="width: 80px; height: 80px; object-fit: contain;" />';
                    $html .= '</div>';
                }
            } else {
                // It's an actual emoji character, convert to Twemoji image URL for better PDF rendering
                
                // Convert emoji to Unicode codepoint for Twemoji URL
                $codepoint = '';
                $length = mb_strlen($emoji, 'UTF-8');
                for ($i = 0; $i < $length; $i++) {
                    $char = mb_substr($emoji, $i, 1, 'UTF-8');
                    $code = unpack('V', iconv('UTF-8', 'UCS-4LE', $char))[1];
                    if ($codepoint !== '') $codepoint .= '-';
                    $codepoint .= dechex($code);
                }
                
                // Use Twemoji CDN (more reliable for PDFs than emoji fonts)
                $twemojiUrl = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/' . $codepoint . '.png';
                
                $html .= '<div style="text-align: center; margin-bottom: 15px;">';
                $html .= '<img src="' . htmlspecialchars($twemojiUrl) . '" alt="emoji" style="width: 80px; height: 80px; object-fit: contain;" />';
                $html .= '</div>';
            }
        }
        
        $html .= '<div class="card-question">' . htmlspecialchars($question['question']) . '</div>';
        
        // Add question translation if present
        if ($translation) {
            $html .= '<div class="card-question-translation">' . htmlspecialchars($translation) . '</div>';
        }
        
        $answerClass = 'card-answer';
        if ($emotion) {
            $answerClass .= ' emotion-' . htmlspecialchars($emotion);
        }
        $html .= '<div class="' . $answerClass . '">';
        $html .= '<div class="card-answer-text">' . htmlspecialchars($answer) . '</div>';
        if ($answerTranslation) {
            $html .= '<div class="card-translation">' . htmlspecialchars($answerTranslation) . '</div>';
        }
        $html .= '</div>';
        
        // Add hint if present
        if ($hint) {
            $html .= '<div class="card-hint">';
            $html .= '<strong>💡 Hint:</strong> ' . htmlspecialchars($hint);
            $html .= '</div>';
        }
        
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
        error_log('PDF generation failed. Response: ' . substr($response, 0, 500));
        die('PDF generation failed: Invalid response. Response: ' . htmlspecialchars(substr($response, 0, 200)));
    }
    
    // Get the PDF URL (it's already a full URL from the render service)
    $pdfUrl = $result['url'];
    
    // Fetch the PDF file
    $ch = curl_init($pdfUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    $pdfData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error || $httpCode !== 200 || empty($pdfData)) {
        http_response_code(500);
        die('Failed to fetch generated PDF from: ' . htmlspecialchars($pdfUrl) . ' (HTTP ' . $httpCode . ')');
    }
    
    // Check if we actually got a PDF (should start with %PDF)
    if (substr($pdfData, 0, 4) !== '%PDF') {
        http_response_code(500);
        die('Received invalid PDF data. URL: ' . htmlspecialchars($pdfUrl) . ', Content-Type: ' . htmlspecialchars($contentType) . ', Starts with: ' . htmlspecialchars(substr($pdfData, 0, 50)));
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
