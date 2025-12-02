/**
 * PathChoiceDialog Component
 * Displays a dialog with four category options for the user to choose
 */

const PathChoiceDialog = ({ forkCategories, getCategoryById, onPathChoice, onOpenShop }) => {
  const createButton = (choiceKey, emoji) => (
    <button
      onClick={() => onPathChoice(choiceKey)}
      style={{
        padding: '15px 20px',
        fontSize: '18px',
        fontWeight: 'bold',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        minWidth: '140px',
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.05)';
        e.target.style.backgroundColor = '#45a049';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.backgroundColor = '#4CAF50';
      }}
    >
      <span style={{ fontSize: '32px' }}>{getCategoryById(forkCategories[choiceKey])?.emoji}</span>
      <span style={{ fontSize: '14px', textAlign: 'center' }}>{getCategoryById(forkCategories[choiceKey])?.displayName}</span>
    </button>
  );

  return (
    <div id="path-choice-dialog" style={{
      position: 'absolute',
      top: 'calc(40% - 10px)',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '20px',
      borderRadius: '15px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      zIndex: 1010,
      minWidth: '280px',
      maxWidth: 'min(85vw, 380px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h3 style={{
        margin: '0 0 20px 0',
        textAlign: 'center',
        fontSize: '22px',
        color: '#333',
      }}>
        Choose Your Path 🛤️
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
        marginBottom: '20px',
      }}>
        {createButton('choice1')}
        {createButton('choice2')}
        {createButton('choice3')}
        {createButton('choice4')}
      </div>

      {/* Vendor Section */}
      <div style={{
        position: 'relative',
        width: '100%',
        marginTop: '10px',
        borderTop: '2px solid #ddd',
        paddingTop: '15px',
      }}>
        <img 
          src={`${import.meta.env.BASE_URL || '/'}images/vendor.png`}
          alt="Vendor"
          style={{
            width: '40%',
            height: 'auto',
            borderRadius: '8px',
            display: 'block',
            margin: '0 auto',
          }}
        />
        <button
          onClick={onOpenShop}
          style={{
            position: 'absolute',
            bottom: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 20px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateX(-50%) scale(1.1)';
            e.target.style.backgroundColor = '#FB8C00';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateX(-50%) scale(1)';
            e.target.style.backgroundColor = '#FF9800';
          }}
        >
          💰 TRADE
        </button>
      </div>
    </div>
  );
};

export default PathChoiceDialog;
