/**
 * Utility for rendering emojis, including SVG and PNG image support
 */

/**
 * Get the path to the emoji image if it's an image file (SVG or PNG)
 * @param {string} emoji - The emoji string (could be a regular emoji or filename like "vino blanco.svg" or "salsa.png")
 * @param {string} category - The category of the question (e.g., 'food', 'shopping')
 * @returns {string|null} - The path to the image file or null if not an image
 */
export function getEmojiSvgPath(emoji, category) {
  if (!emoji || typeof emoji !== 'string') return null;
  
  if (emoji.endsWith('.svg') || emoji.endsWith('.png')) {
    // Get base path for assets (handles subdirectory deployments)
    const basePath = import.meta.env.BASE_URL || '/';
    // URL encode the filename to handle spaces and special characters
    const encodedEmoji = encodeURIComponent(emoji);
    return `${basePath}images/objects/${category}/${encodedEmoji}`;
  }
  
  return null;
}

/**
 * Get the path to a category icon image
 * @param {string} emoji - The emoji string (could be a regular emoji or filename like "food.png")
 * @returns {string|null} - The path to the category image file or null if not an image
 */
export function getCategoryIconPath(emoji) {
  if (!emoji || typeof emoji !== 'string') return null;
  
  if (emoji.endsWith('.svg') || emoji.endsWith('.png')) {
    // Get base path for assets (handles subdirectory deployments)
    const basePath = import.meta.env.BASE_URL || '/';
    // URL encode the filename to handle spaces and special characters
    const encodedEmoji = encodeURIComponent(emoji);
    return `${basePath}images/categories/${encodedEmoji}`;
  }
  
  return null;
}

/**
 * Check if an emoji string is an image file (SVG or PNG)
 * @param {string} emoji - The emoji string
 * @returns {boolean} - True if the emoji is an image file
 */
export function isEmojiSvg(emoji) {
  return emoji && typeof emoji === 'string' && (emoji.endsWith('.svg') || emoji.endsWith('.png'));
}
