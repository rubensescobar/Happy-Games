/**
 * Games Page JavaScript
 * Handles loading, filtering and displaying games for the BuscaGames games page
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the games page
  initializeGamesPage();
});

/**
 * Initialize all games page features
 */
function initializeGamesPage() {
  // Load all games initially
  loadAllGames();
  
  // Setup game card hover effects
  setupGameCardEffects();
  
  // Setup filter controls
  setupFilterControls();
  
  // Setup search functionality
  setupSearchFunction();
  
  // Check user login state
  checkUserLoginState();
}

/**
 * Load all games from the game repository
 */
function loadAllGames() {
  const gamesContainer = document.getElementById('gamesContainer');
  if (!gamesContainer) return;
  
  // Clear the container first
  gamesContainer.innerHTML = '';
  
  // Get all games from repository
  const allGames = window.gameRepository.getAllGames();
  
  // Display message if no games found
  if (!allGames || allGames.length === 0) {
    gamesContainer.innerHTML = `
      <div class="no-games-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Nenhum jogo encontrado.</p>
      </div>
    `;
    return;
  }
  
  // Render each game
  allGames.forEach(game => {
    renderGameCard(game, gamesContainer);
  });
  
  // Add animation to cards
  animateGameCards();
}

/**
 * Render a game card with all necessary information
 */
