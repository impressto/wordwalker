/**
 * PathChoiceDialog Component
 * Displays the fork in the road with two category options for the user to choose
 */

const PathChoiceDialog = ({ forkCategories, getCategoryById, onPathChoice }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 'calc(50% - 10px)',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      zIndex: 10,
    }}>
      <button
        onClick={() => onPathChoice('upper')}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: '#7CB342',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        <span>↑</span>
        <span>{getCategoryById(forkCategories.upper)?.emoji}</span>
        <span>{getCategoryById(forkCategories.upper)?.displayName}</span>
      </button>
      
      <button
        onClick={() => onPathChoice('lower')}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: '#558B2F',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        <span>↓</span>
        <span>{getCategoryById(forkCategories.lower)?.emoji}</span>
        <span>{getCategoryById(forkCategories.lower)?.displayName}</span>
      </button>
    </div>
  );
};

export default PathChoiceDialog;
