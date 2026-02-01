/**
 * Canvas Drawing Utilities
 * Helper functions for drawing on the canvas
 */

import { getTheme } from '../config/parallaxThemes';
import gameSettings from '../config/gameSettings';

/**
 * Draw a diamond shape with gradient
 */
export const drawDiamond = (ctx, x, y, size, primaryColor, gradientColor, glowIntensity = 0) => {
  ctx.save();
  
  // Apply glow effect if intensity > 0
  if (glowIntensity > 0) {
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 15 * glowIntensity;
  }
  
  // Create gradient from top to bottom
  const gradient = ctx.createLinearGradient(x, y - size/2, x, y + size/2);
  gradient.addColorStop(0, primaryColor);
  gradient.addColorStop(1, gradientColor);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x, y - size/2); // Top
  ctx.lineTo(x + size/2, y); // Right
  ctx.lineTo(x, y + size/2); // Bottom
  ctx.lineTo(x - size/2, y); // Left
  ctx.closePath();
  ctx.fill();
  
  // Add highlight
  ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + glowIntensity * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(x, y - size/2);
  ctx.lineTo(x + size/4, y - size/4);
  ctx.lineTo(x, y);
  ctx.lineTo(x - size/4, y - size/4);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
};

/**
 * Get layer Y position with theme offset
 */
export const getLayerY = (baseY, layerId, theme) => {
  return baseY + (theme.layerPositions[layerId] || 0);
};

/**
 * Get layer speed from theme
 */
export const getLayerSpeed = (layerId, theme) => {
  return theme.layerSpeeds[layerId] || gameSettings.parallax.layerSpeeds[layerId];
};

/**
 * Draw a tiled parallax layer
 */
export const drawTiledLayer = (ctx, image, offset, speed, y, width) => {
  if (!image) return;
  
  const layerWidth = image.width;
  const layerHeight = image.height;
  
  // Calculate scroll offset with parallax effect
  const scrollOffset = (offset * speed) % layerWidth;
  
  // Calculate how many tiles needed to cover the width
  const tilesNeeded = Math.ceil(width / layerWidth) + 2;
  
  // Draw tiles horizontally
  for (let i = -1; i < tilesNeeded; i++) {
    const x = i * layerWidth - scrollOffset;
    ctx.drawImage(image, x, y, layerWidth, layerHeight);
  }
};

/**
 * Draw checkpoint emoji with fade-in effect
 */
export const drawCheckpointEmoji = (
  ctx,
  emoji,
  x,
  y,
  size,
  opacity,
  emojiImageCache,
  isEmojiSvg,
  getEmojiSvgPath
) => {
  ctx.save();
  ctx.globalAlpha = opacity;
  
  // Check if this is an SVG emoji
  if (isEmojiSvg(emoji)) {
    const svgPath = getEmojiSvgPath(emoji);
    
    // Check cache for this emoji
    if (emojiImageCache.current[svgPath]) {
      const img = emojiImageCache.current[svgPath];
      ctx.drawImage(img, x - size/2, y - size/2, size, size);
    } else {
      // Load the SVG image and cache it
      const img = new Image();
      img.src = svgPath;
      img.onload = () => {
        emojiImageCache.current[svgPath] = img;
      };
      
      // Fall back to text emoji while loading
      ctx.font = `${size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, x, y);
    }
  } else {
    // Draw text emoji
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, y);
  }
  
  ctx.restore();
};

/**
 * Calculate checkpoint fade-in opacity
 */
export const calculateCheckpointFadeOpacity = (fadeStartTime, currentTime, fadeDuration = 500) => {
  if (!fadeStartTime) return 0;
  const elapsed = currentTime - fadeStartTime;
  return Math.min(elapsed / fadeDuration, 1);
};

/**
 * Draw path tiles (regular or fork)
 */
export const drawPathTiles = (ctx, pathImage, pathForkImage, offset, horizonY, width, forkPosition) => {
  if (!pathImage) return;
  
  const pathWidth = pathImage.width;
  const pathHeight = pathImage.height;
  
  // Path scrolls with camera
  const pathScrollOffset = offset % pathWidth;
  
  // Calculate how many tiles needed
  const pathTilesNeeded = Math.ceil(width / pathWidth) + 2;
  
  // Y position for path
  const pathY = horizonY - pathHeight * 0.5;
  
  for (let i = -1; i < pathTilesNeeded; i++) {
    const tileX = i * pathWidth - pathScrollOffset;
    const tileWorldX = offset + tileX;
    
    // Check if this tile should be the fork
    const isForkTile = pathForkImage && 
      tileWorldX <= forkPosition && 
      tileWorldX + pathWidth > forkPosition;
    
    if (isForkTile) {
      ctx.drawImage(pathForkImage, tileX, pathY, pathForkImage.width, pathForkImage.height);
    } else {
      ctx.drawImage(pathImage, tileX, pathY, pathWidth, pathHeight);
    }
  }
};

export default {
  drawDiamond,
  getLayerY,
  getLayerSpeed,
  drawTiledLayer,
  drawCheckpointEmoji,
  calculateCheckpointFadeOpacity,
  drawPathTiles,
};
