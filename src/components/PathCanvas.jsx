import { useEffect, useRef, useState } from 'react';

const PathCanvas = () => {
  const canvasRef = useRef(null);
  const [grassImage, setGrassImage] = useState(null);
  const [pathImage, setPathImage] = useState(null);
  const [pathForkImage, setPathForkImage] = useState(null);
  const [mountainsImage, setMountainsImage] = useState(null);
  const [trees1Image, setTrees1Image] = useState(null); // Foreground trees
  const [trees2Image, setTrees2Image] = useState(null); // Distant trees
  const [trees3Image, setTrees3Image] = useState(null); // Very distant trees (between mountains and trees2)
  const offsetRef = useRef(0);
  const animationFrameRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  
  // Path configuration
  const pathSegments = useRef([
    { type: 'straight', startX: 0, length: 800 },
    { type: 'fork', startX: 800, length: 400, branches: ['upper', 'lower'] }
  ]);
  
  // Fork appears further away - will take several seconds to scroll into view
  // At 2 pixels per frame * 60 fps = 120 pixels/second
  // 2000 pixels = ~16-17 seconds before fork appears
  const forkPositionRef = useRef(2000); // When fork appears (in pixels from start)

  useEffect(() => {
    // Load grass image
    const grass = new Image();
    grass.src = '/src/assets/images/grass.png';
    grass.onload = () => {
      setGrassImage(grass);
    };
    
    // Load path image
    const path = new Image();
    path.src = '/src/assets/images/path.png';
    path.onload = () => {
      setPathImage(path);
    };
    
    // Load path fork image
    const pathFork = new Image();
    pathFork.src = '/src/assets/images/path-fork.png';
    pathFork.onload = () => {
      setPathForkImage(pathFork);
    };
    
    // Load mountains image
    const mountains = new Image();
    mountains.src = '/src/assets/images/mountains.png';
    mountains.onload = () => {
      setMountainsImage(mountains);
    };
    
    // Load trees1 image (foreground trees)
    const trees1 = new Image();
    trees1.src = '/src/assets/images/trees1.png';
    trees1.onload = () => {
      setTrees1Image(trees1);
    };
    
    // Load trees2 image (distant trees)
    const trees2 = new Image();
    trees2.src = '/src/assets/images/trees2.png';
    trees2.onload = () => {
      setTrees2Image(trees2);
    };
    
    // Load trees3 image (very distant trees - between mountains and trees2)
    const trees3 = new Image();
    trees3.src = '/src/assets/images/trees3.png';
    trees3.onload = () => {
      setTrees3Image(trees3);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawScene = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Define horizon line (eye level) - positioned in upper third
      const horizonY = height * 0.35;
      
      // Draw sky (above horizon)
      const skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGradient.addColorStop(0, '#87CEEB'); // Sky blue at top
      skyGradient.addColorStop(1, '#B0D4E3'); // Lighter blue near horizon
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, horizonY);
      
      // Draw mountains at the horizon (tiled horizontally with parallax)
      if (mountainsImage) {
        const mountainWidth = mountainsImage.width;
        const mountainHeight = mountainsImage.height;
        
        // Parallax effect - mountains move slower than foreground (0.3x speed)
        const mountainScrollOffset = (offsetRef.current * 0.3) % mountainWidth;
        
        // Calculate how many tiles needed to cover the width
        const mountainTilesNeeded = Math.ceil(width / mountainWidth) + 2;
        
        // Position mountains at the horizon
        const mountainY = horizonY - mountainHeight;
        
        // Draw mountain tiles horizontally
        for (let i = -1; i < mountainTilesNeeded; i++) {
          const x = i * mountainWidth - mountainScrollOffset;
          ctx.drawImage(mountainsImage, x, mountainY, mountainWidth, mountainHeight);
        }
      }
      
      // Draw very distant trees (trees3) with parallax - between mountains and trees2
      if (trees3Image) {
        const trees3Width = trees3Image.width;
        const trees3Height = trees3Image.height;
        
        // Parallax effect - very distant trees move at 0.4x speed (slower than trees2)
        const trees3ScrollOffset = (offsetRef.current * 0.4) % trees3Width;
        
        // Calculate how many tiles needed
        const trees3TilesNeeded = Math.ceil(width / trees3Width) + 2;
        
        // Position very distant trees at horizon
        const trees3Y = horizonY - trees3Height * 0.3; // Slightly overlap with mountains
        
        // Draw trees3 tiles horizontally
        for (let i = -1; i < trees3TilesNeeded; i++) {
          const x = i * trees3Width - trees3ScrollOffset;
          ctx.drawImage(trees3Image, x, trees3Y, trees3Width, trees3Height);
        }
      }
      
      // Draw distant grass (between horizon and path)
      const distantGrassGradient = ctx.createLinearGradient(0, horizonY, 0, height * 0.5);
      distantGrassGradient.addColorStop(0, '#6B8E23'); // Olive drab (distant)
      distantGrassGradient.addColorStop(1, '#7CB342'); // Lighter green
      ctx.fillStyle = distantGrassGradient;
      ctx.fillRect(0, horizonY, width, height * 0.15);
      
      // Draw distant trees (trees2) with parallax
      if (trees2Image) {
        const trees2Width = trees2Image.width;
        const trees2Height = trees2Image.height;
        
        // Parallax effect - distant trees move at 0.5x speed
        const trees2ScrollOffset = (offsetRef.current * 0.5) % trees2Width;
        
        // Calculate how many tiles needed
        const trees2TilesNeeded = Math.ceil(width / trees2Width) + 2;
        
        // Position distant trees just below horizon
        const trees2Y = horizonY;
        
        // Draw trees2 tiles horizontally
        for (let i = -1; i < trees2TilesNeeded; i++) {
          const x = i * trees2Width - trees2ScrollOffset;
          ctx.drawImage(trees2Image, x, trees2Y, trees2Width, trees2Height);
        }
      }
      
      // Define path area
      const pathTop = height * 0.5; // Where path starts (behind)
      const pathBottom = height * 0.55; // Where path ends (in front)
      const pathHeight = pathBottom - pathTop;
      
      // Draw grass in the path area first (so it appears behind transparent path)
      if (grassImage) {
        const tileWidth = grassImage.width;
        const tileHeight = grassImage.height;
        const scrollOffset = offsetRef.current % tileWidth;
        
        // Draw grass tiles in the path area
        const pathAreaHeight = pathHeight;
        const tilesX = Math.ceil(width / tileWidth) + 1;
        const tilesY = Math.ceil(pathAreaHeight / tileHeight) + 1;
        
        for (let row = 0; row < tilesY; row++) {
          for (let col = -1; col < tilesX; col++) {
            const x = col * tileWidth - scrollOffset;
            const y = pathTop + row * tileHeight;
            ctx.drawImage(grassImage, x, y, tileWidth, tileHeight);
          }
        }
      }
      
      // Draw the path using tiled images (on top of grass)
      
      // Person position (fixed on screen)
      const personX = width * 0.3;
      
      // Calculate current scroll position and fork position
      const scrollPos = offsetRef.current;
      const forkScreenX = forkPositionRef.current - scrollPos;
      
      // Check if fork is 200 pixels from the right edge
      // This gives the user time to choose before the fork reaches them
      const forkDistance = width - forkScreenX;
      const shouldShowChoice = forkDistance >= 200 && forkScreenX < width;
      
      if (shouldShowChoice && !isPaused && !showChoice) {
        setIsPaused(true);
        setShowChoice(true);
      }
      
      // Draw path tiles
      if (pathImage && pathForkImage) {
        const tileSize = 240; // Both images are 240x240
        const pathScrollOffset = scrollPos % tileSize;
        
        // Calculate how many tiles we need
        const tilesNeeded = Math.ceil(width / tileSize) + 2;
        
        // Draw straight path tiles before fork
        for (let i = -1; i < tilesNeeded; i++) {
          const tileX = i * tileSize - pathScrollOffset;
          const tileCenterX = tileX + tileSize / 2;
          
          // Check if this tile position is before the fork
          const tileWorldX = scrollPos + tileCenterX;
          
          if (tileWorldX < forkPositionRef.current) {
            // Draw straight path tile
            ctx.drawImage(pathImage, tileX, pathTop, tileSize, pathHeight);
          } else if (tileWorldX >= forkPositionRef.current && tileWorldX < forkPositionRef.current + tileSize) {
            // Draw fork tile at the fork position
            ctx.drawImage(pathForkImage, tileX, pathTop, tileSize, pathHeight);
          } else {
            // After fork - could draw continuation or different path tiles
            // For now, continue with straight tiles
            ctx.drawImage(pathImage, tileX, pathTop, tileSize, pathHeight);
          }
        }
      }
      
      // Draw foreground grass (in front of path)
      if (grassImage) {
        // Use tiled grass image with scrolling effect
        const grassHeight = height - pathBottom;
        const tileWidth = grassImage.width;
        const tileHeight = grassImage.height;
        
        // Calculate how many tiles we need (with extra for scrolling)
        const tilesX = Math.ceil(width / tileWidth) + 1;
        const tilesY = Math.ceil(grassHeight / tileHeight) + 1;
        
        // Apply the offset for scrolling animation (right to left)
        const scrollOffset = offsetRef.current % tileWidth;
        
        // Draw tiles
        for (let row = 0; row < tilesY; row++) {
          for (let col = -1; col < tilesX; col++) {
            const x = col * tileWidth - scrollOffset;
            const y = pathBottom + row * tileHeight;
            ctx.drawImage(grassImage, x, y, tileWidth, tileHeight);
          }
        }
      } else {
        // Fallback: solid color if image not loaded
        const foregroundGrassGradient = ctx.createLinearGradient(0, pathBottom, 0, height);
        foregroundGrassGradient.addColorStop(0, '#7CB342');
        foregroundGrassGradient.addColorStop(1, '#558B2F');
        ctx.fillStyle = foregroundGrassGradient;
        ctx.fillRect(0, pathBottom, width, height - pathBottom);
      }
      
      // Draw foreground trees (trees1) with parallax - in front of grass
      if (trees1Image) {
        const trees1Width = trees1Image.width;
        const trees1Height = trees1Image.height;
        
        // Parallax effect - foreground trees move faster at 1.5x speed
        const trees1ScrollOffset = (offsetRef.current * 1.5) % trees1Width;
        
        // Calculate how many tiles needed
        const trees1TilesNeeded = Math.ceil(width / trees1Width) + 2;
        
        // Position foreground trees at bottom of screen
        const trees1Y = height - trees1Height;
        
        // Draw trees1 tiles horizontally
        for (let i = -1; i < trees1TilesNeeded; i++) {
          const x = i * trees1Width - trees1ScrollOffset;
          ctx.drawImage(trees1Image, x, trees1Y, trees1Width, trees1Height);
        }
      }
      
      // Draw walking person emoji on the path
      // Position roughly in the middle-left of the path (personX already defined above)
      const personY = pathTop + (pathBottom - pathTop) * 0.5; // Middle of the path vertically
      
      // Calculate size based on position (larger = closer to viewer)
      const personSize = 40 + (personY - pathTop) / (pathBottom - pathTop) * 40; // 40-80px based on depth
      
      ctx.font = `${personSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚶🏾‍➡️', personX, personY);
    };

    const animate = () => {
      // Update scroll offset (move right to left) only if not paused
      if (!isPaused) {
        offsetRef.current += 2; // Adjust speed as needed
      }
      
      drawScene();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [grassImage, pathImage, pathForkImage, mountainsImage, trees1Image, trees2Image, trees3Image, isPaused, showChoice]);

  const handlePathChoice = (choice) => {
    console.log(`User chose: ${choice} path`);
    setShowChoice(false);
    setIsPaused(false);
    
    // Reset for next fork (in a real app, this would continue to next segment)
    // For now, we'll just continue the animation
    forkPositionRef.current += 1200; // Set next fork position further ahead
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100vh',
          margin: 0,
          padding: 0,
        }}
      />
      
      {showChoice && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 10,
        }}>
          <button
            onClick={() => handlePathChoice('upper')}
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
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            ↑ Upper Path (Food)
          </button>
          
          <button
            onClick={() => handlePathChoice('lower')}
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
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            ↓ Lower Path (Shopping)
          </button>
        </div>
      )}
    </div>
  );
};

export default PathCanvas;
