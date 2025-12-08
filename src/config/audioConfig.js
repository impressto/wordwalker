/**
 * Audio Configuration
 * Centralized configuration for all audio settings including remote pronunciation files
 */

const audioConfig = {
  // Base URL for pronunciation audio files
  // Files are organized by category: /audio-samples/{category}/{questionId}.mp3
  pronunciationBaseUrl: 'https://impressto.ca/wordwalker/audio-samples/',
  
  // File format for pronunciation audio
  pronunciationFormat: 'mp3',
  
  // Timeout for checking if audio file exists (in milliseconds)
  pronunciationCheckTimeout: 5000,
  
  // Default volume for pronunciation playback (0.0 to 1.0)
  pronunciationVolume: 0.7,
};

export default audioConfig;
