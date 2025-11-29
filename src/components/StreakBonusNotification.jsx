/**
 * StreakBonusNotification Component
 * Displays a celebration notification when the user achieves a streak milestone
 */

import { useEffect, memo, useState, useRef } from 'react';
import gameSettings, { getStreakColor } from '../config/gameSettings';

const StreakBonusNotification = ({ streak, show }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(streak);
  const lastShownStreak = useRef(0);
  
  // Convert animation duration from ms to seconds for CSS
  const animationDurationSeconds = gameSettings.streak.animationDuration / 1000;
  
  useEffect(() => {
    console.log('[STREAK COMPONENT] useEffect called - show:', show, 'streak:', streak, 'lastShown:', lastShownStreak.current, 'isVisible:', isVisible);
    // Only show if parent says show AND we haven't shown this streak level yet
    if (show && streak !== lastShownStreak.current) {
      console.log('[STREAK COMPONENT] Showing with streak:', streak);
      setCurrentStreak(streak);
      setIsVisible(true);
      lastShownStreak.current = streak;
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        console.log('[STREAK COMPONENT] Hiding after timeout');
        setIsVisible(false);
      }, gameSettings.streak.notificationDuration);
      
      return () => {
        console.log('[STREAK COMPONENT] Cleanup timer');
        clearTimeout(timer);
      };
    } else {
      console.log('[STREAK COMPONENT] NOT showing - condition not met');
    }
  }, [show, streak]);
  
  if (!isVisible) {
    return null;
  }

  // Get the current streak color
  const streakColor = getStreakColor(currentStreak);
  
  return (
    <div style={{
      position: 'absolute',
      top: '30%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: `${streakColor}E6`, // Add opacity to the streak color (E6 = 90% opacity)
      padding: '30px 50px',
      borderRadius: '15px',
      boxShadow: `0 8px 32px ${streakColor}80`, // Glow effect using streak color
      zIndex: 50,
      animation: `streakFadeInOut ${animationDurationSeconds}s ease-in-out`,
    }}>
      <style>
        {`
          @keyframes streakFadeInOut {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8);
            }
            20% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            80% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8);
            }
          }
        `}
      </style>
      <div style={{
        fontSize: '60px',
      }}>
        🔥
      </div>
      
      <div style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
      }}>
        STREAK!
      </div>
      
      <div style={{
        fontSize: '24px',
        color: 'white',
        fontWeight: 'bold',
      }}>You got {currentStreak} correct in a row!
        +{gameSettings.streak.bonusPoints} BONUS POINTS!
      </div>
    </div>
  );
};

export default memo(StreakBonusNotification);
