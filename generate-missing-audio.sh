#!/bin/bash

###############################################################################
# Generate Missing Audio Files List for Translation
#
# Usage: ./generate-missing-audio.sh <category>
# Example: ./generate-missing-audio.sh food
#          ./generate-missing-audio.sh transportation
#
# This script compares the correctAnswer values in a category's config file
# with the actual audio files present, and generates a markdown file listing
# all missing audio files that need to be recorded by a translator.
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if category argument is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Category name required${NC}"
    echo "Usage: ./generate-missing-audio.sh <category>"
    echo "Example: ./generate-missing-audio.sh food"
    exit 1
fi

CATEGORY="$1"
AUDIO_ANSWERS_DIR="audio-samples/answers/${CATEGORY}"
AUDIO_EXAMPLES_DIR="audio-samples/examples/${CATEGORY}"
CONFIG_FILE="src/config/questions/${CATEGORY}.js"
OUTPUT_FILE="work/missing-${CATEGORY}-audio.html"
TEMP_DIR="/tmp/missing-audio-$$"

# Create temp directory
mkdir -p "$TEMP_DIR"

# Validate paths
if [ ! -d "$AUDIO_ANSWERS_DIR" ]; then
    echo -e "${RED}Error: Audio answers directory not found: ${AUDIO_ANSWERS_DIR}${NC}"
    exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Error: Config file not found: ${CONFIG_FILE}${NC}"
    exit 1
fi

echo -e "${BLUE}Processing category: ${CATEGORY}${NC}"
echo "----------------------------------------"

# ============================================================================
# PART 1: Process correctAnswer (answers)
# ============================================================================
echo -e "${GREEN}=== Processing Correct Answers ===${NC}"

# Extract all unique correctAnswer values from the config file (keep special characters)
echo -e "${YELLOW}Extracting correct answers from config...${NC}"
grep "correctAnswer:" "$CONFIG_FILE" | \
    sed "s/.*correctAnswer: '//" | \
    sed "s/',$//" | \
    sed "s/correctAnswer://g" | \
    sed "s/['\"]//g" | \
    sed 's/,$//' | \
    sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | \
    sort -u > "$TEMP_DIR/correct_answers.txt"

TOTAL_ANSWERS=$(wc -l < "$TEMP_DIR/correct_answers.txt")
echo -e "${GREEN}Found ${TOTAL_ANSWERS} unique correct answers${NC}"

# Extract audio file names (without .mp3 extension)
echo -e "${YELLOW}Checking existing answer audio files...${NC}"
if ls "$AUDIO_ANSWERS_DIR"/*.mp3 >/dev/null 2>&1; then
    find "$AUDIO_ANSWERS_DIR" -type f -name "*.mp3" -exec basename {} \; | \
        sed 's/.mp3$//' | \
        sort -u > "$TEMP_DIR/audio_files.txt"
else
    touch "$TEMP_DIR/audio_files.txt"
fi

TOTAL_AUDIO=$(wc -l < "$TEMP_DIR/audio_files.txt")
echo -e "${GREEN}Found ${TOTAL_AUDIO} existing answer audio files${NC}"

# For comparison, we need to create a cleaned version of answers
# This matches the cleaning done by clean-example-filenames.sh:
# - Remove ¡ ¿ ! ? globally (not just start/end)
# - Remove internal dots
# - Remove leading em dashes (—)
# - Clean up extra spaces
echo -e "${YELLOW}Comparing to find missing answer files...${NC}"
while IFS= read -r answer; do
    cleaned=$(echo "$answer" | \
        sed 's/¡//g' | \
        sed 's/¿//g' | \
        sed 's/!//g' | \
        sed 's/?//g' | \
        sed 's/\.//g' | \
        sed 's/^— *//' | \
        sed 's/  */ /g' | \
        sed 's/^ *//' | \
        sed 's/ *$//')
    echo "$cleaned"
done < "$TEMP_DIR/correct_answers.txt" | sort -u > "$TEMP_DIR/correct_answers_cleaned.txt"

