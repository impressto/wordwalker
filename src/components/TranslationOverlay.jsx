/**
 * TranslationOverlay Component
 * Shows the English translation and points earned after a correct answer
 * Also displays streak bonus when a milestone is reached
 */

import { translations } from '../config/translations';

const TranslationOverlay = ({ currentQuestion, firstAttempt = true, streakMilestone = null }) => {
  if (!currentQuestion) return null;

  // Get the English translation
  const englishTranslation = translations[currentQuestion.correctAnswer] || currentQuestion.correctAnswer;
  const spanishWord = currentQuestion.correctAnswer;
  
  // Check if Spanish and English are the same (case-insensitive)
  const wordsAreSame = spanishWord.toLowerCase() === englishTranslation.toLowerCase();

  return (
    <div id="translation-overlay" style={{
      position: 'absolute',
      top: 'calc(35% + 15px)',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      backgroundColor: 'rgba(76, 175, 80, 0.95)',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      zIndex: 35,
      animation: 'fadeIn 0.3s ease-out',
      minWidth: '280px',
      maxWidth: '90vw',
    }}>
      <div id="translation-checkmark" style={{
        fontSize: '50px',
        marginBottom: '10px',
      }}>
        ✅
      </div>
      
      <div id="translation-text" style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
      }}>
        {wordsAreSame ? spanishWord : `${spanishWord} = ${englishTranslation}`}
      </div>
      
      {firstAttempt && (
        <div id="translation-points" style={{
          fontSize: '16px',
          color: 'white',
          marginTop: '10px',
          fontStyle: 'italic',
        }}>
          +{currentQuestion.points} points!
        </div>
      )}
      
      {/* Show streak bonus message if milestone reached */}
      {streakMilestone && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginTop: '15px',
          padding: '15px 25px',
          backgroundColor: 'rgba(255, 152, 0, 0.95)',
          borderRadius: '12px',
          animation: 'streakPulse 2.5s ease-in-out',
        }}>
          <style>
            {`
              @keyframes streakPulse {
                0%, 100% {
                  opacity: 0;
                  transform: scale(0.9);
                }
                10%, 90% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}
          </style>
          <div style={{ fontSize: '40px' }}>🔥</div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
          }}>
            {streakMilestone.streak} STREAK!
          </div>
          <div style={{
            fontSize: '18px',
            color: 'white',
            fontWeight: 'bold',
          }}>
            +{streakMilestone.bonusPoints} BONUS!
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationOverlay;