function renderGameCard(game, container) {
  // Create the game card element
  const gameCard = document.createElement('div');
  gameCard.className = 'game-card-immersive';
  gameCard.dataset.gameId = game.id;
  
  // Add genre data attribute for filtering
  if (game.genres && game.genres.length > 0) {
    gameCard.dataset.generos = game.genres.join(',');
  }
  
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
  
  // Create game card HTML
  gameCard.innerHTML = `
    <div class="game-card-image-container">
      <img src="${game.image}" alt="${game.title}" class="game-card-image">
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
  
  const wishlistBtn = gameCard.querySelector('.wishlist-button');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', function() {
      // Use the unified toggleFavorite function from favorites.js
      window.toggleFavorite(this);
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
 * Setup category filter controls
 */
function setupFilterControls() {
  // Category filters
  const categoryItems = document.querySelectorAll('.category-item');
  categoryItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Update active state
      categoryItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      
      // Get category value
      const category = this.getAttribute('data-genero');
      
      // Filter games
      filterGamesByCategory(category);
    });
  });
  
  // Platform filters
  const platformCheckboxes = document.querySelectorAll('input[name="platform"]');
  platformCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });
  
  // Price range filter
  const priceRange = document.getElementById('priceRange');
  if (priceRange) {
    priceRange.addEventListener('input', function() {
      const priceValue = document.getElementById('priceValue');
      if (priceValue) {
        priceValue.textContent = `R$ ${this.value}`;
      }
    });
    
    priceRange.addEventListener('change', applyFilters);
  }
  
  // Discount filter
  const discountCheckbox = document.getElementById('onlyDiscounts');
  if (discountCheckbox) {
    discountCheckbox.addEventListener('change', applyFilters);
  }
  
  // Apply filters button
  const applyFiltersBtn = document.getElementById('applyFilters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
  }
  
  // Sort select
  const sortSelect = document.getElementById('sortGames');
  if (sortSelect) {
    sortSelect.addEventListener('change', sortGames);
  }
}

/**
 * Filter games by category
 */
function filterGamesByCategory(category) {
  const gameCards = document.querySelectorAll('.game-card-immersive');
  
  if (category === 'all') {
    // Show all games
    gameCards.forEach(card => {
      card.style.display = 'block';
    });
  } else {
    // Filter by category
    gameCards.forEach(card => {
      const genres = card.getAttribute('data-generos');
      
      if (genres && genres.includes(category)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  // Animate visible cards
  animateGameCards();
}

/**
 * Apply all filters (platforms, price, discounts)
 */
function applyFilters() {
  const gameCards = document.querySelectorAll('.game-card-immersive');
  let visibleGames = 0;
  
  // Get filter values
  const maxPrice = parseFloat(document.getElementById('priceRange').value);
  const onlyDiscounts = document.getElementById('onlyDiscounts').checked;
  
  const platforms = {
    pc: document.getElementById('platformPC').checked,
    playstation: document.getElementById('platformPS').checked,
    xbox: document.getElementById('platformXbox').checked
  };
  
  // Apply filters to each game card
  gameCards.forEach(card => {
    const price = parseFloat(card.querySelector('.price-current').getAttribute('data-price'));
    const hasDiscount = card.querySelector('.discount-tag') !== null;
    const platformIcons = card.querySelectorAll('.platform-icon');
    
    // Check platform match
    let hasPlatform = false;
    platformIcons.forEach(icon => {
      if ((platforms.pc && icon.textContent.includes('PC')) ||
          (platforms.playstation && icon.textContent.includes('PlayStation')) ||
          (platforms.xbox && icon.textContent.includes('Xbox'))) {
        hasPlatform = true;
      }
    });
    
    // If no platforms selected, show all
    if (!platforms.pc && !platforms.playstation && !platforms.xbox) {
      hasPlatform = true;
    }
    
    // Check if game matches all filters
    const meetsPrice = price <= maxPrice;
    const meetsDiscount = !onlyDiscounts || hasDiscount;
    
    if (meetsPrice && hasPlatform && meetsDiscount) {
      card.style.display = 'block';
      visibleGames++;
    } else {
      card.style.display = 'none';
    }
  });
  
  // Show "no results" message if no games match filters
  const noResultsMessage = document.getElementById('noResultsMessage');
  if (noResultsMessage) {
    if (visibleGames === 0) {
      noResultsMessage.style.display = 'block';
    } else {
      noResultsMessage.style.display = 'none';
    }
  }
  
  // Animate visible cards
  animateGameCards();
}

/**
 * Sort games by price, name, rating, etc.
 */
function sortGames() {
  const sortSelect = document.getElementById('sortGames');
  if (!sortSelect) return;
  
  const sortBy = sortSelect.value;
  const gamesContainer = document.getElementById('gamesContainer');
  if (!gamesContainer) return;
  
  // Get all game cards
  const gameCards = Array.from(gamesContainer.querySelectorAll('.game-card-immersive'));
  
  // Sort based on selection
  gameCards.sort((a, b) => {
    if (sortBy === 'price-asc') {
      const priceA = parseFloat(a.querySelector('.price-current').getAttribute('data-price'));
      const priceB = parseFloat(b.querySelector('.price-current').getAttribute('data-price'));
      return priceA - priceB;
    } else if (sortBy === 'price-desc') {
      const priceA = parseFloat(a.querySelector('.price-current').getAttribute('data-price'));
      const priceB = parseFloat(b.querySelector('.price-current').getAttribute('data-price'));
      return priceB - priceA;
    } else if (sortBy === 'name-asc') {
      const nameA = a.querySelector('.game-card-title').textContent;
      const nameB = b.querySelector('.game-card-title').textContent;
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'name-desc') {
      const nameA = a.querySelector('.game-card-title').textContent;
      const nameB = b.querySelector('.game-card-title').textContent;
      return nameB.localeCompare(nameA);
    } else if (sortBy === 'rating-desc') {
      const ratingA = parseFloat(a.querySelector('.rating-number').textContent);
      const ratingB = parseFloat(b.querySelector('.rating-number').textContent);
      return ratingB - ratingA;
    } else if (sortBy === 'discount-desc') {
      const discountTagA = a.querySelector('.discount-tag');
      const discountTagB = b.querySelector('.discount-tag');
      
      const discountA = discountTagA ? parseFloat(discountTagA.textContent.replace(/[^\d.-]/g, '')) : 0;
      const discountB = discountTagB ? parseFloat(discountTagB.textContent.replace(/[^\d.-]/g, '')) : 0;
      
      return discountB - discountA;
    }
    
    return 0;
  });
  
  // Re-append sorted cards
  gameCards.forEach(card => {
    gamesContainer.appendChild(card);
  });
  
  // Animate cards
  animateGameCards();
}

/**
 * Setup search functionality
 */
function setupSearchFunction() {
  const searchBtn = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchGames');
  
  if (searchBtn && searchInput) {
    // Search on button click
    searchBtn.addEventListener('click', () => {
      searchGames(searchInput.value);
    });
    
    // Search on Enter key
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        searchGames(searchInput.value);
      }
    });
  }
}

/**
 * Search for games by title or genre
 */
function searchGames(query) {
  if (!query) {
    // If empty query, show all games
    const gameCards = document.querySelectorAll('.game-card-immersive');
    gameCards.forEach(card => {
      card.style.display = 'block';
    });
    
    const noResultsMessage = document.getElementById('noResultsMessage');
    if (noResultsMessage) {
      noResultsMessage.style.display = 'none';
    }
    
    return;
  }
  
  // Convert query to lowercase for case-insensitive search
  query = query.toLowerCase();
  
  // Filter game cards by search query
  const gameCards = document.querySelectorAll('.game-card-immersive');
  let visibleGames = 0;
  
  gameCards.forEach(card => {
    const title = card.querySelector('.game-card-title').textContent.toLowerCase();
    const genres = card.getAttribute('data-generos')?.toLowerCase() || '';
    
    if (title.includes(query) || genres.includes(query)) {
      card.style.display = 'block';
      visibleGames++;
    } else {
      card.style.display = 'none';
    }
  });
  
  // Show "no results" message if no games match search
  const noResultsMessage = document.getElementById('noResultsMessage');
  if (noResultsMessage) {
    if (visibleGames === 0) {
      noResultsMessage.style.display = 'block';
    } else {
      noResultsMessage.style.display = 'none';
    }
  }
  
  // Animate visible cards
  animateGameCards();
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
  
  let visibleIndex = 0;
  gameCards.forEach((card) => {
    if (card.style.display !== 'none') {
      // Reset animation
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      // Apply animation with staggered delay
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50 * visibleIndex);
      
      visibleIndex++;
    }
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