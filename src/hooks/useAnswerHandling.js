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
import { FLASH_CARDS_ENABLED } from '../config/flashCardsConfig';

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
  maxStreakInCategory,
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
  setMaxStreakInCategory,
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
  setShowChoice,
  setShowFlashCardsOffer,
  setCategoryForFlashCards,
  setStreakAtCompletion,
  
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
  canvasRef,
  
  // Callbacks
  loadNewQuestion,
  soundManagerRef,
}) => {
  // Prevent double-processing of answers
  const processingAnswerRef = useRef(false);
  
  // Store the answered question for translation overlay (before loading next question)
  const answeredQuestionRef = useRef(null);

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
    // Store the current question for the translation overlay
    // (we'll load the next question but overlay needs to show this one)
    answeredQuestionRef.current = currentQuestion;
    
    // Immediately hide question dialog and show translation overlay
    setShowQuestion(false);
    setQuestionAnswered(true); // Mark as answered to prevent question dialog from reappearing
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
      
      // Update max streak if this is a new high for the current category
      if (newStreak > maxStreakInCategory) {
        setMaxStreakInCategory(newStreak);
      }
      
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
    
    // Determine translation display duration using configured setting
    // translationBox.displayDuration controls how long overlay stays visible
    const configuredDuration = getTranslationBoxDuration();
    const streakBonusPause = (newStreak > 0 && newStreak % gameSettings.streak.bonusThreshold === 0) 
      ? gameSettings.streak.extraPauseDuration 
      : 0;
    const translationDisplayDuration = configuredDuration + streakBonusPause;
    
    // Calculate the new checkpoint count for passing to both timeout handlers
    const newCheckpointsAnswered = checkpointsAnswered + 1;
    
    // Resume walking after the victory animation completes
    // Victory animation: 6 frames * 12 loops * ~16.67ms per frame ≈ 1200ms
    // This allows the walker to continue moving while translation is still visible
    const victoryAnimationDuration = 1300; // ~1.3 seconds to ensure victory animation completes
    setTimeout(() => {
      // Continue to next checkpoint/question logic (but don't load new question yet)
      handleAfterCorrectAnswer(newStreak, newCheckpointsAnswered, false); // Pass false to skip loading new question
    }, victoryAnimationDuration);
    
    // Hide translation overlay after the full display duration
    // This runs independently, keeping the overlay visible while walker moves
    // Controlled by gameSettings.translationBox.displayDuration
    setTimeout(() => {
      console.log('🔔 Translation overlay hiding, loading new question...', { 
        newCheckpointsAnswered, 
        checkpointsPerCategory,
        willLoadQuestion: newCheckpointsAnswered < checkpointsPerCategory 
      });
      setShowTranslation(false);
      // Now load the new question after translation is hidden
      handleAfterCorrectAnswer(newStreak, newCheckpointsAnswered, true); // Pass true to load new question
    }, translationDisplayDuration);
  };

  /**
   * Handle logic after correct answer pause
   * @param {number} newStreak - The updated streak value
   * @param {number} newCheckpointsAnswered - The new checkpoint count
   * @param {boolean} shouldLoadNewQuestion - Whether to load the new question
   */
  const handleAfterCorrectAnswer = (newStreak, newCheckpointsAnswered, shouldLoadNewQuestion = true) => {
    // Note: setShowTranslation is now handled separately in handleCorrectAnswer
    // to allow translation to remain visible while walker continues moving
    
    // Only run the full logic once (when shouldLoadNewQuestion is false for the first call)
    if (!shouldLoadNewQuestion) {
      // First call (after victory animation) - just unpause and set up for next checkpoint
      // Reset processing flag to allow next answer
      processingAnswerRef.current = false;
      
      // Update checkpoint counter
      setCheckpointsAnswered(newCheckpointsAnswered);
      
      setFirstAttempt(true); // Reset for next question
      setIncorrectAnswers([]); // Reset incorrect answers for next question
      setHintUsed(false); // Reset hint usage for next question
      
      // Check if we've completed all checkpoints for this category
      if (newCheckpointsAnswered >= checkpointsPerCategory) {
        // Keep paused when category is completed - will unpause when user selects new category
        setIsPaused(true);
        // Prepare category completion but don't show choice dialog yet
        handleCategoryCompletion(false); // Pass false to skip showing choice dialog
      } else {
        // Only unpause if continuing in the same category
        setIsPaused(false);
        // Prepare for next checkpoint and load new question immediately
        checkpointPositionRef.current += checkpointSpacing;
        checkpointFadeStartTimeRef.current = null;
        checkpointSoundPlayedRef.current = false;
        // Load new question NOW so checkpoint shows correct emoji
        const category = forkCategories[selectedPath] || selectedPath;
        loadNewQuestion(category);
        // Set questionAnswered to false so checkpoint appears with new emoji
        setQuestionAnswered(false);
        console.log('✅ Loading new question immediately for correct checkpoint emoji');
      }
    } else {
      // Second call (after translation hidden)
      console.log('🎯 Second call to handleAfterCorrectAnswer - question already loaded');
      // If category was completed, now show the choice dialog
      if (newCheckpointsAnswered >= checkpointsPerCategory) {
        handleCategoryCompletion(true); // Pass true to show choice dialog now
      }
    }
  };

  /**
   * Handle category completion logic
   * @param {boolean} shouldShowChoice - Whether to show the category choice dialog
   */
  const handleCategoryCompletion = (shouldShowChoice = true) => {
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
    
    // Only show choice dialog if requested (after translation is hidden)
    if (shouldShowChoice) {
      // Check if player achieved a streak at any point in this category and offer flash cards
      // Only offer flash cards for the 'food' category in this experimental feature
      if (FLASH_CARDS_ENABLED && maxStreakInCategory > 0 && currentCategory === 'food') {
        // Store the category and the max streak achieved for flash cards
        setCategoryForFlashCards(currentCategory);
        setStreakAtCompletion(maxStreakInCategory);
        
        // Show flash cards offer dialog instead of going directly to category selector
        setTimeout(() => {
          setShowFlashCardsOffer(true);
        }, 100);
      } else {
        // Position camera to show fork and trigger the choice dialog
        // Use a small delay to ensure state updates have propagated
        setTimeout(() => {
          const canvas = canvasRef.current;
          if (canvas) {
            offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
          }
          setShowChoice(true);
        }, 100);
      }
    }
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
    answeredQuestionRef,
  };
};
