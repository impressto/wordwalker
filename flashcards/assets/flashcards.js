/**
 * Flash Cards JavaScript
 * 
 * Contains functionality for audio playback and card flip interactions.
 */

// Audio player functionality
let currentAudio = null;
let autoplayEnabled = false;

function playAudio(audioPath) {
    // Stop currently playing audio if any
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    
    // Create and play new audio
    currentAudio = new Audio(audioPath);
    currentAudio.play().catch(function(error) {
        console.error('Error playing audio:', error);
    });
}

// Toggle auto-play functionality
function toggleAutoplay() {
    const toggle = document.getElementById('autoplay-toggle');
    autoplayEnabled = toggle.checked;
    // Save preference to localStorage
    localStorage.setItem('flashcard-autoplay', autoplayEnabled);
}

// Toggle category selector on mobile
function toggleCategories() {
    const selector = document.querySelector('.category-selector');
    selector.classList.toggle('expanded');
    // Save state to localStorage
    localStorage.setItem('category-selector-expanded', selector.classList.contains('expanded'));
}

// Language toggle function
function toggleLanguage(currentLang) {
    // Use the language passed from PHP (which knows about session state)
    currentLang = currentLang || 'en';
    const currentUrl = new URL(window.location.href);
    const newLang = currentLang === 'en' ? 'es' : 'en';
    currentUrl.searchParams.set('lang', newLang);
    // Reset to page 1 when switching languages to ensure clean state
    currentUrl.searchParams.set('page', '1');
    window.location.href = currentUrl.toString();
}

// Flip card functionality
function flipCard(card) {
    const wasFlipped = card.classList.contains('flipped');
    card.classList.toggle('flipped');
    
    // If auto-play is enabled and card is now flipped (showing answer)
    if (autoplayEnabled && !wasFlipped) {
        // Find the audio button in the card's answer section
        const audioButton = card.querySelector('.flashcard-answer .audio-player');
        if (audioButton) {
            // Get the audio path from the onclick attribute
            const onclickAttr = audioButton.getAttribute('onclick');
            const audioPathMatch = onclickAttr.match(/playAudio\('([^']+)'\)/);
            if (audioPathMatch && audioPathMatch[1]) {
                // Small delay to let the flip animation start
                setTimeout(function() {
                    playAudio(audioPathMatch[1]);
                }, 300);
            }
        }
    }
}

// Prevent audio button clicks from flipping the card
document.addEventListener('DOMContentLoaded', function() {
    const audioButtons = document.querySelectorAll('.audio-player, .example-audio-player');
    audioButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Restore auto-play preference from localStorage
    const savedAutoplay = localStorage.getItem('flashcard-autoplay');
    if (savedAutoplay === 'true') {
        const toggle = document.getElementById('autoplay-toggle');
        if (toggle) {
            toggle.checked = true;
            autoplayEnabled = true;
        }
    }
    
    // Restore category selector state on mobile
    const savedExpanded = localStorage.getItem('category-selector-expanded');
    if (savedExpanded === 'true') {
        const selector = document.querySelector('.category-selector');
        if (selector) {
            selector.classList.add('expanded');
        }
    }
});

