#!/bin/bash
# Flash Cards Quick Preview Script
# 
# This script helps you quickly test and preview flash card pages
# for different categories during development.

CATEGORIES=(
    "food"
    "recreation"
    "transportation"
    "accommodation"
    "shopping"
    "people"
    "daily_routines"
    "grammar"
    "plants_animals"
    "environment"
    "business"
    "medical"
    "entertainment"
    "numbers"
    "greetings"
    "directions"
)

echo "==================================="
echo "Flash Cards Page Statistics"
echo "==================================="
echo ""

total_questions=0
total_pages=0

for category in "${CATEGORIES[@]}"; do
    file="src/config/questions/${category}.js"
    
    if [ ! -f "$file" ]; then
        echo "❌ $category: File not found"
        continue
    fi
    
    # Count questions by counting "id:" occurrences
    count=$(grep -o "id: *['\"]" "$file" | wc -l)
    pages=$(( (count + 8) / 9 ))  # Round up division by 9 (changed from 10)
    
    total_questions=$((total_questions + count))
    total_pages=$((total_pages + pages))
    
    printf "✓ %-20s %4d questions, %3d pages\n" "$category" "$count" "$pages"
done

echo ""
echo "==================================="
printf "Total: %d questions across %d pages\n" "$total_questions" "$total_pages"
echo "==================================="
echo ""
echo "Quick Test URLs:"
echo "  Business: http://localhost:8080/flashcards.php?category=business&page=1"
echo "  Food:     http://localhost:8080/flashcards.php?category=food&page=1"
echo "  Grammar:  http://localhost:8080/flashcards.php?category=grammar&page=1"
echo ""
echo "To test a specific category:"
echo "  curl -s 'http://localhost:8080/flashcards.php?category=CATEGORY&page=1' | grep -o 'Page [0-9]* of [0-9]*' | head -1"
echo ""
