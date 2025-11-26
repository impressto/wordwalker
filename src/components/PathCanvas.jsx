import { useEffect, useRef, useState } from 'react';
import { getRandomQuestionByCategory, shuffleOptions, getAllCategoryIds, getCategoryById } from '../config/questions';

const PathCanvas = () => {
  const canvasRef = useRef(null);
  const [grassImage, setGrassImage] = useState(null);
  const [pathImage, setPathImage] = useState(null);
  const [pathForkImage, setPathForkImage] = useState(null);
  const [mountainsImage, setMountainsImage] = useState(null);
  const [trees1Image, setTrees1Image] = useState(null); // Foreground trees
  const [trees2Image, setTrees2Image] = useState(null); // Distant trees
  const [trees3Image, setTrees3Image] = useState(null); // Very distant trees (between mountains and trees2)
  const [bushesImage, setBushesImage] = useState(null); // Bushes behind path
  const [walkerSpriteSheet, setWalkerSpriteSheet] = useState(null); // Walker sprite sheet
  const offsetRef = useRef(0);
  const animationFrameRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [firstAttempt, setFirstAttempt] = useState(true);
  
  // Walker sprite animation state
  const walkerFrameRef = useRef(0); // Current frame index
  const walkerFrameCounterRef = useRef(0); // Counter for frame timing
  const [isVictoryAnimation, setIsVictoryAnimation] = useState(false); // Toggle between walk/victory
  const victoryAnimationCounterRef = useRef(0); // How long to show victory animation
  
  // Checkpoint fade-in animation
  const checkpointFadeStartTimeRef = useRef(null); // Track when checkpoint starts fading in
  const checkpointFadeDuration = 500; // 500ms fade-in duration
  
  // Sprite sheet configuration
  const spriteConfig = {
    width: 1800,           // Total sprite sheet width
    height: 740,           // Total sprite sheet height
    rows: 2,               // 2 rows (walking, victory)
    cols: 6,               // 6 sprites per row
    frameWidth: 300,       // Each sprite is 300px wide (1800 / 6 = 300)
    frameHeight: 370,      // 740 / 2 = 370px per frame
    walkingRow: 0,         // First row is walking animation
    victoryRow: 1,         // Second row is victory animation
    totalFrames: 6,        // 6 frames per animation
  };
  
  // Checkpoint cycling - track how many checkpoints answered in current category
  const [checkpointsAnswered, setCheckpointsAnswered] = useState(0);
  const checkpointsPerCategory = 4; // Number of checkpoints before next fork
  
  // Fork path categories - randomly select 2 different categories for each fork
  const [forkCategories, setForkCategories] = useState(() => {
    const allCategories = getAllCategoryIds();
    // Shuffle and pick first 2 categories
    const shuffled = [...allCategories].sort(() => Math.random() - 0.5);
    return {
      upper: shuffled[0] || 'food',
      lower: shuffled[1] || 'shopping'
    };
  });
  
  // Learning checkpoint configuration
  const checkpointPositionRef = useRef(3500); // Position of first checkpoint after fork
  const checkpointSpacing = 600; // Distance between checkpoints (~5 seconds at 120 px/sec)
  
  // Path configuration
  const pathSegments = useRef([
    { type: 'straight', startX: 0, length: 800 },
    { type: 'fork', startX: 800, length: 400, branches: ['upper', 'lower'] }
  ]);
  
  // Fork appears after 1 second of walking
  // At 2 pixels per frame * 60 fps = 120 pixels/second
  // Plus canvas width to ensure it scrolls into view from the right
  // Using 900 pixels = ~7-8 seconds to scroll into view from right edge
  const forkPositionRef = useRef(900); // When fork appears (in pixels from start)


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
    
    // Load bushes image (behind path)
    const bushes = new Image();
    bushes.src = '/src/assets/images/bushes.png';
    bushes.onload = () => {
      setBushesImage(bushes);
    };
    
    // Load walker sprite sheet
    const walker = new Image();
    walker.src = '/src/assets/images/walker.png';
    walker.onload = () => {
      setWalkerSpriteSheet(walker);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = window.innerHeight;
    };

    const drawScene = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Define horizon line (eye level) - positioned in upper third
      const horizonY = height * 0.35;
      
      // Draw sky (upper portion - navy to light blue)
      const skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGradient.addColorStop(0, '#1e3a5f'); // Navy blue at top
      skyGradient.addColorStop(1, '#87CEEB'); // Light blue at horizon
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, horizonY);
      
      // Draw grass base background (below horizon to bottom)
      const grassBaseGradient = ctx.createLinearGradient(0, horizonY, 0, height);
      grassBaseGradient.addColorStop(0, '#9DBF9E'); // Light green at top
      grassBaseGradient.addColorStop(1, '#7A9A5C'); // Darker green at bottom
      ctx.fillStyle = grassBaseGradient;
      ctx.fillRect(0, horizonY, width, height - horizonY);
      
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
      
      // Draw distant grass (between horizon and path) - extended to cover area above path
      const distantGrassGradient = ctx.createLinearGradient(0, horizonY, 0, height * 0.55);
      distantGrassGradient.addColorStop(0, '#6B8E23'); // Olive drab (distant)
      distantGrassGradient.addColorStop(1, '#7CB342'); // Lighter green
      ctx.fillStyle = distantGrassGradient;
      ctx.fillRect(0, horizonY, width, height * 0.55 - horizonY); // Fill from horizon to path top
      
      // Draw very distant trees (trees3) with parallax - between mountains and trees2
      // Drawn after grass so it appears in front
      if (trees3Image) {
        const trees3Width = trees3Image.width;
        const trees3Height = trees3Image.height;
        
        // Parallax effect - very distant trees move at 0.4x speed (slower than trees2)
        const trees3ScrollOffset = (offsetRef.current * 0.4) % trees3Width;
        
        // Calculate how many tiles needed
        const trees3TilesNeeded = Math.ceil(width / trees3Width) + 2;
        
        // Position very distant trees at horizon - moved up additional 10 pixels
        const trees3Y = horizonY - trees3Height * 0.3 - 10; // Slightly overlap with mountains
        
        // Draw trees3 tiles horizontally
        for (let i = -1; i < trees3TilesNeeded; i++) {
          const x = i * trees3Width - trees3ScrollOffset;
          ctx.drawImage(trees3Image, x, trees3Y, trees3Width, trees3Height);
        }
      }
      
      // Draw distant trees (trees2) with parallax
      if (trees2Image) {
        const trees2Width = trees2Image.width;
        const trees2Height = trees2Image.height;
        
        // Parallax effect - distant trees move at 0.5x speed
        const trees2ScrollOffset = (offsetRef.current * 0.5) % trees2Width;
        
        // Calculate how many tiles needed
        const trees2TilesNeeded = Math.ceil(width / trees2Width) + 2;
        
        // Position distant trees
        const trees2Y = horizonY - 15;
        
        // Draw trees2 tiles horizontally
        for (let i = -1; i < trees2TilesNeeded; i++) {
          const x = i * trees2Width - trees2ScrollOffset;
          ctx.drawImage(trees2Image, x, trees2Y, trees2Width, trees2Height);
        }
      }
      
      // Define path area - moved down 60 pixels
      const pathTop = height * 0.55 + 60; // Where path starts (behind)
      const pathBottom = height * 0.75 + 60; // Where path ends (in front)
      const pathHeight = pathBottom - pathTop;
      
      // Draw grass for entire area (path + foreground) - single unified tile
      if (grassImage) {
        const tileWidth = grassImage.width;
        const scrollOffset = offsetRef.current % tileWidth;
        
        // Draw grass tiles - repeat horizontally, stretch vertically from pathTop to bottom
        const totalGrassHeight = height - pathTop;
        const tilesX = Math.ceil(width / tileWidth) + 1;
        
        for (let col = -1; col < tilesX; col++) {
          const x = col * tileWidth - scrollOffset;
          const y = pathTop;
          ctx.drawImage(grassImage, x, y, tileWidth, totalGrassHeight);
        }
      }
      
      // Draw bushes with parallax - after grass so bushes appear in front
      if (bushesImage) {
        const bushesWidth = bushesImage.width;
        const bushesHeight = bushesImage.height;
        
        // Parallax effect - bushes move at 0.8x speed (slower than path/grass)
        const bushesScrollOffset = (offsetRef.current * 0.8) % bushesWidth;
        
        // Calculate how many tiles needed
        const bushesTilesNeeded = Math.ceil(width / bushesWidth) + 2;
        
        // Position bushes just above the path - moved up 30 pixels
        const bushesY = pathTop - bushesHeight * 0.5 - 30; // Overlap slightly with path area
        
        // Draw bushes tiles horizontally
        for (let i = -1; i < bushesTilesNeeded; i++) {
          const x = i * bushesWidth - bushesScrollOffset;
          ctx.drawImage(bushesImage, x, bushesY, bushesWidth, bushesHeight);
        }
      }
      
      // Draw the path using tiled images (on top of grass)
      
      // Person position (fixed on screen)
      const personX = width * 0.3;
      
      // Calculate current scroll position and fork position
      const scrollPos = offsetRef.current;
      const forkScreenX = forkPositionRef.current - scrollPos;
      
      // Check if fork is fully visible on screen (entire tile visible)
      const forkTileSize = 240;
      const forkFullyVisible = forkScreenX >= 0 && (forkScreenX + forkTileSize) <= width;
      
      // Check if fork is 200 pixels from the right edge
      // This gives the user time to choose before the fork reaches them
      const forkDistance = width - forkScreenX;
      const shouldShowChoice = forkDistance >= 200 && forkScreenX < width && !selectedPath;
      
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
          } else if (tileWorldX >= forkPositionRef.current && tileWorldX < forkPositionRef.current + tileSize && !selectedPath) {
            // Draw fork tile at the fork position - only if no path has been selected yet
            ctx.drawImage(pathForkImage, tileX, pathTop, tileSize, pathHeight);
          } else if (selectedPath) {
            // After fork AND path selected - draw straight path tiles
            ctx.drawImage(pathImage, tileX, pathTop, tileSize, pathHeight);
          }
          // If no path selected and after fork, don't draw anything (prevents path from appearing to right of fork)
        }
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
      
      // Draw learning checkpoint (emoji on path) if path has been selected and not answered
      if (selectedPath && !questionAnswered) {
        const checkpointScreenX = checkpointPositionRef.current - scrollPos;
        
        // Draw checkpoint emoji if it's visible on screen
        if (checkpointScreenX < width && checkpointScreenX > 0) {
          const checkpointY = pathTop + (pathBottom - pathTop) * 0.5 - 15; // Positioned on the path
          const checkpointSize = 60;
          
          // Initialize fade-in start time if not set
          if (checkpointFadeStartTimeRef.current === null) {
            checkpointFadeStartTimeRef.current = Date.now();
          }
          
          // Calculate fade-in opacity
          const fadeElapsed = Date.now() - checkpointFadeStartTimeRef.current;
          const fadeOpacity = Math.min(fadeElapsed / checkpointFadeDuration, 1);
          
          ctx.save();
          ctx.globalAlpha = fadeOpacity;
          ctx.font = `${checkpointSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Display the current question's emoji (should always be loaded now)
          const emojiToDisplay = currentQuestion ? currentQuestion.emoji : '❓';
          ctx.fillText(emojiToDisplay, checkpointScreenX, checkpointY);
          ctx.restore();
        }
        
        // Check if checkpoint is just to the right of the person - trigger question dialog
        // Show question when checkpoint is within ~100px to the right of person
        const distanceFromPerson = checkpointScreenX - personX;
        if (distanceFromPerson <= 100 && distanceFromPerson > 0 && !showQuestion && currentQuestion) {
          setIsPaused(true);
          setShowQuestion(true);
        }
      }
      
      // Draw walking person using sprite sheet animation
      // Position roughly in the middle-left of the path (personX already defined above)
      const personY = pathTop + (pathBottom - pathTop) * 0.5 - 50; // Middle of the path vertically, moved up 50 pixels
      
      if (walkerSpriteSheet) {
        // Update animation frame
        if (!isPaused) {
          walkerFrameCounterRef.current++;
          
          // Change frame every 8 loops for smooth animation
          if (walkerFrameCounterRef.current % 8 === 0) {
            if (isVictoryAnimation) {
              // Victory animation
              walkerFrameRef.current = (walkerFrameRef.current + 1) % spriteConfig.totalFrames;
              
              // Count how many frames of victory animation have played
              victoryAnimationCounterRef.current++;
              
              // After playing all 6 frames of victory animation, switch back to walking
              if (victoryAnimationCounterRef.current >= spriteConfig.totalFrames) {
                setIsVictoryAnimation(false);
                victoryAnimationCounterRef.current = 0;
                walkerFrameRef.current = 0;
              }
            } else {
              // Walking animation
              walkerFrameRef.current = (walkerFrameRef.current + 1) % spriteConfig.totalFrames;
            }
          }
        }
        
        // Calculate which row to use (walking or victory)
        const currentRow = isVictoryAnimation ? spriteConfig.victoryRow : spriteConfig.walkingRow;
        
        // Calculate source position in sprite sheet
        const sourceX = walkerFrameRef.current * spriteConfig.frameWidth;
        const sourceY = currentRow * spriteConfig.frameHeight;
        
        // Calculate size to draw on canvas (scaled appropriately)
        const drawWidth = 80;  // Adjust size as needed
        const drawHeight = (spriteConfig.frameHeight / spriteConfig.frameWidth) * drawWidth;
        
        // Draw the current frame from sprite sheet
        ctx.drawImage(
          walkerSpriteSheet,
          sourceX, sourceY,                    // Source position in sprite sheet
          spriteConfig.frameWidth,             // Source width
          spriteConfig.frameHeight,            // Source height
          personX - drawWidth / 2,             // Destination X (centered)
          personY - drawHeight / 2,            // Destination Y (centered)
          drawWidth,                           // Destination width
          drawHeight                           // Destination height
        );
      } else {
        // Fallback to emoji if sprite sheet not loaded yet
        const personSize = 40 + (personY - pathTop) / (pathBottom - pathTop) * 40;
        ctx.font = `${personSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚶🏾‍➡️', personX, personY);
      }
    };

    const animate = () => {
      // Calculate if fork is fully visible on screen
      const canvas = canvasRef.current;
      if (canvas) {
        const scrollPos = offsetRef.current;
        const forkScreenX = forkPositionRef.current - scrollPos;
        const forkTileSize = 240;
        const forkFullyVisible = forkScreenX >= 0 && (forkScreenX + forkTileSize) <= canvas.width;
        
        // Update scroll offset (move right to left) only if not paused
        // AND if fork is not fully visible yet (or path has been selected)
        if (!isPaused && (!forkFullyVisible || selectedPath)) {
          offsetRef.current += 2; // Adjust speed as needed
        }
      } else {
        // Fallback if canvas not available
        if (!isPaused) {
          offsetRef.current += 2;
        }
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
  }, [grassImage, pathImage, pathForkImage, mountainsImage, trees1Image, trees2Image, trees3Image, bushesImage, walkerSpriteSheet, isPaused, showChoice, showQuestion, selectedPath, questionAnswered, isVictoryAnimation]);

  // Helper function to load a new question for the current checkpoint
  const loadNewQuestion = (category) => {
    const question = getRandomQuestionByCategory(category);
    if (question) {
      const shuffledOptions = shuffleOptions(question.options);
      setCurrentQuestion({
        ...question,
        options: shuffledOptions
      });
    }
  };

  const handlePathChoice = (choice) => {
    console.log(`User chose: ${choice} path`);
    setSelectedPath(choice);
    setShowChoice(false);
    setIsPaused(false);
    setCheckpointsAnswered(0); // Reset checkpoint counter for new category
    
    // Position the first checkpoint immediately visible on the right side of screen
    // offsetRef.current is current scroll position, add canvas width * 0.8 to place it on right
    const canvas = canvasRef.current;
    if (canvas) {
      checkpointPositionRef.current = offsetRef.current + canvas.width * 0.85;
    } else {
      // Fallback if canvas not available
      checkpointPositionRef.current = offsetRef.current + 1000;
    }
    
    // Reset fade-in timer for new checkpoint
    checkpointFadeStartTimeRef.current = null;
    
    // Load the first question immediately so the correct emoji appears
    const category = forkCategories[choice];
    loadNewQuestion(category);
  };


  const handleAnswerChoice = (answer) => {
    if (!currentQuestion) return;
    
    if (answer === currentQuestion.correctAnswer) {
      // Correct answer - award points based on the question's point value
      if (firstAttempt) {
        setTotalPoints(prevPoints => prevPoints + currentQuestion.points);
      }
      
      // Trigger victory animation
      setIsVictoryAnimation(true);
      walkerFrameRef.current = 0; // Start victory animation from first frame
      victoryAnimationCounterRef.current = 0;
      
      // Increment checkpoint counter
      const newCheckpointsAnswered = checkpointsAnswered + 1;
      setCheckpointsAnswered(newCheckpointsAnswered);
      
      setQuestionAnswered(true);
      setShowQuestion(false);
      setIsPaused(false);
      setFirstAttempt(true); // Reset for next question
      
      // Check if we've completed all checkpoints for this category
      if (newCheckpointsAnswered >= checkpointsPerCategory) {
        // Reset for next fork
        setCheckpointsAnswered(0);
        setSelectedPath(null);
        setQuestionAnswered(false);
        setCurrentQuestion(null); // Clear current question
        
        // Generate new random categories for the next fork
        const allCategories = getAllCategoryIds();
        const shuffled = [...allCategories].sort(() => Math.random() - 0.5);
        setForkCategories({
          upper: shuffled[0] || 'food',
          lower: shuffled[1] || 'shopping'
        });
        
        // Position next fork further ahead - reduced wait time
        forkPositionRef.current = offsetRef.current + 1000;
        
        // Reset checkpoint position for after next fork
        checkpointPositionRef.current = forkPositionRef.current + 1500;
      } else {
        // Move to next checkpoint in the same category
        checkpointPositionRef.current += checkpointSpacing;
        setQuestionAnswered(false); // Ready for next checkpoint
        
        // Reset fade-in timer for new checkpoint
        checkpointFadeStartTimeRef.current = null;
        
        // Load the next question immediately for the next checkpoint
        const category = forkCategories[selectedPath];
        loadNewQuestion(category);
      }
    } else {
      // Wrong answer - can try again but won't get points
      setFirstAttempt(false);
      // Could add visual feedback here (shake animation, error message, etc.)
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Points and Progress Display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 20,
      }}>
        <div style={{
          padding: '10px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: '20px',
          fontWeight: 'bold',
        }}>
          Points: {totalPoints}
        </div>
        
        {selectedPath && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(33, 150, 243, 0.9)',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>{getCategoryById(forkCategories[selectedPath])?.emoji}</span>
            <span>{checkpointsAnswered}/{checkpointsPerCategory}</span>
          </div>
        )}
      </div>

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
      )}

      {showQuestion && currentQuestion && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          zIndex: 10,
          animation: 'fadeIn 0.5s ease-out',
        }}>
          <div style={{ 
            fontSize: '60px',
            animation: 'fadeInScale 0.6s ease-out',
          }}>
            {currentQuestion.emoji}
          </div>
          
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '10px',
          }}>
            {currentQuestion.question}
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '100%',
          }}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerChoice(option)}
                style={{
                  padding: '12px 24px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.backgroundColor = '#1976D2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.backgroundColor = '#2196F3';
                }}
              >
                {option}
              </button>
            ))}
          </div>
          
          {!firstAttempt && (
            <div style={{
              color: '#d32f2f',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '10px',
            }}>
              Try again! (No points for incorrect answers)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PathCanvas;