// Download flashcard as image
function downloadCardImage(button) {
    // Stop event propagation to prevent card flip
    event.stopPropagation();
    
    // Find the flashcard and flashcard back element
    const flashcard = button.closest('.flashcard');
    const flashcardBack = flashcard.querySelector('.flashcard-back');
    
    if (!flashcardBack || !flashcard) {
        console.error('Could not find flashcard element');
        return;
    }
    
    // Temporarily hide the download button
    button.style.display = 'none';
    
    // Hide audio players during capture
    const audioPlayers = flashcardBack.querySelectorAll('.audio-player, .example-audio-player');
    const audioPlayerOriginalStyles = [];
    audioPlayers.forEach(function(player, index) {
        audioPlayerOriginalStyles[index] = player.style.display;
        player.style.display = 'none';
    });
    
    // Show watermark during capture
    const watermark = flashcardBack.querySelector('.flashcard-watermark');
    const originalWatermarkDisplay = watermark ? watermark.style.display : null;
    if (watermark) {
        watermark.style.display = 'block';
    }
    
    // Save original transform and styles
    const flashcardInner = flashcard.querySelector('.flashcard-inner');
    const originalTransform = flashcardInner.style.transform;
    const originalFlashcardHeight = flashcard.style.height;
    const originalFlashcardMaxHeight = flashcard.style.maxHeight;
    const originalFlashcardOverflow = flashcard.style.overflow;
    const originalFlashcardWidth = flashcard.style.width;
    const originalBackHeight = flashcardBack.style.height;
    const originalBackMaxHeight = flashcardBack.style.maxHeight;
    const originalBackOverflow = flashcardBack.style.overflow;
    const originalBackWidth = flashcardBack.style.width;
    
    // Remove transform and expand height constraints
    flashcardInner.style.transform = 'none';
    flashcard.style.height = 'auto';
    flashcard.style.maxHeight = 'none';
    flashcard.style.overflow = 'visible';
    
    // Widen the flashcard by 50% for the image capture
    flashcard.style.width = '150%';
    flashcard.style.maxWidth = '150%';
    
    // Make sure the back is visible and expanded
    flashcardBack.style.transform = 'rotateY(0deg)';
    flashcardBack.style.visibility = 'visible';
    flashcardBack.style.height = 'auto';
    flashcardBack.style.maxHeight = 'none';
    flashcardBack.style.overflow = 'visible';
    flashcardBack.style.width = '100%';
    
    // Get the card number for the filename
    const cardNumber = flashcardBack.querySelector('.flashcard-number')?.textContent || 'card';
    const questionText = flashcardBack.querySelector('.flashcard-question')?.textContent?.trim() || 'flashcard';
    
    // Create a sanitized filename
    const filename = `wordwalker-${cardNumber.replace('#', '')}-${questionText.substring(0, 30).replace(/[^a-z0-9]/gi, '-')}.png`;
    
    // Wait for all images to load
    const images = flashcardBack.querySelectorAll('img');
    const imagePromises = Array.from(images).map(function(img) {
        if (img.complete) {
            return Promise.resolve();
        }
        return new Promise(function(resolve, reject) {
            img.onload = resolve;
            img.onerror = resolve; // Resolve even on error to not block capture
            // Timeout after 3 seconds
            setTimeout(resolve, 3000);
        });
    });
    
    // Small delay to ensure styles are applied and layout is recalculated
    Promise.all(imagePromises).then(function() {
        return new Promise(function(resolve) {
            setTimeout(resolve, 300);
        });
    }).then(function() {
        // Use html2canvas to capture the flashcard back
        return html2canvas(flashcardBack, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
        });
    }).then(function(canvas) {
        // Restore original styles
        flashcardInner.style.transform = originalTransform;
        flashcard.style.height = originalFlashcardHeight;
        flashcard.style.maxHeight = originalFlashcardMaxHeight;
        flashcard.style.overflow = originalFlashcardOverflow;
        flashcard.style.width = originalFlashcardWidth;
        flashcard.style.maxWidth = '';
        flashcardBack.style.transform = '';
        flashcardBack.style.visibility = '';
        flashcardBack.style.height = originalBackHeight;
        flashcardBack.style.maxHeight = originalBackMaxHeight;
        flashcardBack.style.overflow = originalBackOverflow;
        flashcardBack.style.width = originalBackWidth;
        button.style.display = 'flex';
        
        // Restore audio player visibility
        audioPlayers.forEach(function(player, index) {
            player.style.display = audioPlayerOriginalStyles[index];
        });
        
        // Hide watermark again
        if (watermark) {
            watermark.style.display = originalWatermarkDisplay || 'none';
        }
        
        // Convert canvas to blob and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }).catch(function(error) {
        console.error('Error capturing card:', error);
        // Restore original styles on error
        flashcardInner.style.transform = originalTransform;
        flashcard.style.height = originalFlashcardHeight;
        flashcard.style.maxHeight = originalFlashcardMaxHeight;
        flashcard.style.overflow = originalFlashcardOverflow;
        flashcard.style.width = originalFlashcardWidth;
        flashcard.style.maxWidth = '';
        flashcardBack.style.transform = '';
        flashcardBack.style.visibility = '';
        flashcardBack.style.height = originalBackHeight;
        flashcardBack.style.maxHeight = originalBackMaxHeight;
        flashcardBack.style.overflow = originalBackOverflow;
        flashcardBack.style.width = originalBackWidth;
        button.style.display = 'flex';
        
        // Restore audio player visibility on error
        audioPlayers.forEach(function(player, index) {
            player.style.display = audioPlayerOriginalStyles[index];
        });
        
        // Hide watermark on error
        if (watermark) {
            watermark.style.display = originalWatermarkDisplay || 'none';
        }
        
        alert('Sorry, there was an error saving the card image.');
    });
}
