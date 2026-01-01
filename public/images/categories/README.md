# Category Icons

This folder contains PNG icons for each category displayed in the path choice dialog.

## Required Images

The following PNG files should be placed in this directory:

1. ✅ `food.png` - Food category icon
2. ⚠️  `shopping.png` - Shopping category icon
3. ⚠️  `entertainment.png` - Entertainment category icon
4. ⚠️  `accommodation.png` - Accommodation category icon
5. ⚠️  `transportation.png` - Transportation category icon
6. ⚠️  `directions.png` - Directions category icon
7. ⚠️  `emergencies.png` - Medical & Emergencies category icon
8. ⚠️  `greetings.png` - Greetings & Conversations category icon
9. ⚠️  `numbers.png` - Numbers, Colors & Time category icon
10. ⚠️  `grammar.png` - Grammar category icon
11. ⚠️  `recreation.png` - Recreation category icon
12. ⚠️  `plants_animals.png` - Plants & Animals category icon
13. ⚠️  `people.png` - People & Relationships category icon
14. ⚠️  `routines.png` - Daily Routines category icon
15. ⚠️  `dining.png` - Restaurant & Dining category icon
16. ⚠️  `environment.png` - Weather & Environment category icon

## Image Specifications

- **Format**: PNG with transparency
- **Recommended Size**: 128x128 pixels or larger (will be displayed at 48x48px)
- **Style**: Should be clear, simple icons that represent each category
- **Color**: Can be colorful or monochrome - will display at full opacity

## Notes

- Images are loaded from `public/images/categories/{filename}`
- Fallback: If image is not found, the system will try to display the filename as text
- The images will be scaled to 48x48 pixels in the UI with object-fit: contain
