/**
 * useCanvasEvents Hook
 * Handles canvas mouse, touch, and click events
 */

import { useState, useRef, useCallback } from 'react';

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
  
  // Setters
  setIsPaused,
  setShowChoice,
  setShowQuestion,
  setIsPreviewMode,
  setQuestionDialogOpacity,
  
  // Refs
  velocityRef,
  offsetRef,
  forkPositionRef,
  previewStateSnapshotRef,
  skipCameraRepositionRef,
}) => {
  const walkerPressTimerRef = useRef(null);
  const walkerPressStartRef = useRef(null);

  // Check if coordinates are over checkpoint
  const isOverCheckpoint = useCallback((canvasX, canvasY) => {
    const bounds = checkpointBoundsRef.current;
    
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

  // Check if coordinates are over walker
  const isOverWalker = useCallback((canvasX, canvasY) => {
    const bounds = walkerBoundsRef.current;
    return canvasX >= bounds.x && 
           canvasX <= bounds.x + bounds.width &&
           canvasY >= bounds.y && 
           canvasY <= bounds.y + bounds.height;
  }, [walkerBoundsRef]);

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
      const width = canvas.width;
      offsetRef.current = forkPositionRef.current - (width * 0.75);
      
      // Show category selector
      setShowChoice(true);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    
    if (isOverCheckpoint(canvasX, canvasY)) {
      setShowQuestion(true);
    }
  }, [
    canvasRef, isJustResumed, selectedPath, showChoice, isPaused,
    setIsPaused, velocityRef, offsetRef, forkPositionRef, setShowChoice,
    isOverCheckpoint, setShowQuestion
  ]);

  // Handle mouse move for cursor changes
  const handleCanvasMouseMove = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    
    // Check if over checkpoint
    if (isOverCheckpoint(canvasX, canvasY)) {
      canvas.style.cursor = 'pointer';
    } else if (isOverWalker(canvasX, canvasY)) {
      canvas.style.cursor = 'grab';
    } else {
      canvas.style.cursor = 'default';
    }
  }, [canvasRef, isOverCheckpoint, isOverWalker]);

  // Handle mouse down on walker for preview mode
  const handleCanvasMouseDown = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    
    if (isOverWalker(canvasX, canvasY)) {
      walkerPressStartRef.current = Date.now();
      
      // Start timer for long press (500ms)
      walkerPressTimerRef.current = setTimeout(() => {
        // Save current state before entering preview mode
        previewStateSnapshotRef.current = {
          isPaused: isPaused,
          showQuestion: showQuestion,
        };
        
        // Enter preview mode
        setIsPreviewMode(true);
        setQuestionDialogOpacity(0.3);
        canvas.style.cursor = 'grabbing';
      }, 500);
    }
  }, [canvasRef, isOverWalker, isPaused, showQuestion, setIsPreviewMode, setQuestionDialogOpacity]);

  // Handle mouse up to exit preview mode
  const handleCanvasMouseUp = useCallback(() => {
    // Clear the long press timer
    if (walkerPressTimerRef.current) {
      clearTimeout(walkerPressTimerRef.current);
      walkerPressTimerRef.current = null;
    }
    
    // Exit preview mode
    setIsPreviewMode(false);
    setQuestionDialogOpacity(1);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'default';
    }
    
    walkerPressStartRef.current = null;
  }, [canvasRef, setIsPreviewMode, setQuestionDialogOpacity]);

  // Handle touch events for mobile
  const handleCanvasTouchStart = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (touch.clientX - rect.left) * scaleX;
    const canvasY = (touch.clientY - rect.top) * scaleY;
    
    if (isOverWalker(canvasX, canvasY)) {
      walkerPressStartRef.current = Date.now();
      
      // Start timer for long press (500ms)
      walkerPressTimerRef.current = setTimeout(() => {
        // Save current state before entering preview mode
        previewStateSnapshotRef.current = {
          isPaused: isPaused,
          showQuestion: showQuestion,
        };
        
        // Enter preview mode
        setIsPreviewMode(true);
        setQuestionDialogOpacity(0.3);
      }, 500);
    }
  }, [canvasRef, isOverWalker, isPaused, showQuestion, setIsPreviewMode, setQuestionDialogOpacity]);

  const handleCanvasTouchEnd = useCallback(() => {
    handleCanvasMouseUp();
  }, [handleCanvasMouseUp]);

  return {
    walkerPressTimerRef,
    walkerPressStartRef,
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
