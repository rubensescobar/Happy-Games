/**
 * Home Page JavaScript
 * Handles loading and rendering featured games on the BuscaGames homepage
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the homepage features
  initializeHomepage();
});

/**
 * Initialize all homepage features
 */
function initializeHomepage() {
  // Load featured games
  loadFeaturedGames();
  
  // Setup game card hover effects
  setupGameCardEffects();
  
  // Check user login state
  checkUserLoginState();
}

/**
 * Load featured games from the game repository
 */
function loadFeaturedGames() {
  const featuredGamesContainer = document.getElementById('featuredGames');
  if (!featuredGamesContainer) return;
  
  // Clear the container first
  featuredGamesContainer.innerHTML = '';
  
  // Get featured games from repository
  const featuredGames = window.gameRepository.getFeaturedGames();
  
  // Display message if no featured games found
  if (!featuredGames || featuredGames.length === 0) {
    featuredGamesContainer.innerHTML = `
      <div class="no-games-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Nenhum jogo em destaque encontrado.</p>
      </div>
    `;
    return;
  }
  
  // Render each featured game (show up to 4 games max)
  const gamesToShow = featuredGames.slice(0, 4);
  gamesToShow.forEach(game => {
    renderGameCard(game, featuredGamesContainer);
  });
  
  // Add animation to cards
  animateGameCards();

  // Initialize favorite buttons after rendering games
  if (window.initializeFavorites) {
    window.initializeFavorites();
  }
}

/**
 * Render a game card with all necessary information
 */
function renderGameCard(game, container) {
  // Create the game card element
  const gameCard = document.createElement('div');
  gameCard.className = 'game-card-immersive';
  gameCard.dataset.gameId = game.id;
  
  // Calculate discount tag
  const discountTag = game.discount ? `<div class="discount-tag">-${game.discount}%</div>` : '';
  
  // Create badges HTML
  let badgesHtml = '';
  if (game.tags && game.tags.length > 0) {
    const badges = {
      'featured': '<div class="game-badge featured"><i class="fas fa-star"></i> Destaque</div>',
      'new': '<div class="game-badge new"><i class="fas fa-certificate"></i> Novo</div>',
      'bestseller': '<div class="game-badge bestseller"><i class="fas fa-award"></i> Mais Vendido</div>'
    };
    
    badgesHtml = '<div class="game-badges">';
    game.tags.forEach(tag => {
      if (badges[tag]) {
        badgesHtml += badges[tag];
      }
    });
    badgesHtml += '</div>';
  }
  
  // Create platform icons HTML
  let platformsHtml = '<div class="game-card-platform">';
  if (game.platforms.includes('PC')) {
    platformsHtml += '<span class="platform-icon"><i class="fas fa-desktop"></i> PC</span>';
  }
  if (game.platforms.includes('PlayStation')) {
    platformsHtml += '<span class="platform-icon"><i class="fas fa-playstation"></i> PlayStation</span>';
  }
  if (game.platforms.includes('Xbox')) {
    platformsHtml += '<span class="platform-icon"><i class="fas fa-xbox"></i> Xbox</span>';
  }
  platformsHtml += '</div>';
  
  // Create genres HTML
  let genresHtml = '<div class="genre-tags">';
  game.genres.forEach(genre => {
    genresHtml += `<span class="genre-tag">${genre}</span>`;
  });
  genresHtml += '</div>';
  
  // Create rating stars HTML
  let starsHtml = '<div class="rating-stars">';
  const fullStars = Math.floor(game.rating);
  const hasHalfStar = game.rating % 1 >= 0.5;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsHtml += '<i class="fas fa-star"></i>';
    } else if (i === fullStars + 1 && hasHalfStar) {
      starsHtml += '<i class="fas fa-star-half-alt"></i>';
    } else {
      starsHtml += '<i class="far fa-star"></i>';
    }
  }
  starsHtml += '</div>';
  
  // Fix image path for homepage (remove leading ../ if present)
  let imagePath = game.image;
  if (imagePath.startsWith('../')) {
    imagePath = imagePath.substring(3);
  }
  
  // Create game card HTML
  gameCard.innerHTML = `
    <div class="game-card-image-container">
      <img src="${imagePath}" alt="${game.title}" class="game-card-image">
      <div class="game-card-glare"></div>
    </div>
    
    ${discountTag}
    ${badgesHtml}
    
    <div class="game-card-overlay">
      <h3 class="game-card-title">${game.title}</h3>
      
      ${platformsHtml}
      ${genresHtml}
      
      <div class="game-card-rating">
        ${starsHtml}
        <span class="rating-number">${game.rating.toFixed(1)}</span>
      </div>
      
      <div class="game-card-price">
        ${game.originalPrice !== game.price ? `<span class="price-original">R$ ${game.originalPrice.toFixed(2)}</span>` : ''}
        <span class="price-current" data-price="${game.price}">R$ ${game.price.toFixed(2)}</span>
      </div>
      
      <div class="game-card-actions">
        <button class="action-button add-to-cart"><i class="fas fa-shopping-cart me-2"></i> Adicionar</button>
        <button class="action-button-secondary wishlist-button">
          <i class="far fa-heart"></i>
        </button>
        <button class="action-button-secondary preview-button">
          <i class="fas fa-eye"></i>
        </button>
      </div>
    </div>
  `;
  
  // Add to container
  container.appendChild(gameCard);
  
  // Add event listeners
  const addToCartBtn = gameCard.querySelector('.add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (window.addToCart) {
        window.addToCart(game.id);
      } else {
        console.error('Cart functionality not available');
      }
    });
  }
  
  const previewBtn = gameCard.querySelector('.preview-button');
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      // Use the unified openGamePreview function from immersive.js
      if (window.openGamePreview) {
        window.openGamePreview(game.id);
      } else {
        console.error('Game preview functionality not available');
      }
    });
  }
}

