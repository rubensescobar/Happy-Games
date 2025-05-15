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
  
  // Update the favorites tab if we're on the profile page
  const wishlistTab = document.getElementById('wishlist');
  if (wishlistTab) {
    updateFavoritesTab();
    
    // Add event listener for tab click to refresh content
    const wishlistTabButton = document.querySelector('[data-tab="wishlist"]');
    if (wishlistTabButton) {
      wishlistTabButton.addEventListener('click', function() {
        updateFavoritesTab();
      });
    }
  }
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
    
    // If we're on profile page in the wishlist tab, remove the card from display
    if (document.getElementById('wishlist') && document.getElementById('wishlist').classList.contains('active')) {
      const wishlistGrid = document.getElementById('wishlistGrid');
      if (wishlistGrid) {
        const cardToRemove = wishlistGrid.querySelector(`[data-game-id="${gameId}"]`);
        if (cardToRemove) {
          cardToRemove.remove();
          
          // Show empty state if no more favorites
          if (userProfile.wishlist.length === 0) {
            showEmptyFavoritesState(wishlistGrid);
            updateWishlistSummary(0, 0, 0);
          } else {
            updateWishlistSummary(userProfile.wishlist.length);
          }
        }
      }
    }
  }

  // Save updated userGameProfile to localStorage
  saveUserGameProfile(userProfile);

  // Update the favorites tab if we're on the profile page
  const wishlistTab = document.getElementById('wishlist');
  if (wishlistTab) {
    updateFavoritesTab();
  }

  // Optional: Trigger an event for other parts of the page to react (e.g., updating a wishlist count display)
  document.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { wishlist: userProfile.wishlist } }));
}

/**
 * Updates the Favorites tab in profile.html to display all favorited games
 */
function updateFavoritesTab() {
  // Only run on profile page when wishlist tab exists
  const wishlistGrid = document.getElementById('wishlistGrid');
  if (!wishlistGrid) return;
  
  // Clear the current content
  wishlistGrid.innerHTML = '';
  
  // Get favorited game IDs from user profile
  const userProfile = getUserGameProfile();
  const favoritedGameIds = userProfile.wishlist || [];
  
  // If no favorited games, show empty state
  if (favoritedGameIds.length === 0) {
    showEmptyFavoritesState(wishlistGrid);
    updateWishlistSummary(0, 0, 0);
    return;
  }
  
  // Fetch game details for each favorited game
  const gameData = [];
  let totalValue = 0;
  let potentialSavings = 0;
  
  // Try to get game details from any available source
  favoritedGameIds.forEach(gameId => {
    let gameDetails = null;
    
    // Try window.gameRepository first
    if (window.gameRepository && typeof window.gameRepository.getGameById === 'function') {
      gameDetails = window.gameRepository.getGameById(gameId);
    }
    
    // Try gamesData array if available in window scope
    if (!gameDetails && window.gamesData && Array.isArray(window.gamesData)) {
      gameDetails = window.gamesData.find(g => g.id === gameId);
    }
    
    // If no details found, create minimal object with ID
    if (!gameDetails) {
      gameDetails = { id: gameId };
    }
    
    // Add to game data array
    gameData.push(gameDetails);
    
    // Update summary values if price information is available
    if (gameDetails.price !== undefined && gameDetails.originalPrice !== undefined) {
      totalValue += gameDetails.originalPrice;
      potentialSavings += (gameDetails.originalPrice - gameDetails.price);
    }
  });
  
  // Create and append game cards
  gameData.forEach(game => {
    const gameCard = createFavoriteGameCard(game);
    wishlistGrid.appendChild(gameCard);
  });
  
  // Update summary information
  updateWishlistSummary(favoritedGameIds.length, totalValue, potentialSavings);
}

/**
 * Shows empty state message in the favorites tab
 */
function showEmptyFavoritesState(container) {
  container.innerHTML = `
    <div class="empty-collection">
      <i class="fas fa-heart"></i>
      <p>Você ainda não adicionou jogos aos favoritos</p>
      <a href="games.html" class="btn-explore">Explorar jogos</a>
    </div>
  `;
}

