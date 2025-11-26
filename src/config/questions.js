/**
 * WordWalk Learning Questions Configuration
 * 
 * Structure for each question:
 * {
 *   id: unique identifier
 *   emoji: unicode emoji character
 *   question: the question text to display
 *   options: array of 3-4 possible answers
 *   correctAnswer: the correct answer (must match one option exactly)
 *   points: points awarded for correct answer on first attempt
 *   category: topic category (food, shopping, entertainment, etc.)
 *   difficulty: easy, medium, hard
 * }
 */

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

export const questions = [
  // FOOD CATEGORY
  {
    id: 'food_001',
    emoji: '🍉',
    question: '¿Qué es esto?',
    options: ['manzana', 'sandía', 'naranja'],
    correctAnswer: 'sandía',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_002',
    emoji: '🍌',
    question: '¿Qué es esto?',
    options: ['plátano', 'limón', 'pera', 'mango'],
    correctAnswer: 'plátano',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_003',
    emoji: '🍎',
    question: '¿Qué fruta es esta?',
    options: ['naranja', 'manzana', 'cereza'],
    correctAnswer: 'manzana',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_004',
    emoji: '🍕',
    question: '¿Qué comida es esta?',
    options: ['hamburguesa', 'pizza', 'taco', 'pasta'],
    correctAnswer: 'pizza',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_005',
    emoji: '🍞',
    question: '¿Qué es esto?',
    options: ['pan', 'queso', 'mantequilla'],
    correctAnswer: 'pan',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },

  // SHOPPING CATEGORY
  {
    id: 'shopping_001',
    emoji: '👕',
    question: '¿Qué prenda es esta?',
    options: ['pantalón', 'camisa', 'zapato', 'sombrero'],
    correctAnswer: 'camisa',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
  },
  {
    id: 'shopping_002',
    emoji: '👟',
    question: '¿Qué es esto?',
    options: ['zapato', 'calcetín', 'guante'],
    correctAnswer: 'zapato',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
  },
  {
    id: 'shopping_003',
    emoji: '👜',
    question: '¿Qué es esto?',
    options: ['bolsa', 'reloj', 'cinturón', 'collar'],
    correctAnswer: 'bolsa',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
  },
  {
    id: 'shopping_004',
    emoji: '🕶️',
    question: '¿Qué son estos?',
    options: ['gafas de sol', 'anteojos', 'lentes', 'espejo'],
    correctAnswer: 'gafas de sol',
    points: 10,
    category: 'shopping',
    difficulty: 'medium',
  },

  // ENTERTAINMENT CATEGORY
  {
    id: 'entertainment_001',
    emoji: '🎬',
    question: '¿Qué es esto?',
    options: ['cine', 'teatro', 'televisión'],
    correctAnswer: 'cine',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },
  {
    id: 'entertainment_002',
    emoji: '🎮',
    question: '¿Qué es esto?',
    options: ['videojuego', 'teléfono', 'computadora', 'control remoto'],
    correctAnswer: 'videojuego',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },
  {
    id: 'entertainment_003',
    emoji: '🎸',
    question: '¿Qué instrumento es este?',
    options: ['guitarra', 'piano', 'violín'],
    correctAnswer: 'guitarra',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },
  {
    id: 'entertainment_004',
    emoji: '⚽',
    question: '¿Qué deporte es este?',
    options: ['baloncesto', 'fútbol', 'tenis', 'béisbol'],
    correctAnswer: 'fútbol',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },

  // Add more questions here as needed...
];

/**
 * Helper function to get questions by category
 * @param {string} category - The category to filter by
 * @returns {Array} Array of questions in that category
 */
export const getQuestionsByCategory = (category) => {
  return questions.filter(q => q.category === category);
};

/**
 * Helper function to get questions by difficulty
 * @param {string} difficulty - The difficulty level (easy, medium, hard)
 * @returns {Array} Array of questions at that difficulty
 */
export const getQuestionsByDifficulty = (difficulty) => {
  return questions.filter(q => q.difficulty === difficulty);
};

/**
 * Helper function to get a random question from a category
 * @param {string} category - The category to pick from
 * @returns {Object} A random question object
 */
export const getRandomQuestionByCategory = (category) => {
  const categoryQuestions = getQuestionsByCategory(category);
  if (categoryQuestions.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
  return categoryQuestions[randomIndex];
};

/**
 * Helper function to get a question by ID
 * @param {string} id - The question ID
 * @returns {Object|null} The question object or null if not found
 */
export const getQuestionById = (id) => {
  return questions.find(q => q.id === id) || null;
};

/**
 * Helper function to shuffle answer options
 * @param {Array} options - The array of answer options
 * @returns {Array} Shuffled array of options
 */
export const shuffleOptions = (options) => {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
