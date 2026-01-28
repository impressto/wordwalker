#!/bin/bash

# Replace greetings_101 to greetings_200 with grammar_201 to grammar_300
file="src/config/questions/grammar.js"

for i in {101..200}; do
    new_num=$((i + 100))
    sed -i "s/id: 'greetings_${i}'/id: 'grammar_${new_num}'/g" "$file"
done

# Count the replacements
count=$(grep -c "id: 'grammar_[23][0-9][0-9]'" "$file")
echo "Replaced $count IDs from greetings_ to grammar_"

# Show first 3 examples
echo "First 3 examples:"
grep "id: 'grammar_[23]" "$file" | head -3