/**
 * Creates a game card for the favorites tab
 */
function createFavoriteGameCard(game) {
  const cardElement = document.createElement('div');
  cardElement.className = 'wishlist-card';
  cardElement.setAttribute('data-game-id', game.id);
  
  // Handle if we have full game data
  if (game.image && game.title && game.price !== undefined) {
    const discount = game.originalPrice > game.price 
      ? Math.round(((game.originalPrice - game.price) / game.originalPrice) * 100)
      : 0;
      
    const discountBadge = discount > 0 
      ? `<div class="discount-badge">-${discount}%</div>` 
      : '';
      
    const originalPriceDisplay = discount > 0 
      ? `<span class="original-price">R$ ${game.originalPrice.toFixed(2)}</span>` 
      : '';
    
    cardElement.innerHTML = `
      <div class="wishlist-card-image">
        <img src="${game.image}" alt="${game.title}">
        ${discountBadge}
      </div>
      <div class="wishlist-card-content">
        <h3 class="game-title">${game.title}</h3>
        <div class="wishlist-card-price">
          ${originalPriceDisplay}
          <span class="game-price">R$ ${game.price.toFixed(2)}</span>
        </div>
        <div class="wishlist-card-actions">
          <button class="favorite-btn active" data-game-id="${game.id}">
            <i class="fas fa-heart"></i>
          </button>
          <button class="add-to-cart-btn" data-game-id="${game.id}">
            <i class="fas fa-shopping-cart"></i> Adicionar
          </button>
        </div>
      </div>
    `;
  } 
  // Simplified display if we only have game ID
  else {
    cardElement.innerHTML = `
      <div class="wishlist-card-content">
        <h3 class="game-title">Jogo #${game.id}</h3>
        <div class="wishlist-card-actions">
          <button class="favorite-btn active" data-game-id="${game.id}">
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
    `;
  }
  
  // Add event listener for favorite button
  const favoriteBtn = cardElement.querySelector('.favorite-btn');
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', function() {
      // Use the existing toggle function
      toggleFavorite(this);
    });
  }
  
  // Add event listener for add to cart button
  const addToCartBtn = cardElement.querySelector('.add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function() {
      const gameId = this.getAttribute('data-game-id');
      if (window.addToCart) {
        window.addToCart(gameId);
      } else if (typeof addToCart === 'function') {
        addToCart(gameId);
      } else {
        console.log('Adding to cart:', gameId);
        showNotification('Jogo adicionado ao carrinho!', 'success');
      }
    });
  }
  
  return cardElement;
}

/**
 * Updates the wishlist summary section in the profile page
 */
function updateWishlistSummary(itemCount, totalValue = 0, potentialSavings = 0) {
  const wishlistTotal = document.getElementById('wishlistTotal');
  const wishlistValue = document.getElementById('wishlistValue');
  const potentialSavingsEl = document.getElementById('potentialSavings');
  
  if (wishlistTotal) wishlistTotal.textContent = itemCount;
  if (wishlistValue) wishlistValue.textContent = `R$ ${totalValue.toFixed(2)}`;
  if (potentialSavingsEl) potentialSavingsEl.textContent = `R$ ${potentialSavings.toFixed(2)}`;
  
  // Update user profile stats counter if available
  const wishlistCount = document.getElementById('wishlistCount');
  if (wishlistCount) wishlistCount.textContent = itemCount;
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

/**
 * Shows a notification message
 */
function showNotification(message, type = 'info') {
  // Use SweetAlert2 if available
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 3000
    });
  } else {
    // Fallback to alert
    alert(message);
  }
}

// Expose functions if needed by other modules
window.isGameInWishlist = isGameInWishlist;
window.initializeFavorites = initializeFavorites; // Keep initialization exposed if needed externally
window.toggleFavorite = toggleFavorite; // Expose the main toggle function 
window.updateFavoritesTab = updateFavoritesTab; // Expose the favorites tab update function 