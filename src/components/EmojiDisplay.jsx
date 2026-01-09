import React, { useState } from 'react';
import { isEmojiSvg, getEmojiSvgPath } from '../utils/emojiUtils.jsx';

/**
 * EmojiDisplay component - Renders either a regular emoji or an SVG/PNG image
 * @param {Object} props
 * @param {string} props.emoji - The emoji string (regular emoji or .svg/.png filename)
 * @param {string} props.category - The category for SVG/PNG path resolution (e.g., 'food')
 * @param {string} props.size - The size in pixels (default: '60px')
 * @param {Object} props.style - Additional inline styles
 * @param {string} props.className - Additional CSS class names
 */
export default function EmojiDisplay({ emoji, category, size = '60px', style = {}, className = '' }) {
  const [imageError, setImageError] = useState(false);
  
  if (!emoji) {
    return <span style={{ fontSize: size, ...style }} className={className}>❓</span>;
  }

  // Check if this is an SVG/PNG file
  if (isEmojiSvg(emoji)) {
    const svgPath = getEmojiSvgPath(emoji, category);
    
    // If image failed to load, show fallback emoji
    if (imageError) {
      return <span style={{ fontSize: size, ...style }} className={className}>❓</span>;
    }
    
    // PNG images (150x150px) need to be rendered larger to match text emoji size
    // Apply 1.4x scale for PNG images to appear similar to regular emojis
    const isPng = emoji.endsWith('.png');
    const numericSize = parseFloat(size);
    const scaledSize = isPng ? numericSize * 1.4 : numericSize;
    const displaySize = `${scaledSize}px`;
    
    return (
      <img
        src={svgPath}
        alt={emoji}
        style={{
          width: displaySize,
          height: displaySize,
          objectFit: 'contain',
          ...style
        }}
        className={className}
        onError={() => {
          console.error(`Failed to load image emoji: ${svgPath}`);
          setImageError(true);
        }}
      />
    );
  }

  // Regular emoji - render as text
  return (
    <span style={{ fontSize: size, ...style }} className={className}>
      {emoji}
    </span>
  );
}
