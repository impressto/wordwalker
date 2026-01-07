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
OUTPUT_FILE="work/missing-${CATEGORY}-audio.md"
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

# For comparison, we need to create a cleaned version of answers (remove ¡¿?!)
echo -e "${YELLOW}Comparing to find missing answer files...${NC}"
sed 's/^¡//' "$TEMP_DIR/correct_answers.txt" | \
    sed 's/!$//' | \
    sed 's/^¿//' | \
    sed 's/?$//' | \
    sort -u > "$TEMP_DIR/correct_answers_cleaned.txt"

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

# For comparison, we need to create a cleaned version of examples (remove ¡¿?!)
echo -e "${YELLOW}Comparing to find missing example files...${NC}"
sed 's/^¡//' "$TEMP_DIR/usage_examples.txt" | \
    sed 's/!$//' | \
    sed 's/^¿//' | \
    sed 's/?$//' | \
    sort -u > "$TEMP_DIR/usage_examples_cleaned.txt"

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
**Total Missing Answers:** ${MISSING_COUNT} audio files  
**Total Missing Examples:** ${MISSING_EXAMPLES_COUNT} audio files  
**Total Missing:** $((MISSING_COUNT + MISSING_EXAMPLES_COUNT)) audio files

## Instructions for Translator

Please record clear, native Spanish pronunciation for each phrase listed below. There are two types of audio files to record:

1. **Correct Answers** - Short phrases (saved in \`answers/${CATEGORY}/\`)
2. **Usage Examples** - Full sentence examples (saved in \`examples/${CATEGORY}/\`)

### File Naming Format

**For Both Correct Answers and Usage Examples:**
- Use the exact Spanish text as shown below (WITH ¡ ¿ ! ? characters)
- Then manually remove ¡ ¿ ! ? characters from the filename
- Add \`.mp3\` extension
- Examples:
  - Original: \`¿dónde está?\`
  - Filename: \`dónde está.mp3\`
  
  - Original: \`¡Hola! ¿Cómo estás?\`
  - Filename: \`Hola Cómo estás.mp3\`
EOF
# Now add the part with backticks without variable expansion
cat << 'ENDOFEXAMPLES'

### Recording Guidelines
- Clear, native Spanish pronunciation
- MP3 format
- Moderate speaking pace
- Quiet environment (no background noise)

---

ENDOFEXAMPLES
} > "$OUTPUT_FILE"

# ============================================================================
# Add missing answers section
# ============================================================================
if [ "$MISSING_COUNT" -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
## Missing Correct Answer Audio Files

These are short phrases that should be saved in \`audio-samples/answers/${CATEGORY}/\`

**IMPORTANT:** The text below includes ¡ ¿ ! ? characters for translation purposes. When creating the MP3 filename, manually remove these characters.

### Items to Record (${MISSING_COUNT} files)

EOF

    while IFS= read -r item; do
        echo "- $item" >> "$OUTPUT_FILE"
    done < "$TEMP_DIR/missing_audio.txt"
    
    echo "" >> "$OUTPUT_FILE"
fi

# ============================================================================
# Add missing examples section
# ============================================================================
if [ "$MISSING_EXAMPLES_COUNT" -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
## Missing Usage Example Audio Files

These are full sentence examples that should be saved in \`audio-samples/examples/${CATEGORY}/\`

**IMPORTANT:** The text below includes ¡ ¿ ! ? characters for translation purposes. When creating the MP3 filename, manually remove these characters.

### Items to Record (${MISSING_EXAMPLES_COUNT} files)

EOF

    while IFS= read -r item; do
        echo "- $item" >> "$OUTPUT_FILE"
    done < "$TEMP_DIR/missing_examples.txt"
    
    echo "" >> "$OUTPUT_FILE"
fi

# Add footer
cat >> "$OUTPUT_FILE" << EOF

---

## Summary Statistics

- **Total missing answer files:** ${MISSING_COUNT}
- **Total missing example files:** ${MISSING_EXAMPLES_COUNT}
- **Total missing files:** $((MISSING_COUNT + MISSING_EXAMPLES_COUNT))
- **Existing answer files:** ${TOTAL_AUDIO}
- **Existing example files:** ${TOTAL_EXAMPLE_AUDIO}
- **Total unique answers:** ${TOTAL_ANSWERS}
- **Total unique examples:** ${TOTAL_EXAMPLES}
- **Category:** ${CATEGORY_TITLE}
- **File format:** MP3

## Delivery

Please save audio files in two separate folders:
1. \`${CATEGORY}/answers/\` - for correct answer audio files
2. \`${CATEGORY}/examples/\` - for usage example audio files

Zip both folders for delivery.

---

**Note:** 
- Answer files should be placed in \`audio-samples/answers/${CATEGORY}/\`
- Example files should be placed in \`audio-samples/examples/${CATEGORY}/\`
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
