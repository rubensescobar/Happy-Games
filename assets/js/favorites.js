/**
 * Favorites/Wishlist Management for Happy-Games
 * This file provides consistent functionality for favorites across the site
 */

// Helper function to get userGameProfile from localStorage, ensuring wishlist exists and contains only IDs
function getUserGameProfile() {
  const defaultProfile = { wishlist: [] };
  try {
    const profile = JSON.parse(localStorage.getItem('userGameProfile')) || defaultProfile;
    // Ensure wishlist exists and is an array of strings (IDs)
    if (!profile.wishlist || !Array.isArray(profile.wishlist) || !profile.wishlist.every(item => typeof item === 'string')) {
      // Attempt to convert old object format to ID array if necessary
      if (Array.isArray(profile.wishlist) && profile.wishlist.every(item => typeof item === 'object' && item !== null && 'id' in item)) {
          profile.wishlist = profile.wishlist.map(item => item.id);
          console.warn("Converted old wishlist format to array of IDs.");
      } else {
         profile.wishlist = [];
      }
    }
    return profile;
  } catch (e) {
    console.error("Error parsing userGameProfile from localStorage:", e);
    return defaultProfile;
  }
}

// Helper function to save userGameProfile to localStorage
function saveUserGameProfile(profile) {
  try {
    localStorage.setItem('userGameProfile', JSON.stringify(profile));
  } catch (e) {
    console.error("Error saving userGameProfile to localStorage:", e);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize wishlist icons based on localStorage
  initializeFavorites();
});

// Initialize wishlist/favorites UI from localStorage (Updated to check for IDs)
function initializeFavorites() {
  const userProfile = getUserGameProfile();
  const gameCards = document.querySelectorAll('.game-card-immersive, .game-card'); // Also target regular game cards

  gameCards.forEach(card => {
    const gameId = card.getAttribute('data-game-id');
    // Find wishlist button within the card, handling different card structures
    const wishlistBtn = card.querySelector('.wishlist-button, .add-to-wishlist'); // Check for both button classes

    if (wishlistBtn && gameId) {
      // Check if the gameId exists in the user's wishlist array of IDs
      const isInWishlist = userProfile.wishlist.includes(gameId); // Use includes for array of IDs
      const icon = wishlistBtn.querySelector('i');

      if (isInWishlist && icon) {
        icon.classList.remove('far');
        icon.classList.add('fas');
      } else if (!isInWishlist && icon) { // Ensure icon is outline if not in wishlist
         icon.classList.remove('fas');
         icon.classList.add('far');
      }

      // Remove any existing click listeners to prevent duplicates
      // Clone node is not the most efficient but ensures listeners are removed reliably across different initializations
      const newWishlistBtn = wishlistBtn.cloneNode(true);
      wishlistBtn.parentNode.replaceChild(newWishlistBtn, wishlistBtn);


      // Add click event listener using the updated toggleFavorite
      newWishlistBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFavorite(this);
      });
    }
  });
}

// Toggle item in favorites/wishlist
function toggleFavorite(button) {
  // Check if user is logged in - requireLogin handles redirection/modal
  if (window.auth && !window.auth.isUserLoggedIn()) {
    window.auth.requireLogin(null, true);
    return;
  }

  const icon = button.querySelector('i');
  // const gameCard = button.closest('.game-card-immersive, .game-card'); // Check both card classes - Removed as it causes error in modal
  let gameId = button.dataset.gameId; // Attempt to get gameId directly from the button's dataset

  // If gameId is not on the button, try getting it from the closest parent game card
  if (!gameId) {
    const gameCard = button.closest('.game-card-immersive, .game-card');
    if (gameCard) {
      gameId = gameCard.getAttribute('data-game-id');
    }
  }

  if (!gameId) {
    console.error("Cannot toggle favorite: game-id attribute not found on the button or parent card.");
    return;
  }

  let userProfile = getUserGameProfile();
  // Use indexOf for arrays of primitives (IDs)
  const existingIndex = userProfile.wishlist.indexOf(gameId);

  if (existingIndex === -1) {
    // Add to wishlist (only the ID)
    userProfile.wishlist.push(gameId);

    // Change from outline to solid heart
    if (icon) {
        icon.classList.remove('far');
        icon.classList.add('fas');
    }

    // Add XP for adding to wishlist (assuming addUserXP is available globally or via auth module)
    if (window.auth && typeof window.auth.addUserXP === 'function') {
        window.auth.addUserXP(5, 'Adicionou um jogo à lista de desejos');
    } else if (typeof addUserXP === 'function') { // Fallback if addUserXP is a global function
        addUserXP(5, 'Adicionou um jogo à lista de desejos');
    }

    // Show notification (assuming showNotification is available globally)
    if (typeof showNotification === 'function') {
      showNotification('Adicionado à lista de desejos', 'success');
    }

  } else {
    // Remove from wishlist
    userProfile.wishlist.splice(existingIndex, 1);

    // Change from solid to outline heart
    if (icon) {
        icon.classList.remove('fas');
        icon.classList.add('far');
    }

    // Show notification (assuming showNotification is available globally)
    if (typeof showNotification === 'function') {
      showNotification('Removido da lista de desejos', 'info');
    }
  }

  // Save updated userGameProfile to localStorage
  saveUserGameProfile(userProfile);

  // Optional: Trigger an event for other parts of the page to react (e.g., updating a wishlist count display)
  document.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { wishlist: userProfile.wishlist } }));
}

// Function to check if a game is in the user's wishlist
function isGameInWishlist(gameId) {
  if (!gameId) {
    return false;
  }
  const userProfile = getUserGameProfile();
  // Use includes for arrays of primitives (IDs)
  return userProfile.wishlist.includes(gameId);
}

// Expose functions if needed by other modules
// window.addToWishlist = addToWishlist; // Removed
// window.removeFromWishlist = removeFromWishlist; // Removed
// window.toggleWishlist = toggleWishlist; // Removed
window.isGameInWishlist = isGameInWishlist;
window.initializeFavorites = initializeFavorites; // Keep initialization exposed if needed externally
window.toggleFavorite = toggleFavorite; // Expose the main toggle function 