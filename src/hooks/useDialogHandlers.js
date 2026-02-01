/**
 * useDialogHandlers Hook
 * Manages dialog open/close states and handlers
 */

import { useState, useCallback } from 'react';

export const useDialogHandlers = ({
  // Pause state
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
  setGameMode,
  
  // Refs
  canvasRef,
  offsetRef,
  forkPositionRef,
  skipCameraRepositionRef,
  
  // Current state
  streak,
  selectedPath,
  gameMode,
  currentCheckpointLimit,
}) => {
  // Search dialog state
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchPaused, setIsSearchPaused] = useState(false);

  // Character and theme shop handlers with pause management
  const handleOpenShop = useCallback(() => {
    handleOpenCharacterShop();
    setIsPaused(true);
  }, [handleOpenCharacterShop, setIsPaused]);

  const handleCloseShop = useCallback(() => {
    handleCloseCharacterShop();
    setIsPaused(false);
  }, [handleCloseCharacterShop, setIsPaused]);

  const handlePurchaseCharacterWrapper = useCallback((characterId, cost, totalPoints, setTotalPoints) => {
    purchaseCharacter(characterId, cost, totalPoints, setTotalPoints);
  }, [purchaseCharacter]);

  const handlePurchaseThemeWrapper = useCallback((themeId, cost, totalPoints, setTotalPoints) => {
    purchaseTheme(themeId, cost, totalPoints, setTotalPoints);
  }, [purchaseTheme]);

  // Search handlers
  const handleSearchClick = useCallback(() => {
    // Pause the game if it's not already paused by something else
    setIsPaused(prev => {
      if (!prev) {
        setIsSearchPaused(true);
      }
      return true;
    });
    setShowSearch(true);
  }, [setIsPaused]);

  const handleSearchClose = useCallback(() => {
    setShowSearch(false);
    // Only resume if we were the ones who paused it
    if (isSearchPaused) {
      setIsPaused(false);
      setIsSearchPaused(false);
    }
  }, [isSearchPaused, setIsPaused]);

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
      // Resume game and move to next checkpoint
      setIsPaused(false);
      setCheckpointsAnswered(prev => prev + 1);
      
      // Position next checkpoint
      const canvas = canvasRef.current;
      if (canvas) {
        // This will be handled by the parent component
      }
      
      // Check if category is complete
      // This logic should be in the parent component
    }
  }, [setShowFlashCards, gameMode, selectedPath, setIsPaused, setCheckpointsAnswered, canvasRef]);

  const handleFlashCardsClose = useCallback((openedFromUrl) => {
    // User clicked close button
    setShowFlashCards(false);
    
    // If opened from URL, don't show path choice - just close
    if (openedFromUrl) {
      setOpenedFromUrl(false);
      setIsPaused(false);
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
  }, [setShowFlashCards, setOpenedFromUrl, setIsPaused, canvasRef, offsetRef, forkPositionRef, setShowChoice, setSelectedPath]);

  // Debug handler to open flash cards directly from category selector
  const handleDebugOpenFlashCards = useCallback(() => {
    setCategoryForFlashCards('food');
    setStreakAtCompletion(streak || 5);
    setShowChoice(false);
    setShowFlashCards(true);
  }, [setCategoryForFlashCards, setStreakAtCompletion, streak, setShowChoice, setShowFlashCards]);

  return {
    // Search state
    showSearch,
    setShowSearch,
    isSearchPaused,
    
    // Shop handlers
    handleOpenShop,
    handleCloseShop,
    handlePurchaseCharacterWrapper,
    handlePurchaseThemeWrapper,
    
    // Search handlers
    handleSearchClick,
    handleSearchClose,
    
    // Flash cards handlers
    handleFlashCardsAccept,
    handleFlashCardsDecline,
    handleFlashCardsComplete,
    handleFlashCardsClose,
    handleDebugOpenFlashCards,
  };
};

export default useDialogHandlers;
