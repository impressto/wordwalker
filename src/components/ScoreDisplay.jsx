/**
 * ScoreDisplay Component
 * Displays points, streak indicator, and category progress at the bottom of the screen
 */

const ScoreDisplay = ({ totalPoints, streak, selectedPath, forkCategories, checkpointsAnswered, checkpointsPerCategory, getCategoryById }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'row',
      gap: '15px',
      zIndex: 20,
      alignItems: 'center',
    }}>
      {/* Points and Streak Combined Display */}
      <div style={{
        padding: '10px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        fontSize: '18px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
      }}>
        <span>Points: {totalPoints}</span>
        {streak > 0 && (
          <>
            <span style={{ color: '#ccc' }}>|</span>
            <span style={{ 
              color: streak >= 3 ? '#ff9800' : '#ffc107',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}>
              🔥 {streak} Streak
            </span>
          </>
        )}
      </div>
      
      {/* Category Progress */}
      {selectedPath && (
        <div style={{
          padding: '10px 20px',
          backgroundColor: 'rgba(33, 150, 243, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>{getCategoryById(forkCategories[selectedPath])?.emoji}</span>
          <span>{checkpointsAnswered}/{checkpointsPerCategory}</span>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
