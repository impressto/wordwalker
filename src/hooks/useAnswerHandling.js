/**
 * Answer Handling Hook
 * 
 * Custom hook that manages the logic for handling answer choices,
 * including validation, scoring, streak tracking, and progression
 */

import { useRef } from 'react';
import { addToFirstTryByCategory, addCorrectAnswer } from '../utils/questionTracking';
import { generateNewForkCategories, extractCategoryIds } from '../utils/categoryRotation';
import { getAllCategoryIds } from '../config/questions';
import gameSettings, { getTranslationBoxDuration } from '../config/gameSettings';

/**
 * Custom hook for handling answer choices in the game
 * @param {Object} params - Hook parameters
 * @returns {Object} Handler functions and state
 */
export const useAnswerHandling = ({
  // Current state
  currentQuestion,
  firstAttempt,
  incorrectAnswers,
  hintUsed,
  streak,
  checkpointsAnswered,
  checkpointsPerCategory,
  selectedPath,
  forkCategories,
  completedCategories,
  presentedCategories,
  isPreviewMode,
  
  // State setters
  setIsPreviewMode,
  setQuestionDialogOpacity,
  setShowTranslation,
  setShowHint,
  setCorrectFirstTryIds,
  setCorrectAnswersByCategory,
  setTotalPoints,
  setStreak,
  setIsVictoryAnimation,
  setCheckpointsAnswered,
  setQuestionAnswered,
  setShowQuestion,
  setIsPaused,
  setFirstAttempt,
  setIncorrectAnswers,
  setHintUsed,
  setCompletedCategories,
  setSelectedPath,
  setCurrentQuestion,
  setForkCategories,
  setPresentedCategories,
  
  // Refs
  walkerFrameRef,
  victoryAnimationCounterRef,
  walkerPressTimerRef,
  offsetRef,
  forkPositionRef,
  checkpointPositionRef,
  checkpointSpacing,
  checkpointFadeStartTimeRef,
  checkpointSoundPlayedRef,
  
  // Callbacks
  loadNewQuestion,
  soundManagerRef,
}) => {
  // Prevent double-processing of answers
  const processingAnswerRef = useRef(false);

  /**
   * Handle answer choice selection
   * @param {string} answer - The selected answer
   */
  const handleAnswerChoice = (answer) => {
    if (!currentQuestion) return;
    
    // Exit preview mode if active (user is answering the question)
    if (isPreviewMode) {
      setIsPreviewMode(false);
      setQuestionDialogOpacity(1); // Reset opacity immediately
      // Clear any pending timer
      if (walkerPressTimerRef.current) {
        clearTimeout(walkerPressTimerRef.current);
        walkerPressTimerRef.current = null;
      }
    }
    
    // Prevent double-processing using ref
    if (processingAnswerRef.current) {
      return;
    }
    
    processingAnswerRef.current = true;
    
    // Skip if this answer was already tried and was incorrect
    if (incorrectAnswers.includes(answer)) {
      processingAnswerRef.current = false;
      return;
    }
    
    if (answer === currentQuestion.correctAnswer) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer(answer);
    }
  };

  /**
   * Handle correct answer logic
   */
  const handleCorrectAnswer = () => {
    // Show translation and pause
    setShowTranslation(true);
    setShowHint(false); // Clear hint on correct answer
    
    // Increment streak for correct answer on first attempt
    let newStreak = streak;
    if (firstAttempt) {
      // Track this question as answered correctly on first try (session-scoped, organized by category)
      setCorrectFirstTryIds(prev => 
        addToFirstTryByCategory(currentQuestion.id, currentQuestion.category, prev)
      );
      
      // Add to persistent category-based tracking
      setCorrectAnswersByCategory(prev => 
        addCorrectAnswer(currentQuestion.id, currentQuestion.category, prev)
      );
      
      // Calculate points to award based on whether hint was used
      let pointsToAward = currentQuestion.points;
      
      if (hintUsed) {
        // If hint was used, award only half points
        pointsToAward = Math.floor(currentQuestion.points / 2);
      }
      
      // Play correct sound only on first attempt
      if (soundManagerRef.current) {
        soundManagerRef.current.playCorrect();
      }
      
      newStreak = streak + 1;
      setStreak(newStreak);
      
      // Award points (full or half depending on hint usage)
      setTotalPoints(prevPoints => prevPoints + pointsToAward);
      
      // Award streak bonus every N correct answers in a row (configurable)
      if (newStreak > 0 && newStreak % gameSettings.streak.bonusThreshold === 0) {
        // Award bonus points
        setTotalPoints(prevPoints => prevPoints + gameSettings.streak.bonusPoints);
        
        // Play streak bonus sound (pass the streak level to play the appropriate sound)
        if (soundManagerRef.current) {
          soundManagerRef.current.playStreak(newStreak);
        }
      }
    } else {
      // Correct answer on retry - no points, but play a softer sound
      if (soundManagerRef.current) {
        soundManagerRef.current.playCorrect();
      }
    }
    
    // Trigger victory animation
    setIsVictoryAnimation(true);
    walkerFrameRef.current = 0; // Start victory animation from first frame
    victoryAnimationCounterRef.current = 0;
    
    // Determine pause duration - use configured translation box duration
    // If duration is 0 (infinite), use a minimum of 2 seconds for the victory animation
    const configuredDuration = getTranslationBoxDuration();
    const baseTranslationPause = configuredDuration === 0 ? 2000 : configuredDuration;
    const streakBonusPause = (newStreak > 0 && newStreak % gameSettings.streak.bonusThreshold === 0) 
      ? gameSettings.streak.extraPauseDuration 
      : 0;
    const pauseDuration = baseTranslationPause + streakBonusPause;
    
    // Pause to show the translation, then continue
    setTimeout(() => {
      handleAfterCorrectAnswer(newStreak);
    }, pauseDuration);
  };

  /**
   * Handle logic after correct answer pause
   * @param {number} newStreak - The updated streak value
   */
  const handleAfterCorrectAnswer = (newStreak) => {
    setShowTranslation(false);
    
    // Reset processing flag to allow next answer
    processingAnswerRef.current = false;
    
    // Increment checkpoint counter
    const newCheckpointsAnswered = checkpointsAnswered + 1;
    setCheckpointsAnswered(newCheckpointsAnswered);
    
    setQuestionAnswered(true);
    setShowQuestion(false);
    setIsPaused(false);
    setFirstAttempt(true); // Reset for next question
    setIncorrectAnswers([]); // Reset incorrect answers for next question
    setHintUsed(false); // Reset hint usage for next question
    
    // Check if we've completed all checkpoints for this category
    if (newCheckpointsAnswered >= checkpointsPerCategory) {
      handleCategoryCompletion();
    } else {
      handleNextCheckpoint();
    }
  };

  /**
   * Handle category completion logic
   */
  const handleCategoryCompletion = () => {
    // Mark the current category as globally completed
    // selectedPath can be either a choice key or a categoryId directly
    const currentCategory = forkCategories[selectedPath] || selectedPath;
    setCompletedCategories(prev => new Set([...prev, currentCategory]));
    
    // Reset for next fork
    setCheckpointsAnswered(0);
    setSelectedPath(null);
    setQuestionAnswered(false);
    setCurrentQuestion(null); // Clear current question
    
    // Generate new random categories for the next fork, excluding the just-completed category
    // Pass the currentCategory as additionalCompleted to ensure it's excluded immediately
    const newForkCategories = generateNewForkCategories(
      completedCategories,
      presentedCategories,
      null,
      new Set([currentCategory])
    );
    setForkCategories(newForkCategories);
    
    // Add the new categories to presented set, reset if needed
    setPresentedCategories(prev => {
      const newPresented = new Set([...prev, ...extractCategoryIds(newForkCategories)]);
      // If all available categories have been presented, reset
      const allCategories = getAllCategoryIds();
      const availableCategories = allCategories.filter(cat => !completedCategories.has(cat));
      if (availableCategories.every(cat => newPresented.has(cat))) {
        return new Set(extractCategoryIds(newForkCategories));
      }
      return newPresented;
    });
    
    // Position next fork further ahead - account for stop margin so it doesn't come too far into view
    // Adding extra distance (100px stopMargin) to compensate for the stopping point
    forkPositionRef.current = offsetRef.current + 600;
    
    // Reset checkpoint position for after next fork
    checkpointPositionRef.current = forkPositionRef.current + 1500;
  };

  /**
   * Handle moving to next checkpoint in the same category
   */
  const handleNextCheckpoint = () => {
    // Move to next checkpoint in the same category
    checkpointPositionRef.current += checkpointSpacing;
    setQuestionAnswered(false); // Ready for next checkpoint
    
    // Reset fade-in timer for new checkpoint
    checkpointFadeStartTimeRef.current = null;
    
    // Reset checkpoint sound flag for next checkpoint
    checkpointSoundPlayedRef.current = false;
    
    // Load the next question immediately for the next checkpoint
    // selectedPath can be either a choice key or a categoryId directly
    const category = forkCategories[selectedPath] || selectedPath;
    loadNewQuestion(category);
  };

  /**
   * Handle incorrect answer logic
   * @param {string} answer - The incorrect answer
   */
  const handleIncorrectAnswer = (answer) => {
    // Wrong answer - track it, play wrong sound, reset streak on first attempt
    setIncorrectAnswers(prev => [...prev, answer]);
    
    // Reset processing flag to allow retry
    processingAnswerRef.current = false;
    
    if (soundManagerRef.current) {
      soundManagerRef.current.playWrong();
    }
    
    if (firstAttempt) {
      setStreak(0); // Reset streak on first wrong answer
      
      // If hint was used and this is the first wrong answer, apply point penalty
      if (hintUsed) {
        const penalty = Math.floor(currentQuestion.points / 2);
        setTotalPoints(prevPoints => Math.max(0, prevPoints - penalty)); // Can't go below 0
      }
    }
    setFirstAttempt(false);
  };

  return {
    handleAnswerChoice,
  };
};
