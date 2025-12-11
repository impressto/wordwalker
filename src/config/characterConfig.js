/**
 * Character Configuration
 * Centralized configuration for all game characters
 * 
 * Each character follows the same sprite sheet format:
 * - Width: 1400px (6 frames × 233px each)
 * - Height: 600px (2 rows × 300px each)
 *   - Row 1: Walking animation (6 frames)
 *   - Row 2: Victory animation (6 frames)
 * 
 * Character properties:
 * - scale: Render size multiplier (1.0 = default, 0.8 = 20% smaller, 1.2 = 20% larger)
 * - yOffset: Vertical position adjustment in pixels (0 = default, negative = up, positive = down)
 */

const characterConfig = {
  // Array of all available characters
  characters: [
    {
      id: 'default',
      name: 'Walter',
      spriteFile: 'walker-default.png',
      avatarFile: 'walker-default-avatar.png',
      cost: 0,
      description: 'Your starting character',
      scale: 1.0, // Render scale multiplier (1.0 = default size)
      yOffset: 20, // Vertical position adjustment in pixels
    },
    {
      id: 'blue',
      name: 'Charlie',
      spriteFile: 'walker-blue.png',
      avatarFile: 'walker-blue-avatar.png',
      cost: 100,
      description: 'A speedy blue character',
      scale: 1.0,
      yOffset: 20,
    },
    {
      id: 'dog',
      name: 'Chewie',
      spriteFile: 'walker-dog.png',
      avatarFile: 'walker-dog-avatar.png',
      cost: 200,
      description: 'A loyal canine companion',
      scale: 0.8,
      yOffset: 30,
    },
    {
      id: 'cat',
      name: 'Tiger',
      spriteFile: 'walker-cat.png',
      avatarFile: 'walker-cat-avatar.png',
      cost: 200,
      description: 'An independent feline friend',
      scale: 1.0,
      yOffset: 20,
    },
    {
      id: 'emma',
      name: 'Emma',
      spriteFile: 'walker-emma.png',
      avatarFile: 'walker-emma-avatar.png',
      cost: 30,
      description: 'A charming character',
      scale: 1.4,
      yOffset: 0,
    },
    {
      id: 'asuka',
      name: 'Asuka',
      spriteFile: 'walker-asuka.png',
      avatarFile: 'walker-asuka-avatar.png',
      cost: 30,
      description: 'A spirited adventurer',
      scale: 1.4,
      yOffset: 0,
    },
    {
      id: 'elvis',
      name: 'Elvis',
      spriteFile: 'walker-elvis.png',
      avatarFile: 'walker-elvis-avatar.png',
      cost: 50,
      description: 'The King of Rock and Roll',
      scale: 1.7,
      yOffset: -10,
    },
    {
      id: 'steamboatwillie',
      name: 'Steamboat Willie',
      spriteFile: 'walker-steamboatwillie.png',
      avatarFile: 'walker-steamboatwillie-avatar.png',
      cost: 75,
      description: 'Classic 1928 cartoon character',
      scale: 1.3,
      yOffset: 5
    },
  ],

  // Sprite sheet configuration (same for all characters)
  spriteSheetConfig: {
    width: 1400,           // Total sprite sheet width
    height: 600,           // Total sprite sheet height
    rows: 2,               // 2 rows (walking, victory)
    cols: 6,               // 6 sprites per row
    frameWidth: 233.33,    // Each sprite is ~233px wide (1400 / 6 = 233.33)
    frameHeight: 300,      // 600 / 2 = 300px per frame
    walkingRow: 0,         // First row is walking animation
    victoryRow: 1,         // Second row is victory animation
    totalFrames: 6,        // 6 frames per animation
  },
};

/**
 * Get all characters for shop display
 * @returns {array} Array of all available characters
 */
export const getAllCharacters = () => {
  return characterConfig.characters;
};

/**
 * Get a specific character by ID
 * @param {string} characterId - The character ID
 * @returns {object|null} Character object or null if not found
 */
export const getCharacterById = (characterId) => {
  return characterConfig.characters.find(char => char.id === characterId) || null;
};

/**
 * Get character file mapping for sprite loading
 * @returns {object} Object mapping character IDs to sprite file names
 */
export const getCharacterFileMap = () => {
  const fileMap = {};
  characterConfig.characters.forEach(char => {
    fileMap[char.id] = char.spriteFile;
  });
  return fileMap;
};

/**
 * Get sprite sheet configuration
 * @returns {object} Sprite sheet configuration
 */
export const getSpriteSheetConfig = () => {
  return characterConfig.spriteSheetConfig;
};

export default characterConfig;
