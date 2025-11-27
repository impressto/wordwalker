/**
 * QuestionDialog Component
 * Displays the question modal with emoji, question text, and answer options
 */

const QuestionDialog = ({ currentQuestion, showTranslation, firstAttempt, onAnswerChoice }) => {
  if (!currentQuestion) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 'calc(35% + 15px)',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      zIndex: 10,
      animation: 'fadeIn 0.5s ease-out',
    }}>
      <div style={{ 
        fontSize: '60px',
        animation: 'fadeInScale 0.6s ease-out',
      }}>
        {currentQuestion.emoji}
      </div>
      
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '10px',
      }}>
        {currentQuestion.question}
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
      }}>
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerChoice(option)}
            disabled={showTranslation}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: showTranslation ? '#cccccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: showTranslation ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'all 0.2s',
              opacity: showTranslation ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!showTranslation) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = '#1976D2';
              }
            }}
            onMouseLeave={(e) => {
              if (!showTranslation) {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = '#2196F3';
              }
            }}
          >
            {option}
          </button>
        ))}
      </div>
      
      {!firstAttempt && (
        <div style={{
          color: '#d32f2f',
          fontSize: '16px',
          fontWeight: 'bold',
          marginTop: '10px',
        }}>
          Try again! (No points for incorrect answers)
        </div>
      )}
    </div>
  );
};

export default QuestionDialog;
