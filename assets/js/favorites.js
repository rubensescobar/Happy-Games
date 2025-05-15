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
  // Try to get gameId from various possible attribute locations
  let gameId = button.dataset.gameId || button.getAttribute('data-game-id') || button.dataset.id || button.getAttribute('data-id');

  // If still no gameId, try getting it from the closest parent game card
  if (!gameId) {
    const gameCard = button.closest('.game-card-immersive, .game-card, .cart-item');
    if (gameCard) {
      gameId = gameCard.dataset.gameId || gameCard.getAttribute('data-game-id');
    }
  }

  if (!gameId) {
    console.error("Cannot toggle favorite: game ID attribute not found on the button or parent card.");
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
  cardElement.className = 'favorite-game-card';
  cardElement.setAttribute('data-game-id', game.id);
  
  // Ensure game has proper data or set defaults
  const title = game.title || `Game #${game.id}`;
  const imageSrc = game.image || '../assets/images/placeholder-game.jpg';
  const platforms = game.platforms && Array.isArray(game.platforms) ? game.platforms.join(', ') : '';
  
  // Create card with simpler style matching the provided image
  cardElement.innerHTML = `
    <div class="favorite-card-content">
      <div class="favorite-image">
        <img src="${imageSrc}" alt="${title}" onerror="this.src='../assets/images/placeholder-game.jpg'">
        <button type="button" class="favorite-remove-btn" data-id="${game.id}">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <div class="favorite-details">
        <h3 class="favorite-title">${title}</h3>
        <p class="favorite-platforms">${platforms}</p>
      </div>
    </div>
  `;
  
  // Add event listener for remove button (unfavorite)
  const removeBtn = cardElement.querySelector('.favorite-remove-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const gameId = this.getAttribute('data-id');
      toggleFavorite(this); // This removes from wishlist and updates UI
    });
  }
  
  return cardElement;
}

/**
 * Updates the Favorites tab in profile.html to display all favorited games
 */
function updateFavoritesTab() {
  // Check if we're on the profile page (based on URL)
  const isProfilePage = window.location.pathname.includes('profile.html');
  if (!isProfilePage) return;
  
  // Only run on profile page when wishlist tab exists
  const wishlistContainer = document.getElementById('wishlist');
  if (!wishlistContainer) return;
  
  // Find or create the wishlistGrid container
  let wishlistGrid = document.getElementById('wishlistGrid');
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
  
  // Create grid container for favorite cards
  const favoriteCardsContainer = document.createElement('div');
  favoriteCardsContainer.className = 'favorite-cards-grid';
  favoriteCardsContainer.id = 'favoritesItems';
  
  // Append container to wishlist grid
  wishlistGrid.appendChild(favoriteCardsContainer);
  
  // Fetch game details for each favorited game
  const gameData = [];
  let totalValue = 0;
  let potentialSavings = 0;
  
  // Determine which games array to use - try multiple sources
  let gamesArray = [];
  
  // First priority: game-repository.js (newer implementation)
  if (window.gameRepository && typeof window.gameRepository.getAllGames === 'function') {
    gamesArray = window.gameRepository.getAllGames();
    console.log("Using window.gameRepository.getAllGames(): Found", gamesArray.length, "games");
  } 
  // Second priority: games.js global gamesData array
  else if (window.gamesData && Array.isArray(window.gamesData)) {
    gamesArray = window.gamesData;
    console.log("Using window.gamesData: Found", gamesArray.length, "games");
  }
  // Third priority: Check for other known data sources
  else if (typeof getAllGames === 'function') {
    gamesArray = getAllGames();
    console.log("Using getAllGames(): Found", gamesArray.length, "games");
  }
  // Fallback: hardcoded minimal game data
  else {
    console.warn("No game repository found. Using fallback game data.");
    // Minimal hardcoded fallback data
    gamesArray = [
      {
        id: '1',
        title: 'God of War Ragnarok',
        image: '../assets/images/game12.png',
        platforms: ['PlayStation', 'PC'],
        genres: ['Ação', 'Aventura', 'RPG'],
        price: 124.95,
        originalPrice: 249.90
      },
      {
        id: '2',
        title: 'Ghost of Tsushima',
        image: '../assets/images/game13.png',
        platforms: ['PlayStation', 'PC'],
        genres: ['Ação', 'Mundo Aberto', 'Samurai'],
        price: 49.99,
        originalPrice: 199.99
      },
      {
        id: '3',
        title: 'The Witcher 3: Wild Hunt',
        image: '../assets/images/game4.png',
        platforms: ['PC', 'PlayStation', 'Xbox'],
        genres: ['RPG', 'Fantasia', 'Aventura'],
        price: 79.99,
        originalPrice: 199.99
      }
    ];
  }

  // Print all game IDs in the array to debug
  console.log("Available game IDs:", gamesArray.map(g => g.id));
  
  // Debug which game IDs we're looking for
  console.log("Looking for game IDs:", favoritedGameIds);
  
  // Find full game details for each favorited game ID
  favoritedGameIds.forEach(gameId => {
    // Find the game in our array (using string comparison to be safe)
    let gameDetails = gamesArray.find(g => String(g.id) === String(gameId));
    
    if (gameDetails) {
      console.log(`Found game details for ID ${gameId}:`, gameDetails.title);
      
      // Fix image path if we're in profile.html which is in the pages directory
      if (gameDetails.image && !gameDetails.image.startsWith('http') && !gameDetails.image.includes('assets/')) {
        if (isProfilePage && !gameDetails.image.startsWith('../')) {
          gameDetails.image = '../' + gameDetails.image;
        }
      }
      
      // Add to game data array
      gameData.push(gameDetails);
      
      // Update summary values if price information is available
      if (gameDetails.price !== undefined && gameDetails.originalPrice !== undefined) {
        totalValue += gameDetails.originalPrice;
        potentialSavings += (gameDetails.originalPrice - gameDetails.price);
      }
    } else {
      console.warn(`No game details found for ID ${gameId}`);
      // Create minimal object with ID if we can't find the game
      gameData.push({ 
        id: gameId,
        title: `Game #${gameId}`,
        image: '../assets/images/placeholder-game.jpg'
      });
    }
  });
  
  // Create and append game cards
  gameData.forEach(game => {
    const gameCard = createFavoriteGameCard(game);
    favoriteCardsContainer.appendChild(gameCard);
  });
  
  // Update summary information
  updateWishlistSummary(favoritedGameIds.length, totalValue, potentialSavings);
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