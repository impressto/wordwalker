import React from 'react';
import { isEmojiSvg, getEmojiSvgPath } from '../utils/emojiUtils.jsx';

/**
 * EmojiDisplay component - Renders either a regular emoji or an SVG image
 * @param {Object} props
 * @param {string} props.emoji - The emoji string (regular emoji or .svg filename)
 * @param {string} props.category - The category for SVG path resolution (e.g., 'food')
 * @param {string} props.size - The size in pixels (default: '60px')
 * @param {Object} props.style - Additional inline styles
 * @param {string} props.className - Additional CSS class names
 */
export default function EmojiDisplay({ emoji, category, size = '60px', style = {}, className = '' }) {
  if (!emoji) {
    return <span style={{ fontSize: size, ...style }} className={className}>❓</span>;
  }

  // Check if this is an SVG file
  if (isEmojiSvg(emoji)) {
    const svgPath = getEmojiSvgPath(emoji, category);
    
    return (
      <img
        src={svgPath}
        alt={emoji}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          ...style
        }}
        className={className}
        onError={(e) => {
          console.error(`Failed to load SVG emoji: ${svgPath}`);
          // Fallback to question mark emoji if image fails to load
          e.target.style.display = 'none';
          e.target.parentElement.insertAdjacentHTML('afterbegin', '<span style="font-size: ' + size + '">❓</span>');
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
