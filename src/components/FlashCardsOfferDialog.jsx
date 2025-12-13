import { useState, useEffect } from 'react';
import './FlashCardsOfferDialog.css';

/**
 * FlashCardsOfferDialog Component
 * Asks the player if they want to see flash cards after completing a category with a streak
 */
const FlashCardsOfferDialog = ({ streak, onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Add a small delay before showing the dialog to allow DOM layout calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flash-cards-offer-dialog ${isVisible ? 'visible' : ''}`}>
      <div className="offer-content">
        <div className="offer-icon">🎓</div>
        
        <h2>Great Job!</h2>
        
        <div className="offer-message">
          <p className="highlight">
            You completed this category with a streak of {streak}! 🔥
          </p>
          
          <p className="question">
            Would you like to review some flash cards?
          </p>
          
          <div className="explanation">
            <p>Flash cards will help reinforce what you've learned.</p>
            <p>You'll see <strong>10 interactive cards</strong> you can flip and review.</p>
          </div>
        </div>
        
        <div className="offer-buttons">
          <button className="btn-decline" onClick={onDecline}>
            No, Thanks
          </button>
          <button className="btn-accept" onClick={onAccept}>
            Yes, Show Me! 📚
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashCardsOfferDialog;
