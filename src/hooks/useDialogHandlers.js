/**
 * useDialogHandlers Hook
 * Manages dialog open/close states and handlers for search, shop, and flash cards
 */

import { useState, useCallback } from 'react';

export const useDialogHandlers = ({
  // Pause state
  isPaused,
  setIsPaused,
  
  // Character shop handlers from useCharacterAndTheme
  handleOpenCharacterShop,
  handleCloseCharacterShop,
  handlePurchaseCharacter: purchaseCharacter,
  handlePurchaseTheme: purchaseTheme,
  
  // State setters
  setShowFlashCards,
  setShowFlashCardsOffer,
  setShowChoice,
  setSelectedPath,
  setCategoryForFlashCards,
  setStreakAtCompletion,
  setOpenedFromUrl,
  setCheckpointsAnswered,
  setIsIdleAnimationMode,
  
  // Refs
  canvasRef,
  offsetRef,
  forkPositionRef,
  checkpointPositionRef,
  checkpointFadeStartTimeRef,
  checkpointSoundPlayedRef,
  
  // Current state
  streak,
  selectedPath,
  gameMode,
  openedFromUrl,
  checkpointsAnswered,
  currentCheckpointLimit,
  totalPoints,
  setTotalPoints,
}) => {
  // Search dialog state
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchPaused, setIsSearchPaused] = useState(false);

  // Search handlers
  const handleSearchClick = useCallback(() => {
    // Pause the game if it's not already paused by something else
    if (!isPaused) {
      setIsPaused(true);
      setIsSearchPaused(true);
    }
    setShowSearch(true);
  }, [isPaused, setIsPaused]);

  const handleSearchClose = useCallback(() => {
    setShowSearch(false);
    // Only resume if we were the ones who paused it
    if (isSearchPaused) {
      setIsPaused(false);
      setIsSearchPaused(false);
    }
  }, [isSearchPaused, setIsPaused]);

  // Character and theme shop handlers with pause management
  const handleOpenShop = useCallback(() => {
    handleOpenCharacterShop();
    setIsPaused(true);
  }, [handleOpenCharacterShop, setIsPaused]);

  const handleCloseShop = useCallback(() => {
    handleCloseCharacterShop();
    setIsPaused(false);
  }, [handleCloseCharacterShop, setIsPaused]);

  const handlePurchaseCharacterWrapper = useCallback((characterId, cost) => {
    purchaseCharacter(characterId, cost, totalPoints, setTotalPoints);
  }, [purchaseCharacter, totalPoints, setTotalPoints]);

  const handlePurchaseThemeWrapper = useCallback((themeId, cost) => {
    purchaseTheme(themeId, cost, totalPoints, setTotalPoints);
  }, [purchaseTheme, totalPoints, setTotalPoints]);

  // Flash cards handlers
  const handleFlashCardsAccept = useCallback(() => {
    setShowFlashCardsOffer(false);
    setShowFlashCards(true);
  }, [setShowFlashCardsOffer, setShowFlashCards]);

  const handleFlashCardsDecline = useCallback(() => {
    setShowFlashCardsOffer(false);
    // Continue to category selector
    setIsPaused(true);
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
      }
      setShowChoice(true);
    }, 100);
  }, [setShowFlashCardsOffer, setIsPaused, canvasRef, offsetRef, forkPositionRef, setShowChoice]);

  const handleFlashCardsComplete = useCallback(() => {
    setShowFlashCards(false);
    
    // Check if we're in flashcard mode as part of the game flow
    if (gameMode === 'flashcard' && selectedPath) {
      // Resume game and move to next checkpoint (similar to question flow)
      setIsPaused(false);
      setCheckpointsAnswered(prev => prev + 1);
      
      // Position next checkpoint
      const canvas = canvasRef.current;
      if (canvas) {
        checkpointPositionRef.current = offsetRef.current + canvas.width * 0.5 + 95;
      }
      checkpointFadeStartTimeRef.current = null;
      checkpointSoundPlayedRef.current = false;
      
      // Check if category is complete
      if (checkpointsAnswered + 1 >= currentCheckpointLimit) {
        // Category completed, return to fork
        setTimeout(() => {
          const canvas = canvasRef.current;
          if (canvas) {
            offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
          }
          setIsPaused(true);
          setShowChoice(true);
          setSelectedPath(null);
        }, 100);
      }
    } else {
      // Debug mode or original flow - continue to category selector
      // Pause immediately to stop walker movement
      setIsPaused(true);
      
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
        }
        setShowChoice(true);
      }, 100);
    }
  }, [
    setShowFlashCards, gameMode, selectedPath, setIsPaused, setCheckpointsAnswered,
    canvasRef, offsetRef, forkPositionRef, checkpointPositionRef,
    checkpointFadeStartTimeRef, checkpointSoundPlayedRef,
    checkpointsAnswered, currentCheckpointLimit, setShowChoice, setSelectedPath
  ]);

  const handleFlashCardsClose = useCallback(() => {
    // User clicked close button
    setShowFlashCards(false);
    
    // If opened from URL, don't show path choice - just close
    if (openedFromUrl) {
      setOpenedFromUrl(false); // Reset the flag
      setIsPaused(false); // Unpause the game
    } else {
      // Normal flow - return to path choice dialog
      setIsPaused(true);
      
      // Return to fork/category selection
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
        }
        setShowChoice(true);
        setSelectedPath(null);
      }, 100);
    }
  }, [
    setShowFlashCards, openedFromUrl, setOpenedFromUrl, setIsPaused,
    canvasRef, offsetRef, forkPositionRef, setShowChoice, setSelectedPath
  ]);

  // Debug handler to open flash cards directly from category selector
  const handleDebugOpenFlashCards = useCallback(() => {
    // Set default values for testing
    setCategoryForFlashCards('food');
    setStreakAtCompletion(streak || 5);
    setShowChoice(false);
    setIsIdleAnimationMode(false);
    setShowFlashCards(true);
  }, [setCategoryForFlashCards, setStreakAtCompletion, streak, setShowChoice, setIsIdleAnimationMode, setShowFlashCards]);

  return {
    // Search state
    showSearch,
    setShowSearch,
    isSearchPaused,
    
    // Search handlers
    handleSearchClick,
    handleSearchClose,
    
    // Shop handlers
    handleOpenShop,
    handleCloseShop,
    handlePurchaseCharacterWrapper,
    handlePurchaseThemeWrapper,
    
    // Flash cards handlers
    handleFlashCardsAccept,
    handleFlashCardsDecline,
    handleFlashCardsComplete,
    handleFlashCardsClose,
    handleDebugOpenFlashCards,
  };
};

export default useDialogHandlers;
