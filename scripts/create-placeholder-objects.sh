#!/bin/bash

# Create placeholder object images for flash cards
# This creates simple colored rectangles with text labels for testing

set -e

OBJECTS_DIR="public/images/flash-cards/objects"
cd "$(dirname "$0")/.."

echo "Creating placeholder object images..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Please install it first:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    echo "  Or manually create PNG files in $OBJECTS_DIR"
    exit 1
fi

# Create directory if it doesn't exist
mkdir -p "$OBJECTS_DIR"

# Array of object names (Spanish with article)
declare -a objects=(
    "el plátano"
    "la manzana"
    "la naranja"
    "la piña"
    "la pizza"
    "la hamburguesa"
    "el taco"
    "el pollo"
    "el helado"
)

# Corresponding colors for each food item
declare -a colors=(
    "#FFE135"  # banana - yellow
    "#FF4444"  # apple - red
    "#FF8C00"  # orange - orange
    "#FFD700"  # pineapple - golden
    "#FF6B6B"  # pizza - red/tomato
    "#8B4513"  # hamburger - brown
    "#F4A460"  # taco - tan
    "#F5DEB3"  # chicken - wheat
    "#FFB6C1"  # ice cream - pink
)

# Create each placeholder image
for i in "${!objects[@]}"; do
    name="${objects[$i]}"
    color="${colors[$i]}"
    filename="$OBJECTS_DIR/$name.png"
    
    if [ -f "$filename" ]; then
        echo "  ⏭️  Skipping $name (already exists)"
        continue
    fi
    
    echo "  ✅ Creating $name.png"
    
    # Create a simple colored rectangle with rounded corners and text
    convert -size 126x120 xc:transparent \
        -fill "$color" \
        -draw "roundrectangle 5,5 121,115 15,15" \
        -fill white \
        -stroke black \
        -strokewidth 1 \
        -pointsize 18 \
        -font "Arial-Bold" \
        -gravity center \
        -annotate +0+0 "$name" \
        "$filename"
done

echo ""
echo "✅ Done! Created placeholder images in $OBJECTS_DIR"
echo ""
echo "📋 Next steps:"
echo "  1. Replace placeholder images with proper illustrations"
echo "  2. Enable flash cards: Set FLASH_CARDS_ENABLED = true in src/config/flash-cards/index.js"
echo "  3. Test by completing the food category with a streak"
