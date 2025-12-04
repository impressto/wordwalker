/**
 * Theme Shop Configuration
 * Defines theme metadata for the shop (names, costs, descriptions)
 * Separate from parallaxThemes.js which contains rendering configuration
 */

const themeShopConfig = {
  themes: [
    {
      id: 'default',
      name: 'Default Forest',
      description: 'Original forest landscape',
      cost: 0,
      thumbnail: 'scene.jpg', // Located at public/images/themes/default/scene.jpg
    },
    {
      id: 'hong-kong',
      name: 'Hong Kong Harbor',
      description: 'Urban harbor landscape',
      cost: 250,
      thumbnail: 'scene.jpg', // Located at public/images/themes/hong-kong/scene.jpg
    },
    {
      id: 'jamaica',
      name: 'Jamaica Beach',
      description: 'Tropical beach landscape',
      cost: 250,
      thumbnail: 'scene.jpg', // Located at public/images/themes/jamaica/scene.jpg
    },
    {
      id: 'dia-de-los-muertos',
      name: 'Día de los Muertos',
      description: 'Colorful Day of the Dead celebration',
      cost: 400,
      thumbnail: 'scene.jpg', // Located at public/images/themes/dia-de-los-muertos/scene.jpg
    },
    // Add more themes here following the same structure
    // {
    //   id: 'mountain',
    //   name: 'Mountain Peak',
    //   description: 'High altitude mountain landscape',
    //   cost: 175,
    //   thumbnail: 'scene.jpg',
    // },
  ],
};

/**
 * Get all themes for shop display
 * @returns {array} Array of theme shop items
 */
export const getShopThemes = () => {
  return themeShopConfig.themes;
};

/**
 * Get a specific theme shop config
 * @param {string} themeId - The theme identifier
 * @returns {object|null} Theme shop config or null if not found
 */
export const getShopTheme = (themeId) => {
  return themeShopConfig.themes.find(t => t.id === themeId) || null;
};

/**
 * Get cost of a theme
 * @param {string} themeId - The theme identifier
 * @returns {number} Theme cost in points
 */
export const getThemeCost = (themeId) => {
  const theme = getShopTheme(themeId);
  return theme ? theme.cost : 0;
};

export default themeShopConfig;
