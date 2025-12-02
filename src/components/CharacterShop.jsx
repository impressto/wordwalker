/**
 * CharacterShop Component
 * Displays available characters and themes for purchase
 */

import { useState, useEffect } from 'react';
import { getShopThemes } from '../config/themeShopConfig';
import './CharacterShop.css';

const CharacterShop = ({ totalPoints, ownedCharacters, currentCharacter, onPurchase, onSelectCharacter, ownedThemes, currentTheme, onPurchaseTheme, onSelectTheme, onClose }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState('characters'); // 'characters' or 'themes'

  // Debug logging for state issues
  useEffect(() => {
    console.log('[CharacterShop] State update:', {
      totalPoints,
      currentCharacter,
      ownedCharacters,
      currentTheme,
      ownedThemes,
      activeTab
    });
  }, [totalPoints, currentCharacter, ownedCharacters, currentTheme, ownedThemes, activeTab]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger fade-in after component is mounted and ready to render
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Character definitions with costs
  const characters = [
    {
      id: 'default',
      name: 'Walter',
      spriteFile: 'walker-default.png',
      avatarFile: 'walker-default-avatar.png',
      cost: 0,
      description: 'Your starting character',
    },
    {
      id: 'blue',
      name: 'Charlie',
      spriteFile: 'walker-blue.png',
      avatarFile: 'walker-blue-avatar.png',
      cost: 50,
      description: 'A speedy blue character',
    },
    {
      id: 'dog',
      name: 'Chewie',
      spriteFile: 'walker-dog.png',
      avatarFile: 'walker-dog-avatar.png',
      cost: 75,
      description: 'A loyal canine companion',
    },
    {
      id: 'cat',
      name: 'Tiger',
      spriteFile: 'walker-cat.png',
      avatarFile: 'walker-cat-avatar.png',
      cost: 60,
      description: 'An independent feline friend',
    },
    {
      id: 'emma',
      name: 'Emma',
      spriteFile: 'walker-emma.png',
      avatarFile: 'walker-emma-avatar.png',
      cost: 80,
      description: 'A charming character',
    },
    {
      id: 'asuka',
      name: 'Asuka',
      spriteFile: 'walker-asuka.png',
      avatarFile: 'walker-asuka-avatar.png',
      cost: 85,
      description: 'A spirited adventurer',
    },
  ];

  const handleCharacterAction = (character) => {
    if (character.id === 'default' || ownedCharacters.includes(character.id)) {
      // Already own this character, just select it
      onSelectCharacter(character.id);
    } else {
      // Try to purchase
      if (totalPoints >= character.cost) {
        onPurchase(character.id, character.cost);
      }
    }
  };

  return (
    <div className={`character-shop-overlay ${isReady ? 'ready' : ''}`}>
      <div className="character-shop-dialog">
        <div className="shop-header">
          <h2>Shop</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="current-points">
          Points Available: <strong>{totalPoints}</strong>
        </div>

        {/* Tab Navigation */}
        <div className="shop-tabs">
          <button
            className={`tab-btn ${activeTab === 'characters' ? 'active' : ''}`}
            onClick={() => setActiveTab('characters')}
          >
            Characters
          </button>
          <button
            className={`tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            Themes
          </button>
        </div>

        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div className="characters-grid">
            {characters.map((character) => {
              const ownedList = Array.isArray(ownedCharacters) ? ownedCharacters : [];
              const isOwned = character.id === 'default' || ownedList.includes(character.id);
              const isSelected = character.id === currentCharacter;
              const canAfford = (totalPoints ?? 0) >= character.cost;

              return (
                <div
                  key={character.id}
                  className={`character-card ${isSelected ? 'selected' : ''} ${isOwned ? 'owned' : ''} ${!canAfford && !isOwned ? 'unaffordable' : ''}`}
                >
                  <div className="character-preview">
                    <img
                      src={`${import.meta.env.BASE_URL}images/walkers/${character.avatarFile}`}
                      alt={character.name}
                    />
                  </div>

                  <div className="character-info">
                    <h3>{character.name}</h3>
                    <p className="description">{character.description}</p>

                    {character.cost > 0 ? (
                      <div className="cost">
                        {isOwned ? (
                          <span className="owned-badge">✓ Owned</span>
                        ) : (
                          <span className={canAfford ? 'affordable' : 'unaffordable'}>
                            {character.cost} points
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="cost">
                        <span className="free">Free</span>
                      </div>
                    )}

                    <button
                      className={`action-btn ${isSelected ? 'selected-btn' : isOwned ? 'select-btn' : canAfford ? 'buy-btn' : 'disabled-btn'}`}
                      onClick={() => handleCharacterAction(character)}
                      disabled={!canAfford && !isOwned}
                    >
                      {isSelected && '✓ Selected'}
                      {!isSelected && isOwned && 'Select'}
                      {!isSelected && !isOwned && canAfford && `Buy for ${character.cost}`}
                      {!isSelected && !isOwned && !canAfford && `Need ${Math.max(0, character.cost - totalPoints)} more`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div className="themes-grid">
            {getShopThemes().map((theme) => {
              const ownedList = Array.isArray(ownedThemes) ? ownedThemes : [];
              const isOwned = theme.id === 'default' || ownedList.includes(theme.id);
              const isSelected = theme.id === currentTheme;
              const canAfford = (totalPoints ?? 0) >= theme.cost;

              const handleThemeAction = () => {
                if (theme.id === 'default' || isOwned) {
                  onSelectTheme(theme.id);
                } else {
                  if (totalPoints >= theme.cost) {
                    onPurchaseTheme(theme.id, theme.cost);
                  }
                }
              };

              return (
                <div
                  key={theme.id}
                  className={`theme-card ${isSelected ? 'selected' : ''} ${isOwned ? 'owned' : ''} ${!canAfford && !isOwned ? 'unaffordable' : ''}`}
                >
                  <div className="theme-preview">
                    <img
                      src={`${import.meta.env.BASE_URL}images/themes/${theme.id}/${theme.thumbnail}`}
                      alt={theme.name}
                    />
                  </div>

                  <div className="theme-info">
                    <h3>{theme.name}</h3>
                    <p className="description">{theme.description}</p>

                    {theme.cost > 0 ? (
                      <div className="cost">
                        {isOwned ? (
                          <span className="owned-badge">✓ Owned</span>
                        ) : (
                          <span className={canAfford ? 'affordable' : 'unaffordable'}>
                            {theme.cost} points
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="cost">
                        <span className="free">Free</span>
                      </div>
                    )}

                    <button
                      className={`action-btn ${isSelected ? 'selected-btn' : isOwned ? 'select-btn' : canAfford ? 'buy-btn' : 'disabled-btn'}`}
                      onClick={handleThemeAction}
                      disabled={!canAfford && !isOwned}
                    >
                      {isSelected && '✓ Selected'}
                      {!isSelected && isOwned && 'Select'}
                      {!isSelected && !isOwned && canAfford && `Buy for ${theme.cost}`}
                      {!isSelected && !isOwned && !canAfford && `Need ${Math.max(0, theme.cost - totalPoints)} more`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="shop-footer">
          <button className="close-shop-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterShop;
