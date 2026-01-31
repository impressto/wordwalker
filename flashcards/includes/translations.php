<?php
/**
 * Language translations for the flashcards interface
 * Returns translated strings based on the specified language
 */

function getTranslations($lang = 'en') {
    $translations = [
        'en' => [
            // Header
            'page_title' => 'Spanish Flash Cards',
            'multiple_categories' => 'Multiple Categories',
            
            // Category selector
            'choose_categories' => 'Choose Categories:',
            'click_to_toggle' => '(Click to add/remove)',
            'select_categories' => 'Select Categories',
            
            // Search
            'search_placeholder' => '🔍 Search cards by Spanish or English...',
            'search_button' => 'Search',
            'search_all_categories' => 'Search all categories',
            'across_all_categories' => 'across all categories',
            'all_categories' => 'All Categories',
            'all_categories_desc' => 'Browse flash cards from all available categories',
            'clear_search' => 'Clear search',
            'no_results' => 'No results found',
            'no_results_text' => 'No flash cards match your search term',
            'try_different' => 'Try a different search term or',
            'clear_the_search' => 'clear the search',
            
            // Controls
            'new_shuffle' => '🔄 New Shuffle Order',
            'shuffle_confirm' => 'Reset shuffle order for this category?',
            'autoplay_audio' => '🔊 Auto-play audio',
            
            // Pagination
            'page_of' => 'Page',
            'of' => 'of',
            'total_cards' => 'total flash cards',
            'previous' => '‹ Previous',
            'next' => 'Next ›',
            'first' => '« First',
            'last' => 'Last »',
            
            // Messages
            'no_cards' => 'No flash cards available',
            'no_cards_text' => 'There are no flash cards available for this category yet.',
            
            // Flashcard labels
            'play_audio' => 'Play audio',
            'play_example' => 'Play example',
            'flip_instruction' => '👆 Click to reveal answer',
            'example_label' => 'Example:',
            'save_image' => 'Save Image',
            'download_card_image' => 'Download card as image',
            
            // Difficulty levels
            'difficulty_easy' => 'EASY',
            'difficulty_medium' => 'MEDIUM',
            'difficulty_hard' => 'HARD',
            
            // Links
            'report_error' => '💬 Report error or make suggestions',
            'learn_more' => '📖 Learn more about the mission',
            'share_cards' => '📢 Share These Flash Cards',
            'share_text' => 'Help others learn Spanish! Share with friends and family:',
            'back_to_app' => '🎮 Try the WordWalker Game (Learning Spanish for Kids)',
            
            // Language toggle
            'language' => 'Language',
            'switch_to_spanish' => 'Español',
            'switch_to_english' => 'English',
            
            // Free forever tagline
            'free_forever_tagline' => '100% Free Forever • No Ads • No Subscriptions • Community Driven',
            'free_flashcards_desc' => 'Learn Spanish with free interactive flashcards and audio pronunciation',
            
            // Category names
            'category_food' => 'Food and Dining',
            'category_recreation' => 'Recreation',
            'category_transportation' => 'Transportation',
            'category_accommodation' => 'Accommodation',
            'category_shopping' => 'Shopping',
            'category_people' => 'People & Relationships',
            'category_daily_routines' => 'Daily Routines',
            'category_grammar' => 'Grammar',
            'category_plants_animals' => 'Plants and Animals',
            'category_environment' => 'Weather & Environment',
            'category_business' => 'Work and Business',
            'category_medical' => 'Medical & Emergencies',
            'category_entertainment' => 'Entertainment',
            'category_numbers' => 'Numbers, Colors & Time',
            'category_greetings' => 'Greetings & Conversations',
            'category_directions' => 'Places and Directions',
            
            // Category descriptions
            'category_food_desc' => 'Learn food, dining, and restaurant vocabulary',
            'category_recreation_desc' => 'Learn leisure, beach, and outdoor activity vocabulary',
            'category_transportation_desc' => 'Learn transportation and travel vocabulary',
            'category_accommodation_desc' => 'Learn accommodation and lodging vocabulary',
            'category_shopping_desc' => 'Learn shopping and clothing vocabulary',
            'category_people_desc' => 'Learn family, professions, and describing people',
            'category_daily_routines_desc' => 'Learn daily activities and reflexive verbs',
            'category_grammar_desc' => 'Learn Spanish grammar, verb conjugations, and sentence structure',
            'category_plants_animals_desc' => 'Learn plant and animal names and characteristics',
            'category_environment_desc' => 'Learn weather, climate, and environmental vocabulary',
            'category_business_desc' => 'Learn business, work, and office vocabulary',
            'category_medical_desc' => 'Learn medical and emergency vocabulary',
            'category_entertainment_desc' => 'Learn entertainment and hobby vocabulary',
            'category_numbers_desc' => 'Learn numbers, dates, times, and calendar vocabulary',
            'category_greetings_desc' => 'Learn greetings, farewells, and common conversation phrases',
            'category_directions_desc' => 'Learn sightseeing & landmarks vocabulary',
            
            // SEO Footer
            'seo_footer_title' => '100% Free Spanish Flashcards - Always Free',
            'seo_footer_intro' => 'WordWalker offers completely free Spanish flashcards',
            'seo_footer_intro_detail' => 'with no hidden costs, no subscriptions, and no premium tiers. Our commitment is simple:',
            'seo_footer_commitment' => 'free Spanish learning for everyone, forever',
            'seo_no_cost_title' => '✓ No Cost Ever',
            'seo_no_cost_text' => 'All flashcards, audio pronunciation, and features are 100% free. No payments required.',
            'seo_no_subscription_title' => '✓ No Subscription',
            'seo_no_subscription_text' => 'Never worry about monthly fees or trial periods. Access everything freely anytime.',
            'seo_always_free_title' => '✓ Always Free',
            'seo_always_free_text' => 'Our promise: these Spanish flashcards will remain free forever, for everyone.',
            'seo_comparison_text' => 'Unlike other flashcard platforms that charge for premium features,',
            'seo_wordwalker_provides' => 'WordWalker provides free Spanish vocabulary practice',
            'seo_with_audio' => 'with audio pronunciation across all categories. Learn Spanish at your own pace with our',
            'seo_free_interactive' => 'free interactive flashcards',
            'seo_covering' => 'covering food, travel, business, grammar, and more - all without spending a penny.',
            'seo_start_learning' => 'Start learning Spanish today with our free flashcards - visit <a href="https://www.facebook.com/groups/2642136512829821">our facebook group</a> for the latest updates.',
        ],
        'es' => [
            // Header
            'page_title' => 'Tarjetas de Vocabulario en Español',
            'multiple_categories' => 'Categorías Múltiples',
            
            // Category selector
            'choose_categories' => 'Elegir Categorías:',
            'click_to_toggle' => '(Haz clic para agregar/quitar)',
            'select_categories' => 'Seleccionar Categorías',
            
            // Search
            'search_placeholder' => '🔍 Buscar tarjetas en español o inglés...',
            'search_button' => 'Buscar',
            'search_all_categories' => 'Buscar en todas las categorías',
            'across_all_categories' => 'en todas las categorías',
            'all_categories' => 'Todas las Categorías',
            'all_categories_desc' => 'Explora tarjetas de todas las categorías disponibles',
            'clear_search' => 'Limpiar búsqueda',
            'no_results' => 'No se encontraron resultados',
            'no_results_text' => 'No hay tarjetas que coincidan con tu búsqueda',
            'try_different' => 'Prueba con un término diferente o',
            'clear_the_search' => 'limpia la búsqueda',
            
            // Controls
            'new_shuffle' => '🔄 Nuevo Orden Aleatorio',
            'shuffle_confirm' => '¿Restablecer el orden aleatorio para esta categoría?',
            'autoplay_audio' => '🔊 Reproducción automática',
            
            // Pagination
            'page_of' => 'Página',
            'of' => 'de',
            'total_cards' => 'tarjetas en total',
            'previous' => '‹ Anterior',
            'next' => 'Siguiente ›',
            'first' => '« Primera',
            'last' => 'Última »',
            
            // Messages
            'no_cards' => 'No hay tarjetas disponibles',
            'no_cards_text' => 'Todavía no hay tarjetas disponibles para esta categoría.',
            
            // Flashcard labels
            'play_audio' => 'Reproducir audio',
            'play_example' => 'Reproducir ejemplo',
            'flip_instruction' => '👆 Haz clic para ver la respuesta',
            'example_label' => 'Ejemplo:',
            'save_image' => 'Guardar Imagen',
            'download_card_image' => 'Descargar tarjeta como imagen',
            
            // Difficulty levels
            'difficulty_easy' => 'FÁCIL',
            'difficulty_medium' => 'MEDIO',
            'difficulty_hard' => 'DIFÍCIL',
            
            // Links
            'report_error' => '💬 Reportar error o hacer sugerencias',
            'learn_more' => '📖 Conoce más sobre la misión',
            'share_cards' => '📢 Comparte Estas Tarjetas',
            'share_text' => '¡Ayuda a otros a aprender español! Comparte con amigos y familia:',
            'back_to_app' => '🎮 Prueba el Juego WordWalker (Aprendiendo Español para Niños)',
            
            // Language toggle
            'language' => 'Idioma',
            'switch_to_spanish' => 'Español',
            'switch_to_english' => 'English',
            
            // Free forever tagline
            'free_forever_tagline' => '100% Gratis Para Siempre • Sin Costo • Sin Suscripción • Impulsado por la Comunidad',
            'free_flashcards_desc' => 'Aprende español con tarjetas interactivas gratuitas y pronunciación de audio',
            
            // Category names
            'category_food' => 'Comida y Restaurantes',
            'category_recreation' => 'Recreación',
            'category_transportation' => 'Transporte',
            'category_accommodation' => 'Alojamiento',
            'category_shopping' => 'Compras',
            'category_people' => 'Gente y Relaciones',
            'category_daily_routines' => 'Rutinas Diarias',
            'category_grammar' => 'Gramática',
            'category_plants_animals' => 'Plantas y Animales',
            'category_environment' => 'Clima y Medio Ambiente',
            'category_business' => 'Negocios y Trabajo',
            'category_medical' => 'Médico y Emergencias',
            'category_entertainment' => 'Entretenimiento',
            'category_numbers' => 'Números, Colores y Hora',
            'category_greetings' => 'Saludos y Conversaciones',
            'category_directions' => 'Lugares y Direcciones',
            
            // Category descriptions
            'category_food_desc' => 'Aprende vocabulario de comida, restaurantes y gastronomía',
            'category_recreation_desc' => 'Aprende vocabulario de ocio, playa y actividades al aire libre',
            'category_transportation_desc' => 'Aprende vocabulario de transporte y viajes',
            'category_accommodation_desc' => 'Aprende vocabulario de alojamiento y hospedaje',
            'category_shopping_desc' => 'Aprende vocabulario de compras y ropa',
            'category_people_desc' => 'Aprende sobre familia, profesiones y descripción de personas',
            'category_daily_routines_desc' => 'Aprende actividades diarias y verbos reflexivos',
            'category_grammar_desc' => 'Aprende gramática española, conjugaciones verbales y estructura de oraciones',
            'category_plants_animals_desc' => 'Aprende nombres y características de plantas y animales',
            'category_environment_desc' => 'Aprende vocabulario sobre clima, tiempo y medio ambiente',
            'category_business_desc' => 'Aprende vocabulario de negocios, trabajo y oficina',
            'category_medical_desc' => 'Aprende vocabulario médico y de emergencias',
            'category_entertainment_desc' => 'Aprende vocabulario de entretenimiento y pasatiempos',
            'category_numbers_desc' => 'Aprende números, fechas, horas y vocabulario de calendario',
            'category_greetings_desc' => 'Aprende saludos, despedidas y frases comunes de conversación',
            'category_directions_desc' => 'Aprende vocabulario de turismo y lugares de interés',
            
            // SEO Footer
            'seo_footer_title' => '100% Tarjetas de Español Gratis - Siempre Gratis',
            'seo_footer_intro' => 'WordWalker ofrece tarjetas de español completamente gratuitas',
            'seo_footer_intro_detail' => 'sin costos ocultos, sin suscripciones y sin niveles premium. Nuestro compromiso es simple:',
            'seo_footer_commitment' => 'aprendizaje de español gratuito para todos, para siempre',
            'seo_no_cost_title' => '✓ Sin Costo Nunca',
            'seo_no_cost_text' => 'Todas las tarjetas, pronunciación de audio y características son 100% gratuitas. No se requieren pagos.',
            'seo_no_subscription_title' => '✓ Sin Suscripción',
            'seo_no_subscription_text' => 'Nunca te preocupes por tarifas mensuales o períodos de prueba. Accede a todo libremente en cualquier momento.',
            'seo_always_free_title' => '✓ Siempre Gratis',
            'seo_always_free_text' => 'Nuestra promesa: estas tarjetas de español permanecerán gratis para siempre, para todos.',
            'seo_comparison_text' => 'A diferencia de otras plataformas de tarjetas que cobran por características premium,',
            'seo_wordwalker_provides' => 'WordWalker proporciona práctica de vocabulario en español gratuita',
            'seo_with_audio' => 'con pronunciación de audio en todas las categorías. Aprende español a tu propio ritmo con nuestras',
            'seo_free_interactive' => 'tarjetas interactivas gratuitas',
            'seo_covering' => 'que cubren comida, viajes, negocios, gramática y más - todo sin gastar un centavo.',
            'seo_start_learning' => 'Comienza a aprender español hoy con nuestras tarjetas gratuitas - visita <a href="https://www.facebook.com/groups/2642136512829821">nuestro grupo de facebook</a> para las últimas actualizaciones.',
        ]
    ];
    
    return $translations[$lang] ?? $translations['en'];
}

/**
 * Get the current interface language from session or default to English
 */
function getCurrentLanguage() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Check URL parameter first
    if (isset($_GET['lang']) && in_array($_GET['lang'], ['en', 'es'])) {
        $_SESSION['interface_lang'] = $_GET['lang'];
        return $_GET['lang'];
    }
    
    // Check session
    if (isset($_SESSION['interface_lang']) && in_array($_SESSION['interface_lang'], ['en', 'es'])) {
        return $_SESSION['interface_lang'];
    }
    
    // Default to English
    return 'en';
}

/**
 * Helper function to get a translated string
 */
function t($key, $lang = null) {
    if ($lang === null) {
        $lang = getCurrentLanguage();
    }
    $translations = getTranslations($lang);
    return $translations[$key] ?? $key;
}
