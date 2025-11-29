import './ResumeDialog.css';

const ResumeDialog = ({ onResume, onNewGame, savedStats }) => {
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
              <span className="stat-label">Progress:</span>
              <span className="stat-value">{savedStats.checkpointsAnswered} checkpoints</span>
            </div>
          </div>
        )}
        
        <div className="resume-dialog-buttons">
          <button className="btn-resume" onClick={onResume}>
            📖 Resume Game
          </button>
          <button className="btn-new-game" onClick={onNewGame}>
            ✨ New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeDialog;