comm -23 "$TEMP_DIR/correct_answers_cleaned.txt" "$TEMP_DIR/audio_files.txt" > "$TEMP_DIR/missing_answers_cleaned.txt"

# Now get the original versions with special characters for the missing ones
> "$TEMP_DIR/missing_audio.txt"
while IFS= read -r cleaned_answer; do
    # Find the original version with special characters
    grep -F "$cleaned_answer" "$TEMP_DIR/correct_answers.txt" | head -1 >> "$TEMP_DIR/missing_audio.txt"
done < "$TEMP_DIR/missing_answers_cleaned.txt"

MISSING_COUNT=$(wc -l < "$TEMP_DIR/missing_audio.txt")
echo -e "${YELLOW}Found ${MISSING_COUNT} missing answer audio files${NC}"

# ============================================================================
# PART 2: Process usageExample (examples)
# ============================================================================
echo ""
echo -e "${GREEN}=== Processing Usage Examples ===${NC}"

# Extract all unique usageExample values from the config file (keep special characters)
echo -e "${YELLOW}Extracting usage examples from config...${NC}"
grep "usageExample:" "$CONFIG_FILE" | \
    sed "s/.*usageExample: '//" | \
    sed "s/',$//" | \
    sed "s/usageExample://g" | \
    sed "s/['\"]//g" | \
    sed 's/,$//' | \
    sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | \
    sort -u > "$TEMP_DIR/usage_examples.txt"

TOTAL_EXAMPLES=$(wc -l < "$TEMP_DIR/usage_examples.txt")
echo -e "${GREEN}Found ${TOTAL_EXAMPLES} unique usage examples${NC}"

# Extract example audio file names (without .mp3 extension)
echo -e "${YELLOW}Checking existing example audio files...${NC}"
if [ -d "$AUDIO_EXAMPLES_DIR" ] && ls "$AUDIO_EXAMPLES_DIR"/*.mp3 >/dev/null 2>&1; then
    find "$AUDIO_EXAMPLES_DIR" -type f -name "*.mp3" -exec basename {} \; | \
        sed 's/.mp3$//' | \
        sort -u > "$TEMP_DIR/example_audio_files.txt"
else
    touch "$TEMP_DIR/example_audio_files.txt"
fi

TOTAL_EXAMPLE_AUDIO=$(wc -l < "$TEMP_DIR/example_audio_files.txt")
echo -e "${GREEN}Found ${TOTAL_EXAMPLE_AUDIO} existing example audio files${NC}"

# For comparison, we need to create a cleaned version of examples
# This matches the cleaning done by clean-example-filenames.sh:
# - Remove ¡ ¿ ! ? globally (not just start/end)
# - Remove internal dots
# - Remove leading em dashes (—)
# - Clean up extra spaces
echo -e "${YELLOW}Comparing to find missing example files...${NC}"
while IFS= read -r example; do
    cleaned=$(echo "$example" | \
        sed 's/¡//g' | \
        sed 's/¿//g' | \
        sed 's/!//g' | \
        sed 's/?//g' | \
        sed 's/\.//g' | \
        sed 's/^— *//' | \
        sed 's/  */ /g' | \
        sed 's/^ *//' | \
        sed 's/ *$//')
    echo "$cleaned"
done < "$TEMP_DIR/usage_examples.txt" | sort -u > "$TEMP_DIR/usage_examples_cleaned.txt"

comm -23 "$TEMP_DIR/usage_examples_cleaned.txt" "$TEMP_DIR/example_audio_files.txt" > "$TEMP_DIR/missing_examples_cleaned.txt"

# Now get the original versions with special characters for the missing ones
> "$TEMP_DIR/missing_examples.txt"
while IFS= read -r cleaned_example; do
    # Find the original version with special characters
    grep -F "$cleaned_example" "$TEMP_DIR/usage_examples.txt" | head -1 >> "$TEMP_DIR/missing_examples.txt"
done < "$TEMP_DIR/missing_examples_cleaned.txt"

