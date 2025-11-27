#!/usr/bin/env node

/**
 * Script to add contextual hints to all questions
 * Run with: node add-hints.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsPath = path.join(__dirname, 'src/config/questions.js');
let content = fs.readFileSync(questionsPath, 'utf8');

// Hint templates based on question patterns and contexts
const hintPatterns = {
  // Fruits
  'sandía': 'Very juicy and refreshing on hot days',
  'plátano': 'Monkeys love this curved fruit',
  'manzana': 'Keeps the doctor away',
  'naranja': 'Round citrus fruit full of vitamin C',
  'uvas': 'Small fruits that grow in bunches',
  'piña': 'Tropical fruit with spiky skin',
  'fresa': 'Small red berry with seeds on the outside',
  'limón': 'Sour yellow citrus',
  'pera': 'Shaped like a light bulb',
  'mango': 'Sweet tropical fruit with a large pit',
  
  // Vegetables
  'zanahoria': 'Orange root vegetable, good for eyes',
  'tomate': 'Red and used in salads and sauces',
  'lechuga': 'Green leafy base for salads',
  'papa': 'Starchy root vegetable, can be fried',
  'cebolla': 'Makes you cry when you cut it',
  'brócoli': 'Green vegetable that looks like a tiny tree',
  'pepino': 'Green and crunchy, mostly water',
  'pimiento': 'Bell-shaped vegetable, can be many colors',
  'maíz': 'Yellow kernels, makes popcorn',
  'guisantes': 'Small round green vegetables in pods',
  
  // Main Dishes
  'pizza': 'Italian dish with cheese and toppings',
  'hamburguesa': 'Meat patty in a bun',
  'espagueti': 'Long thin pasta noodles',
  'sushi': 'Japanese rice and fish rolls',
  'taco': 'Mexican tortilla with fillings',
  'arroz': 'White or brown grains, staple in Asia',
  'pollo': 'White meat that comes from birds',
  'carne': 'Red meat from animals',
  'pescado': 'Protein from the sea',
  'sopa': 'Liquid meal, often hot',
  
  // Bread & Grains
  'pan': 'Baked from flour, basic food',
  'tortilla': 'Flat bread used in Mexican food',
  'galleta': 'Small sweet baked snack',
  'cereal': 'Breakfast food eaten with milk',
  'pasta': 'Italian food made from wheat',
  
  // Dairy
  'leche': 'White drink from cows',
  'queso': 'Made from milk, often yellow',
  'yogur': 'Creamy fermented milk product',
  'mantequilla': 'Spread made from cream',
  
  // Drinks
  'agua': 'Clear liquid, essential for life',
  'jugo': 'Liquid from squeezed fruits',
  'café': 'Brown drink that wakes you up',
  'té': 'Hot drink made from leaves',
  'refresco': 'Fizzy sweet drink',
  
  // Desserts
  'helado': 'Frozen sweet treat',
  'pastel': 'Sweet baked celebration food',
  'chocolate': 'Sweet brown candy from cacao',
  
  // Shopping - Clothing
  'camisa': 'Top with buttons and collar',
  'pantalones': 'Clothing for your legs',
  'zapatos': 'You wear these on your feet',
  'vestido': 'One-piece outfit for women',
  'chaqueta': 'Wear over other clothes when cool',
  'sombrero': 'Protects your head from sun',
  'calcetines': 'Wear inside shoes',
  'corbata': 'Formal neck accessory for suits',
  'abrigo': 'Heavy coat for winter',
  'bufanda': 'Wraps around neck for warmth',
  'guantes': 'Keep your hands warm',
  'jeans': 'Blue denim pants',
  'botas': 'Tall shoes for feet and ankles',
  'traje de baño': 'Wear when swimming',
  
  // Shopping - Accessories
  'bolso': 'Carry your personal items',
  'mochila': 'Bag you wear on your back',
  'reloj': 'Tells you what time it is',
  'gafas de sol': 'Protect eyes from bright light',
  'anillo': 'Jewelry for your finger',
  
  // Shopping Actions
  'tienda': 'Place where you buy things',
  'pagar': 'Give money for something',
  'comprar': 'Get something by paying',
  'vender': 'Give something for money',
  
  // Transportation
  'coche': 'Four-wheeled vehicle on roads',
  'autobús': 'Large vehicle with many seats',
  'tren': 'Runs on tracks',
  'avión': 'Flies in the sky',
  'bicicleta': 'Two wheels, you pedal it',
  'taxi': 'Car you pay to ride in',
  
  // Directions
  'derecha': 'Opposite of left',
  'izquierda': 'Opposite of right',
  'recto': 'Go forward without turning',
  'norte': 'Opposite of south',
  'sur': 'Opposite of north',
  
  // Accommodation
  'hotel': 'Place to sleep when traveling',
  'habitación': 'Private room to sleep',
  'cama': 'Furniture for sleeping',
  'llave': 'Opens a locked door',
  
  // Emergencies
  'hospital': 'Where sick people get care',
  'doctor': 'Medical professional who helps when sick',
  'farmacia': 'Buy medicine here',
  'policía': 'Enforces laws and helps in emergencies',
};

// Function to generate a hint based on the correct answer
function generateHint(correctAnswer, question, emoji) {
  // Check if we have a predefined hint
  if (hintPatterns[correctAnswer]) {
    return hintPatterns[correctAnswer];
  }
  
  // Generate contextual hints based on question patterns
  if (question.includes('color')) {
    return 'Think about what color this usually is';
  }
  if (question.includes('dónde compras') || question.includes('dónde encuentras')) {
    return 'Think about where you usually find this';
  }
  if (question.includes('cuándo') || question.includes('qué estación')) {
    return 'Think about the time or season';
  }
  if (question.includes('cómo describes')) {
    return 'Think about how you would describe it';
  }
  if (question.includes('usas') || question.includes('te pones')) {
    return 'Think about when or where you use this';
  }
  if (question.includes('talla') || question.includes('tamaño')) {
    return 'Think about size or measurements';
  }
  
  // Default hints
  return 'Look at the emoji for a clue';
}

// Regex to find questions without hints and add them
const questionRegex = /{([^}]+correctAnswer:\s*'([^']+)'[^}]+?)}/gs;

let match;
let modifications = 0;

content = content.replace(questionRegex, (fullMatch, questionBody, correctAnswer) => {
  // Check if this question already has a hint
  if (questionBody.includes('hint:')) {
    return fullMatch;
  }
  
  // Extract question text and emoji
  const questionMatch = questionBody.match(/question:\s*'([^']+)'/);
  const emojiMatch = questionBody.match(/emoji:\s*'([^']+)'/);
  
  const questionText = questionMatch ? questionMatch[1] : '';
  const emoji = emojiMatch ? emojiMatch[1] : '';
  
  // Generate hint
  const hint = generateHint(correctAnswer, questionText, emoji);
  
  // Find where to insert the hint (after correctAnswer)
  const modifiedBody = questionBody.replace(
    /(correctAnswer:\s*'[^']+',)/,
    `$1\n    hint: '${hint}',`
  );
  
  modifications++;
  return `{${modifiedBody}}`;
});

console.log(`Added hints to ${modifications} questions`);

// Write back to file
fs.writeFileSync(questionsPath, content, 'utf8');
console.log('✓ Updated questions.js with hints');
