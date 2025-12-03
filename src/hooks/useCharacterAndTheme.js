import { useState, useEffect } from 'react';
import gameSettings from '../config/gameSettings';
import { getCharacterFileMap } from '../config/characterConfig';
import { setActiveTheme } from '../utils/themeManager';

/**
 * Custom hook for managing character and theme state
 * Handles:
 * - Current character selection and persistence
 * - Owned characters management
 * - Walker sprite variants loading
 * - Current theme selection and persistence
 * - Owned themes management
 * - Shop visibility state
 */
export const useCharacterAndTheme = () => {
  // Character system state
  const [currentCharacter, setCurrentCharacter] = useState(() => {
    return localStorage.getItem('wordwalker-current-character') || 'default';
  });

  const [ownedCharacters, setOwnedCharacters] = useState(() => {
    const saved = localStorage.getItem('wordwalker-owned-characters');
    return saved ? JSON.parse(saved) : ['default'];
  });

  const [showCharacterShop, setShowCharacterShop] = useState(false);
  const [walkerVariants, setWalkerVariants] = useState({}); // Store loaded walker images for different characters

  // Parallax theme state - track current active theme
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('wordwalker-current-theme') || gameSettings.parallax.currentTheme;
  });

  // Owned themes state - track which themes user has purchased
  const [ownedThemes, setOwnedThemes] = useState(() => {
    const saved = localStorage.getItem('wordwalker-owned-themes');
    return saved ? JSON.parse(saved) : ['default'];
  });

  // Update theme in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('wordwalker-current-theme', currentTheme);
    setActiveTheme(currentTheme);
  }, [currentTheme]);

  // Update owned themes in localStorage when they change
  useEffect(() => {
    localStorage.setItem('wordwalker-owned-themes', JSON.stringify(ownedThemes));
  }, [ownedThemes]);

  // Load walker sprite sheets for all characters
  useEffect(() => {
    const loadWalkerVariants = async () => {
      const variants = {};
      const characterFiles = getCharacterFileMap();

      const basePath = import.meta.env.BASE_URL || '/';

      for (const [charId, filename] of Object.entries(characterFiles)) {
        const walker = new Image();
        walker.src = `${basePath}images/walkers/${filename}`;
        variants[charId] = walker;
      }

      setWalkerVariants(variants);
    };

    loadWalkerVariants();
  }, []);

  // Update walker sprite sheet when current character changes
  const getWalkerSpriteSheet = () => {
    return walkerVariants[currentCharacter] || null;
  };

  // Handler functions
  const handleOpenCharacterShop = () => {
    setShowCharacterShop(true);
  };

  const handleCloseCharacterShop = () => {
    setShowCharacterShop(false);
  };

  const handlePurchaseCharacter = (characterId, cost, currentTotalPoints, onPointsChange) => {
    if (currentTotalPoints >= cost) {
      // Deduct points
      const newPoints = currentTotalPoints - cost;
      onPointsChange(newPoints);

      // Add to owned characters and select immediately
      const updated = [...ownedCharacters, characterId];
      setOwnedCharacters(updated);
      localStorage.setItem('wordwalker-owned-characters', JSON.stringify(updated));

      // Select the new character immediately
      setCurrentCharacter(characterId);
      localStorage.setItem('wordwalker-current-character', characterId);
    }
  };

  const handleSelectCharacter = (characterId) => {
    if (ownedCharacters.includes(characterId) || characterId === 'default') {
      setCurrentCharacter(characterId);
      localStorage.setItem('wordwalker-current-character', characterId);
    }
  };

  const handlePurchaseTheme = (themeId, cost, currentTotalPoints, onPointsChange) => {
    if (currentTotalPoints >= cost) {
      // Deduct points
      const newPoints = currentTotalPoints - cost;
      onPointsChange(newPoints);

      // Add to owned themes and select immediately
      const updated = [...ownedThemes, themeId];
      setOwnedThemes(updated);
      localStorage.setItem('wordwalker-owned-themes', JSON.stringify(updated));

      // Select the new theme immediately
      setCurrentTheme(themeId);
      localStorage.setItem('wordwalker-current-theme', themeId);
      setActiveTheme(themeId);
    }
  };

  const handleSelectTheme = (themeId) => {
    if (ownedThemes.includes(themeId) || themeId === 'default') {
      setCurrentTheme(themeId);
      localStorage.setItem('wordwalker-current-theme', themeId);
      setActiveTheme(themeId);
    }
  };

  // Check if there's an affordable unbought character
  const hasAffordablePurchase = (totalPoints) => {
    const characters = [
      { id: 'default', cost: 0 },
      { id: 'blue', cost: 50 },
      { id: 'dog', cost: 75 },
      { id: 'cat', cost: 60 },
      { id: 'emma', cost: 80 },
      { id: 'asuka', cost: 85 },
    ];

    return characters.some(char =>
      char.id !== 'default' &&
      !ownedCharacters.includes(char.id) &&
      totalPoints >= char.cost
    );
  };

  return {
    // Character state
    currentCharacter,
    setCurrentCharacter,
    ownedCharacters,
    setOwnedCharacters,
    showCharacterShop,
    setShowCharacterShop,
    walkerVariants,
    getWalkerSpriteSheet,

    // Theme state
    currentTheme,
    setCurrentTheme,
    ownedThemes,
    setOwnedThemes,

    // Handlers
    handleOpenCharacterShop,
    handleCloseCharacterShop,
    handlePurchaseCharacter,
    handleSelectCharacter,
    handlePurchaseTheme,
    handleSelectTheme,
    hasAffordablePurchase,
  };
};
