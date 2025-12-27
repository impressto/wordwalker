/**
 * ScoreDisplay Component
 * Displays points, streak indicator, and category progress at the bottom of the screen
 */

import { useState, useEffect } from 'react';
import './ScoreDisplay.css';

const ScoreDisplay = ({ totalPoints, streak, selectedPath, forkCategories, checkpointsAnswered, checkpointsPerCategory, getCategoryById, onOpenShop, hasAffordablePurchase }) => {
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
    <div id="score-display" style={{
      position: 'fixed',
      bottom: isMobile ? '30px' : '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'row',
      gap: isMobile ? '8px' : '15px',
      zIndex: 1000,
      alignItems: 'center',
      maxWidth: '95vw',
      flexWrap: 'nowrap',
    }}>
      {/* Points and Streak Combined Display - Clickable */}
      <div 
        id="score-points-streak" 
        className={hasAffordablePurchase ? 'pulse-glow' : ''}
        onClick={onOpenShop} 
        style={{
        padding: isMobile ? '8px 10px' : '10px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        fontSize: isMobile ? '13px' : '16px',
        fontWeight: 'bold',
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '6px' : '12px',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        userSelect: 'none',
      }} onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
      }} onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
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
        <div id="score-category-progress" style={{
          padding: isMobile ? '8px 10px' : '10px 16px',
          backgroundColor: 'rgba(33, 150, 243, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: isMobile ? '13px' : '16px',
          fontWeight: 'bold',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          whiteSpace: 'nowrap',
        }}>
          <span>{getCategoryById(forkCategories[selectedPath] || selectedPath)?.displayName}</span>
          <span>{checkpointsAnswered}/{checkpointsPerCategory}</span>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
