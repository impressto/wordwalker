/**
 * Audio Configuration
 * Centralized configuration for all audio settings including remote pronunciation files
 */

/**
 * Get the appropriate base URL for audio files based on current domain
 * This prevents CORS issues when the app is hosted on multiple domains
 */
const getAudioBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // For wordwalker.ca domain
  if (hostname === 'wordwalker.ca' || hostname === 'www.wordwalker.ca') {
    return `${protocol}//wordwalker.ca/audio-samples/answers/`;
  }
  
  // For impressto.ca domain (or localhost development)
  // Default to impressto.ca path structure
  return `${protocol}//${hostname}/wordwalker/audio-samples/answers/`;
};

const audioConfig = {
  // Base URL for pronunciation audio files
  // Files are organized by category: /audio-samples/answers/{category}/{correctAnswer}.mp3
  // Dynamically determined based on current domain to avoid CORS issues
  pronunciationBaseUrl: getAudioBaseUrl(),
  
  // File format for pronunciation audio
  pronunciationFormat: 'mp3',
  
  // Timeout for checking if audio file exists (in milliseconds)
  pronunciationCheckTimeout: 5000,
  
  // Default volume for pronunciation playback (0.0 to 1.0)
  pronunciationVolume: 0.7,
};

export default audioConfig;
