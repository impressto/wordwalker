/**
 * CheckpointHintPopup Component
 * Displays a hint popup when user clicks on a checkpoint emoji
 */

const CheckpointHintPopup = ({ currentQuestion, onClose }) => {
  if (!currentQuestion) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1020,
        animation: 'fadeIn 0.2s ease-in',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
          }}>
            <span style={{ fontSize: '48px' }}>{currentQuestion.emoji}</span>
            <h2 style={{
              margin: 0,
              color: '#2c5f2d',
              fontSize: '24px',
              fontWeight: 'bold',
            }}>
              💡 Hint
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '32px',
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1,
              padding: '0',
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{
          backgroundColor: '#f0f8f0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '15px',
        }}>
          <p style={{
            margin: 0,
            fontSize: '18px',
            color: '#333',
            lineHeight: '1.6',
          }}>
            {currentQuestion.hint}
          </p>
        </div>
        
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#666',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          Click the checkpoint emoji anytime for a hint!
        </p>
        
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '15px',
            marginTop: '20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
        >
          Got it!
        </button>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckpointHintPopup;
