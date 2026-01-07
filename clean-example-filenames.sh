#!/bin/bash

###############################################################################
# Clean Example Audio Filenames
#
# This script removes Spanish special characters (¡ ¿ ! ? .) from MP3 filenames
# in the audio-samples/examples/ directories, keeping only the final . for .mp3
#
# Usage: ./clean-example-filenames.sh <category> [--dry-run]
# Example: ./clean-example-filenames.sh greetings
#          ./clean-example-filenames.sh greetings --dry-run
#
# The --dry-run flag will show what would be renamed without actually doing it.
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if category argument is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Category name required${NC}"
    echo "Usage: ./clean-example-filenames.sh <category> [--dry-run]"
    echo "Example: ./clean-example-filenames.sh greetings"
    exit 1
fi

CATEGORY="$1"
DRY_RUN=false

# Check for dry-run flag
if [ "$2" = "--dry-run" ] || [ "$2" = "-n" ]; then
    DRY_RUN=true
    echo -e "${YELLOW}DRY RUN MODE - No files will be renamed${NC}"
    echo ""
fi

EXAMPLES_DIR="audio-samples/examples/${CATEGORY}"

# Validate directory exists
if [ ! -d "$EXAMPLES_DIR" ]; then
    echo -e "${RED}Error: Examples directory not found: ${EXAMPLES_DIR}${NC}"
    echo "Make sure the category name is correct and the directory exists."
    exit 1
fi

echo -e "${BLUE}Processing examples directory: ${EXAMPLES_DIR}${NC}"
echo "----------------------------------------"

# Count total MP3 files
TOTAL_FILES=$(find "$EXAMPLES_DIR" -type f -name "*.mp3" | wc -l)

if [ "$TOTAL_FILES" -eq 0 ]; then
    echo -e "${YELLOW}No MP3 files found in ${EXAMPLES_DIR}${NC}"
    exit 0
fi

echo -e "${CYAN}Found ${TOTAL_FILES} MP3 files${NC}"
echo ""

RENAMED_COUNT=0
SKIPPED_COUNT=0

# Process each MP3 file
while IFS= read -r filepath; do
    # Get the directory and filename
    dir=$(dirname "$filepath")
    filename=$(basename "$filepath")
    
    # Remove special characters: ¡ ¿ ! ? .
    # Keep only the final . before .mp3
    # Also remove leading em dashes (—) and clean up spaces
    new_filename=$(echo "$filename" | \
        sed 's/¡//g' | \
        sed 's/¿//g' | \
        sed 's/!//g' | \
        sed 's/?//g' | \
        sed 's/\.mp3$/@MP3@/' | \
        sed 's/\.//g' | \
        sed 's/@MP3@$/.mp3/' | \
        sed 's/^— *//' | \
        sed 's/  */ /g' | \
        sed 's/^ *//' | \
        sed 's/ *$//' | \
        sed 's/ \.mp3$/.mp3/')
    
    # Check if filename changed
    if [ "$filename" = "$new_filename" ]; then
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        continue
    fi
    
    new_filepath="${dir}/${new_filename}"
    
    # Display the change
    echo -e "${YELLOW}Rename:${NC}"
    echo -e "  From: ${CYAN}${filename}${NC}"
    echo -e "  To:   ${GREEN}${new_filename}${NC}"
    
    # Check if target file already exists
    if [ -f "$new_filepath" ] && [ "$filepath" != "$new_filepath" ]; then
        echo -e "  ${RED}⚠ Warning: Target file already exists, skipping${NC}"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        echo ""
        continue
    fi
    
    # Perform the rename (unless dry-run)
    if [ "$DRY_RUN" = false ]; then
        mv "$filepath" "$new_filepath"
        echo -e "  ${GREEN}✓ Renamed${NC}"
        RENAMED_COUNT=$((RENAMED_COUNT + 1))
    else
        echo -e "  ${YELLOW}(would rename)${NC}"
        RENAMED_COUNT=$((RENAMED_COUNT + 1))
    fi
    
    echo ""
    
done < <(find "$EXAMPLES_DIR" -type f -name "*.mp3")

# Summary
echo "----------------------------------------"
echo -e "${BLUE}Summary:${NC}"
echo "  Total files processed: ${TOTAL_FILES}"
echo "  Files renamed: ${RENAMED_COUNT}"
echo "  Files skipped: ${SKIPPED_COUNT}"

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo -e "${YELLOW}This was a dry run. To actually rename files, run:${NC}"
    echo "  ./clean-example-filenames.sh ${CATEGORY}"
elif [ "$RENAMED_COUNT" -gt 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Successfully cleaned ${RENAMED_COUNT} filenames!${NC}"
else
    echo ""
    echo -e "${GREEN}✓ All filenames are already clean!${NC}"
fi
