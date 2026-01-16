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
