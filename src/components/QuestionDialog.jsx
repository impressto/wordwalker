/**
 * QuestionDialog Component
 * Displays the question modal with emoji, question text, and answer options
 */

import { useState, useEffect } from 'react';
import { getTranslationBoxDuration } from '../config/gameSettings';
import EmojiDisplay from './EmojiDisplay';

const QuestionDialog = ({ 
  currentQuestion, 
  showTranslation, 
  showHint, 
  hintUsed,
  firstAttempt, 
  incorrectAnswers = [], 
  onAnswerChoice,
  onHintClick,
  questionTranslation,
  onClose,
  gameMode,
  categoryProgress = { answered: 0, total: 0 }
}) => {
  const [dialogTop, setDialogTop] = useState('100px');
  const [isTranslationVisible, setIsTranslationVisible] = useState(true);

  useEffect(() => {
    const baseDuration = getTranslationBoxDuration();
    
    // If duration is 0, keep translation visible indefinitely
    if (baseDuration === 0) {
      setIsTranslationVisible(true);
      return;
    }
    
    // Only set timer if showHint is true and duration is configured
    if (!showHint) {
      setIsTranslationVisible(false);
      return;
    }
    
    setIsTranslationVisible(true);
    
    // Calculate dynamic duration based on text length
    // Average reading speed: ~200-250 words per minute = ~4 words per second
    // We'll use ~3-4 words per second for comfortable reading
    let duration = baseDuration;
    if (questionTranslation) {
      const wordCount = questionTranslation.trim().split(/\s+/).length;
      const charCount = questionTranslation.length;
      
      // Calculate reading time: 
      // - Use word count (250ms per word = 240 words/min)
      // - Add extra time for longer words (using char count)
      // - Minimum 2 seconds, maximum 10 seconds
      const wordBasedTime = wordCount * 250; // 250ms per word
      const charBasedTime = charCount * 50;  // 50ms per character for longer words
      const calculatedTime = Math.max(wordBasedTime, charBasedTime);
      
      // Apply min/max bounds
      duration = Math.max(2000, Math.min(10000, calculatedTime));
    }
    
    // Set timer to hide translation box after calculated duration
    const timer = setTimeout(() => {
      setIsTranslationVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [showHint, currentQuestion?.id, questionTranslation]);

  useEffect(() => {
    const calculatePosition = () => {
      // Look for the logo image by its alt text
      const logoImg = document.querySelector('img[alt="WordWalk Logo"]');
      if (logoImg) {
        // Get the parent container of the logo
        const logoContainer = logoImg.parentElement;
        if (logoContainer) {
          const rect = logoContainer.getBoundingClientRect();
          // Position 10px below the logo, accounting for viewport scrolling
          const topPosition = rect.bottom + 10 + window.scrollY;
          setDialogTop(`${topPosition}px`);
        }
      }
    };

    // Calculate on mount
    calculatePosition();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculatePosition);
    
    // Also recalculate on scroll since absolute/fixed positioning can be affected
    window.addEventListener('scroll', calculatePosition);
    
    // Use a small delay to ensure everything is rendered
    const timer = setTimeout(calculatePosition, 150);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
      clearTimeout(timer);
    };
  }, []);

  if (!currentQuestion) return null;

  // Get the hint from the question object, or fallback to a generic hint
  const hint = currentQuestion.hint || 'Think about the question carefully';
  
  // Calculate penalty for next wrong answer (escalating system)
  // 1st wrong: 1/2 points, 2nd wrong: full points, 3rd+ wrong: full points
  const wrongAnswerCount = incorrectAnswers.length;
  let nextPenalty;
  if (wrongAnswerCount === 0) {
    nextPenalty = Math.ceil(currentQuestion.points / 2);
  } else {
    nextPenalty = currentQuestion.points; // Full points for 2nd+ wrong answers
  }
  
  // Calculate total penalties accumulated so far (with escalating system)
  let totalPenalties = 0;
  for (let i = 0; i < incorrectAnswers.length; i++) {
    if (i === 0) {
      totalPenalties += Math.ceil(currentQuestion.points / 2);
    } else {
      totalPenalties += currentQuestion.points;
    }
  }
  
  // Calculate current potential points after all penalties
  // Start with original points (or half if hint used), then subtract all penalties
  const basePoints = hintUsed 
    ? Math.floor(currentQuestion.points / 2) 
    : currentQuestion.points;
  
  const currentPotentialPoints = basePoints - totalPenalties;

  return (
    <div id="question-dialog" style={{
      position: 'fixed',
      top: dialogTop,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      padding: '20px',
      borderRadius: '15px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      zIndex: 1010,
      animation: 'fadeInOnly 0.5s ease-out',
      minWidth: '300px',
      maxWidth: 'min(85vw, 380px)',
    }}>
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          title="Close question"
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '30px',
            height: '30px',
            border: 'none',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            color: '#333',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            lineHeight: '1',
            padding: '0',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(211, 47, 47, 0.8)';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            e.target.style.color = '#333';
          }}
        >
          ✕
        </button>
      )}
      <div id="question-emoji" style={{ 
        animation: 'fadeInScale 0.6s ease-out',
      }}>
        <EmojiDisplay 
          emoji={currentQuestion.emoji} 
          category={currentQuestion.category}
          size="60px"
        />
      </div>
      
      <div id="question-text" style={{
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '10px',
        textAlign: 'center',
        color: '#000000',
      }}>
        {currentQuestion.question}
      </div>
      
      {/* Display hint below question when hintIsQuestion is true in multichoice mode */}
      {gameMode === 'multichoice' && currentQuestion.hintIsQuestion && currentQuestion.hint && (
        <div style={{
          fontSize: '14px',
          color: '#666',
          textAlign: 'center',
          fontStyle: 'italic',
          marginTop: '-5px',
          marginBottom: '5px',
        }}>
          {currentQuestion.hint}
        </div>
      )}
      
      {/* Hint Button and English Translation */}
      {firstAttempt && !showHint && questionTranslation && (
        <button
          id="hint-button"
          onClick={onHintClick}
          disabled={hintUsed}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '15px',
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
          💡 Show English (-{Math.ceil(currentQuestion.points / 2)}pts)
        </button>
      )}
      
      {/* Display English translation when hint is shown */}
      {showHint && isTranslationVisible && questionTranslation && (
        <div style={{
          backgroundColor: '#FFF3E0',
          padding: '12px 20px',
          borderRadius: '8px',
          border: '2px solid #FF9800',
          animation: 'fadeInScale 0.4s ease-out',
          width: '120%',
          minWidth: '350px',
          boxSizing: 'border-box',
          margin: '0 auto',
          position: 'relative',
          left: '-10%',
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
            Points reduced to {basePoints}
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
                fontSize: '16px',
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
            Try again! (Next wrong: -{nextPenalty} pts)
          </div>
        </div>
      )}
      
      {/* Points Indicator - show at bottom on first attempt, or if there are penalties */}
      {(firstAttempt || incorrectAnswers.length > 0) && (
        <div id="potential-points" style={{
          marginTop: '8px',
          padding: '6px 12px',
          backgroundColor: currentPotentialPoints < 0 
            ? 'rgba(211, 47, 47, 0.15)' 
            : (hintUsed || incorrectAnswers.length > 0) 
              ? 'rgba(255, 152, 0, 0.15)' 
              : 'rgba(76, 175, 80, 0.15)',
          borderRadius: '8px',
          border: `2px solid ${
            currentPotentialPoints < 0 
              ? '#d32f2f' 
              : (hintUsed || incorrectAnswers.length > 0) 
                ? '#FF9800' 
                : '#4CAF50'
          }`,
          animation: (hintUsed || incorrectAnswers.length > 0) ? 'pointsUpdate 0.4s ease-out' : 'none',
        }}>
          <style>
            {`
              @keyframes pointsUpdate {
                0% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.1);
                  background-color: rgba(255, 152, 0, 0.3);
                }
                100% {
                  transform: scale(1);
                }
              }
            `}
          </style>
          <div id="potential-points-value" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: currentPotentialPoints < 0 
              ? '#d32f2f' 
              : (hintUsed || incorrectAnswers.length > 0) 
                ? '#E65100' 
                : '#2E7D32',
            fontSize: '15px',
            fontWeight: 'bold',
          }}>
            <span id="potential-points-icon" style={{ fontSize: '18px' }}>
              {currentPotentialPoints < 0 ? '⚠️' : '💎'}
            </span>
            <span id="potential-points-text">
              {currentPotentialPoints < 0 
                ? `${currentPotentialPoints} points (PENALTY!)` 
                : firstAttempt && incorrectAnswers.length === 0 && !hintUsed
                  ? `${currentPotentialPoints} points available`
                  : `${currentPotentialPoints} points`
              }
            </span>
          </div>
          
          {/* Show breakdown of penalties */}
          {(hintUsed || incorrectAnswers.length > 0) && (
            <div id="potential-points-breakdown" style={{
              fontSize: '11px',
              color: '#d32f2f',
              textAlign: 'center',
              marginTop: '4px',
              lineHeight: '1.3',
            }}>
              {hintUsed && (
                <div style={{ fontStyle: 'italic' }}>
                  Hint: -{Math.ceil(currentQuestion.points / 2)} pts
                </div>
              )}
              {incorrectAnswers.length > 0 && (
                <div style={{ fontStyle: 'italic' }}>
                  {incorrectAnswers.length} wrong answer{incorrectAnswers.length > 1 ? 's' : ''}: -{totalPenalties} pts
                  {incorrectAnswers.length >= 2 && <span style={{ color: '#b71c1c', fontWeight: 'bold' }}> (escalating!)</span>}
                </div>
              )}
              {currentPotentialPoints < 0 && (
                <div style={{ 
                  fontWeight: 'bold', 
                  marginTop: '4px',
                  color: '#b71c1c'
                }}>
                  You'll lose {Math.abs(currentPotentialPoints)} points if correct!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progress bar showing category progress - beneath potential points */}
      {categoryProgress.total > 0 && (
        <div 
          id="category-progress-bar"
          style={{ 
            width: '100%',
            height: '14px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '7px',
            marginTop: '8px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${(categoryProgress.answered / categoryProgress.total) * 100}%`,
              backgroundColor: categoryProgress.answered === categoryProgress.total
                ? '#FFD700'
                : '#4CAF50',
              borderRadius: '7px',
              transition: 'width 0.3s ease',
            }}
          />
          {/* Progress text overlay */}
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              whiteSpace: 'nowrap',
            }}
          >
            {categoryProgress.answered}/{categoryProgress.total} mastered
          </span>
        </div>
      )}

      {/* Development Mode: Display Question ID */}
      {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
        <div id="dev-question-id" style={{
          marginTop: '8px',
          padding: '4px 8px',
          fontSize: '10px',
          color: '#666',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
          fontFamily: 'monospace',
          textAlign: 'center',
        }}>
          ID: {currentQuestion.id}
        </div>
      )}
    </div>
  );
};

export default QuestionDialog;
