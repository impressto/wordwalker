#!/bin/bash

###############################################################################
# Convert MP3 Files to Mono
#
# This script converts MP3 files to mono (single channel) audio.
#
# Usage: ./convert-mp3-to-mono.sh [category]
# Examples: 
#   ./convert-mp3-to-mono.sh               # Convert all MP3s in current directory
#   ./convert-mp3-to-mono.sh greetings     # Convert MP3s in audio-samples/examples/greetings
#   ./convert-mp3-to-mono.sh numbers       # Convert MP3s in audio-samples/examples/numbers
###############################################################################

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Determine target directory
if [ -z "$1" ]; then
    # No argument - use current directory
    TARGET_DIR="."
    echo -e "${BLUE}Converting MP3 files to mono in current directory${NC}"
else
    # Category argument provided
    CATEGORY="$1"
    TARGET_DIR="audio-samples/examples/${CATEGORY}"
    
    # Validate directory exists
    if [ ! -d "$TARGET_DIR" ]; then
        echo -e "${RED}Error: Directory not found: ${TARGET_DIR}${NC}"
        echo "Make sure the category name is correct and the directory exists."
        exit 1
    fi
    
    echo -e "${BLUE}Converting MP3 files to mono in ${TARGET_DIR}${NC}"
fi

echo ""

# Change to target directory
cd "$TARGET_DIR"

# Check if any MP3 files exist
shopt -s nullglob
mp3_files=(*.mp3)
if [ ${#mp3_files[@]} -eq 0 ]; then
    echo -e "${YELLOW}No MP3 files found${NC}"
    exit 0
fi

echo -e "${GREEN}Found ${#mp3_files[@]} MP3 file(s)${NC}"
echo ""

# Counter for processed files
COUNT=0

# Process all MP3 files
for f in "${mp3_files[@]}"; do
    echo -e "${YELLOW}Processing:${NC} $f"
    if ffmpeg -i "$f" -ac 1 -y "tmp_$f" -loglevel error 2>&1 > /dev/null; then
        mv "tmp_$f" "$f"
        echo -e "${GREEN}✓ Converted:${NC} $f"
        COUNT=$((COUNT + 1))
    else
        echo -e "${RED}✗ Failed:${NC} $f"
        # Clean up tmp file if it exists
        [ -f "tmp_$f" ] && rm "tmp_$f"
    fi
done

echo ""

echo -e "${GREEN}Complete! Converted ${COUNT} file(s) to mono${NC}"
