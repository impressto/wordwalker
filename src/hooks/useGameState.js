/**
 * useGameState Hook
 * Manages game state persistence including loading, saving, and auto-save functionality
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { loadGameState, saveGameState, clearGameState, hasSavedGameState, convertLoadedState } from '../utils/gameStatePersistence';
import { initializeForkCategories } from '../utils/categoryRotation';
import gameSettings from '../config/gameSettings';

export const useGameState = ({
  // State setters from parent
  setTotalPoints,
  setStreak,
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
  setCurrentCharacter,
  setOwnedCharacters,
  setCurrentTheme,
  setOwnedThemes,
  setCheckpointsAnswered,
  
  // Refs from parent
  offsetRef,
  forkPositionRef,
  checkpointPositionRef,
  targetOffsetRef,
  
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
  currentCharacter,
  ownedCharacters,
  currentTheme,
  ownedThemes,
  
  // Checkpoint config
  checkpointsPerCategory,
  checkpointSpacing,
}) => {
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedStats, setSavedStats] = useState(null);
  const autosaveTimerRef = useRef(null);

  // Check for saved game state on mount
  const checkSavedState = useCallback(() => {
    if (hasSavedGameState()) {
      const loadedState = loadGameState();
      if (loadedState) {
        setSavedStats({
          points: loadedState.totalPoints || 0,
          streak: loadedState.streak || 0,
          masteredQuestions: Object.values(loadedState.correctAnswersByCategory || {})
            .reduce((sum, arr) => sum + arr.length, 0)
        });
        return loadedState;
      }
    }
    return null;
  }, []);

  // Resume game with saved state
  const handleResumeGame = useCallback((loadedState) => {
    setShowResumeDialog(false);
    
    if (!loadedState) return;
    
    const convertedState = convertLoadedState(loadedState);
    
    // Restore all state from saved game
    setTotalPoints(convertedState.totalPoints);
    setStreak(convertedState.streak);
    setSelectedPath(convertedState.selectedPath);
    setForkCategories(convertedState.forkCategories);
    setCompletedCategories(convertedState.completedCategories);
    setPresentedCategories(convertedState.presentedCategories);
    setUsedQuestionIds(convertedState.usedQuestionIds);
    setCorrectFirstTryIds(convertedState.correctFirstTryIds);
    setCorrectAnswersByCategory(convertedState.correctAnswersByCategory);
    setSoundEnabled(convertedState.soundEnabled);
    setVolume(convertedState.volume);
    setMusicEnabled(convertedState.musicEnabled);
    setCurrentCharacter(convertedState.currentCharacter);
    setOwnedCharacters(convertedState.ownedCharacters);
    setCurrentTheme(convertedState.currentTheme);
    setOwnedThemes(convertedState.ownedThemes);
    
    // Restore scroll position
    offsetRef.current = convertedState.offsetRef || 0;
    
    // Restore checkpoints answered
    const savedCheckpointsAnswered = convertedState.checkpointsAnswered || 0;
    setCheckpointsAnswered(savedCheckpointsAnswered);
    targetOffsetRef.current = null;
    
    // Restore checkpoint position based on saved progress
    const nextCheckpointIndex = savedCheckpointsAnswered;
    checkpointPositionRef.current = forkPositionRef.current + 1500 + (nextCheckpointIndex * checkpointSpacing);
  }, [
    setTotalPoints, setStreak, setSelectedPath, setForkCategories, setCompletedCategories,
    setPresentedCategories, setUsedQuestionIds, setCorrectFirstTryIds, setCorrectAnswersByCategory,
    setSoundEnabled, setVolume, setMusicEnabled, setCurrentCharacter, setOwnedCharacters,
    setCurrentTheme, setOwnedThemes, setCheckpointsAnswered, offsetRef, forkPositionRef,
    checkpointPositionRef, targetOffsetRef, checkpointSpacing
  ]);

  // Start new game (clear saved state but preserve mastered questions)
  const handleNewGame = useCallback((canvasRef) => {
    setShowResumeDialog(false);
    
    // Load current correctAnswersByCategory before clearing state
    const loadedState = loadGameState();
    const persistedCorrectAnswers = loadedState?.correctAnswersByCategory || {};
    
    // Clear game state but don't reset to zero - keep mastered questions
    clearGameState();
    
    // Reset all game state to initial values
    setTotalPoints(0);
    setStreak(0);
    setSelectedPath(null);
    setForkCategories(initializeForkCategories());
    setCompletedCategories(new Set());
    setPresentedCategories(new Set());
    setUsedQuestionIds({});
    setCorrectAnswersByCategory(persistedCorrectAnswers); // Preserve learned questions
    offsetRef.current = -300;
    targetOffsetRef.current = null;
    
    // Position camera to show fork on the right side
    const canvas = canvasRef.current;
    if (canvas) {
      offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
    }
  }, [
    setTotalPoints, setStreak, setSelectedPath, setForkCategories, setCompletedCategories,
    setPresentedCategories, setUsedQuestionIds, setCorrectAnswersByCategory, offsetRef,
    forkPositionRef, targetOffsetRef
  ]);

  // Auto-save game state periodically
  const setupAutosave = useCallback(() => {
    // Clear any existing timer
    if (autosaveTimerRef.current) {
      clearInterval(autosaveTimerRef.current);
    }
    
    // Set up new auto-save interval (every 30 seconds)
    autosaveTimerRef.current = setInterval(() => {
      const stateToSave = {
        totalPoints,
        streak,
        maxStreakInCategory,
        selectedPath,
        checkpointsAnswered,
        usedQuestionIds,
        completedCategories: Array.from(completedCategories),
        forkCategories,
        presentedCategories: Array.from(presentedCategories),
        soundEnabled,
        volume,
        musicEnabled,
        correctFirstTryIds,
        correctAnswersByCategory,
        offsetRef: offsetRef.current,
        currentCharacter,
        ownedCharacters,
        currentTheme,
        ownedThemes,
      };
      saveGameState(stateToSave);
    }, 30000);
    
    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
      }
    };
  }, [
    totalPoints, streak, maxStreakInCategory, selectedPath, checkpointsAnswered,
    usedQuestionIds, completedCategories, forkCategories, presentedCategories,
    soundEnabled, volume, musicEnabled, correctFirstTryIds, correctAnswersByCategory,
    currentCharacter, ownedCharacters, currentTheme, ownedThemes, offsetRef
  ]);

  // Immediate save function for important state changes
  const saveImmediately = useCallback(() => {
    const stateToSave = {
      totalPoints,
      streak,
      maxStreakInCategory,
      selectedPath,
      checkpointsAnswered,
      usedQuestionIds,
      completedCategories: Array.from(completedCategories),
      forkCategories,
      presentedCategories: Array.from(presentedCategories),
      soundEnabled,
      volume,
      musicEnabled,
      correctFirstTryIds,
      correctAnswersByCategory,
      offsetRef: offsetRef.current,
      currentCharacter,
      ownedCharacters,
      currentTheme,
      ownedThemes,
    };
    saveGameState(stateToSave);
  }, [
    totalPoints, streak, maxStreakInCategory, selectedPath, checkpointsAnswered,
    usedQuestionIds, completedCategories, forkCategories, presentedCategories,
    soundEnabled, volume, musicEnabled, correctFirstTryIds, correctAnswersByCategory,
    currentCharacter, ownedCharacters, currentTheme, ownedThemes, offsetRef
  ]);

  return {
    showResumeDialog,
    setShowResumeDialog,
    savedStats,
    setSavedStats,
    checkSavedState,
    handleResumeGame,
    handleNewGame,
    setupAutosave,
    saveImmediately,
  };
};

export default useGameState;
