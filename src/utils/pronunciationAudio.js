/**
 * Pronunciation Audio Manager
 * Handles remote audio playback for word pronunciations
 * Only fetches audio when online and checks for file existence before displaying play button
 * 
 * Files are organized by category: /audio-samples/{category}/{questionId}.mp3
 * Example: https://impressto.ca/wordwalker/audio-samples/grammar/grammar_001.mp3
 */

import audioConfig from '../config/audioConfig';

class PronunciationAudioManager {
  constructor() {
    this.baseUrl = audioConfig.pronunciationBaseUrl;
    this.audioCache = new Map(); // Cache for audio elements
    this.existenceCache = new Map(); // Cache for file existence checks
    this.fileFormat = audioConfig.pronunciationFormat;
    this.checkTimeout = audioConfig.pronunciationCheckTimeout;
    this.defaultVolume = audioConfig.pronunciationVolume;
  }

  /**
   * Check if the app is currently online
   * @returns {boolean} True if online, false if offline
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Get the full URL for an audio file based on question
   * @param {Object} question - The question object containing id and category
   * @returns {string} The full URL to the audio file
   */
  getAudioUrl(question) {
    if (!question || !question.id || !question.category) {
      return null;
    }
    return `${this.baseUrl}${question.category}/${question.id}.${this.fileFormat}`;
  }

  /**
   * Check if audio file exists on the remote server
   * Uses HEAD request to avoid downloading the entire file
   * Results are cached to avoid repeated network requests
   * @param {Object} question - The question object containing id and category
   * @returns {Promise<boolean>} True if file exists, false otherwise
   */
  async checkAudioExists(question) {
    // Return false immediately if offline
    if (!this.isOnline()) {
      return false;
    }

    const url = this.getAudioUrl(question);
    
    // Return false if we couldn't generate a valid URL
    if (!url) {
      return false;
    }
    
    // Check cache first
    if (this.existenceCache.has(url)) {
      return this.existenceCache.get(url);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.checkTimeout);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const exists = response.ok;
      this.existenceCache.set(url, exists);
      return exists;
    } catch (error) {
      // Network error, timeout, or file doesn't exist
      this.existenceCache.set(url, false);
      return false;
    }
  }

  /**
   * Play the pronunciation audio for a question
   * @param {Object} question - The question object containing id and category
   * @param {number} volume - Volume level (0.0 to 1.0)
   * @returns {Promise<boolean>} True if playback started, false otherwise
   */
  async playPronunciation(question, volume = null) {
    // Don't attempt to play if offline
    if (!this.isOnline()) {
      console.log('Cannot play pronunciation audio while offline');
      return false;
    }

    const url = this.getAudioUrl(question);
    
    if (!url) {
      console.log('Cannot generate audio URL for question');
      return false;
    }
    
    const playbackVolume = volume !== null ? volume : this.defaultVolume;

    try {
      // Check if we have a cached audio element
      let audio = this.audioCache.get(url);

      if (!audio) {
        // Create new audio element
        audio = new Audio(url);
        audio.volume = playbackVolume;
        
        // Cache it for future use
        this.audioCache.set(url, audio);
      } else {
        // Reset playback if audio was already playing
        audio.currentTime = 0;
        audio.volume = playbackVolume;
      }

      await audio.play();
      return true;
    } catch (error) {
      console.error('Error playing pronunciation audio:', error);
      // Remove from cache if it failed to play
      this.audioCache.delete(url);
      return false;
    }
  }

  /**
   * Preload audio file for faster playback
   * Only preloads if online and file exists
   * @param {Object} question - The question object containing id and category
   */
  async preloadAudio(question) {
    if (!this.isOnline()) {
      return;
    }

    const url = this.getAudioUrl(question);
    
    if (!url || this.audioCache.has(url)) {
      return; // Already loaded or invalid URL
    }

    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.audioCache.set(url, audio);
    } catch (error) {
      // Silently fail - not critical
    }
  }

  /**
   * Clear the audio cache to free up memory
   */
  clearCache() {
    this.audioCache.clear();
    this.existenceCache.clear();
  }

  /**
   * Set the base URL for audio files
   * @param {string} url - The new base URL
   */
  setBaseUrl(url) {
    this.baseUrl = url.endsWith('/') ? url : `${url}/`;
    // Clear caches since URLs have changed
    this.clearCache();
  }
}

// Export singleton instance
export const pronunciationAudio = new PronunciationAudioManager();
export default pronunciationAudio;
