/**
 * Flash Cards JavaScript
 * 
 * Contains functionality for audio playback and card flip interactions.
 */

// Audio player functionality
let currentAudio = null;
let autoplayEnabled = false;

// Deck management
const MAX_DECK_SIZE = 120;
let userDeck = [];

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
    
    // Load deck from localStorage
    loadDeck();
    
    // Close dialog when clicking outside
    const dialog = document.getElementById('export-dialog');
    if (dialog) {
        dialog.addEventListener('click', function(e) {
            if (e.target === dialog) {
                hideExportDialog();
            }
        });
    }
});

// Stop audio when navigating away from the page
window.addEventListener('beforeunload', function() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
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
    
    // Wait for all images to load and convert external images to data URLs
    const images = flashcardBack.querySelectorAll('img');
    const imagePromises = Array.from(images).map(function(img) {
        if (img.complete) {
            return Promise.resolve();
        }
        return new Promise(function(resolve, reject) {
            img.onload = resolve;
            img.onerror = resolve; // Resolve even on error to not block capture
            // Increased timeout for slow connections (e.g., satellite internet)
            setTimeout(resolve, 10000);
        });
    });
    
    // Convert external images to data URLs to avoid CORS issues
    const convertImagesToDataURLs = function() {
        const emojiImages = flashcardBack.querySelectorAll('.flashcard-emoji-img');
        const conversionPromises = Array.from(emojiImages).map(function(img) {
            return new Promise(function(resolve) {
                if (!img.src || img.src.startsWith('data:')) {
                    resolve();
                    return;
                }
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const image = new Image();
                
                image.crossOrigin = 'anonymous';
                
                // Set timeout for conversion process
                const timeoutId = setTimeout(function() {
                    console.warn('Image conversion timeout for:', img.src);
                    resolve();
                }, 10000);
                
                image.onload = function() {
                    clearTimeout(timeoutId);
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0);
                    try {
                        const dataURL = canvas.toDataURL('image/png');
                        img.src = dataURL;
                        console.log('Successfully converted image to data URL');
                        resolve();
                    } catch (e) {
                        console.warn('Could not convert image to data URL:', e);
                        resolve();
                    }
                };
                image.onerror = function(e) {
                    clearTimeout(timeoutId);
                    console.warn('Could not load image for conversion:', img.src, e);
                    resolve();
                };
                
                // Trigger image load
                image.src = img.src;
            });
        });
        return Promise.all(conversionPromises);
    };
    
    // Small delay to ensure styles are applied and layout is recalculated
    Promise.all(imagePromises)
        .then(function() {
            console.log('All images loaded, converting to data URLs...');
            return convertImagesToDataURLs();
        })
        .then(function() {
            console.log('Image conversion complete, waiting for layout...');
            return new Promise(function(resolve) {
                setTimeout(resolve, 500);
            });
        }).then(function() {
            console.log('Starting canvas capture...');
        // Use html2canvas to capture the flashcard back
        return html2canvas(flashcardBack, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: false
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
// ==================== DECK MANAGEMENT ====================

/**
 * Load deck from localStorage
 */
function loadDeck() {
    const stored = localStorage.getItem('wordwalker-deck');
    if (stored) {
        try {
            userDeck = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading deck:', e);
            userDeck = [];
        }
    }
    updateDeckUI();
}

/**
 * Save deck to localStorage
 */
function saveDeck() {
    localStorage.setItem('wordwalker-deck', JSON.stringify(userDeck));
    updateDeckUI();
}

/**
 * Toggle a card in/out of the deck
 */
function toggleDeck(cardId, button) {
    const index = userDeck.indexOf(cardId);
    
    if (index > -1) {
        // Remove from deck
        userDeck.splice(index, 1);
        button.classList.remove('in-deck');
        button.querySelector('.deck-btn-text').textContent = '+ deck';
        button.title = 'Add to deck';
    } else {
        // Check if deck is at max capacity
        if (userDeck.length >= MAX_DECK_SIZE) {
            alert('Your deck is full! Maximum ' + MAX_DECK_SIZE + ' cards allowed. Remove some cards to add more.');
            return;
        }
        // Add to deck
        userDeck.push(cardId);
        button.classList.add('in-deck');
        button.querySelector('.deck-btn-text').textContent = '✓ in deck';
        button.title = 'Remove from deck';
    }
    
    saveDeck();
}

/**
 * Update deck UI (count and button visibility)
 */
function updateDeckUI() {
    const deckCount = userDeck.length;
    const countElement = document.getElementById('deck-count');
    const dialogCountElement = document.getElementById('dialog-deck-count');
    const generateButton = document.getElementById('generate-deck-btn');
    const deckLinkElement = document.querySelector('.deck-link');
    
    if (countElement) {
        countElement.textContent = deckCount;
    }
    if (dialogCountElement) {
        dialogCountElement.textContent = deckCount;
    }
    if (generateButton) {
        generateButton.style.display = deckCount > 0 ? 'flex' : 'none';
    }
    if (deckLinkElement) {
        deckLinkElement.style.display = deckCount > 0 ? 'block' : 'none';
    }
    
    // Update all "+ deck" buttons to show correct state
    document.querySelectorAll('.add-to-deck-btn').forEach(function(button) {
        const cardId = button.getAttribute('data-card-id');
        if (userDeck.indexOf(cardId) > -1) {
            button.classList.add('in-deck');
            button.querySelector('.deck-btn-text').textContent = '✓ in deck';
            button.title = 'Remove from deck';
        } else {
            button.classList.remove('in-deck');
            button.querySelector('.deck-btn-text').textContent = '+ deck';
            button.title = 'Add to deck';
        }
    });
}

/**
 * Show export dialog
 */
function showExportDialog() {
    if (userDeck.length === 0) {
        alert('Your deck is empty. Add some flashcards to your deck first.');
        return;
    }
    
    const dialog = document.getElementById('export-dialog');
    const dialogCount = document.getElementById('dialog-deck-count');
    
    if (dialogCount) {
        dialogCount.textContent = userDeck.length;
    }
    
    if (dialog) {
        dialog.style.display = 'flex';
    }
}

/**
 * Hide export dialog
 */
function hideExportDialog() {
    const dialog = document.getElementById('export-dialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
}

/**
 * Export deck as PDF
 */
function exportDeck(format) {
    if (userDeck.length === 0) {
        alert('Your deck is empty.');
        return;
    }
    
    // Show loading state
    const exportButtons = document.querySelectorAll('.export-btn');
    exportButtons.forEach(function(btn) {
        btn.disabled = true;
        btn.textContent = 'Generating...';
    });
    
    // Prepare form data
    const formData = new FormData();
    formData.append('action', 'export');
    formData.append('format', 'pdf');
    formData.append('cards', JSON.stringify(userDeck));
    
    // Test with impressto.ca URL
    const exportUrl = 'https://impressto.ca/wordwalker/flashcards/includes/export-proxy.php';
    
    console.log('Posting to:', exportUrl);
    
    // Send request
    fetch(exportUrl, {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        if (!response.ok) {
            // Try to get error details
            return response.text().then(function(text) {
                try {
                    const error = JSON.parse(text);
                    throw new Error(error.message || error.error || 'Export failed');
                } catch (e) {
                    throw new Error('Export failed: HTTP ' + response.status);
                }
            });
        }
        
        // For successful response, get the blob
        return response.blob();
    })
    .then(function(blob) {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wordwalker-deck-' + new Date().toISOString().split('T')[0] + '.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Restore buttons to original state
        exportButtons.forEach(function(btn) {
            btn.disabled = false;
            btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg><div><strong>Download PDF</strong><small>Printable 3-column layout</small></div>';
        });
        
        hideExportDialog();
    })
    .catch(function(error) {
        console.error('Export error:', error);
        alert('Export failed: ' + error.message);
        
        // Reset buttons
        exportButtons.forEach(function(btn) {
            btn.disabled = false;
            btn.textContent = 'Download PDF';
        });
    });
}