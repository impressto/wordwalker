# Manual Migration Guide - Question Translations

## Current Status

### ✅ Completed (156 translations)
- **animals.js** - 64 translations
- **beach.js** - 43 translations  
- **people.js** - 100 translations

### ⏳ To Do (~1,500 translations)
The following files have been created with TODO markers and need content extracted from the old `question-translations.js`:

1. **food.js** - ~200-300 translations
2. **shopping.js** - ~150-200 translations
3. **entertainment.js** - ~100-150 translations
4. **accommodation.js** - ~150-200 translations
5. **transportation.js** - ~100 translations
6. **directions.js** - ~50 translations
7. **emergencies.js** - ~50 translations
8. **greetings.js** - ~50 translations
9. **numbers.js** - ~100 translations
10. **grammar.js** - ~100 translations
11. **daily_routines.js** - TBD
12. **restaurant.js** - TBD (may overlap with food)

## Migration Strategy

### Option A: Gradual Migration (Recommended)
Migrate one category at a time while keeping the system functional:

1. Keep the old `question-translations.js` as a fallback
2. Complete one category file at a time
3. Test after each category
4. Once all done, remove the old file

### Option B: Bulk Search & Extract
Use your code editor's search functionality:

1. Open `question-translations.js`
2. For each category, search for relevant Spanish keywords
3. Copy matching translations to the new category file
4. Remove duplicates

## Step-by-Step Instructions

### For Each Category:

#### 1. Identify Keywords
For example, for **food.js**:
```
Search terms: comida, bebida, fruta, verdura, carne, pescado, postre, 
              dulce, pan, ensalada, sopa, hamburguesa, pizza, taco, etc.
```

#### 2. Extract Translations
In `question-translations.js`, search for questions containing those keywords and copy them.

#### 3. Format in Category File
```javascript
export const foodTranslations = {
  "¿Spanish question?": "English translation",
  "¿Another question?": "Another translation",
  // ...
};
```

#### 4. Remove TODO Comment
Once completed, remove the `TODO:` section from the file.

#### 5. Test
Run your app and verify the category works correctly.

## Search Keywords by Category

### Food
```
comida, comer, bebida, beber, fruta, verdura, carne, pescado, pollo, 
cerdo, res, mariscos, postre, dulce, pan, arroz, pasta, sopa, ensalada,
hamburguesa, pizza, taco, burrito, desayuno, almuerzo, cena
```

### Shopping
```
comprar, tienda, ropa, zapatos, camisa, pantalón, vestido, falda, 
chaqueta, suéter, calcetines, talla, precio, caro, barato, pagar,
descuento, bolsa, carrito, caja
```

### Entertainment
```
juego, jugar, deporte, música, cantar, bailar, película, cine, 
teatro, arte, pintar, dibujar, leer, libro, guitarra, piano,
fútbol, béisbol, básquetbol, nadar
```

### Accommodation
```
hotel, habitación, reserva, check-in, check-out, alojamiento, 
recepción, llave, cama, toalla, sábana, almohada, baño, ducha,
servicio, limpieza, maleta, equipaje
```

### Transportation
```
transporte, autobús, tren, avión, taxi, metro, carro, bicicleta,
aeropuerto, estación, billete, boleto, vuelo, pasajero, conductor,
manejar, viajar
```

### Directions
```
dirección, calle, avenida, derecha, izquierda, recto, doblar,
norte, sur, este, oeste, cerca, lejos, aquí, allá, mapa,
esquina, cruce, semáforo
```

### Emergencies
```
emergencia, hospital, médico, doctor, enfermero, enfermo, dolor,
ayuda, policía, bombero, ambulancia, accidente, peligro, urgente,
medicina, farmacia
```

### Greetings
```
hola, adiós, buenos días, buenas tardes, buenas noches, gracias,
por favor, disculpa, perdón, cómo estás, qué tal, mucho gusto,
encantado, hasta luego
```

### Numbers
```
número, uno, dos, tres, primero, segundo, color, rojo, azul, verde,
amarillo, hora, tiempo, día, semana, mes, año, lunes, martes,
enero, febrero
```

### Grammar
```
verbo, conjugar, presente, pasado, futuro, ser, estar, tener, hacer,
ir, pronombre, artículo, género, singular, plural, masculino, femenino
```

## Quick Search Method

1. Open `question-translations.js` in VS Code
2. Press `Ctrl+F` (or `Cmd+F` on Mac)
3. Search for category keyword (e.g., "comida")
4. Use `Alt+Enter` to select all matches
5. Copy selected lines
6. Paste into appropriate category file
7. Clean up formatting

## Verification Checklist

After completing each category:

- [ ] File exports correct object name (e.g., `foodTranslations`)
- [ ] All translations follow pattern: `"Spanish": "English",`
- [ ] No duplicate questions across categories
- [ ] File is imported in `translations/index.js`
- [ ] TODO comment removed from file
- [ ] App runs without errors
- [ ] Questions display correct translations

## Notes

- Some questions may fit multiple categories - use your judgment
- Keep translations in alphabetical order for easier maintenance
- Add section comments within files for subsections (e.g., "// Fruits", "// Vegetables")
- Test frequently to catch issues early

## When Complete

Once all categories are migrated:

1. Verify all questions have translations
2. Test thoroughly across all categories
3. Update imports throughout codebase to use new structure
4. Backup the old `question-translations.js`
5. Delete the old file
6. Update README.md in translations folder
7. Commit changes

## Estimated Time

- Per category: 15-30 minutes
- Total: 3-5 hours (spread across multiple sessions)

Good luck! 🚀
