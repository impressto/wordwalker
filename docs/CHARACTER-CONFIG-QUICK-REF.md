# Quick Reference: Adding Characters to WordWalker

## TL;DR - 3 Steps to Add a Character

### 1️⃣ Create Sprite Files
```
public/images/walkers/
├── walker-MYCHAR.png           (1400×600px sprite sheet)
└── walker-MYCHAR-avatar.png    (shop thumbnail)
```

**Sprite Sheet Format:**
- 1400 × 600 pixels
- 2 rows × 6 columns
- Row 1: Walking (6 frames)
- Row 2: Victory (6 frames)

### 2️⃣ Update Config
Edit `src/config/characterConfig.js`:

```javascript
{
  id: 'MYCHAR',
  name: 'My Character',
  spriteFile: 'walker-MYCHAR.png',
  avatarFile: 'walker-MYCHAR-avatar.png',
  cost: 100,  // 0 = free starter character
  description: 'Brief description here',
}
```

### 3️⃣ Build & Deploy
```bash
npm run build
./deploy.sh
```

---

## Current Characters

| ID | Name | Cost | File |
|----|------|------|------|
| default | Walter | 0 | walker-default.png |
| blue | Charlie | 50 | walker-blue.png |
| dog | Chewie | 75 | walker-dog.png |
| cat | Tiger | 60 | walker-cat.png |
| emma | Emma | 80 | walker-emma.png |
| asuka | Asuka | 85 | walker-asuka.png |

## Testing Locally

```bash
npm run build    # Build production version
npm run dev      # Start dev server (http://localhost:3000)
```

Then click the Points display → Character Shop opens → Test your new character!

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Character doesn't appear in shop | Verify `id` matches exactly, rebuild with `npm run build` |
| White box instead of sprite | Check sprite file path is correct, image dimensions are 1400×600 |
| Can't select character | Ensure it's either owned or has `cost: 0` |
| Service worker not caching | Run `./deploy.sh` to update service-worker.js |

## File Locations

- **Character Config:** `src/config/characterConfig.js`
- **Component:** `src/components/CharacterShop.jsx`
- **Hook:** `src/hooks/useCharacterAndTheme.js`
- **Animation:** `src/components/PathCanvas.jsx`
- **Sprites:** `public/images/walkers/`

## Config Properties Explained

```javascript
{
  id: 'unique-id',              // Must be lowercase, no spaces. Used internally.
  name: 'Display Name',         // Shows in shop UI
  spriteFile: 'walker-*.png',   // Full sprite sheet (1400×600px)
  avatarFile: 'walker-*-avatar.png',  // Icon shown in shop list
  cost: 50,                     // Points cost. 0 = free/starter character
  description: 'Shop text',     // Flavor text shown to player
}
```

---

**Questions?** See `docs/CHARACTER-CONFIG-REFACTORING.md` for full documentation.
