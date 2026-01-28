const VolumeControl = ({ soundEnabled, volume, onToggleSound, onVolumeChange, musicEnabled, onToggleMusic }) => {
  // Cycle through three states:
  // State 1: All sound active (soundEnabled=true, musicEnabled=true) - 🎵
  // State 2: Just effects (soundEnabled=true, musicEnabled=false) - 🔊
  // State 3: No sound (soundEnabled=false, musicEnabled=false) - 🔇
  const handleCycleSound = () => {
    if (soundEnabled && musicEnabled) {
      // State 1 -> State 2: Turn off music, keep effects
      onToggleMusic();
    } else if (soundEnabled && !musicEnabled) {
      // State 2 -> State 3: Turn off all sound
      onToggleSound();
    } else {
      // State 3 -> State 1: Turn on all sound including music
      onToggleSound();
      if (!musicEnabled) {
        onToggleMusic();
      }
    }
  };

  // Determine which icon to show
  const getIcon = () => {
    if (!soundEnabled) {
      return '🔇'; // No sound
    } else if (musicEnabled) {
      return '🎵'; // All sound active
    } else {
      return '🔊'; // Just effects
    }
  };

  // Determine title text
  const getTitle = () => {
    if (!soundEnabled) {
      return 'No Sound (Click to enable all)';
    } else if (musicEnabled) {
      return 'All Sound Active (Click for effects only)';
    } else {
      return 'Effects Only (Click to mute all)';
    }
  };

  return (
    <div id="volume-control" style={{
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
        onClick={handleCycleSound} 
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          padding: '0',
          lineHeight: '1',
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
        }}
        title={getTitle()}
      >
        {getIcon()}
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
