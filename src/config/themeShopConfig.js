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
      enabled: true,
    },
    {
      id: 'hong-kong',
      name: 'Hong Kong Harbor',
      description: 'Urban harbor landscape',
      cost: 200,
      thumbnail: 'scene.jpg', // Located at public/images/themes/hong-kong/scene.jpg
      enabled: true,
    },
    {
      id: 'jamaica',
      name: 'Jamaica Beach',
      description: 'Tropical beach landscape',
      cost: 40,
      thumbnail: 'scene.jpg', // Located at public/images/themes/jamaica/scene.jpg
      enabled: true,
    },
    {
      id: 'dia-de-los-muertos',
      name: 'Día de los Muertos',
      description: 'Day of the Dead celebration',
      cost: 600,
      thumbnail: 'scene.jpg', // Located at public/images/themes/dia-de-los-muertos/scene.jpg
      enabled: true,
    },
    {
      id: 'paris',
      name: 'Paris',
      description: 'Iconic Parisian cityscape',
      cost: 800,
      thumbnail: 'scene.jpg', // Located at public/images/themes/paris/scene.jpg
      enabled: true,
    },
    {
      id: 'nassau',
      name: 'Nassau Nights',
      description: 'Pirates bury treasure at night',
      cost: 1000,
      thumbnail: 'scene.jpg', // Located at public/images/themes/nassau/scene.jpg
      enabled: true,
    },
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
