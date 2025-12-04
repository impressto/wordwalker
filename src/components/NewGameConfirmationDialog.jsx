import { useState, useEffect } from 'react';
import './NewGameConfirmationDialog.css';

const NewGameConfirmationDialog = ({ masteredCount, onConfirm, onCancel }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Add a small delay before showing the dialog to allow DOM layout calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50); // 50ms delay for layout calculation

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`new-game-confirmation-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="new-game-confirmation-dialog">
        <div className="confirmation-icon">⚠️</div>
        
        <h2>Start New Game?</h2>
        
        <div className="confirmation-message">
          <p className="highlight">
            You've mastered {masteredCount} question{masteredCount !== 1 ? 's' : ''}!
          </p>
          
          <div className="explanation">
            <p><strong>What will happen:</strong></p>
            <ul>
              <li>✅ Your learned progress will be <strong>kept</strong> ({masteredCount} mastered questions)</li>
              <li>❌ Your score will be <strong>reset to 0</strong></li>
              <li>❌ Your streak will be <strong>reset to 0</strong></li>
            </ul>
          </div>
          
          <p className="note">
            You can always <strong>Resume</strong> your current game instead.
          </p>
        </div>
        
        <div className="confirmation-buttons">
          <button className="btn-cancel" onClick={onCancel}>
            ← Keep Playing
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            🆕 Start New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGameConfirmationDialog;
