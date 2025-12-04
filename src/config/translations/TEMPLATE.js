/**
 * [CATEGORY NAME] Question Translations
 * Category: [category_id]
 * 
 * This is a template showing the correct format for category translation files.
 * Copy this structure when creating or filling in category files.
 */

// 1. Export must follow this naming pattern: [category]Translations
export const categoryTranslations = {
  
  // 2. Group related translations with comments
  // Main Section
  "¿Spanish question text?": "English translation text",
  "¿Another Spanish question?": "Another English translation",
  
  // Subsection (optional, for organization)
  "¿More specific question?": "More specific translation",
  "¿Related question?": "Related translation",
  
  // Another Subsection
  "¿Different topic?": "Different translation",
  
  // 3. Always end with comma after last translation (safer for additions)
  "¿Last question?": "Last translation",
};

// 4. No additional exports needed - just the main object

/* 
 * FORMATTING RULES:
 * 
 * ✅ DO:
 * - Use double quotes for both Spanish and English
 * - Include question marks in Spanish (¿ at start, ? at end)
 * - Add comma after each translation
 * - Use section comments for organization
 * - Keep alphabetical or logical order
 * 
 * ❌ DON'T:
 * - Mix single and double quotes
 * - Forget the comma after each entry
 * - Add extra exports
 * - Leave TODO comments after completion
 * 
 * EXAMPLE FROM REAL FILE (animals.js):
 * 
 * export const animalsTranslations = {
 *   // Domestic & Farm Animals
 *   "¿Cuál es un animal doméstico común?": "What is a common domestic animal?",
 *   "¿Qué animal dice \"miau\"?": "What animal says 'meow'?",
 *   
 *   // Birds
 *   "¿Qué pájaro grande vuela muy alto?": "What big bird flies very high?",
 *   "¿Qué pájaro ve bien de noche?": "What bird sees well at night?",
 * };
 */
