/**
 * Flash Cards JavaScript
 * 
 * Contains functionality for audio playback and card flip interactions.
 */

// Audio player functionality
let currentAudio = null;

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

// Flip card functionality
function flipCard(card) {
    card.classList.toggle('flipped');
}

// Prevent audio button clicks from flipping the card
document.addEventListener('DOMContentLoaded', function() {
    const audioButtons = document.querySelectorAll('.audio-player, .example-audio-player');
    audioButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
});
