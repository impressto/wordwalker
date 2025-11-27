#!/bin/bash

# Quick deployment helper for WordWalker PWA
# Run this after making changes

echo "🚀 WordWalker PWA - Quick Deploy Helper"
echo "========================================"
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the wordwalker directory"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(grep -oP '"version":\s*"\K[^"]+' package.json)
echo "📦 Current version: $CURRENT_VERSION"
echo ""

# Ask for version bump
echo "Version bump type:"
echo "  1) Patch (0.0.X) - Bug fixes"
echo "  2) Minor (0.X.0) - New features"
echo "  3) Major (X.0.0) - Breaking changes"
echo "  4) Skip version bump"
read -p "Choose (1-4): " BUMP_CHOICE

if [ "$BUMP_CHOICE" != "4" ]; then
    # Parse current version
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
    
    # Bump version based on choice
    case $BUMP_CHOICE in
        1)
            PATCH=$((PATCH + 1))
            ;;
        2)
            MINOR=$((MINOR + 1))
            PATCH=0
            ;;
        3)
            MAJOR=$((MAJOR + 1))
            MINOR=0
            PATCH=0
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
    
    NEW_VERSION="$MAJOR.$MINOR.$PATCH"
    echo ""
    echo "🔄 Bumping version: $CURRENT_VERSION → $NEW_VERSION"
    
    # Update package.json
    sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
    
    # Update service-worker.js in public/ - use regex to match any version
    sed -i "s/wordwalker-v[0-9]\+\.[0-9]\+\.[0-9]\+/wordwalker-v$NEW_VERSION/g" public/service-worker.js
    
    echo "✅ Version updated to $NEW_VERSION"
    VERSION=$NEW_VERSION
else
    echo "⏭️  Skipping version bump"
    VERSION=$CURRENT_VERSION
fi

echo ""
echo "🔨 Building..."
yarn build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "✅ Build complete!"
echo ""

# Show what to deploy
echo "📋 Files to upload to server:"
echo "   - index.php (always - includes SW registration)"
echo "   - package.json (for version cache busting)"
echo "   - dist/ folder (entire folder, includes service-worker.js)"
echo "   - pwa-test.html (optional: PWA debugging tool)"
echo ""

# Check version consistency
PKG_VERSION=$(grep -oP '"version":\s*"\K[^"]+' package.json)
SW_VERSION=$(grep -oP "CACHE_NAME = 'wordwalker-v\K[^']+" dist/service-worker.js 2>/dev/null || echo "not found")

if [ "$PKG_VERSION" = "$SW_VERSION" ]; then
    echo "✅ Version consistent: $SW_VERSION"
else
    echo "⚠️  WARNING: Version mismatch!"
    echo "   package.json: $PKG_VERSION"
    echo "   service-worker.js: $SW_VERSION"
    echo ""
    echo "   This is OK if you skipped version bump."
    echo "   Otherwise, update CACHE_NAME in public/service-worker.js"
fi

echo ""
echo "📊 Service Worker Cache Details:"
grep -A 3 "const CACHE_NAME" dist/service-worker.js 2>/dev/null || echo "   Could not read service-worker.js"
echo ""

echo "🔍 After deploying, test at:"
echo "   https://impressto.ca/wordwalker/pwa-test.html"
echo "   https://impressto.ca/wordwalker/index.php"
echo ""
echo "📱 To test offline on mobile:"
echo "   1. Visit https://impressto.ca/wordwalker/pwa-test.html"
echo "   2. Tap 'Clear All Caches' and 'Unregister Service Worker'"
echo "   3. Visit https://impressto.ca/wordwalker/index.php"
echo "   4. Click 'Install App' button (or use browser menu)"
echo "   5. Play until some assets are cached"
echo "   6. Turn off internet (airplane mode)"
echo "   7. Open PWA - should work offline!"
echo ""
echo "💡 Quick checks:"
echo "   - Volume control in top-left? ✓"
echo "   - Background music playing? ✓"
echo "   - Install button in bottom-right? ✓"
echo "   - Streak bonus every 5 correct answers? ✓"
echo "   - Smooth fade in/out for streak? ✓"
echo ""
echo "📝 Deployment notes:"
echo "   - Service worker is in dist/service-worker.js (not root)"
echo "   - index.php registers it from dist/service-worker.js"
echo "   - Cache busting uses version from package.json"
echo "   - Background is black (set in index.php)"
echo ""
echo "🎉 Ready to deploy!"
echo ""
