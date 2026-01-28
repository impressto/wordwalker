import { useState } from 'react';
import './ResumeDialog.css';
import { questions } from '../config/questions';
import gameSettings from '../config/gameSettings';
import NewGameConfirmationDialog from './NewGameConfirmationDialog';
import { getTotalMasteredQuestions } from '../utils/questionTracking';
import packageJson from '../../package.json';

const ResumeDialog = ({ onResume, onNewGame, savedStats }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Calculate total questions and progress
  const totalQuestions = questions.length;
  // Sum first-try correct across all categories
  const correctFirstTry = Object.values(savedStats?.correctFirstTryIds || {})
    .reduce((total, categoryIds) => total + categoryIds.length, 0);
  const remaining = totalQuestions - correctFirstTry;
  
  // Get total mastered questions (permanent learning data)
  const masteredCount = getTotalMasteredQuestions(savedStats?.correctAnswersByCategory || {});
  
  // Threshold for showing confirmation (configurable in gameSettings)
  const shouldShowConfirmation = masteredCount >= gameSettings.persistence.confirmationThreshold;
  
  const handleNewGameClick = () => {
    if (shouldShowConfirmation) {
      setShowConfirmation(true);
    } else {
      onNewGame();
    }
  };
  
  const handleConfirmNewGame = () => {
    setShowConfirmation(false);
    onNewGame();
  };
  
  const handleCancelNewGame = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="resume-dialog-overlay">
      <div className="resume-dialog">
        <h2>Welcome Back!</h2>
        <p>You have a saved game. Would you like to resume or start fresh?</p>
        
        {savedStats && (
          <div className="saved-stats">
            <div className="stat-item">
              <span className="stat-label">Points:</span>
              <span className="stat-value">{savedStats.totalPoints}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Current Streak:</span>
              <span className="stat-value">{savedStats.streak}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Learning Progress:</span>
              <span className="stat-value">{correctFirstTry}/{totalQuestions} mastered</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Remaining:</span>
              <span className="stat-value">{remaining} to master</span>
            </div>
          </div>
        )}
        
        <div className="resume-dialog-buttons">
          <button className="btn-resume" onClick={onResume}>
            📖 Resume Game
          </button>
          <button className="btn-new-game" onClick={handleNewGameClick}>
            ✨ New Game
          </button>
        </div>
        
        <div className="github-link">
          <a href="https://github.com/impressto/wordwalker" target="_blank" rel="noopener noreferrer">
            ⭐ View Source Code on GitHub
          </a>
          
          &nbsp; <a href="https://wordwalker.ca/contact.php" target="_blank" rel="noopener noreferrer">
            💬 Contact Support
          </a>
          
          <div className="version-info">v{packageJson.version}</div>
        </div>
      </div>
      
      {showConfirmation && (
        <NewGameConfirmationDialog
          masteredCount={masteredCount}
          onConfirm={handleConfirmNewGame}
          onCancel={handleCancelNewGame}
        />
      )}
    </div>
  );
};

export default ResumeDialog;
