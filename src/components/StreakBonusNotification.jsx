/**
 * StreakBonusNotification Component
 * Displays a celebration notification when the user achieves a streak milestone
 */

import gameSettings from '../config/gameSettings';

const StreakBonusNotification = ({ streak }) => {
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
      backgroundColor: 'rgba(255, 152, 0, 0.95)',
      padding: '30px 50px',
      borderRadius: '15px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      zIndex: 50,
      animation: 'streakFadeInOut 2.5s ease-in-out',
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
        {streak} STREAK!
      </div>
      
      <div style={{
        fontSize: '24px',
        color: 'white',
        fontWeight: 'bold',
      }}>
        +{gameSettings.streak.bonusPoints} BONUS POINTS!
      </div>
    </div>
  );
};

export default StreakBonusNotification;
