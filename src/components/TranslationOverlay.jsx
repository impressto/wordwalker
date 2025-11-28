/**
 * TranslationOverlay Component
 * Shows the English translation and points earned after a correct answer
 * Also displays streak bonus when a milestone is reached
 */

import { translations } from '../config/answer-translations';
import gameSettings, { getStreakColor, getStreakGradientColor } from '../config/gameSettings';

const TranslationOverlay = ({ currentQuestion, firstAttempt = true, streak = 0 }) => {
  if (!currentQuestion) return null;

  // Get the English translation
  const englishTranslation = translations[currentQuestion.correctAnswer] || currentQuestion.correctAnswer;
  const spanishWord = currentQuestion.correctAnswer;
  
  // Check if Spanish and English are the same (case-insensitive)
  const wordsAreSame = spanishWord.toLowerCase() === englishTranslation.toLowerCase();
  
  // Check if current streak is a milestone
  const isStreakMilestone = streak > 0 && streak % gameSettings.streak.bonusThreshold === 0;

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
      {isStreakMilestone && (
        <div 
          key={`streak-${streak}`}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '25px',
            marginTop: '20px',
            padding: '25px 50px',
            backgroundColor: `${getStreakColor(streak)}E6`, // Use streak color with opacity (E6 = 90%)
            borderRadius: '15px',
            animation: 'streakPulse 2.5s ease-in-out',
            position: 'relative',
            boxShadow: `0 8px 32px ${getStreakColor(streak)}80`, // Glow effect using streak color
          }}>
          <style>
            {`
              @keyframes streakPulse {
                0% {
                  opacity: 0;
                  transform: scale(0.9);
                }
                20%, 100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              @keyframes diamondGlow {
                0%, 100% {
                  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
                }
                50% {
                  filter: drop-shadow(0 0 25px rgba(255, 255, 255, 1));
                }
              }
            `}
          </style>
          
          {/* Diamond SVG at the left */}
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 100 100"
            style={{
              animation: 'diamondGlow 2s ease-in-out infinite',
              flexShrink: 0,
            }}
          >
            {/* Determine diamond color based on streak level */}
            <defs>
              <radialGradient id="diamondGradient">
                <stop offset="0%" style={{
                  stopColor: getStreakColor(streak),
                  stopOpacity: 1
                }} />
                <stop offset="100%" style={{
                  stopColor: getStreakGradientColor(streak),
                  stopOpacity: 0.8
                }} />
              </radialGradient>
            </defs>
            
            {/* Outer glow layers */}
            <polygon 
              points="50,10 90,50 50,90 10,50" 
              fill="url(#diamondGradient)"
              opacity="0.3"
              transform="scale(1.3) translate(-7.5, -7.5)"
            />
            <polygon 
              points="50,10 90,50 50,90 10,50" 
              fill="url(#diamondGradient)"
              opacity="0.4"
              transform="scale(1.15) translate(-3.75, -3.75)"
            />
            
            {/* Main diamond */}
            <polygon 
              points="50,10 90,50 50,90 10,50" 
              fill="url(#diamondGradient)"
              opacity="0.9"
            />
            
            {/* Inner highlight for sparkle */}
            <polygon 
              points="50,30 65,50 50,70 35,50" 
              fill="#FFFFFF"
              opacity="0.6"
            />
          </svg>
          
          {/* Text content in a column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}>
              {streak} STREAK! 🔥
            </div>
            <div style={{
              fontSize: '24px',
              color: 'white',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}>
              +{gameSettings.streak.bonusPoints} BONUS!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationOverlay;
