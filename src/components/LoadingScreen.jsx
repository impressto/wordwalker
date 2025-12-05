const LoadingScreen = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#1a3d0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '20px',
        animation: 'spin 1s linear infinite',
      }}>
        ⏳
      </div>
      <h1 style={{
        color: '#87CEEB',
        fontFamily: 'Arial, sans-serif',
        marginTop: 0,
      }}>
        Loading...
      </h1>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
