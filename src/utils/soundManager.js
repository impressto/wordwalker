class SoundManager {
  constructor() {
    // Audio files in public/audio folder
    // Use Vite's base URL for proper subdirectory support
    const baseUrl = import.meta.env.BASE_URL || '/';
    this.baseUrl = `${baseUrl}audio/`;
    this.fileFormat = 'mp3';
    this.masterVolume = 1;
    this.audioUnlocked = false;
    this.backgroundMusic = null;
    this.currentTheme = 'default'; // Track current theme for background music
    
    // Preloaded audio buffers for instant playback
    this.preloadedSounds = {};
    // Theme-specific sounds (choice, correct, wrong) and generic sounds (streaks)
    this.themeSounds = ['correct', 'wrong', 'choice'];
    this.genericSounds = ['streak1', 'streak2', 'streak3', 'streak4'];

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    
    // Preload sound effects
    this.preloadSounds();
    
    // Unlock audio on first user interaction (required for PWA/mobile)
    this.unlockAudio();
  }

  /**
   * Get the streak sound file name based on streak level
   * @param {number} streak - The current streak level
   * @returns {string} The sound name (streak1, streak2, streak3, or streak4)
   */
  getStreakSoundName(streak) {
    // Determine which streak sound to play based on streak level
    // streak 5 = streak1, streak 10 = streak2, streak 15 = streak3, streak 20+ = streak4
    if (streak >= 20) {
      return 'streak4';
    } else if (streak >= 15) {
      return 'streak3';
    } else if (streak >= 10) {
      return 'streak2';
    } else {
      return 'streak1';
    }
  }

  /**
   * Preload all sound effects for instant playback
   */
  async preloadSounds() {
    // Preload theme-specific sounds
    for (const sound of this.themeSounds) {
      try {
        const url = `${this.baseUrl}themes/${this.currentTheme}/${sound}.${this.fileFormat}`;
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.preloadedSounds[sound] = audioBuffer;
      } catch (error) {
        // Failed to preload sound
      }
    }
    
    // Preload generic sounds (streaks)
    for (const sound of this.genericSounds) {
      try {
        const url = `${this.baseUrl}${sound}.${this.fileFormat}`;
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.preloadedSounds[sound] = audioBuffer;
      } catch (error) {
        // Failed to preload sound
      }
    }
  }

  /**
   * Unlock audio context on first user interaction (required for PWA and mobile browsers)
   */
  unlockAudio() {
    const unlockHandler = () => {
      if (!this.audioUnlocked) {
        // Resume audio context
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        
        // Play and immediately pause a silent sound to unlock
        const silentSound = new Audio();
        silentSound.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        silentSound.play().then(() => {
          this.audioUnlocked = true;
        }).catch(() => {
          // Ignore errors
        });
        
        // Remove listeners after first successful unlock
        document.removeEventListener('touchstart', unlockHandler);
        document.removeEventListener('touchend', unlockHandler);
        document.removeEventListener('click', unlockHandler);
        document.removeEventListener('keydown', unlockHandler);
      }
    };

    // Listen for first user interaction
    document.addEventListener('touchstart', unlockHandler, { once: false });
    document.addEventListener('touchend', unlockHandler, { once: false });
    document.addEventListener('click', unlockHandler, { once: false });
    document.addEventListener('keydown', unlockHandler, { once: false });
  }

  /**
   * Sets the master volume for all sounds
   * @param {number} newVolume - Volume between 0 and 1
   */
  setMasterVolume(newVolume) {
    this.masterVolume = Math.max(0, Math.min(1, newVolume));
    
    // Update background music volume
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.masterVolume * 0.3; // Background at 30% of master
      if (this.masterVolume === 0) {
        this.backgroundMusic.pause();
      } else if (this.backgroundMusic.paused) {
        this.backgroundMusic.play().catch(() => {});
      }
    }
  }

  /**
   * Set the current theme for background music and sound effects
   * @param {string} themeId - The theme identifier
   */
  setTheme(themeId) {
    this.currentTheme = themeId;
    
    // Reload theme-specific sound effects
    this.preloadThemeSounds();
    
    // If background music is playing, restart it with the new theme
    if (this.backgroundMusic) {
      this.stopBackgroundMusic();
      this.startBackgroundMusic();
    }
  }

  /**
   * Preload theme-specific sound effects when theme changes
   */
  async preloadThemeSounds() {
    for (const sound of this.themeSounds) {
      try {
        const url = `${this.baseUrl}themes/${this.currentTheme}/${sound}.${this.fileFormat}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.preloadedSounds[sound] = audioBuffer;
      } catch (error) {
        // Failed to reload sound
      }
    }
  }

  /**
   * Start playing looping background music
   */
  startBackgroundMusic() {
    if (this.backgroundMusic) {
      return; // Already playing
    }
    
    if (this.masterVolume === 0) {
      return;
    }

    // Ensure audio context is resumed
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Construct path to theme-specific background music
    const backgroundPath = `${this.baseUrl}themes/${this.currentTheme}/background.${this.fileFormat}`;
    this.backgroundMusic = new Audio(backgroundPath);
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = this.masterVolume * 0.3; // 30% volume for background
    this.backgroundMusic.preload = 'auto';
    
    this.backgroundMusic.play().catch(() => {
      // Failed to play background music
    });
  }

  /**
   * Stop the background music
   */
  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
    }
  }

  /**
   * Plays a single sound effect using preloaded buffer if available
   * @param {String} sound - Name of the sound file (without extension)
   */
  play(sound) {
    if (this.masterVolume === 0) {
      return;
    }

    // Ensure audio context is resumed
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Use preloaded buffer for instant playback if available
    if (this.preloadedSounds[sound]) {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.preloadedSounds[sound];
      gainNode.gain.value = this.masterVolume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
      return source;
    }
    
    // Fallback to Audio element for non-preloaded sounds
    // Check if this is a theme-specific sound or generic sound
    const isThemeSound = this.themeSounds.includes(sound);
    const audioUrl = isThemeSound 
      ? `${this.baseUrl}themes/${this.currentTheme}/${sound}.${this.fileFormat}`
      : `${this.baseUrl}${sound}.${this.fileFormat}`;
    
    const audio = new Audio(audioUrl);
    audio.volume = this.masterVolume;
    audio.preload = 'auto';
    
    // Store reference to prevent garbage collection
    if (!this.activeSounds) {
      this.activeSounds = [];
    }
    this.activeSounds.push(audio);
    
    audio.addEventListener('ended', () => {
      const index = this.activeSounds.indexOf(audio);
      if (index > -1) {
        this.activeSounds.splice(index, 1);
      }
    });
    
    audio.play().catch(() => {
      // Failed to play sound
    });
    
    return audio;
  }

  /**
   * Play the correct answer sound
   */
  playCorrect() {
    this.play('correct');
  }

  /**
   * Play the wrong answer sound
   */
  playWrong() {
    this.play('wrong');
  }

  /**
   * Play the streak bonus sound based on streak level
   * @param {number} streak - The current streak level
   */
  playStreak(streak = 5) {
    const streakSound = this.getStreakSoundName(streak);
    this.play(streakSound);
  }

  /**
   * Play the path choice sound
   */
  playChoice() {
    this.play('choice');
  }
}

export default SoundManager;