/**
 * Set up glare effect and other interactive features for game cards
 */
function setupGameCardEffects() {
  // Setup glare effect on game cards
  document.addEventListener('mousemove', function(e) {
    const gameCards = document.querySelectorAll('.game-card-immersive');
    
    gameCards.forEach(card => {
      const glare = card.querySelector('.game-card-glare');
      if (glare) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          glare.style.setProperty('--x', `${x}px`);
          glare.style.setProperty('--y', `${y}px`);
        }
      }
    });
  });
}

/**
 * Animate game cards with a staggered fade-in effect
 */
function animateGameCards() {
  const gameCards = document.querySelectorAll('.game-card-immersive');
  
  gameCards.forEach((card, index) => {
    // Reset animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    // Apply animation with staggered delay
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 * index);
  });
}

/**
 * Check user login state and update UI accordingly
 */
function checkUserLoginState() {
  const isLoggedIn = localStorage.getItem('isLogged') === 'true';
  
  // Load and update user profile if logged in
  if (isLoggedIn) {
    updateUserProfileUI();
    updateWishlistButtonsState();
  }
  
  // Update cart count
  updateCartCount();
}

/**
 * Update the cart count in the UI
 */
function updateCartCount() {
  const cartCountElement = document.querySelector('.cart-count');
  if (!cartCountElement) return;
  
  // Get cart from local storage (use the new standard cart key)
  const cart = JSON.parse(localStorage.getItem('buscaGamesCart') || '[]');
  
  // Calculate total number of items
  const count = cart.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
  
  // Update count
  cartCountElement.textContent = count;
  
  // Show if not empty
  if (count > 0) {
    cartCountElement.classList.add('show');
  } else {
    cartCountElement.classList.remove('show');
  }
}

/**
 * Update user profile display (level, XP, etc.)
 */
function updateUserProfileUI() {
  const savedProfile = localStorage.getItem('userGameProfile');
  if (!savedProfile) return;
  
  try {
    const userProfile = JSON.parse(savedProfile);
    
    // Update level badge
    const userLevelEl = document.getElementById('userLevel');
    if (userLevelEl) {
      userLevelEl.textContent = userProfile.level || 1;
    }
    
    // Update XP progress bar
    const userXpBarEl = document.getElementById('userXpBar');
    if (userXpBarEl) {
      const xpProgress = userProfile.xp % 100;
      const percentage = (xpProgress / 100) * 100;
      userXpBarEl.style.width = `${percentage}%`;
    }
    
    // Update XP text
    const userXpTextEl = document.getElementById('userXpText');
    if (userXpTextEl) {
      const xpToNext = 100 - (userProfile.xp % 100);
      userXpTextEl.textContent = `${xpToNext} XP para o próximo nível`;
    }
    
    // Show the level container if it exists
    const userLevelContainer = document.getElementById('userLevelContainer');
    if (userLevelContainer) {
      userLevelContainer.classList.remove('d-none');
    }
  } catch (error) {
    console.error('Error updating user profile UI:', error);
  }
}

/**
 * Update wishlist button states based on user's wishlist
 */
function updateWishlistButtonsState() {
  const savedProfile = localStorage.getItem('userGameProfile');
  if (!savedProfile) return;
  
  try {
    const userProfile = JSON.parse(savedProfile);
    const wishlist = userProfile.wishlist || [];
    
    document.querySelectorAll('.wishlist-button').forEach(button => {
      const gameCard = button.closest('.game-card-immersive');
      if (!gameCard) return;
      
      const gameId = gameCard.getAttribute('data-game-id');
      
      if (gameId && wishlist.includes(gameId)) {
        button.innerHTML = '<i class="fas fa-heart"></i>';
        button.classList.add('active');
      } else {
        button.innerHTML = '<i class="far fa-heart"></i>';
        button.classList.remove('active');
      }
    });
  } catch (error) {
    console.error('Error updating wishlist buttons:', error);
  }
} 