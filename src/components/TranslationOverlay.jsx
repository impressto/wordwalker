/**
 * TranslationOverlay Component
 * Shows the English translation and points earned after a correct answer
 */

import { translations } from '../config/translations';

const TranslationOverlay = ({ currentQuestion }) => {
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
      gap: '15px',
      backgroundColor: 'rgba(76, 175, 80, 0.95)',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      zIndex: 11,
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{
        fontSize: '50px',
        marginBottom: '10px',
      }}>
        ✅
      </div>
      
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
      }}>
        {currentQuestion.correctAnswer} = {translations[currentQuestion.correctAnswer] || currentQuestion.correctAnswer}
      </div>
      
      <div style={{
        fontSize: '16px',
        color: 'white',
        marginTop: '10px',
        fontStyle: 'italic',
      }}>
        +{currentQuestion.points} points!
      </div>
    </div>
  );
};

export default TranslationOverlay;
