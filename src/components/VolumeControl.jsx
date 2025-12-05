const VolumeControl = ({ soundEnabled, volume, onToggleSound, onVolumeChange }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '10px 15px',
      borderRadius: '25px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    }}>
      <button 
        onClick={onToggleSound} 
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          padding: '0',
          lineHeight: '1',
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
        }}
        title={soundEnabled ? 'Sound On' : 'Sound Off'}
      >
        {soundEnabled ? (volume > 0.5 ? '🔊' : volume > 0 ? '🔉' : '🔈') : '🔇'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        disabled={!soundEnabled}
        style={{
          width: '80px',
          height: '4px',
          cursor: soundEnabled ? 'pointer' : 'not-allowed',
          opacity: soundEnabled ? 1 : 0.5,
          accentColor: '#4CAF50',
          display: window.innerWidth <= 768 ? 'none' : 'block',
        }}
        title={`Volume: ${Math.round(volume * 100)}%`}
      />
    </div>
  );
};

export default VolumeControl;
