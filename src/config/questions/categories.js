/**
 * Category definitions for path choices
 */
export const categories = {
  food: {
    id: 'food',
    name: 'Food',
    displayName: 'Comida',
    emoji: '🍎',
    description: 'Learn food and drink vocabulary',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    displayName: 'Compras',
    emoji: '🛍️',
    description: 'Learn shopping and clothing vocabulary',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    displayName: 'Entretenimiento',
    emoji: '🎮',
    description: 'Learn entertainment and hobby vocabulary',
  },
  accommodation: {
    id: 'accommodation',
    name: 'Accommodation',
    displayName: 'Alojamiento',
    emoji: '🏨',
    description: 'Learn accommodation and lodging vocabulary',
  },
  transportation: {
    id: 'transportation',
    name: 'Transportation',
    displayName: 'Transporte',
    emoji: '🚕',
    description: 'Learn transportation and travel vocabulary',
  },
  directions: {
    id: 'directions',
    name: 'Directions',
    displayName: 'Direcciones',
    emoji: '🗺️',
    description: 'Learn directions and navigation vocabulary',
  },
  emergencies: {
    id: 'emergencies',
    name: 'Emergencies',
    displayName: 'Emergencias',
    emoji: '🚑',
    description: 'Learn emergency and health vocabulary',
  },
  greetings: {
    id: 'greetings',
    name: 'Greetings & Conversations',
    displayName: 'Saludos y Conversaciones',
    emoji: '👋',
    description: 'Learn greetings, farewells, and common conversation phrases',
  },
  numbers: {
    id: 'numbers',
    name: 'Numbers, Colors & Time',
    displayName: 'Números, Colores y Hora',
    emoji: '🔢',
    description: 'Learn numbers, colors, dates, times, and calendar vocabulary',
  },
  grammar: {
    id: 'grammar',
    name: 'Grammar',
    displayName: 'Gramática',
    emoji: '📝',
    description: 'Learn Spanish grammar, verb conjugations, and sentence structure',
  },
  beach: {
    id: 'beach',
    name: 'Beach & Activities',
    displayName: 'Playa y Actividades',
    emoji: '🏖️',
    description: 'Learn beach and outdoor activity vocabulary',
  },
  animals: {
    id: 'animals',
    name: 'Animals',
    displayName: 'Animales',
    emoji: '🦁',
    description: 'Learn animal names and characteristics',
  },
  people: {
    id: 'people',
    name: 'People & Relationships',
    displayName: 'Gente y Relaciones',
    emoji: '👨‍👩‍👧‍👦',
    description: 'Learn family, professions, and describing people',
  },
  daily_routines: {
    id: 'daily_routines',
    name: 'Daily Routines',
    displayName: 'Rutinas Diarias',
    emoji: '🌅',
    description: 'Learn daily activities and reflexive verbs',
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant & Dining',
    displayName: 'Restaurante y Comida',
    emoji: '🍽️',
    description: 'Learn restaurant vocabulary, ordering, and dining phrases',
  },
  weather: {
    id: 'weather',
    name: 'Weather & Environment',
    displayName: 'Clima y Medio Ambiente',
    emoji: '🌤️',
    description: 'Learn weather, climate, and environmental vocabulary',
  },
};

/**
 * Get all available category IDs
 * @returns {Array} Array of category IDs
 */
export const getAllCategoryIds = () => {
  return Object.keys(categories);
};

/**
 * Get category by ID
 * @param {string} id - The category ID
 * @returns {Object|null} The category object or null
 */
export const getCategoryById = (id) => {
  return categories[id] || null;
};
