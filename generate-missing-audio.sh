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
AUDIO_DIR="audio-samples/${CATEGORY}"
CONFIG_FILE="src/config/questions/${CATEGORY}.js"
OUTPUT_FILE="work/missing-${CATEGORY}-audio.md"
TEMP_DIR="/tmp/missing-audio-$$"

# Create temp directory
mkdir -p "$TEMP_DIR"

# Validate paths
if [ ! -d "$AUDIO_DIR" ]; then
    echo -e "${RED}Error: Audio directory not found: ${AUDIO_DIR}${NC}"
    exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Error: Config file not found: ${CONFIG_FILE}${NC}"
    exit 1
fi

echo -e "${BLUE}Processing category: ${CATEGORY}${NC}"
echo "----------------------------------------"

# Extract all unique correctAnswer values from the config file
echo -e "${YELLOW}Extracting correct answers from config...${NC}"
grep "correctAnswer:" "$CONFIG_FILE" | \
    sed "s/.*correctAnswer: '//" | \
    sed "s/',$//" | \
    sed 's/^¿//' | \
    sed 's/?$//' | \
    sort -u > "$TEMP_DIR/correct_answers.txt"

TOTAL_ANSWERS=$(wc -l < "$TEMP_DIR/correct_answers.txt")
echo -e "${GREEN}Found ${TOTAL_ANSWERS} unique correct answers${NC}"

# Extract audio file names (without .mp3 extension)
echo -e "${YELLOW}Checking existing audio files...${NC}"
if ls "$AUDIO_DIR"/*.mp3 >/dev/null 2>&1; then
    find "$AUDIO_DIR" -type f -name "*.mp3" -exec basename {} \; | \
        sed 's/.mp3$//' | \
        sort -u > "$TEMP_DIR/audio_files.txt"
else
    touch "$TEMP_DIR/audio_files.txt"
fi

TOTAL_AUDIO=$(wc -l < "$TEMP_DIR/audio_files.txt")
echo -e "${GREEN}Found ${TOTAL_AUDIO} existing audio files${NC}"

# Find missing audio files
echo -e "${YELLOW}Comparing to find missing files...${NC}"
comm -23 "$TEMP_DIR/correct_answers.txt" "$TEMP_DIR/audio_files.txt" > "$TEMP_DIR/missing_audio.txt"

MISSING_COUNT=$(wc -l < "$TEMP_DIR/missing_audio.txt")

if [ "$MISSING_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ All audio files are present! Nothing missing.${NC}"
    rm -rf "$TEMP_DIR"
    exit 0
fi

echo -e "${YELLOW}Found ${MISSING_COUNT} missing audio files${NC}"

# Generate markdown file
echo -e "${BLUE}Generating markdown file: ${OUTPUT_FILE}${NC}"

# Capitalize first letter of category for title
CATEGORY_TITLE="$(tr '[:lower:]' '[:upper:]' <<< ${CATEGORY:0:1})${CATEGORY:1}"

# Create the markdown file header with variables expanded
{
cat << EOF
# Missing Audio Files for ${CATEGORY_TITLE} Category

**Date:** $(date +"%B %d, %Y")  
**Category:** ${CATEGORY_TITLE}  
**Total Missing:** ${MISSING_COUNT} audio files

## Instructions for Translator

Please record clear, native Spanish pronunciation for each phrase listed below. Save each audio file as an MP3 with the exact Spanish text as the filename.

### File Naming Format
- Use the exact Spanish text as shown, but REMOVE leading ¿ and trailing ? characters
EOF
# Now add the part with backticks without variable expansion
cat << 'ENDOFEXAMPLES'
- Add `.mp3` extension
- Examples:
  - `el tren.mp3`
  - `la estación.mp3`
  - `dónde está.mp3` (NOT `¿dónde está?.mp3`)

### Recording Guidelines
- Clear, native Spanish pronunciation
- MP3 format
- Moderate speaking pace
- Quiet environment (no background noise)

---

## Missing Audio Files

ENDOFEXAMPLES
} > "$OUTPUT_FILE"


# Add all missing items as a simple list
echo "### Items to Record" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

while IFS= read -r item; do
    echo "- $item" >> "$OUTPUT_FILE"
done < "$TEMP_DIR/missing_audio.txt"

# Add footer
cat >> "$OUTPUT_FILE" << EOF

---

## Summary Statistics

- **Total missing audio files:** ${MISSING_COUNT}
- **Existing audio files:** ${TOTAL_AUDIO}
- **Total unique answers:** ${TOTAL_ANSWERS}
- **Category:** ${CATEGORY_TITLE}
- **File format:** MP3
- **Naming:** Use exact Spanish text + .mp3

## Delivery

Please save all audio files in a folder named \`${CATEGORY}\` and zip it for delivery.

---

**Note:** All audio files should be placed in the \`audio-samples/${CATEGORY}/\` directory once completed.
EOF

# Clean up temp files
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✓ Successfully generated: ${OUTPUT_FILE}${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  Total correct answers: ${TOTAL_ANSWERS}"
echo "  Existing audio files:  ${TOTAL_AUDIO}"
echo "  Missing audio files:   ${MISSING_COUNT}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review the generated file: ${OUTPUT_FILE}"
echo "  2. Send to translator for recording"
echo "  3. Place completed files in: ${AUDIO_DIR}/"
