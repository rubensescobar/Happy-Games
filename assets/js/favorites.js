/**
 * Favorites/Wishlist Management for Happy-Games
 * This file provides consistent functionality for favorites across the site
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize wishlist icons based on localStorage
  initializeFavorites();
});

// Initialize wishlist/favorites UI from localStorage
function initializeFavorites() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const gameCards = document.querySelectorAll('.game-card-immersive');
  
  gameCards.forEach(card => {
    const gameId = card.getAttribute('data-game-id');
    const wishlistBtn = card.querySelector('.wishlist-button');
    
    if (wishlistBtn && gameId) {
      const isInWishlist = wishlist.some(item => item.id === gameId);
      const icon = wishlistBtn.querySelector('i');
      
      if (isInWishlist && icon) {
        icon.classList.remove('far');
        icon.classList.add('fas');
      }
      
      // Add click event listener
      wishlistBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFavorite(this);
      });
    }
  });
}

// Toggle item in favorites/wishlist
function toggleFavorite(button) {
  const icon = button.querySelector('i');
  const gameCard = button.closest('.game-card-immersive');
  const gameId = gameCard.getAttribute('data-game-id');
  const gameTitle = gameCard.querySelector('.game-card-title').textContent;
  const gameImage = gameCard.querySelector('.game-card-image').src;
  
  // Get wishlist from localStorage
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const existingIndex = wishlist.findIndex(item => item.id === gameId);
  
  if (existingIndex === -1) {
    // Add to wishlist
    wishlist.push({
      id: gameId,
      title: gameTitle,
      image: gameImage
    });
    
    // Change from outline to solid heart
    icon.classList.remove('far');
    icon.classList.add('fas');
    
    // Add XP for adding to wishlist
    if (typeof updateXP === 'function') {
      updateXP(10);
    }
  } else {
    // Remove from wishlist
    wishlist.splice(existingIndex, 1);
    
    // Change from solid to outline heart
    icon.classList.remove('fas');
    icon.classList.add('far');
  }
  
  // Save updated wishlist to localStorage
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
} 