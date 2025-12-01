#!/bin/bash

# Quick PWA status checker for WordWalker
# Verifies version consistency and PWA setup

echo "🔍 WordWalker PWA - Status Check"
echo "================================="
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the wordwalker directory"
    exit 1
fi

# Get version from package.json
PKG_VERSION=$(grep -oP '"version":\s*"\K[^"]+' package.json)
echo "📦 package.json version: $PKG_VERSION"

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "⚠️  dist/ folder not found - run 'yarn build' first"
    exit 1
fi

# Get version from service worker
SW_VERSION=$(grep -oP "CACHE_NAME = 'wordwalker-v\K[^']+" dist/service-worker.js 2>/dev/null || echo "not found")
echo "🔧 service-worker.js version: $SW_VERSION"

echo ""

# Check version consistency
if [ "$PKG_VERSION" = "$SW_VERSION" ]; then
    echo "✅ Versions match!"
else
    echo "❌ Version mismatch!"
    echo "   Update CACHE_NAME in public/service-worker.js to 'wordwalker-v$PKG_VERSION'"
    echo "   Then rebuild with 'yarn build'"
fi

echo ""
echo "📂 Required files check:"

# Check essential files
check_file() {
    if [ -f "$1" ]; then
        echo "   ✅ $1"
    else
        echo "   ❌ $1 - MISSING!"
    fi
}

check_file "index.php"
check_file "package.json"
check_file "dist/index.html"
check_file "dist/manifest.json"
check_file "dist/service-worker.js"
check_file "dist/assets/index.js"
check_file "dist/assets/vendor.js"
check_file "dist/assets/index.css"

echo ""
echo "🎨 Icon files:"
check_file "dist/icon-192x192.png"
check_file "dist/icon-512x512.png"
check_file "dist/icon.png"

echo ""
echo "🔊 Audio files:"
check_file "dist/audio/background.mp3"
check_file "dist/audio/correct.mp3"
check_file "dist/audio/wrong.mp3"
check_file "dist/audio/streak.mp3"
check_file "dist/audio/choice.mp3"

echo ""
echo "🖼️  Image files:"
check_file "dist/images/grass.png"
check_file "dist/images/path.png"
check_file "dist/images/path-fork.png"
check_file "dist/images/mountains.png"
check_file "dist/images/walkers/walker-default.png"

echo ""
echo "📋 Service Worker Configuration:"
echo "   Cache Names:"
grep "const.*CACHE" dist/service-worker.js 2>/dev/null | sed 's/^/   /'

echo ""
echo "🌐 Manifest Configuration:"
if [ -f "dist/manifest.json" ]; then
    echo "   Name: $(grep -oP '"name":\s*"\K[^"]+' dist/manifest.json)"
    echo "   Short Name: $(grep -oP '"short_name":\s*"\K[^"]+' dist/manifest.json)"
    echo "   Start URL: $(grep -oP '"start_url":\s*"\K[^"]+' dist/manifest.json)"
    echo "   Theme Color: $(grep -oP '"theme_color":\s*"\K[^"]+' dist/manifest.json)"
    echo "   Background: $(grep -oP '"background_color":\s*"\K[^"]+' dist/manifest.json)"
else
    echo "   ❌ manifest.json not found"
fi

echo ""
echo "💡 Next steps:"
echo "   1. If versions don't match, update public/service-worker.js"
echo "   2. Run './deploy.sh' to build and prepare for deployment"
echo "   3. Upload to server:"
echo "      - index.php"
echo "      - package.json"
echo "      - dist/ folder"
echo "   4. Test at: https://impressto.ca/wordwalker/pwa-test.html"
echo ""
