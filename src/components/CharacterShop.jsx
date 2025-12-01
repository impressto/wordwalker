/**
 * CharacterShop Component
 * Displays available characters for purchase
 */

import { useState, useEffect } from 'react';
import './CharacterShop.css';

const CharacterShop = ({ totalPoints, ownedCharacters, currentCharacter, onPurchase, onSelectCharacter, onClose }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isReady, setIsReady] = useState(false);

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
          <h2>Character Shop</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="current-points">
          Points Available: <strong>{totalPoints}</strong>
        </div>

        <div className="characters-grid">
          {characters.map((character) => {
            const isOwned = character.id === 'default' || ownedCharacters.includes(character.id);
            const isSelected = character.id === currentCharacter;
            const canAfford = totalPoints >= character.cost;

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
                    {isSelected
                      ? '✓ Selected'
                      : isOwned
                      ? 'Select'
                      : canAfford
                      ? `Buy for ${character.cost}`
                      : `Need ${character.cost - totalPoints} more`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

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
