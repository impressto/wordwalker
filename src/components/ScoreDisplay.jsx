/**
 * ScoreDisplay Component
 * Displays points, streak indicator, and category progress at the bottom of the screen
 */

import { useState, useEffect } from 'react';

const ScoreDisplay = ({ totalPoints, streak, selectedPath, forkCategories, checkpointsAnswered, checkpointsPerCategory, getCategoryById }) => {
  // Detect if mobile screen with reactive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? '30px' : '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'row',
      gap: isMobile ? '8px' : '15px',
      zIndex: 1000,
      alignItems: 'center',
    }}>
      {/* Points and Streak Combined Display */}
      <div style={{
        padding: isMobile ? '8px 12px' : '10px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        fontSize: isMobile ? '14px' : '18px',
        fontWeight: 'bold',
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '8px' : '15px',
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
          padding: isMobile ? '8px 12px' : '10px 20px',
          backgroundColor: 'rgba(33, 150, 243, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: 'bold',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>{getCategoryById(forkCategories[selectedPath])?.emoji}</span>
          <span>{checkpointsAnswered}/{checkpointsPerCategory}</span>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
