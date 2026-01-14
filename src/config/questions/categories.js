import { businessQuestions } from "./business";

/**
 * Category definitions for path choices
 */
export const categories = {
  food: {
    id: "food",
    name: "Food and Dining",
    displayName: "Comida y Restaurantes",
    emoji: "food.png",
    description: "Learn food, dining, and restaurant vocabulary",
  },

  transportation: {
    id: "transportation",
    name: "Transportation",
    displayName: "Transporte",
    emoji: "transportation.png",
    description: "Learn transportation and travel vocabulary",
  },

  recreation: {
    id: "recreation",
    name: "Recreation",
    displayName: "Recreación",
    emoji: "recreation.png",
    description: "Learn leisure, beach, and outdoor activity vocabulary",
  },

  accommodation: {
    id: "accommodation",
    name: "Accommodation",
    displayName: "Alojamiento",
    emoji: "accommodation.png",
    description: "Learn accommodation and lodging vocabulary",
  },

  shopping: {
    id: "shopping",
    name: "Shopping",
    displayName: "Compras",
    emoji: "shopping.png",
    description: "Learn shopping and clothing vocabulary",
  },

  people: {
    id: "people",
    name: "People & Relationships",
    displayName: "Gente y Relaciones",
    emoji: "people.png",
    description: "Learn family, professions, and describing people",
  },

  daily_routines: {
    id: "daily_routines",
    name: "Daily Routines",
    displayName: "Rutinas Diarias",
    emoji: "daily_routines.png",
    description: "Learn daily activities and reflexive verbs",
  },

  grammar: {
    id: "grammar",
    name: "Grammar",
    displayName: "Gramática",
    emoji: "grammar.png",
    description:
      "Learn Spanish grammar, verb conjugations, and sentence structure",
  },

  plants_animals: {
    id: "plants_animals",
    name: "Plants and  Animals",
    displayName: "Plantas y Animales",
    emoji: "plants_animals.png",
    description: "Learn plant and animal names and characteristics",
  },

  environment: {
    id: "environment",
    name: "Weather & Environment",
    displayName: "Clima y Medio Ambiente",
    emoji: "environment.png",
    description: "Learn weather, climate, and environmental vocabulary",
  },

  business: {
    id: "business",
    name: "Work and Business",
    displayName: "Negocios y Trabajo",
    emoji: "business.png",
    description: "Learn business, work, and office vocabulary",
  },

  medical: {
    id: "medical",
    name: "Medical & Emergencies",
    displayName: "Médico y Emergencias",
    emoji: "medical.png",
    description: "Learn medical and emergency vocabulary",
  },

  entertainment: {
    id: "entertainment",
    name: "Entertainment",
    displayName: "Entretenimiento",
    emoji: "entertainment.png",
    description: "Learn entertainment and hobby vocabulary",
  },

  numbers: {
    id: "numbers",
    name: "Numbers, Dates & Time",
    displayName: "Números, Fechas y Hora",
    emoji: "numbers.png",
    description: "Learn numbers, dates, times, and calendar vocabulary",
  },

  greetings: {
    id: "greetings",
    name: "Greetings & Conversations",
    displayName: "Saludos y Conversaciones",
    emoji: "greetings.png",
    description: "Learn greetings, farewells, and common conversation phrases",
  },

  directions: {
    id: "directions",
    name: "Places and Directions",
    displayName: "Lugares y Direcciones",
    emoji: "directions.png",
    description: "Learn sightseeing & landmarks vocabulary",
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
