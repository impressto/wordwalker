/**
 * TranslationOverlay Component
 * Shows the English translation and points earned after a correct answer
 * Also displays streak bonus when a milestone is reached
 */

import { useState, useEffect } from 'react';
import { translations } from '../config/translations/answers/index';
import gameSettings, { getStreakColor, getStreakGradientColor } from '../config/gameSettings';
import pronunciationAudio from '../utils/pronunciationAudio';

const TranslationOverlay = ({ currentQuestion, firstAttempt = true, streak = 0, hintUsed = false }) => {
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  if (!currentQuestion) return null;

  // Get the English translation
  const englishTranslation = translations[currentQuestion.correctAnswer] || currentQuestion.correctAnswer;
  const spanishWord = currentQuestion.correctAnswer;
  
  // Check if Spanish and English are the same (case-insensitive)
  const wordsAreSame = spanishWord.toLowerCase() === englishTranslation.toLowerCase();
  
  // Check if current streak is a milestone
  const isStreakMilestone = streak > 0 && streak % gameSettings.streak.bonusThreshold === 0;
  
  // Calculate actual points earned (accounting for hint usage)
  const pointsEarned = hintUsed 
    ? Math.floor(currentQuestion.points / 2) 
    : currentQuestion.points;

  // Listen for online/offline status changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if audio file exists for this word
  useEffect(() => {
    console.log('🔍 Audio check starting...', {
      isOnline,
      questionId: currentQuestion?.id,
      category: currentQuestion?.category
    });

    if (!isOnline) {
      console.log('❌ Offline - hiding audio');
      setAudioAvailable(false);
      return;
    }

    let isMounted = true;

    const checkAudio = async () => {
      console.log('📡 Checking audio exists for:', currentQuestion);
      const exists = await pronunciationAudio.checkAudioExists(currentQuestion);
      console.log('✅ Audio check result:', exists);
      
      if (isMounted) {
        setAudioAvailable(exists);
        // Preload if available for faster playback
        if (exists) {
          console.log('📥 Preloading audio...');
          pronunciationAudio.preloadAudio(currentQuestion);
        }
      }
    };

    checkAudio();

    return () => {
      isMounted = false;
    };
  }, [currentQuestion, isOnline]);

  // Handle play button click
  const handlePlayAudio = async () => {
    if (isPlaying) return; // Prevent multiple clicks
    
    setIsPlaying(true);
    const success = await pronunciationAudio.playPronunciation(currentQuestion);
    
    // Reset playing state after a short delay (assume 2-3 seconds for most pronunciations)
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  return (
    <div id="translation-overlay" style={{
      position: 'fixed',
      top: '40%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      backgroundColor: 'rgba(76, 175, 80, 0.85)', // Semi-transparent green
      padding: '20px',
      borderRadius: '15px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      zIndex: 1010,
      animation: 'fadeIn 0.3s ease-out',
      minWidth: '350px',
      maxWidth: 'min(85vw, 380px)',
    }}>
      <div id="translation-checkmark" style={{
        fontSize: '50px',
        marginBottom: '10px',
      }}>
        ✅
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
      }}>
        <div id="translation-text" style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
        }}>
          {wordsAreSame ? spanishWord : `${spanishWord} = ${englishTranslation}`}
        </div>

        {/* Audio play button - only show if online and audio exists */}
        {audioAvailable && isOnline && (
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: isPlaying ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
              border: '2px solid white',
              borderRadius: '20px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isPlaying ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isPlaying ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isPlaying) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isPlaying) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>
              {isPlaying ? '🔊' : '🔉'}
            </span>
            <span>{isPlaying ? 'Playing...' : 'Hear pronunciation'}</span>
          </button>
        )}
      </div>
      
      {firstAttempt && (
        <div id="translation-points" style={{
          fontSize: '16px',
          color: 'white',
          marginTop: '10px',
          fontStyle: 'italic',
        }}>
          +{pointsEarned} points!
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
            background: `linear-gradient(135deg, ${getStreakColor(streak)}, ${getStreakGradientColor(streak)})`,
            borderRadius: '15px',
            animation: 'streakPulse 2.5s ease-in-out',
            position: 'relative',
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4)`, // Neutral glow effect
            opacity: 0.85,
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
              fontSize: '36px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}>
              STREAK! 🔥
            </div>
            <div style={{
              fontSize: '20px',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}>
              You got {streak} in a row!
            </div>
            <div style={{
              fontSize: '18px',
              color: 'white',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              marginTop: '4px',
            }}>
              +{gameSettings.streak.bonusPoints} BONUS POINTS
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationOverlay;
