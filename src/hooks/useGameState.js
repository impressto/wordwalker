/**
 * useGameState Hook
 * Manages game state persistence including loading, saving, and auto-save functionality
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { loadGameState, saveGameState, clearGameState, hasSavedGameState, convertLoadedState } from '../utils/gameStatePersistence';
import { initializeForkCategories, extractCategoryIds } from '../utils/categoryRotation';
import gameSettings from '../config/gameSettings';

export const useGameState = ({
  // State setters from parent
  setTotalPoints,
  setStreak,
  setMaxStreakInCategory,
  setSelectedPath,
  setForkCategories,
  setCompletedCategories,
  setPresentedCategories,
  setUsedQuestionIds,
  setCorrectFirstTryIds,
  setCorrectAnswersByCategory,
  setSoundEnabled,
  setVolume,
  setMusicEnabled,
  setCheckpointsAnswered,
  setShowQuestion,
  setCurrentQuestion,
  setQuestionAnswered,
  setFirstAttempt,
  setIncorrectAnswers,
  setShowTranslation,
  setShowHint,
  setHintUsed,
  setShowChoice,
  setIsPaused,
  
  // Refs from parent
  canvasRef,
  offsetRef,
  velocityRef,
  forkPositionRef,
  checkpointPositionRef,
  targetOffsetRef,
  checkpointFadeStartTimeRef,
  checkpointSoundPlayedRef,
  
  // Current state values for saving
  totalPoints,
  streak,
  maxStreakInCategory,
  selectedPath,
  checkpointsAnswered,
  usedQuestionIds,
  completedCategories,
  forkCategories,
  presentedCategories,
  soundEnabled,
  volume,
  musicEnabled,
  correctFirstTryIds,
  correctAnswersByCategory,
  
  // Checkpoint config
  checkpointSpacing,
  
  // Flash cards state (to check if already showing)
  showFlashCards,
}) => {
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [hasCheckedSavedState, setHasCheckedSavedState] = useState(false);
  const [savedStats, setSavedStats] = useState(null);
  const [isJustResumed, setIsJustResumed] = useState(false);
  const autosaveTimerRef = useRef(null);

  // Check for saved game state on mount
  useEffect(() => {
    if (!hasCheckedSavedState && hasSavedGameState()) {
      const loadedState = loadGameState();
      if (loadedState) {
        const statsToSet = {
          totalPoints: loadedState.totalPoints,
          streak: loadedState.streak,
          checkpointsAnswered: loadedState.checkpointsAnswered,
          correctFirstTryIds: loadedState.correctFirstTryIds || [],
          correctAnswersByCategory: loadedState.correctAnswersByCategory || {},
        };
        setSavedStats(statsToSet);
      }
      setShowResumeDialog(true);
      setHasCheckedSavedState(true);
    } else {
      setHasCheckedSavedState(true);
    }
  }, [hasCheckedSavedState]);

  // Auto-save game state periodically
  useEffect(() => {
    // Only auto-save if game has started (path selected)
    if (!selectedPath) return;

    autosaveTimerRef.current = setInterval(() => {
      const gameState = {
        totalPoints,
        streak,
        maxStreakInCategory,
        selectedPath,
        checkpointsAnswered,
        usedQuestionIds,
        completedCategories,
        forkCategories,
        presentedCategories,
        soundEnabled,
        volume,
        musicEnabled,
        correctFirstTryIds,
        correctAnswersByCategory,
        offsetRef: offsetRef.current,
      };
      saveGameState(gameState);
    }, 5000); // Auto-save every 5 seconds

    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
      }
    };
  }, [totalPoints, streak, maxStreakInCategory, selectedPath, checkpointsAnswered, usedQuestionIds, completedCategories, forkCategories, presentedCategories, soundEnabled, volume, musicEnabled, correctFirstTryIds, correctAnswersByCategory, offsetRef]);

  // Resume game with saved state
  const handleResumeGame = useCallback(() => {
    const loadedState = loadGameState();
    if (loadedState) {
      const convertedState = convertLoadedState(loadedState);
      setTotalPoints(convertedState.totalPoints);
      setStreak(convertedState.streak);
      setMaxStreakInCategory(convertedState.maxStreakInCategory || 0);
      // Don't restore selectedPath - let the user choose category again when resuming
      setSelectedPath(null);
      setCheckpointsAnswered(convertedState.checkpointsAnswered);
      setUsedQuestionIds(convertedState.usedQuestionIds);
      setCompletedCategories(convertedState.completedCategories);
      setForkCategories(convertedState.forkCategories);
      setPresentedCategories(convertedState.presentedCategories || new Set());
      setSoundEnabled(convertedState.soundEnabled);
      setVolume(convertedState.volume);
      setMusicEnabled(convertedState.musicEnabled !== undefined ? convertedState.musicEnabled : true);
      setCorrectFirstTryIds(convertedState.correctFirstTryIds);
      setCorrectAnswersByCategory(convertedState.correctAnswersByCategory);
      
      // Restore scroll position and calculate next checkpoint
      offsetRef.current = convertedState.offsetRef || 0;
      
      // Reset velocity and target to ensure smooth forward movement from restored position
      velocityRef.current = 0;
      targetOffsetRef.current = null;
      
      // Recalculate checkpoint position based on how many checkpoints have been answered
      const nextCheckpointIndex = convertedState.checkpointsAnswered;
      checkpointPositionRef.current = forkPositionRef.current + 1500 + (nextCheckpointIndex * checkpointSpacing);
      
      // Reset checkpoint fade animation to trigger it fresh
      checkpointFadeStartTimeRef.current = null;
      checkpointSoundPlayedRef.current = false;
      
      // Set flag to indicate game was just resumed (for emergency stop safeguard)
      setIsJustResumed(true);
      
      // Pause the game on resume so animation doesn't start until user selects a category
      setIsPaused(true);
      
      // Position camera to show fork and trigger the choice dialog
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
        }
        // Only show choice dialog if not showing flash cards
        if (!showFlashCards) {
          setShowChoice(true);
        }
      }, 100);
      
      setShowResumeDialog(false);
    }
  }, [
    canvasRef, offsetRef, velocityRef, forkPositionRef, checkpointPositionRef,
    targetOffsetRef, checkpointFadeStartTimeRef, checkpointSoundPlayedRef,
    checkpointSpacing, showFlashCards,
    setTotalPoints, setStreak, setMaxStreakInCategory, setSelectedPath,
    setCheckpointsAnswered, setUsedQuestionIds, setCompletedCategories,
    setForkCategories, setPresentedCategories, setSoundEnabled, setVolume,
    setMusicEnabled, setCorrectFirstTryIds, setCorrectAnswersByCategory,
    setIsPaused, setShowChoice
  ]);

  // Start new game (clear saved state but preserve mastered questions)
  const handleNewGame = useCallback(() => {
    // Load current correctAnswersByCategory before clearing state
    const loadedState = loadGameState();
    const persistedCorrectAnswers = loadedState?.correctAnswersByCategory || {};
    
    clearGameState();
    setTotalPoints(0);
    setStreak(0);
    setMaxStreakInCategory(0);
    setSelectedPath(null);
    setCheckpointsAnswered(0);
    setUsedQuestionIds({});
    setCompletedCategories(new Set());
    setPresentedCategories(new Set());
    setCorrectFirstTryIds({});
    setCorrectAnswersByCategory(persistedCorrectAnswers); // Preserve learned questions
    
    // Generate fresh fork categories for new game
    const freshCategories = initializeForkCategories();
    setForkCategories(freshCategories);
    setPresentedCategories(new Set(extractCategoryIds(freshCategories)));
    
    setShowQuestion(false);
    setCurrentQuestion(null);
    setQuestionAnswered(false);
    setFirstAttempt(true);
    setIncorrectAnswers([]);
    setShowTranslation(false);
    setShowHint(false);
    setHintUsed(false);
    setShowChoice(false);
    setIsPaused(false);
    setIsJustResumed(false);
    setShowResumeDialog(false);
  }, [
    setTotalPoints, setStreak, setMaxStreakInCategory, setSelectedPath,
    setCheckpointsAnswered, setUsedQuestionIds, setCompletedCategories,
    setPresentedCategories, setCorrectFirstTryIds, setCorrectAnswersByCategory,
    setForkCategories, setShowQuestion, setCurrentQuestion, setQuestionAnswered,
    setFirstAttempt, setIncorrectAnswers, setShowTranslation, setShowHint,
    setHintUsed, setShowChoice, setIsPaused
  ]);

  return {
    showResumeDialog,
    setShowResumeDialog,
    hasCheckedSavedState,
    savedStats,
    isJustResumed,
    setIsJustResumed,
    handleResumeGame,
    handleNewGame,
  };
};

export default useGameState;
