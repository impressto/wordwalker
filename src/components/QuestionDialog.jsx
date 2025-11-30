/**
 * QuestionDialog Component
 * Displays the question modal with emoji, question text, and answer options
 */

const QuestionDialog = ({ 
  currentQuestion, 
  showTranslation, 
  showHint, 
  hintUsed,
  firstAttempt, 
  incorrectAnswers = [], 
  onAnswerChoice,
  onHintClick,
  questionTranslation
}) => {
  if (!currentQuestion) return null;

  // Get the hint from the question object, or fallback to a generic hint
  const hint = currentQuestion.hint || 'Think about the question carefully';
  
  // Calculate potential points (accounting for hint usage)
  const potentialPoints = hintUsed 
    ? Math.floor(currentQuestion.points / 2) 
    : currentQuestion.points;
  
  // Calculate penalty for displaying on hint button (negative value)
  const penalty = Math.floor(currentQuestion.points / 2);

  return (
    <div id="question-dialog" style={{
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
      zIndex: 30,
      animation: 'fadeIn 0.5s ease-out',
      minWidth: '320px',
      maxWidth: '90vw',
    }}>
      <div id="question-emoji" style={{ 
        fontSize: '60px',
        animation: 'fadeInScale 0.6s ease-out',
      }}>
        {currentQuestion.emoji}
      </div>
      
      <div id="question-text" style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '10px',
        textAlign: 'center',
        color: '#000000',
      }}>
        {currentQuestion.question}
      </div>
      
      {/* Hint Button and English Translation */}
      {firstAttempt && !showHint && (
        <button
          onClick={onHintClick}
          disabled={hintUsed}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: hintUsed ? '#cccccc' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: hintUsed ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.2s',
            opacity: hintUsed ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!hintUsed) {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.backgroundColor = '#F57C00';
            }
          }}
          onMouseLeave={(e) => {
            if (!hintUsed) {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = '#FF9800';
            }
          }}
        >
          💡 Show English (-{penalty} points from {currentQuestion.points})
        </button>
      )}
      
      {/* Display English translation when hint is shown */}
      {showHint && questionTranslation && (
        <div style={{
          backgroundColor: '#FFF3E0',
          padding: '12px 20px',
          borderRadius: '8px',
          border: '2px solid #FF9800',
          animation: 'fadeInScale 0.4s ease-out',
        }}>
          <div style={{
            color: '#E65100',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
            🇬🇧 {questionTranslation}
          </div>
          <div style={{
            color: '#d32f2f',
            fontSize: '14px',
            marginTop: '6px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
            Points reduced to {potentialPoints}
          </div>
        </div>
      )}
      
      <div id="question-options" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
      }}>
        {currentQuestion.options.map((option, index) => {
          const isIncorrect = incorrectAnswers.includes(option);
          const isDisabled = showTranslation || isIncorrect;
          
          return (
            <button
              key={index}
              id={`question-option-${index}`}
              className="question-option-button"
              onClick={() => onAnswerChoice(option)}
              disabled={isDisabled}
              style={{
                padding: '12px 24px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: isIncorrect ? '#d32f2f' : (showTranslation ? '#cccccc' : '#2196F3'),
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
                opacity: isDisabled ? 0.5 : 1,
                textDecoration: isIncorrect ? 'line-through' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isDisabled) {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.backgroundColor = '#1976D2';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.backgroundColor = '#2196F3';
                } else if (isIncorrect) {
                  e.target.style.backgroundColor = '#d32f2f';
                }
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
      
      {!firstAttempt && (
        <div id="question-feedback" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginTop: '10px',
        }}>
          <div id="question-incorrect-message" style={{
            color: '#d32f2f',
            fontSize: '16px',
            fontWeight: 'bold',
          }}>
            Try again! (No points for incorrect answers)
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDialog;
