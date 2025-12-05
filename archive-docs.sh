#!/bin/bash
# Script to archive old implementation documents
# Created: December 4, 2025

# Create archive directory
mkdir -p docs/archive

# List of documents to archive (implementation-specific, phase-specific, or superseded)
ARCHIVE_FILES=(
    "FEATURE-LAUNCH-SUMMARY.md"
    "FINAL-IMPLEMENTATION-SUMMARY.md"
    "FOUR-PHASE-COMPLETE.md"
    "PERSISTENT-TRACKING-IMPLEMENTATION.md"
    "PERSISTENT-TRACKING-TESTING.md"
    "STATE-PERSISTENCE-ANALYSIS.md"
    "STORAGE-OPTIMIZATION-NUMERIC-IDS.md"
)

echo "📦 Archiving old implementation documents..."
echo ""

for file in "${ARCHIVE_FILES[@]}"; do
    if [ -f "docs/$file" ]; then
        echo "  Moving: $file"
        mv "docs/$file" "docs/archive/"
    else
        echo "  ⚠️  Not found: $file"
    fi
done

echo ""
echo "✅ Archive complete!"
echo ""
echo "Archived files are in: docs/archive/"
echo ""
echo "To restore a file:"
echo "  mv docs/archive/FILENAME docs/"
echo ""
echo "To permanently delete archive:"
echo "  rm -rf docs/archive/"
