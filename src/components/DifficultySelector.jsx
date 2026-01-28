/**
 * DifficultySelector Component
 * Modal for selecting game difficulty (easy, medium, hard)
 * Filters questions based on difficulty level
 */

const DifficultySelector = ({ isOpen, onClose, difficulty, onSelectDifficulty }) => {
  if (!isOpen) return null;

  const handleDifficultySelect = (level) => {
    onSelectDifficulty(level);
    localStorage.setItem('gameDifficulty', level);
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div 
        id="difficulty-selector-modal"
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{
          margin: '0 0 20px 0',
          textAlign: 'center',
          fontSize: '24px',
          color: '#333',
        }}>
          🎯 Select Difficulty
        </h2>
        
        <div style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '20px',
          lineHeight: '1.6',
        }}>
          <p style={{ margin: '0 0 10px 0' }}>Choose which questions to include:</p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li><strong>Easy:</strong> Only easy questions</li>
            <li><strong>Medium:</strong> Easy + Medium questions</li>
            <li><strong>Hard:</strong> All questions (Easy + Medium + Hard)</li>
          </ul>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <button
            onClick={() => handleDifficultySelect('easy')}
            style={{
              padding: '15px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: difficulty === 'easy' ? '#4CAF50' : '#f0f0f0',
              color: difficulty === 'easy' ? 'white' : '#333',
              border: difficulty === 'easy' ? '3px solid #45a049' : '2px solid #ddd',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
            onMouseEnter={(e) => {
              if (difficulty !== 'easy') {
                e.target.style.backgroundColor = '#e0e0e0';
              }
            }}
            onMouseLeave={(e) => {
              if (difficulty !== 'easy') {
                e.target.style.backgroundColor = '#f0f0f0';
              }
            }}
          >
            <img 
              src={`${import.meta.env.BASE_URL || '/'}images/settings/easy.png`}
              alt="Easy"
              style={{ width: '24px', height: '24px' }}
            />
            Easy
          </button>
          
          <button
            onClick={() => handleDifficultySelect('medium')}
            style={{
              padding: '15px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: difficulty === 'medium' ? '#FF9800' : '#f0f0f0',
              color: difficulty === 'medium' ? 'white' : '#333',
              border: difficulty === 'medium' ? '3px solid #F57C00' : '2px solid #ddd',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
            onMouseEnter={(e) => {
              if (difficulty !== 'medium') {
                e.target.style.backgroundColor = '#e0e0e0';
              }
            }}
            onMouseLeave={(e) => {
              if (difficulty !== 'medium') {
                e.target.style.backgroundColor = '#f0f0f0';
              }
            }}
          >
            <img 
              src={`${import.meta.env.BASE_URL || '/'}images/settings/medium.png`}
              alt="Medium"
              style={{ width: '24px', height: '24px' }}
            />
            Medium
          </button>
          
          <button
            onClick={() => handleDifficultySelect('hard')}
            style={{
              padding: '15px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: difficulty === 'hard' ? '#F44336' : '#f0f0f0',
              color: difficulty === 'hard' ? 'white' : '#333',
              border: difficulty === 'hard' ? '3px solid #D32F2F' : '2px solid #ddd',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
            onMouseEnter={(e) => {
              if (difficulty !== 'hard') {
                e.target.style.backgroundColor = '#e0e0e0';
              }
            }}
            onMouseLeave={(e) => {
              if (difficulty !== 'hard') {
                e.target.style.backgroundColor = '#f0f0f0';
              }
            }}
          >
            <img 
              src={`${import.meta.env.BASE_URL || '/'}images/settings/hard.png`}
              alt="Hard"
              style={{ width: '24px', height: '24px' }}
            />
            Hard
          </button>
        </div>
        
        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            backgroundColor: 'transparent',
            color: '#666',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DifficultySelector;
