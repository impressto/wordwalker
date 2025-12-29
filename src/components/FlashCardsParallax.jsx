import { useEffect, useRef, useState } from 'react';
import { getTheme } from '../config/parallaxThemes';

/**
 * FlashCardsParallax Component
 * Mini parallax background for flash cards using layers 3, 4, 5, 6, and 7
 * Automatically animates in a continuous loop
 */
const FlashCardsParallax = ({ 
  currentTheme = 'default', 
  width = 600, 
  height = 350,
  parallaxConfig = {} 
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const offsetRef = useRef(0);
  const [parallaxImages, setParallaxImages] = useState({
    layer3: null,
    layer4: null,
    layer5: null,
    layer6: null,
    layer7: null
  });

  // Get base path for assets
  const basePath = import.meta.env.BASE_URL || '/';
  
  // Get theme configuration
  const theme = getTheme(currentTheme);
  
  // Use theme-specific flash card parallax config if available, otherwise use provided config
  const themeFlashCardConfig = theme.flashCardParallax || {};
  const layerOffsets = themeFlashCardConfig.layerOffsets || parallaxConfig.layerOffsets || {};
  const scaleAdjustment = themeFlashCardConfig.scaleAdjustment ?? parallaxConfig.scaleAdjustment ?? 1.0;
  const layer7Scale = themeFlashCardConfig.layer7Scale ?? parallaxConfig.layer7Scale ?? 2.0;
  const customHorizonY = themeFlashCardConfig.horizonY ?? parallaxConfig.horizonY;

  // Load parallax images for layers 3-7
  useEffect(() => {
    const theme = getTheme(currentTheme);
    const themePath = `${basePath}images/themes/${theme.imagePath}/`;
    const images = {};
    const loadPromises = [];

    // Load layers 3, 4, 5, 6, 7
    [3, 4, 5, 6, 7].forEach(layerNum => {
      const img = new Image();
      const promise = new Promise((resolve) => {
        img.onload = () => {
          images[`layer${layerNum}`] = img;
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load parallax layer ${layerNum}`);
          resolve(); // Continue even if image fails
        };
        img.src = `${themePath}parallax-layer${layerNum}.png`;
      });
      loadPromises.push(promise);
    });

    Promise.all(loadPromises).then(() => {
      setParallaxImages(images);
    });
  }, [currentTheme, basePath]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const theme = getTheme(currentTheme);

    // Animation speed (pixels per frame)
    const ANIMATION_SPEED = 0.5;

    const animate = () => {
      // Update offset for continuous scrolling
      offsetRef.current += ANIMATION_SPEED;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate proportional horizon position for mini canvas
      // Use custom horizonY from config if provided, otherwise use theme default
      const baseHorizonY = customHorizonY !== undefined 
        ? height * customHorizonY 
        : height * theme.positioning.horizonY;
      const horizonY = baseHorizonY;

      // Helper function to get layer speed from theme
      const getLayerSpeed = (layerId) => {
        return theme.layerSpeeds[layerId] || 0.5;
      };

      // Helper function to get layer Y position with theme offset + flash card config offset
      const getLayerY = (baseY, layerId) => {
        const themeOffset = theme.layerPositions[layerId] || 0;
        const configOffset = layerOffsets[layerId] || 0;
        
        // Scale the theme offset proportionally to the mini canvas height
        const scaleFactor = height / 800; // Assuming original canvas is ~800px tall
        return baseY + (themeOffset * scaleFactor) + configOffset;
      };

      // Draw Layer 7 (rear layer - no parallax, fills entire canvas)
      if (parallaxImages.layer7) {
        const layer7Width = parallaxImages.layer7.width;
        const layer7Height = parallaxImages.layer7.height;
        
        // Scale based on height to maintain aspect ratio, then multiply by layer7Scale for width coverage
        const scale = (height / layer7Height) * layer7Scale * scaleAdjustment;
        const scaledWidth = layer7Width * scale;
        const scaledHeight = layer7Height * scale;
        const xOffset = -(scaledWidth - width) / 2;
        const layer7Y = getLayerY(0, 'layer7');
        
        ctx.drawImage(parallaxImages.layer7, xOffset, layer7Y, scaledWidth, scaledHeight);
      } else {
        // Fallback background
        ctx.fillStyle = theme.canvasColors?.aboveHorizon || '#7c8799';
        ctx.fillRect(0, 0, width, height);
        
        // Below horizon
        const skyBottom = horizonY - (20 * height / 800);
        ctx.fillStyle = theme.canvasColors?.belowHorizon || '#717d3d';
        ctx.fillRect(0, skyBottom - 2, width, height - skyBottom + 2);
      }

      // Draw Layer 6 (mountains - very slow parallax)
      if (parallaxImages.layer6) {
        const layer6Width = parallaxImages.layer6.width;
        const layer6Height = parallaxImages.layer6.height;
        const layer6Speed = getLayerSpeed('layer6');
        const layer6ScrollOffset = (offsetRef.current * layer6Speed) % layer6Width;
        
        // Scale to fill canvas height for proper proportions
        const scale = (height / layer6Height) * 1.2 * scaleAdjustment;
        const scaledWidth = layer6Width * scale;
        const scaledHeight = layer6Height * scale;
        
        const layer6TilesNeeded = Math.ceil(width / scaledWidth) + 2;
        const layer6Y = getLayerY(horizonY - scaledHeight, 'layer6');
        
        for (let i = -1; i < layer6TilesNeeded; i++) {
          const x = i * scaledWidth - (layer6ScrollOffset * scale);
          ctx.drawImage(parallaxImages.layer6, x, layer6Y, scaledWidth, scaledHeight);
        }
      }

      // Draw Layer 5 (far layer)
      if (parallaxImages.layer5) {
        const layer5Width = parallaxImages.layer5.width;
        const layer5Height = parallaxImages.layer5.height;
        const layer5Speed = getLayerSpeed('layer5');
        const layer5ScrollOffset = (offsetRef.current * layer5Speed) % layer5Width;
        
        // Scale to fill canvas height for proper proportions
        const scale = (height / layer5Height) * 1.2 * scaleAdjustment;
        const scaledWidth = layer5Width * scale;
        const scaledHeight = layer5Height * scale;
        
        const layer5TilesNeeded = Math.ceil(width / scaledWidth) + 2;
        const layer5Y = getLayerY(horizonY - scaledHeight * 0.3, 'layer5');
        
        for (let i = -1; i < layer5TilesNeeded; i++) {
          const x = i * scaledWidth - (layer5ScrollOffset * scale);
          ctx.drawImage(parallaxImages.layer5, x, layer5Y, scaledWidth, scaledHeight);
        }
      }

      // Draw Layer 4 (mid-distant layer)
      if (parallaxImages.layer4) {
        const layer4Width = parallaxImages.layer4.width;
        const layer4Height = parallaxImages.layer4.height;
        const layer4Speed = getLayerSpeed('layer4');
        const layer4ScrollOffset = (offsetRef.current * layer4Speed) % layer4Width;
        
        // Scale to fill canvas height for proper proportions
        const scale = (height / layer4Height) * 1.2 * scaleAdjustment;
        const scaledWidth = layer4Width * scale;
        const scaledHeight = layer4Height * scale;
        
        const layer4TilesNeeded = Math.ceil(width / scaledWidth) + 2;
        const layer4Y = getLayerY(horizonY - 15, 'layer4');
        
        for (let i = -1; i < layer4TilesNeeded; i++) {
          const x = i * scaledWidth - (layer4ScrollOffset * scale);
          ctx.drawImage(parallaxImages.layer4, x, layer4Y, scaledWidth, scaledHeight);
        }
      }

      // Draw Layer 3 (bushes - foreground layer)
      if (parallaxImages.layer3) {
        const layer3Width = parallaxImages.layer3.width;
        const layer3Height = parallaxImages.layer3.height;
        const layer3Speed = getLayerSpeed('layer3');
        const layer3ScrollOffset = (offsetRef.current * layer3Speed) % layer3Width;
        
        // Scale to fill canvas height for proper proportions
        const scale = (height / layer3Height) * scaleAdjustment;
        const scaledWidth = layer3Width * scale;
        const scaledHeight = layer3Height * scale;
        
        const layer3TilesNeeded = Math.ceil(width / scaledWidth) + 2;
        // Position at bottom of canvas
        const pathTop = height * (theme.positioning?.pathTopOffset || 0.55);
        const layer3Y = getLayerY(pathTop - scaledHeight * 0.5, 'layer3');
        
        for (let i = -1; i < layer3TilesNeeded; i++) {
          const x = i * scaledWidth - (layer3ScrollOffset * scale);
          ctx.drawImage(parallaxImages.layer3, x, layer3Y, scaledWidth, scaledHeight);
        }
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [parallaxImages, currentTheme, width, height, layerOffsets, scaleAdjustment, layer7Scale, customHorizonY]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: 'auto',
        borderRadius: '15px',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
};

export default FlashCardsParallax;
