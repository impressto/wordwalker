<?php
/**
 * Alternative Export Implementation using wkhtmltoimage
 * 
 * This is a fallback if Browsershot/Puppeteer is not available
 * Requires wkhtmltoimage to be installed on the server
 */

/**
 * Export using wkhtmltoimage command-line tool
 */
function exportAsZipWithWkhtmltoimage($questions) {
    // Check if wkhtmltoimage is available
    $wkhtmlPath = shell_exec('which wkhtmltoimage 2>&1');
    
    if (empty($wkhtmlPath)) {
        // Fallback to HTML export
        return false;
    }
    
    $wkhtmlPath = trim($wkhtmlPath);
    
    // Create temporary directory
    $tempDir = sys_get_temp_dir() . '/wordwalker_deck_' . uniqid();
    if (!mkdir($tempDir, 0777, true)) {
        return false;
    }
    
    $index = 1;
    foreach ($questions as $question) {
        $html = generateFlashcardHTML($question, $index);
        $htmlFile = $tempDir . '/card_' . $index . '.html';
        $imageFile = $tempDir . '/' . sprintf('%03d_%s.jpg', $index, sanitizeFilename($question['question']));
        
        // Save HTML temporarily
        file_put_contents($htmlFile, $html);
        
        // Convert to image using wkhtmltoimage
        $cmd = escapeshellcmd($wkhtmlPath) . 
               " --width 800 --height 1000 --quality 90 --format jpg " .
               escapeshellarg($htmlFile) . " " . 
               escapeshellarg($imageFile) . 
               " 2>&1";
        
        exec($cmd, $output, $returnCode);
        
        // Clean up HTML file
        unlink($htmlFile);
        
        if ($returnCode !== 0) {
            // If conversion failed, save as HTML instead
            file_put_contents($imageFile . '.html', $html);
        }
        
        $index++;
    }
    
    return $tempDir;
}

/**
 * Check which rendering method is available
 */
function getAvailableRenderingMethod() {
    // Check for Browsershot
    if (class_exists('Spatie\Browsershot\Browsershot')) {
        $nodeCheck = shell_exec('which node 2>&1');
        if (!empty($nodeCheck)) {
            return 'browsershot';
        }
    }
    
    // Check for wkhtmltoimage
    $wkhtmlCheck = shell_exec('which wkhtmltoimage 2>&1');
    if (!empty($wkhtmlCheck)) {
        return 'wkhtmltoimage';
    }
    
    // Fallback to HTML
    return 'html';
}