MISSING_EXAMPLES_COUNT=$(wc -l < "$TEMP_DIR/missing_examples.txt")
echo -e "${YELLOW}Found ${MISSING_EXAMPLES_COUNT} missing example audio files${NC}"

# ============================================================================
# Check if anything is missing
# ============================================================================
echo ""
if [ "$MISSING_COUNT" -eq 0 ] && [ "$MISSING_EXAMPLES_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ All audio files are present! Nothing missing.${NC}"
    rm -rf "$TEMP_DIR"
    exit 0
fi

# Generate HTML file
echo -e "${BLUE}Generating HTML file: ${OUTPUT_FILE}${NC}"

# Capitalize first letter of category for title
CATEGORY_TITLE="$(tr '[:lower:]' '[:upper:]' <<< ${CATEGORY:0:1})${CATEGORY:1}"

# Create the HTML file header with variables expanded
{
cat << 'HTMLSTART'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
HTMLSTART

cat << EOF
    <title>Missing Audio Files - ${CATEGORY_TITLE}</title>
EOF

cat << 'HTMLSTYLE'
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .stat-box {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
        }
        .content {
            padding: 40px;
        }
        .instructions {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        .instructions h2 {
            color: #667eea;
            margin-bottom: 15px;
        }
        .instructions ul {
            margin-left: 20px;
            line-height: 1.8;
        }
        .section {
            margin-bottom: 40px;
        }
        .section-header {
            background: #667eea;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .section-title {
            font-size: 1.5em;
            font-weight: bold;
        }
        .section-count {
            background: rgba(255,255,255,0.3);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        .item-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .item {
            background: #f8f9fa;
            padding: 15px 20px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .item:hover {
            background: #e9ecef;
            transform: translateX(5px);
            border-color: #667eea;
        }
        .item.copied {
            background: #d4edda;
            border-color: #28a745;
        }
        .item-text {
            font-size: 1.1em;
            color: #333;
        }
        .item.copied .item-text {
            color: #155724;
        }
        .copy-icon {
            opacity: 0.3;
            font-size: 1.2em;
            transition: opacity 0.3s;
        }
        .item:hover .copy-icon {
            opacity: 0.7;
        }
        .item.copied .copy-icon {
            opacity: 1;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #dee2e6;
        }
        .progress-container {
            margin: 20px 0;
            background: #e9ecef;
            border-radius: 20px;
            height: 30px;
            overflow: hidden;
            position: relative;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        .toast {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateY(100px);
            transition: all 0.3s ease;
            z-index: 1000;
        }
        .toast.show {
            opacity: 1;
            transform: translateY(0);
        }
        code {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
HTMLSTYLE

cat << EOF
    <div class="container">
        <div class="header">
            <h1>🎙️ Missing Audio Files</h1>
            <h2>${CATEGORY_TITLE} Category</h2>
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-label">Date</div>
                    <div class="stat-value" style="font-size: 1.2em;">$(date +"%b %d, %Y")</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Missing Answers</div>
                    <div class="stat-value">${MISSING_COUNT}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Missing Examples</div>
                    <div class="stat-value">${MISSING_EXAMPLES_COUNT}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Total Missing</div>
                    <div class="stat-value">$((MISSING_COUNT + MISSING_EXAMPLES_COUNT))</div>
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" id="progressBar" style="width: 0%">0 / $((MISSING_COUNT + MISSING_EXAMPLES_COUNT))</div>
            </div>
        </div>
        
        <div class="content">
            <div class="instructions">
                <h2>📋 Instructions for Translator</h2>
                <p style="margin-bottom: 15px;">Please record clear, native Spanish pronunciation for each phrase listed below. Click any item to copy it to your clipboard.</p>
                <ul>
                    <li><strong>Correct Answers</strong> - Short phrases (saved in <code>answers/${CATEGORY}/</code>)</li>
                    <li><strong>Usage Examples</strong> - Full sentence examples (saved in <code>examples/${CATEGORY}/</code>)</li>
                </ul>
                <h3 style="margin-top: 20px; color: #667eea;">File Naming Format:</h3>
                <ul>
                    <li>Use the exact Spanish text as shown (WITH ¡ ¿ ! ? characters)</li>
                    <li>Then manually remove ¡ ¿ ! ? characters from the filename</li>
                    <li>Add <code>.mp3</code> extension</li>
                    <li>Example: <code>¿dónde está?</code> → <code>dónde está.mp3</code></li>
                </ul>
                <h3 style="margin-top: 20px; color: #667eea;">Recording Guidelines:</h3>
                <ul>
                    <li>Clear, native Spanish pronunciation</li>
                    <li>MP3 format</li>
                    <li>Moderate speaking pace</li>
                    <li>Quiet environment (no background noise)</li>
                </ul>
            </div>
EOF
} > "$OUTPUT_FILE"

# ============================================================================
# Add missing answers section
# ============================================================================
if [ "$MISSING_COUNT" -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
            <div class="section">
                <div class="section-header">
                    <div class="section-title">✅ Correct Answer Audio Files</div>
                    <div class="section-count">${MISSING_COUNT} files</div>
                </div>
                <p style="margin-bottom: 15px; color: #666;">
                    Short phrases to save in <code>audio-samples/answers/${CATEGORY}/</code>
                    <br><strong>Click any item to copy to clipboard</strong>
                </p>
                <div class="item-list">
EOF

    while IFS= read -r item; do
        # Escape for HTML display
        html_item=$(echo "$item" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
        # Escape for JavaScript string (replace single quotes)
        js_item=$(echo "$item" | sed "s/'/\\\\'/g")
        cat >> "$OUTPUT_FILE" << EOF
                    <div class="item" onclick="copyToClipboard(this, '${js_item}')">
                        <span class="item-text">${html_item}</span>
                        <span class="copy-icon">📋</span>
                    </div>
EOF
    done < "$TEMP_DIR/missing_audio.txt"
    
    cat >> "$OUTPUT_FILE" << 'EOF'
                </div>
            </div>
EOF
fi

# ============================================================================
# Add missing examples section
# ============================================================================
if [ "$MISSING_EXAMPLES_COUNT" -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
            <div class="section">
                <div class="section-header">
                    <div class="section-title">💬 Usage Example Audio Files</div>
                    <div class="section-count">${MISSING_EXAMPLES_COUNT} files</div>
                </div>
                <p style="margin-bottom: 15px; color: #666;">
                    Full sentence examples to save in <code>audio-samples/examples/${CATEGORY}/</code>
                    <br><strong>Click any item to copy to clipboard</strong>
                </p>
                <div class="item-list">
EOF

    while IFS= read -r item; do
        # Escape for HTML display
        html_item=$(echo "$item" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
        # Escape for JavaScript string (replace single quotes)
        js_item=$(echo "$item" | sed "s/'/\\\\'/g")
        cat >> "$OUTPUT_FILE" << EOF
                    <div class="item" onclick="copyToClipboard(this, '${js_item}')">
                        <span class="item-text">${html_item}</span>
                        <span class="copy-icon">📋</span>
                    </div>
EOF
    done < "$TEMP_DIR/missing_examples.txt"
    
    cat >> "$OUTPUT_FILE" << 'EOF'
                </div>
            </div>
EOF
fi

# Add footer
cat >> "$OUTPUT_FILE" << EOF
        </div>
        
        <div class="footer">
            <h2>📊 Summary Statistics</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 20px; text-align: left;">
                <div><strong>Total missing answer files:</strong> ${MISSING_COUNT}</div>
                <div><strong>Total missing example files:</strong> ${MISSING_EXAMPLES_COUNT}</div>
                <div><strong>Total missing files:</strong> $((MISSING_COUNT + MISSING_EXAMPLES_COUNT))</div>
                <div><strong>Existing answer files:</strong> ${TOTAL_AUDIO}</div>
                <div><strong>Existing example files:</strong> ${TOTAL_EXAMPLE_AUDIO}</div>
                <div><strong>Total unique answers:</strong> ${TOTAL_ANSWERS}</div>
                <div><strong>Total unique examples:</strong> ${TOTAL_EXAMPLES}</div>
                <div><strong>Category:</strong> ${CATEGORY_TITLE}</div>
                <div><strong>File format:</strong> MP3</div>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; text-align: left;">
                <h3 style="color: #667eea; margin-bottom: 10px;">📦 Delivery Instructions</h3>
                <p>Please save audio files in two separate folders:</p>
                <ol style="margin-left: 20px; margin-top: 10px; line-height: 1.8;">
                    <li><code>${CATEGORY}/answers/</code> - for correct answer audio files</li>
                    <li><code>${CATEGORY}/examples/</code> - for usage example audio files</li>
                </ol>
                <p style="margin-top: 10px;">Zip both folders for delivery.</p>
                <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
                    <strong>Note:</strong> Answer files should be placed in <code>audio-samples/answers/${CATEGORY}/</code> and example files in <code>audio-samples/examples/${CATEGORY}/</code>
                </p>
            </div>
        </div>
    </div>
    
    <div class="toast" id="toast">✓ Copied to clipboard!</div>
    
    <script>
        let copiedCount = 0;
        const totalItems = $((MISSING_COUNT + MISSING_EXAMPLES_COUNT));
        
        function copyToClipboard(element, text) {
            // Decode HTML entities
            const textarea = document.createElement('textarea');
            textarea.innerHTML = text;
            const decodedText = textarea.value;
            
            // Copy to clipboard
            navigator.clipboard.writeText(decodedText).then(() => {
                // Mark as copied
                if (!element.classList.contains('copied')) {
                    element.classList.add('copied');
                    copiedCount++;
                    updateProgress();
                    element.querySelector('.copy-icon').textContent = '✓';
                    
                    // Show toast
                    showToast();
                }
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard. Please try again.');
            });
        }
        
        function updateProgress() {
            const progressBar = document.getElementById('progressBar');
            const percentage = (copiedCount / totalItems) * 100;
            progressBar.style.width = percentage + '%';
            progressBar.textContent = copiedCount + ' / ' + totalItems;
        }
        
        function showToast() {
            const toast = document.getElementById('toast');
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }
        
        // Load saved state from localStorage
        window.addEventListener('DOMContentLoaded', () => {
            const items = document.querySelectorAll('.item');
            items.forEach((item, index) => {
                const key = 'copied_' + window.location.pathname + '_' + index;
                if (localStorage.getItem(key) === 'true') {
                    item.classList.add('copied');
                    item.querySelector('.copy-icon').textContent = '✓';
                    copiedCount++;
                }
            });
            updateProgress();
        });
        
        // Save state to localStorage
        const originalCopy = copyToClipboard;
        copyToClipboard = function(element, text) {
            const items = Array.from(document.querySelectorAll('.item'));
            const index = items.indexOf(element);
            const key = 'copied_' + window.location.pathname + '_' + index;
            localStorage.setItem(key, 'true');
            originalCopy(element, text);
        };
    </script>
</body>
</html>
EOF

# Clean up temp files
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✓ Successfully generated: ${OUTPUT_FILE}${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  Correct Answers:"
echo "    Total unique answers:  ${TOTAL_ANSWERS}"
echo "    Existing audio files:  ${TOTAL_AUDIO}"
echo "    Missing audio files:   ${MISSING_COUNT}"
echo ""
echo "  Usage Examples:"
echo "    Total unique examples: ${TOTAL_EXAMPLES}"
echo "    Existing audio files:  ${TOTAL_EXAMPLE_AUDIO}"
echo "    Missing audio files:   ${MISSING_EXAMPLES_COUNT}"
echo ""
echo "  Overall Total Missing:   $((MISSING_COUNT + MISSING_EXAMPLES_COUNT))"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review the generated file: ${OUTPUT_FILE}"
echo "  2. Send to translator for recording"
echo "  3. Place completed answer files in: ${AUDIO_ANSWERS_DIR}/"
echo "  4. Place completed example files in: ${AUDIO_EXAMPLES_DIR}/"
