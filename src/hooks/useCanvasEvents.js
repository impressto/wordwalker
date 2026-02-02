/**
 * useCanvasEvents Hook
 * Handles canvas mouse, touch, and click events
 */

import { useRef, useCallback, useEffect } from 'react';

export const useCanvasEvents = ({
  canvasRef,
  checkpointBoundsRef,
  walkerBoundsRef,
  
  // State
  currentQuestion,
  selectedPath,
  questionAnswered,
  showQuestion,
  showChoice,
  isPaused,
  isJustResumed,
  isPreviewMode,
  
  // Setters
  setIsPaused,
  setShowChoice,
  setShowCheckpointHint,
  setIsPreviewMode,
  setQuestionDialogOpacity,
  
  // Refs
  velocityRef,
  offsetRef,
  forkPositionRef,
  checkpointPositionRef,
  previewStateSnapshotRef,
  walkerPressTimerRef,
  walkerPressStartRef,
  
  // Sound
  soundManagerRef,
}) => {
  // Check if coordinates are over checkpoint
  const isOverCheckpoint = useCallback((canvasX, canvasY) => {
    const bounds = checkpointBoundsRef.current;
    
    // Allow clicking checkpoint even when question dialog is shown
    if (!bounds.visible || !currentQuestion || !selectedPath || questionAnswered) {
      return false;
    }
    
    // Use larger hit area - 1.5x the emoji size for easier clicking
    const hitAreaSize = bounds.size * 1.5;
    const halfSize = hitAreaSize / 2;
    const distanceX = Math.abs(canvasX - bounds.x);
    const distanceY = Math.abs(canvasY - bounds.y);
    
    return distanceX <= halfSize && distanceY <= halfSize;
  }, [checkpointBoundsRef, currentQuestion, selectedPath, questionAnswered]);

  // Check if coordinates are over walker (Easter egg)
  const isOverWalker = useCallback((canvasX, canvasY) => {
    const bounds = walkerBoundsRef.current;
    if (!bounds.width || !bounds.height) return false;
    
    return (
      canvasX >= bounds.x &&
      canvasX <= bounds.x + bounds.width &&
      canvasY >= bounds.y &&
      canvasY <= bounds.y + bounds.height
    );
  }, [walkerBoundsRef]);

  // Handle walker press start (mouse/touch)
  const handleWalkerPressStart = useCallback((canvasX, canvasY) => {
    // Only activate if there's a question dialog showing
    if (!showQuestion || !currentQuestion) return;
    
    if (isOverWalker(canvasX, canvasY)) {
      walkerPressStartRef.current = Date.now();
      
      // Set timer to activate preview mode after 5 seconds
      walkerPressTimerRef.current = setTimeout(() => {
        // Capture current state before entering preview mode
        previewStateSnapshotRef.current = {
          offset: offsetRef.current,
          velocity: velocityRef.current,
          checkpointPosition: checkpointPositionRef.current,
          isPaused: isPaused
        };
        
        setIsPreviewMode(true);
        // Fade out question dialog
        let opacity = 1;
        const fadeInterval = setInterval(() => {
          opacity -= 0.05;
          if (opacity <= 0) {
            opacity = 0;
            clearInterval(fadeInterval);
          }
          setQuestionDialogOpacity(opacity);
        }, 20); // Smooth fade over ~400ms
      }, 5000);
    }
  }, [
    showQuestion, currentQuestion, isOverWalker, isPaused,
    walkerPressStartRef, walkerPressTimerRef, previewStateSnapshotRef,
    offsetRef, velocityRef, checkpointPositionRef,
    setIsPreviewMode, setQuestionDialogOpacity
  ]);

  // Handle walker press end (mouse/touch release)
  const handleWalkerPressEnd = useCallback(() => {
    // Clear timer if still waiting
    if (walkerPressTimerRef.current) {
      clearTimeout(walkerPressTimerRef.current);
      walkerPressTimerRef.current = null;
    }
    
    // If in preview mode, exit it and restore state
    if (isPreviewMode) {
      // Restore state from snapshot
      if (previewStateSnapshotRef.current) {
        offsetRef.current = previewStateSnapshotRef.current.offset;
        velocityRef.current = previewStateSnapshotRef.current.velocity;
        checkpointPositionRef.current = previewStateSnapshotRef.current.checkpointPosition;
        
        // Clear the snapshot
        previewStateSnapshotRef.current = null;
      }
      
      setIsPreviewMode(false);
      
      // Fade question dialog back in
      let opacity = 0;
      const fadeInterval = setInterval(() => {
        opacity += 0.05;
        if (opacity >= 1) {
          opacity = 1;
          clearInterval(fadeInterval);
        }
        setQuestionDialogOpacity(opacity);
      }, 20); // Smooth fade over ~400ms
    }
    
    walkerPressStartRef.current = null;
  }, [
    walkerPressTimerRef, isPreviewMode, previewStateSnapshotRef,
    offsetRef, velocityRef, checkpointPositionRef, walkerPressStartRef,
    setIsPreviewMode, setQuestionDialogOpacity
  ]);

  // Handle canvas click to detect checkpoint clicks
  const handleCanvasClick = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Emergency stop: if game was just resumed and animation is running, stop and show category selector
    if (isJustResumed && !selectedPath && !showChoice && !isPaused) {
      // Stop the animation
      setIsPaused(true);
      velocityRef.current = 0;
      
      // Position camera to show fork on the right side
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = canvas.width / dpr;
      offsetRef.current = forkPositionRef.current - (logicalWidth * 0.75);
      
      // Show the choice dialog
      setTimeout(() => {
        setShowChoice(true);
      }, 50);
      
      return; // Don't process other click handlers
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    if (isOverCheckpoint(clickX, clickY)) {
      // Checkpoint was clicked - show hint popup
      setShowCheckpointHint(true);
      
      // Play a subtle sound effect
      if (soundManagerRef.current) {
        soundManagerRef.current.playChoice();
      }
    }
  }, [
    canvasRef, isJustResumed, selectedPath, showChoice, isPaused,
    setIsPaused, velocityRef, offsetRef, forkPositionRef, setShowChoice,
    isOverCheckpoint, setShowCheckpointHint, soundManagerRef
  ]);

  // Handle canvas mouse move to update cursor
  const handleCanvasMouseMove = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    if (isOverCheckpoint(mouseX, mouseY)) {
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'default';
    }
  }, [canvasRef, isOverCheckpoint]);

  // Handle mouse down on canvas
  const handleCanvasMouseDown = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    handleWalkerPressStart(x, y);
  }, [canvasRef, handleWalkerPressStart]);

  // Handle mouse up on canvas
  const handleCanvasMouseUp = useCallback(() => {
    handleWalkerPressEnd();
  }, [handleWalkerPressEnd]);

  // Handle touch start on canvas
  const handleCanvasTouchStart = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas || event.touches.length === 0) return;

    // Emergency stop: if game was just resumed and animation is running, stop and show category selector
    if (isJustResumed && !selectedPath && !showChoice && !isPaused) {
      // Prevent default touch behavior
      event.preventDefault();
      
      // Stop the animation
      setIsPaused(true);
      velocityRef.current = 0;
      
      // Position camera to show fork on the right side
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = canvas.width / dpr;
      offsetRef.current = forkPositionRef.current - (logicalWidth * 0.75);
      
      // Show the choice dialog
      setTimeout(() => {
        setShowChoice(true);
      }, 50);
      
      return; // Don't process other touch handlers
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const touch = event.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    handleWalkerPressStart(x, y);
  }, [
    canvasRef, isJustResumed, selectedPath, showChoice, isPaused,
    setIsPaused, velocityRef, offsetRef, forkPositionRef, setShowChoice,
    handleWalkerPressStart
  ]);

  // Handle touch end on canvas
  const handleCanvasTouchEnd = useCallback(() => {
    handleWalkerPressEnd();
  }, [handleWalkerPressEnd]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (walkerPressTimerRef.current) {
        clearTimeout(walkerPressTimerRef.current);
      }
    };
  }, [walkerPressTimerRef]);

  return {
    isOverCheckpoint,
    isOverWalker,
    handleCanvasClick,
    handleCanvasMouseMove,
    handleCanvasMouseDown,
    handleCanvasMouseUp,
    handleCanvasTouchStart,
    handleCanvasTouchEnd,
  };
};

export default useCanvasEvents;
