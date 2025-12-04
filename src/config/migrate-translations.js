#!/usr/bin/env node

/**
 * Migration Script for Question Translations
 * 
 * This script helps extract translations from the monolithic question-translations.js
 * file and split them into category-specific files.
 * 
 * Usage:
 *   node migrate-translations.js
 * 
 * The script will read the existing question-translations.js and attempt to
 * group translations by detected patterns or comments.
 */

const fs = require('fs');
const path = require('path');

// Define category patterns to help auto-detect which category a question belongs to
const categoryPatterns = {
  food: [
    /comida|comer|bebida|beber|fruta|verdura|carne|pescado|postre|desayuno|almuerzo|cena/i,
    /restaurante|menú|cocina|plato|sopa|ensalada|hamburguesa|pizza|taco/i,
  ],
  shopping: [
    /comprar|tienda|ropa|zapatos|camisa|pantalón|vestido|talla|precio|pagar/i,
    /bolsa|carrito|caja|descuento|oferta|vender/i,
  ],
  entertainment: [
    /juego|película|música|deporte|arte|diversión|teatro|cine|concierto/i,
    /bailar|cantar|tocar|jugar|ver|escuchar/i,
  ],
  accommodation: [
    /hotel|habitación|reserva|alojamiento|hostal|llave|recepción|check/i,
    /cama|toalla|sábana|almohada|limpieza/i,
  ],
  transportation: [
    /transporte|autobús|tren|avión|taxi|metro|estación|aeropuerto|billete/i,
    /conducir|viajar|vuelo|pasajero|equipaje/i,
  ],
  directions: [
    /dirección|calle|avenida|izquierda|derecha|norte|sur|este|oeste|mapa/i,
    /cerca|lejos|aquí|allá|doblar|seguir|camino/i,
  ],
  emergencies: [
    /emergencia|hospital|médico|enfermo|dolor|ayuda|policía|bombero|accidente/i,
    /urgente|peligro|llamar|ambulancia/i,
  ],
  greetings: [
    /hola|adiós|buenos|buenas|gracias|por favor|perdón|disculpa|saludo/i,
    /¿cómo estás|¿qué tal|mucho gusto|encantado/i,
  ],
  numbers: [
    /número|color|hora|tiempo|fecha|día|mes|año|primero|segundo/i,
    /rojo|azul|verde|amarillo|blanco|negro|lunes|martes/i,
  ],
  grammar: [
    /verbo|conjugar|tiempo verbal|presente|pasado|futuro|subjuntivo/i,
    /pronombre|artículo|género|singular|plural|gramática/i,
  ],
  beach: [
    /playa|arena|mar|ola|sol|bronceado|nadar|surf|bucear|toalla/i,
    /traje de baño|sombrilla|protector solar/i,
  ],
  animals: [
    /animal|perro|gato|pájaro|pez|caballo|vaca|cerdo|gallina|león/i,
    /salvaje|doméstico|mascota|zoológico/i,
  ],
  people: [
    /padre|madre|hijo|hija|hermano|hermana|familia|abuelo|tío|primo/i,
    /doctor|maestro|policía|bombero|artista|trabajador|profession/i,
    /alto|bajo|fuerte|débil|feliz|triste|joven|viejo|person/i,
  ],
};

function detectCategory(questionText) {
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(questionText)) {
        return category;
      }
    }
  }
  return 'mixed'; // fallback category for unmatched
}

function parseTranslationsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract the translations object using regex
  const translationsMatch = content.match(/export const questionTranslations = \{([\s\S]+?)\n\};/);
  
  if (!translationsMatch) {
    console.error('Could not find questionTranslations object');
    return {};
  }
  
  const translationsContent = translationsMatch[1];
  const lines = translationsContent.split('\n');
  
  const categoryMap = {
    mixed: {},
  };
  
  // Initialize category maps
  Object.keys(categoryPatterns).forEach(cat => {
    categoryMap[cat] = {};
  });
  
  let currentComment = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Track comments
    if (trimmed.startsWith('//')) {
      currentComment = trimmed;
      continue;
    }
    
    // Skip empty lines
    if (!trimmed || trimmed === ',') continue;
    
    // Parse translation line: "Spanish": "English",
    const match = trimmed.match(/"([^"]+)":\s*"([^"]+)"/);
    if (match) {
      const [, spanish, english] = match;
      const category = detectCategory(spanish + ' ' + english);
      categoryMap[category][spanish] = english;
    }
  }
  
  return categoryMap;
}

function generateCategoryFile(category, translations) {
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  
  let content = `/**
 * ${categoryName} Question Translations
 * Category: ${category}
 */

export const ${category}Translations = {\n`;
  
  for (const [spanish, english] of Object.entries(translations)) {
    content += `  "${spanish}": "${english}",\n`;
  }
  
  content += `};\n`;
  
  return content;
}

function main() {
  const oldFilePath = path.join(__dirname, 'question-translations.js');
  const translationsDir = path.join(__dirname, 'translations');
  
  console.log('Reading existing translations file...');
  const categoryMap = parseTranslationsFile(oldFilePath);
  
  console.log('\nTranslations found per category:');
  for (const [category, translations] of Object.entries(categoryMap)) {
    const count = Object.keys(translations).length;
    if (count > 0) {
      console.log(`  ${category}: ${count} translations`);
    }
  }
  
  console.log('\nGenerating category files...');
  
  for (const [category, translations] of Object.entries(categoryMap)) {
    if (Object.keys(translations).length === 0) continue;
    
    const fileName = `${category}.js`;
    const filePath = path.join(translationsDir, fileName);
    const content = generateCategoryFile(category, translations);
    
    // Don't overwrite people.js since we already created it manually
    if (category === 'people' && fs.existsSync(filePath)) {
      console.log(`  Skipping ${fileName} (already exists)`);
      continue;
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  Created ${fileName}`);
  }
  
  console.log('\n✓ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Review the generated files in src/config/translations/');
  console.log('2. Update src/config/translations/index.js to import all categories');
  console.log('3. Update imports throughout the codebase to use the new structure');
  console.log('4. Test thoroughly before removing the old question-translations.js');
}

if (require.main === module) {
  main();
}

module.exports = { parseTranslationsFile, detectCategory, generateCategoryFile };
