const SearchButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 30,
        background: '#4CAF50',
        border: 'none',
        borderRadius: '50%',
        width: '56px',
        height: '56px',
        fontSize: '28px',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      }}
    >
      🔍
    </button>
  );
};

export default SearchButton;
