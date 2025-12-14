# Flash Cards Image Creation Checklist

## Required Object Images

The following object images need to be created and placed in `public/images/flash-cards/objects/`:

### Food Category (10 images needed)

| Spanish Name | English Translation | Filename | Status |
|--------------|---------------------|----------|--------|
| la sandía | the watermelon | `la sandía.png` | ✅ Exists |
| el plátano | the banana | `el plátano.png` | ❌ **NEEDED** |
| la manzana | the apple | `la manzana.png` | ❌ **NEEDED** |
| la naranja | the orange | `la naranja.png` | ❌ **NEEDED** |
| la piña | the pineapple | `la piña.png` | ❌ **NEEDED** |
| la pizza | the pizza | `la pizza.png` | ❌ **NEEDED** |
| la hamburguesa | the hamburger | `la hamburguesa.png` | ❌ **NEEDED** |
| el taco | the taco | `el taco.png` | ❌ **NEEDED** |
| el pollo | the chicken | `el pollo.png` | ❌ **NEEDED** |
| el helado | the ice cream | `el helado.png` | ❌ **NEEDED** |

## Image Specifications

### Object Images
- **Format:** PNG with transparency
- **Recommended size:** 126px wide × 120px tall (35% of 360px × 50% of 240px)
- **Aspect ratio:** Flexible, but keep proportional
- **Style:** 
  - Clear, simple illustrations
  - Vibrant colors
  - Suitable for language learning
  - Recognizable at small sizes
- **Background:** Transparent
- **Naming:** Must exactly match Spanish text with article (e.g., `la manzana.png`)

### Character Images
- **Format:** PNG with transparency
- **Recommended size:** 144px wide × 192px tall (40% of 360px × 80% of 240px)
- **Currently available:** Elvis character with 9 emotions
- **Location:** `public/images/flash-cards/characters/elvis/`

### Background Images
- **Format:** PNG
- **Size:** 360px × 240px
- **Currently available:** `purple.png`
- **Location:** `public/images/flash-cards/backgrounds/`

## Quick Creation Guide

### Using Design Software (Photoshop, Figma, etc.)

1. **Create new artboard:** 360px × 240px
2. **Test composition:**
   - Left side (5%, 15%): Character area (144 × 192px)
   - Right side (55%, 25%): Object area (126 × 120px)
   - Bottom: Text area (starts at 60px from top)
3. **Export objects:** Just the object layer as PNG with transparency
4. **File naming:** Use exact Spanish name (with article and accent marks)

### Using AI Image Generation

**Prompt template:**
```
A simple, colorful illustration of [item] on a transparent background, 
suitable for language learning, clean vector-style art, vibrant colors
```

**Example:**
```
A simple, colorful illustration of a banana on a transparent background,
suitable for language learning, clean vector-style art, vibrant colors
```

### Finding/Adapting Stock Images

1. Search for "[item] icon png transparent"
2. Download high-quality PNG
3. Remove background if needed (remove.bg)
4. Resize to recommended dimensions
5. Rename to Spanish text with article

## Testing Your Images

After adding images, test by:

1. **Enable flash cards:** Set `FLASH_CARDS_ENABLED = true` in `src/config/flash-cards/index.js`
2. **Complete a category:** Play through food category with streak
3. **Check each card:** Navigate through all 10 cards
4. **Verify:**
   - Background loads correctly
   - Character appears with correct emotion
   - Object displays clearly
   - Text is readable
   - Layout looks balanced

## Quick Test Checklist

```bash
# 1. Check if images exist
ls public/images/flash-cards/objects/

# 2. Verify filenames match config
# Compare with food.js config file

# 3. Check file sizes (should be reasonable)
du -sh public/images/flash-cards/objects/*

# 4. Test in browser
# Open app and complete food category with streak
```

## Positioning Reference

Current layout in `FlashCardsDialog.jsx`:

```javascript
// Character: Left side
charWidth: 40% of canvas (144px)
charHeight: 80% of canvas (192px)
charX: 5% from left (18px)
charY: 15% from top (36px)

// Object: Right side
objWidth: 35% of canvas (126px)
objHeight: 50% of canvas (120px)
objX: 55% from left (198px)
objY: 25% from top (60px)
```

## Alternative: Batch Generation Script

If you need to create many placeholder images quickly:

```bash
#!/bin/bash
# create-placeholder-objects.sh

cd public/images/flash-cards/objects

# Create simple colored rectangles as placeholders
for name in "el plátano" "la manzana" "la naranja" "la piña" "la pizza" "la hamburguesa" "el taco" "el pollo" "el helado"; do
  convert -size 126x120 xc:transparent \
    -fill "#$(openssl rand -hex 3)" \
    -draw "rectangle 10,10 116,110" \
    -fill white \
    -pointsize 14 \
    -gravity center \
    -annotate +0+0 "$name" \
    "$name.png"
done
```

## Emotion Selection Guide

Choose emotions that match the food/object vibe:

- **Laughing** - Fun, enjoyable foods (ice cream, pizza, taco)
- **Pleased** - Healthy, nutritious items (fruits, vegetables)
- **Welcoming** - Comfort foods (chicken, hamburger)
- **Confused** - Unusual or complex items
- **Indifferent** - Basic staples

Current selections in `food.js`:
- Watermelon → pleased
- Banana → laughing
- Apple → pleased
- Orange → welcoming
- Pineapple → laughing
- Pizza → pleased
- Hamburger → laughing
- Taco → pleased
- Chicken → welcoming
- Ice cream → laughing

## Next Steps

1. ✅ **Code updated** - Dynamic generation system implemented
2. ❌ **Create 9 missing object images** - Priority!
3. ⚪ **Test each card** - Verify composition and layout
4. ⚪ **Adjust positioning** - Fine-tune if needed
5. ⚪ **Add more backgrounds** - Optional variety
6. ⚪ **Create additional characters** - Future enhancement

## Resources

- **Current code:** `src/components/FlashCardsDialog.jsx`
- **Configuration:** `src/config/flash-cards/food.js`
- **Documentation:** `docs/FLASH-CARDS-DYNAMIC-GENERATION.md`
- **Image folders:** `public/images/flash-cards/`
