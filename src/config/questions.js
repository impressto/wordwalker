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
  accommodation: {
    id: 'accommodation',
    name: 'Accommodation',
    displayName: 'Alojamiento',
    emoji: '🏨',
    description: 'Learn accommodation and lodging vocabulary',
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
  {
    id: 'food_006',
    emoji: '🥗',
    question: '¿Qué es esto?',
    options: ['ensalada', 'sopa', 'postre', 'carne'],
    correctAnswer: 'ensalada',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_007',
    emoji: '🍗',
    question: '¿Qué es esto?',
    options: ['pollo', 'pescado', 'cerdo'],
    correctAnswer: 'pollo',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_008',
    emoji: '🥛',
    question: '¿Qué bebida es esta?',
    options: ['leche', 'agua', 'jugo', 'café'],
    correctAnswer: 'leche',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_009',
    emoji: '☕',
    question: '¿Qué bebida es esta?',
    options: ['té', 'café', 'chocolate'],
    correctAnswer: 'café',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_010',
    emoji: '🍰',
    question: '¿Qué es esto?',
    options: ['pastel', 'galleta', 'helado', 'caramelo'],
    correctAnswer: 'pastel',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_011',
    emoji: '🥕',
    question: '¿Qué verdura es esta?',
    options: ['zanahoria', 'papa', 'cebolla'],
    correctAnswer: 'zanahoria',
    points: 10,
    category: 'food',
    difficulty: 'medium',
  },
  {
    id: 'food_012',
    emoji: '🍅',
    question: '¿Qué es esto?',
    options: ['tomate', 'fresa', 'manzana', 'cereza'],
    correctAnswer: 'tomate',
    points: 10,
    category: 'food',
    difficulty: 'medium',
  },
  {
    id: 'food_013',
    emoji: '🧀',
    question: '¿Qué es esto?',
    options: ['queso', 'mantequilla', 'pan', 'leche'],
    correctAnswer: 'queso',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_014',
    emoji: '🍇',
    question: '¿Qué fruta es esta?',
    options: ['uvas', 'cerezas', 'fresas'],
    correctAnswer: 'uvas',
    points: 10,
    category: 'food',
    difficulty: 'medium',
  },
  {
    id: 'food_015',
    emoji: '🥚',
    question: '¿Qué es esto?',
    options: ['huevo', 'queso', 'papa', 'pan'],
    correctAnswer: 'huevo',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_016',
    emoji: '🍓',
    question: '¿Qué fruta es esta?',
    options: ['fresa', 'cereza', 'frambuesa'],
    correctAnswer: 'fresa',
    points: 10,
    category: 'food',
    difficulty: 'medium',
  },
  {
    id: 'food_017',
    emoji: '🥖',
    question: '¿Qué tipo de pan es este?',
    options: ['baguette', 'pan dulce', 'tortilla', 'pan integral'],
    correctAnswer: 'baguette',
    points: 10,
    category: 'food',
    difficulty: 'medium',
  },
  {
    id: 'food_018',
    emoji: '🍜',
    question: '¿Qué es esto?',
    options: ['sopa', 'ensalada', 'arroz'],
    correctAnswer: 'sopa',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_019',
    emoji: '🥩',
    question: '¿Qué es esto?',
    options: ['carne', 'pollo', 'pescado', 'jamón'],
    correctAnswer: 'carne',
    points: 10,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'food_020',
    emoji: '🍊',
    question: '¿Qué fruta es esta?',
    options: ['naranja', 'mandarina', 'limón'],
    correctAnswer: 'naranja',
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
  {
    id: 'shopping_005',
    emoji: '👖',
    question: '¿Qué prenda es esta?',
    options: ['pantalón', 'camisa', 'falda', 'chaqueta'],
    correctAnswer: 'pantalón',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
  },
  {
    id: 'shopping_006',
    emoji: '🧥',
    question: '¿Qué prenda es esta?',
    options: ['chaqueta', 'suéter', 'abrigo'],
    correctAnswer: 'chaqueta',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
  },
  {
    id: 'shopping_007',
    emoji: '👗',
    question: '¿Qué prenda es esta?',
    options: ['vestido', 'falda', 'blusa', 'camisa'],
    correctAnswer: 'vestido',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
  },
  {
    id: 'shopping_008',
    emoji: '🎩',
    question: '¿Qué es esto?',
    options: ['sombrero', 'gorra', 'bufanda'],
    correctAnswer: 'sombrero',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
  },
  {
    id: 'shopping_009',
    emoji: '🧤',
    question: '¿Qué son estos?',
    options: ['guantes', 'calcetines', 'zapatos', 'mitones'],
    correctAnswer: 'guantes',
    points: 10,
    category: 'shopping',
    difficulty: 'medium',
  },
  {
    id: 'shopping_010',
    emoji: '🧣',
    question: '¿Qué es esto?',
    options: ['bufanda', 'cinturón', 'corbata'],
    correctAnswer: 'bufanda',
    points: 10,
    category: 'shopping',
    difficulty: 'medium',
  },
  {
    id: 'shopping_011',
    emoji: '👔',
    question: '¿Qué es esto?',
    options: ['corbata', 'bufanda', 'cinturón', 'pañuelo'],
    correctAnswer: 'corbata',
    points: 10,
    category: 'shopping',
    difficulty: 'medium',
  },
  {
    id: 'shopping_012',
    emoji: '👞',
    question: '¿Qué tipo de zapato es este?',
    options: ['zapato formal', 'tenis', 'sandalia'],
    correctAnswer: 'zapato formal',
    points: 10,
    category: 'shopping',
    difficulty: 'medium',
  },
  {
    id: 'shopping_013',
    emoji: '🩴',
    question: '¿Qué son estos?',
    options: ['sandalias', 'zapatos', 'botas', 'tenis'],
    correctAnswer: 'sandalias',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
  },
  {
    id: 'shopping_014',
    emoji: '👘',
    question: '¿Qué tipo de ropa es esta?',
    options: ['kimono', 'vestido', 'bata'],
    correctAnswer: 'kimono',
    points: 10,
    category: 'shopping',
    difficulty: 'hard',
  },
  {
    id: 'shopping_015',
    emoji: '🎒',
    question: '¿Qué es esto?',
    options: ['mochila', 'bolsa', 'maleta', 'cartera'],
    correctAnswer: 'mochila',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
  },
  {
    id: 'shopping_016',
    emoji: '⌚',
    question: '¿Qué es esto?',
    options: ['reloj', 'pulsera', 'anillo'],
    correctAnswer: 'reloj',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
  },
  {
    id: 'shopping_017',
    emoji: '💍',
    question: '¿Qué es esto?',
    options: ['anillo', 'collar', 'pulsera', 'aretes'],
    correctAnswer: 'anillo',
    points: 10,
    category: 'shopping',
    difficulty: 'medium',
  },
  {
    id: 'shopping_018',
    emoji: '🧢',
    question: '¿Qué es esto?',
    options: ['gorra', 'sombrero', 'boina'],
    correctAnswer: 'gorra',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
  },
  {
    id: 'shopping_019',
    emoji: '👚',
    question: '¿Qué prenda es esta?',
    options: ['blusa', 'camisa', 'vestido', 'camiseta'],
    correctAnswer: 'blusa',
    points: 10,
    category: 'shopping',
    difficulty: 'medium',
  },
  {
    id: 'shopping_020',
    emoji: '🥾',
    question: '¿Qué tipo de calzado es este?',
    options: ['botas', 'zapatos', 'sandalias', 'tenis'],
    correctAnswer: 'botas',
    points: 10,
    category: 'shopping',
    difficulty: 'easy',
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
  {
    id: 'entertainment_005',
    emoji: '🏀',
    question: '¿Qué deporte es este?',
    options: ['baloncesto', 'fútbol', 'voleibol'],
    correctAnswer: 'baloncesto',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },
  {
    id: 'entertainment_006',
    emoji: '🎵',
    question: '¿Qué es esto?',
    options: ['música', 'película', 'libro', 'juego'],
    correctAnswer: 'música',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },
  {
    id: 'entertainment_007',
    emoji: '📺',
    question: '¿Qué es esto?',
    options: ['televisión', 'radio', 'computadora'],
    correctAnswer: 'televisión',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },
  {
    id: 'entertainment_008',
    emoji: '🎭',
    question: '¿Qué es esto?',
    options: ['teatro', 'cine', 'museo', 'concierto'],
    correctAnswer: 'teatro',
    points: 10,
    category: 'entertainment',
    difficulty: 'medium',
  },
  {
    id: 'entertainment_009',
    emoji: '📚',
    question: '¿Qué son estos?',
    options: ['libros', 'revistas', 'periódicos'],
    correctAnswer: 'libros',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },
  {
    id: 'entertainment_010',
    emoji: '🎨',
    question: '¿Qué actividad es esta?',
    options: ['pintura', 'música', 'danza', 'teatro'],
    correctAnswer: 'pintura',
    points: 10,
    category: 'entertainment',
    difficulty: 'medium',
  },
  {
    id: 'entertainment_011',
    emoji: '🎹',
    question: '¿Qué instrumento es este?',
    options: ['piano', 'guitarra', 'violín', 'flauta'],
    correctAnswer: 'piano',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },
  {
    id: 'entertainment_012',
    emoji: '🎤',
    question: '¿Qué es esto?',
    options: ['micrófono', 'guitarra', 'altavoz'],
    correctAnswer: 'micrófono',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },
  {
    id: 'entertainment_013',
    emoji: '🎪',
    question: '¿Qué es esto?',
    options: ['circo', 'teatro', 'cine', 'parque'],
    correctAnswer: 'circo',
    points: 10,
    category: 'entertainment',
    difficulty: 'medium',
  },
  {
    id: 'entertainment_014',
    emoji: '🎯',
    question: '¿Qué juego es este?',
    options: ['dardos', 'billar', 'bolos'],
    correctAnswer: 'dardos',
    points: 10,
    category: 'entertainment',
    difficulty: 'medium',
  },
  {
    id: 'entertainment_015',
    emoji: '🎲',
    question: '¿Qué son estos?',
    options: ['dados', 'cartas', 'fichas', 'piezas'],
    correctAnswer: 'dados',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },
  {
    id: 'entertainment_016',
    emoji: '🏊',
    question: '¿Qué deporte es este?',
    options: ['natación', 'buceo', 'surf'],
    correctAnswer: 'natación',
    points: 10,
    category: 'entertainment',
    difficulty: 'medium',
  },
  {
    id: 'entertainment_017',
    emoji: '🎻',
    question: '¿Qué instrumento es este?',
    options: ['violín', 'guitarra', 'piano', 'flauta'],
    correctAnswer: 'violín',
    points: 10,
    category: 'entertainment',
    difficulty: 'medium',
  },
  {
    id: 'entertainment_018',
    emoji: '🏃',
    question: '¿Qué actividad es esta?',
    options: ['correr', 'caminar', 'saltar'],
    correctAnswer: 'correr',
    points: 10,
    category: 'entertainment',
    difficulty: 'easy',
  },
  {
    id: 'entertainment_019',
    emoji: '🎳',
    question: '¿Qué juego es este?',
    options: ['bolos', 'billar', 'dardos', 'golf'],
    correctAnswer: 'bolos',
    points: 10,
    category: 'entertainment',
    difficulty: 'medium',
  },
  {
    id: 'entertainment_020',
    emoji: '🎺',
    question: '¿Qué instrumento es este?',
    options: ['trompeta', 'saxofón', 'flauta'],
    correctAnswer: 'trompeta',
    points: 10,
    category: 'entertainment',
    difficulty: 'medium',
  },

  // ACCOMMODATION CATEGORY
  {
    id: 'accommodation_001',
    emoji: '🏨',
    question: '¿Qué es esto?',
    options: ['hotel', 'restaurante', 'museo'],
    correctAnswer: 'hotel',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_002',
    emoji: '🛏️',
    question: '¿Qué es esto?',
    options: ['cama', 'sofá', 'silla', 'mesa'],
    correctAnswer: 'cama',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_003',
    emoji: '🔑',
    question: '¿Qué es esto?',
    options: ['llave', 'tarjeta', 'teléfono'],
    correctAnswer: 'llave',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_004',
    emoji: '🚪',
    question: '¿Qué es esto?',
    options: ['ventana', 'puerta', 'pared', 'techo'],
    correctAnswer: 'puerta',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_005',
    emoji: '🪟',
    question: '¿Qué es esto?',
    options: ['ventana', 'puerta', 'espejo'],
    correctAnswer: 'ventana',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_006',
    emoji: '🛁',
    question: '¿Qué es esto?',
    options: ['bañera', 'lavabo', 'ducha', 'inodoro'],
    correctAnswer: 'bañera',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_007',
    emoji: '🚿',
    question: '¿Qué es esto?',
    options: ['ducha', 'bañera', 'lavabo'],
    correctAnswer: 'ducha',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_008',
    emoji: '🪑',
    question: '¿Qué es esto?',
    options: ['silla', 'mesa', 'sofá', 'cama'],
    correctAnswer: 'silla',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_009',
    emoji: '🛋️',
    question: '¿Qué es esto?',
    options: ['sofá', 'cama', 'silla'],
    correctAnswer: 'sofá',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_010',
    emoji: '🪞',
    question: '¿Qué es esto?',
    options: ['espejo', 'ventana', 'puerta', 'cuadro'],
    correctAnswer: 'espejo',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_011',
    emoji: '🕯️',
    question: '¿Qué es esto?',
    options: ['vela', 'lámpara', 'foco'],
    correctAnswer: 'vela',
    points: 10,
    category: 'accommodation',
    difficulty: 'medium',
  },
  {
    id: 'accommodation_012',
    emoji: '💡',
    question: '¿Qué es esto?',
    options: ['foco', 'lámpara', 'vela', 'linterna'],
    correctAnswer: 'foco',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_013',
    emoji: '🧹',
    question: '¿Qué es esto?',
    options: ['escoba', 'trapeador', 'aspiradora'],
    correctAnswer: 'escoba',
    points: 10,
    category: 'accommodation',
    difficulty: 'medium',
  },
  {
    id: 'accommodation_014',
    emoji: '🧺',
    question: '¿Qué es esto?',
    options: ['cesta', 'caja', 'bolsa'],
    correctAnswer: 'cesta',
    points: 10,
    category: 'accommodation',
    difficulty: 'medium',
  },
  {
    id: 'accommodation_015',
    emoji: '🧴',
    question: '¿Qué es esto?',
    options: ['jabón', 'champú', 'crema', 'loción'],
    correctAnswer: 'jabón',
    points: 10,
    category: 'accommodation',
    difficulty: 'medium',
  },
  {
    id: 'accommodation_016',
    emoji: '🧻',
    question: '¿Qué es esto?',
    options: ['papel higiénico', 'toalla', 'servilleta'],
    correctAnswer: 'papel higiénico',
    points: 10,
    category: 'accommodation',
    difficulty: 'medium',
  },
  {
    id: 'accommodation_017',
    emoji: '🧼',
    question: '¿Qué es esto?',
    options: ['jabón', 'esponja', 'toalla'],
    correctAnswer: 'jabón',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_018',
    emoji: '🛌',
    question: '¿Qué actividad es esta?',
    options: ['dormir', 'descansar', 'acostarse'],
    correctAnswer: 'dormir',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_019',
    emoji: '🏡',
    question: '¿Qué es esto?',
    options: ['casa', 'hotel', 'apartamento', 'edificio'],
    correctAnswer: 'casa',
    points: 10,
    category: 'accommodation',
    difficulty: 'easy',
  },
  {
    id: 'accommodation_020',
    emoji: '🏢',
    question: '¿Qué es esto?',
    options: ['edificio', 'casa', 'hotel'],
    correctAnswer: 'edificio',
    points: 10,
    category: 'accommodation',
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
