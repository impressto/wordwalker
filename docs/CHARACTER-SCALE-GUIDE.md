# Character Scale and Position Configuration Guide

## Overview
Each character can now have individual render scale and Y-position adjustments to control their displayed size and vertical positioning in the game. This is useful for:
- Adjusting characters that appear too large or too small
- Fine-tuning vertical positioning when changing scale factors
- Ensuring all characters are properly aligned on the path

## Configuration

The `scale` and `yOffset` properties are defined in `src/config/characterConfig.js` for each character:

```javascript
{
  id: 'default',
  name: 'Walter',
  spriteFile: 'walker-default.png',
  avatarFile: 'walker-default-avatar.png',
  cost: 0,
  description: 'Your starting character',
  scale: 1.0,   // Render scale multiplier
  yOffset: 0,   // Vertical position adjustment in pixels
}
```

## Scale Values

- **1.0** - Default size (100%)
- **0.8** - 20% smaller
- **0.9** - 10% smaller
- **1.1** - 10% larger
- **1.2** - 20% larger

## Y-Offset Values

- **0** - Default position (centered on path)
- **Negative values** - Move character UP (e.g., -10 moves 10 pixels up)
- **Positive values** - Move character DOWN (e.g., 10 moves 10 pixels down)

Typical range: -20 to +20 pixels

## Examples

### Make a character smaller and adjust position
```javascript
{
  id: 'cat',
  name: 'Tiger',
  scale: 0.85,   // 15% smaller
  yOffset: -5,   // Move up 5 pixels to compensate
}
```

### Make a character larger and adjust position
```javascript
{
  id: 'dog',
  name: 'Chewie',
  scale: 1.3,    // 30% larger
  yOffset: 8,    // Move down 8 pixels to keep feet on path
}
```

### Just adjust position without changing scale
```javascript
{
  id: 'emma',
  name: 'Emma',
  scale: 1.0,    // Normal size
  yOffset: -3,   // Slightly higher on the path
}
```

## Implementation Details

- Both scale and yOffset are applied to the rendered sprite
- The scale is applied to both width and height proportionally
- The yOffset is added after all other positioning calculations (including bounce effects)
- Victory animation bounce and other effects work correctly with all scale and offset values
- Default scale is 1.0 and default yOffset is 0 if not specified
- The base render width is 80px (before scaling)
- Positive yOffset moves the character DOWN, negative values move UP

## Common Adjustments

When increasing scale, you may need to adjust yOffset:
- **scale: 1.2-1.3** - Consider yOffset: +5 to +10 (move down)
- **scale: 1.4+** - Consider yOffset: +10 to +15 (move down more)

When decreasing scale, you may need to adjust yOffset:
- **scale: 0.7-0.8** - Consider yOffset: -5 to -8 (move up)
- **scale: 0.5-0.6** - Consider yOffset: -8 to -12 (move up more)

## Testing

After changing scale or yOffset values:
1. Select the character in the Character Shop
2. Start or resume a game
3. Verify the walker appears at the expected size and position
4. Check that the character is properly aligned on the path
5. Verify animations (walking, victory) work smoothly
6. Test the victory animation to ensure bounce effect looks natural
7. Test with different characters to ensure consistency
