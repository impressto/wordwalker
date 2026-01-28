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

/**
 * Get the appropriate base URL for example audio files based on current domain
 * Example files are in /audio-samples/examples/{category}/{usageExample}.mp3
 */
const getExampleAudioBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // For wordwalker.ca domain
  if (hostname === 'wordwalker.ca' || hostname === 'www.wordwalker.ca') {
    return `${protocol}//wordwalker.ca/audio-samples/examples/`;
  }
  
  // For impressto.ca domain (or localhost development)
  // Default to impressto.ca path structure
  return `${protocol}//${hostname}/wordwalker/audio-samples/examples/`;
};

const audioConfig = {
  // Base URL for pronunciation audio files
  // Files are organized by category: /audio-samples/answers/{category}/{correctAnswer}.mp3
  // Dynamically determined based on current domain to avoid CORS issues
  pronunciationBaseUrl: getAudioBaseUrl(),
  
  // Base URL for example audio files
  // Files are organized by category: /audio-samples/examples/{category}/{usageExample}.mp3
  // Dynamically determined based on current domain to avoid CORS issues
  exampleAudioBaseUrl: getExampleAudioBaseUrl(),
  
  // File format for pronunciation audio
  pronunciationFormat: 'mp3',
  
  // Timeout for checking if audio file exists (in milliseconds)
  pronunciationCheckTimeout: 5000,
  
  // Default volume for pronunciation playback (0.0 to 1.0)
  pronunciationVolume: 0.7,
  
  // Background music volume multiplier relative to master volume (0.0 to 1.0)
  // This multiplier is applied to the master volume to keep background music
  // at a lower level than sound effects. Default: 0.3 (30% of master volume)
  backgroundMusicVolume: 0.2,
};

export default audioConfig;
