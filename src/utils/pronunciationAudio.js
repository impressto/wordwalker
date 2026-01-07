/**
 * Pronunciation Audio Manager
 * Handles remote audio playback for word pronunciations
 * Only fetches audio when online and checks for file existence before displaying play button
 * 
 * Files are organized by category: /audio-samples/answers/{category}/{correctAnswer}.mp3
 * Example: https://impressto.ca/wordwalker/audio-samples/answers/grammar/yo.mp3
 */

import audioConfig from '../config/audioConfig';

class PronunciationAudioManager {
  constructor() {
    this.baseUrl = audioConfig.pronunciationBaseUrl;
    this.exampleBaseUrl = audioConfig.exampleAudioBaseUrl;
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
   * Uses the question's correctAnswer as the filename (converted to lowercase)
   * Trims leading ¿ and trailing ? characters from the filename
   * @param {Object} question - The question object containing correctAnswer and category
   * @returns {string} The full URL to the audio file
   */
  getAudioUrl(question) {
    console.log('🔍 getAudioUrl called with question:', question);
    
    if (!question || !question.correctAnswer || !question.category) {
      console.log('❌ Invalid question object:', { question });
      return null;
    }
    
    // Convert correctAnswer to lowercase since all MP3 filenames are lowercase
    // Trim leading ¿ and trailing ? characters for Spanish questions
    let filename = question.correctAnswer.toLowerCase();
    filename = filename.replace(/^¿+/, '').replace(/\?+$/, '');
    
    const url = `${this.baseUrl}${question.category}/${filename}.${this.fileFormat}`;
    console.log('📍 Generated URL:', url);
    return url;
  }

  /**
   * Get the full URL for an example audio file based on usage example text
   * Uses the usageExample text as the filename (preserves original capitalization)
   * Removes ¡, !, ¿, ?, . characters and leading em dashes to match actual file naming
   * @param {string} usageExample - The usage example text
   * @param {string} category - The category for the example
   * @returns {string} The full URL to the example audio file
   */
  getExampleAudioUrl(usageExample, category) {
    console.log('🔍 getExampleAudioUrl called with:', { usageExample, category });
    
    if (!usageExample || !category) {
      console.log('❌ Invalid parameters:', { usageExample, category });
      return null;
    }
    
    // Remove ¡, !, ¿, ?, . characters from filename to match actual file names
    let filename = usageExample.replace(/[¡!¿?.]/g, '');
    // Remove leading em dashes and spaces
    filename = filename.replace(/^—\s*/, '');
    
    const url = `${this.exampleBaseUrl}${category}/${filename}.${this.fileFormat}`;
    console.log('📍 Generated example URL:', url);
    return url;
  }

  /**
   * Check if audio file exists on the remote server
   * In development (localhost), assumes files exist to avoid CORS issues
   * In production, uses Audio element to check existence
   * Results are cached to avoid repeated network requests
   * @param {Object} question - The question object containing id and category
   * @returns {Promise<boolean>} True if file exists, false otherwise
   */
  async checkAudioExists(question) {
    console.log('checkAudioExists called with question:', question);
    
    // Return false immediately if offline
    if (!this.isOnline()) {
      console.log('App is offline, returning false');
      return false;
    }

    const url = this.getAudioUrl(question);
    console.log('Generated audio URL:', url);
    
    // Return false if we couldn't generate a valid URL
    if (!url) {
      console.log('Could not generate valid URL, returning false');
      return false;
    }
    
    // Check cache first
    if (this.existenceCache.has(url)) {
      const cachedResult = this.existenceCache.get(url);
      console.log('Found in cache:', url, 'exists:', cachedResult);
      return cachedResult;
    }

    // In development (localhost), assume files exist to avoid CORS issues
    // The audio will fail gracefully if file doesn't actually exist
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('local');
    
    if (isDevelopment) {
      console.log('🔧 Development mode: Assuming audio exists (CORS bypass)');
      this.existenceCache.set(url, true);
      return true;
    }

    // In production, use Audio element to check if file exists
    return new Promise((resolve) => {
      console.log('Creating Audio element to check:', url);
      const audio = new Audio();
      audio.crossOrigin = "anonymous"; // Enable CORS for proper audio loading
      
      const timeout = setTimeout(() => {
        console.log('Audio check timed out for:', url);
        audio.src = ''; // Clear source
        this.existenceCache.set(url, false);
        resolve(false);
      }, this.checkTimeout);

      audio.addEventListener('canplaythrough', () => {
        console.log('✅ Audio file exists and can play:', url);
        clearTimeout(timeout);
        this.existenceCache.set(url, true);
        resolve(true);
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.log('❌ Audio file does not exist or cannot load:', url, e);
        clearTimeout(timeout);
        this.existenceCache.set(url, false);
        resolve(false);
      }, { once: true });

      // Set the source to trigger loading
      audio.src = url;
    });
  }

  /**   * Check if example audio file exists on the remote server
   * Similar to checkAudioExists but for usage examples
   * @param {string} usageExample - The usage example text
   * @param {string} category - The category for the example
   * @returns {Promise<boolean>} True if file exists, false otherwise
   */
  async checkExampleAudioExists(usageExample, category) {
    console.log('checkExampleAudioExists called with:', { usageExample, category });
    
    // Return false immediately if offline
    if (!this.isOnline()) {
      console.log('App is offline, returning false');
      return false;
    }

    const url = this.getExampleAudioUrl(usageExample, category);
    console.log('Generated example audio URL:', url);
    
    // Return false if we couldn't generate a valid URL
    if (!url) {
      console.log('Could not generate valid URL, returning false');
      return false;
    }
    
    // Check cache first
    if (this.existenceCache.has(url)) {
      const cachedResult = this.existenceCache.get(url);
      console.log('Found in cache:', url, 'exists:', cachedResult);
      return cachedResult;
    }

    // In development (localhost), assume files exist to avoid CORS issues
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('local');
    
    if (isDevelopment) {
      console.log('🔧 Development mode: Assuming example audio exists (CORS bypass)');
      this.existenceCache.set(url, true);
      return true;
    }

    // In production, use Audio element to check if file exists
    return new Promise((resolve) => {
      console.log('Creating Audio element to check:', url);
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      
      const timeout = setTimeout(() => {
        console.log('Audio check timed out for:', url);
        audio.src = '';
        this.existenceCache.set(url, false);
        resolve(false);
      }, this.checkTimeout);

      audio.addEventListener('canplaythrough', () => {
        console.log('✅ Example audio file exists and can play:', url);
        clearTimeout(timeout);
        this.existenceCache.set(url, true);
        resolve(true);
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.log('❌ Example audio file does not exist or cannot load:', url, e);
        clearTimeout(timeout);
        this.existenceCache.set(url, false);
        resolve(false);
      }, { once: true });

      audio.src = url;
    });
  }

  /**   * Play the pronunciation audio for a question
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
        audio = new Audio();
        audio.crossOrigin = "anonymous"; // Enable CORS for proper audio loading
        audio.src = url;
        audio.volume = playbackVolume;
        
        // Cache it for future use
        this.audioCache.set(url, audio);
      } else {
        // Reset playback if audio was already playing
        audio.currentTime = 0;
        audio.volume = playbackVolume;
      }

      console.log('🎵 Attempting to play:', url);
      await audio.play();
      console.log('✅ Audio playback started successfully');
      return true;
    } catch (error) {
      console.error('Error playing pronunciation audio:', error);
      console.error('Failed URL:', url);
      // Remove from cache if it failed to play
      this.audioCache.delete(url);
      return false;
    }
  }

  /**
   * Play the example audio for a usage example
   * @param {string} usageExample - The usage example text
   * @param {string} category - The category for the example
   * @param {number} volume - Volume level (0.0 to 1.0)
   * @returns {Promise<boolean>} True if playback started, false otherwise
   */
  async playExample(usageExample, category, volume = null) {
    // Don't attempt to play if offline
    if (!this.isOnline()) {
      console.log('Cannot play example audio while offline');
      return false;
    }

    const url = this.getExampleAudioUrl(usageExample, category);
    
    if (!url) {
      console.log('Cannot generate example audio URL');
      return false;
    }
    
    const playbackVolume = volume !== null ? volume : this.defaultVolume;

    try {
      // Check if we have a cached audio element
      let audio = this.audioCache.get(url);

      if (!audio) {
        // Create new audio element
        audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.src = url;
        audio.volume = playbackVolume;
        
        // Cache it for future use
        this.audioCache.set(url, audio);
      } else {
        // Reset playback if audio was already playing
        audio.currentTime = 0;
        audio.volume = playbackVolume;
      }

      console.log('🎵 Attempting to play example:', url);
      await audio.play();
      console.log('✅ Example audio playback started successfully');
      return true;
    } catch (error) {
      console.error('Error playing example audio:', error);
      console.error('Failed URL:', url);
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
      // Create audio element with CORS enabled
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.src = url;
      audio.preload = 'auto';
      this.audioCache.set(url, audio);
      console.log('📥 Preloaded audio:', url);
    } catch (error) {
      console.log('Failed to preload audio:', error);
      // Silently fail - not critical
    }
  }

  /**
   * Preload example audio file for faster playback
   * Only preloads if online and file exists
   * @param {string} usageExample - The usage example text
   * @param {string} category - The category for the example
   */
  async preloadExample(usageExample, category) {
    if (!this.isOnline()) {
      return;
    }

    const url = this.getExampleAudioUrl(usageExample, category);
    
    if (!url || this.audioCache.has(url)) {
      return; // Already loaded or invalid URL
    }

    try {
      // Create audio element with CORS enabled
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.src = url;
      audio.preload = 'auto';
      this.audioCache.set(url, audio);
      console.log('📥 Preloaded example audio:', url);
    } catch (error) {
      console.log('Failed to preload example audio:', error);
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
