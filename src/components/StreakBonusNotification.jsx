/**
 * StreakBonusNotification Component
 * Displays a celebration notification when the user achieves a streak milestone
 */

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
      zIndex: 12,
      animation: 'fadeInScale 0.4s ease-out',
    }}>
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
        +50 BONUS POINTS!
      </div>
    </div>
  );
};

export default StreakBonusNotification;
