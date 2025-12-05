const TopLogo = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 30,
    }}>
      <img 
        src={`${import.meta.env.BASE_URL || '/'}images/top-logo.png`}
        alt="WordWalk Logo"
        style={{
          maxWidth: '200px',
          height: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
};

export default TopLogo;
