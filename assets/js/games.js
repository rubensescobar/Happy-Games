/**
 * Games Page JavaScript
 * Handles game listing functionality for BuscaGames
 */

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize games page
  initializeGamesPage();
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize cart if available
  if (typeof initializeCart === 'function') {
    initializeCart();
  }
});

// Initialize Games Page
function initializeGamesPage() {
  // Show all games on initial load
  updateGameDisplay();
  
  // Setup game card hover effects
  setupGameCardEffects();
  
  // Add animation to cards on load
  animateGameCards();
  
  // Initialize price range slider
  initializePriceRangeSlider();
  
  // Update cart UI
  updateCartUI();
}

// Initialize the price range slider
function initializePriceRangeSlider() {
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  
  if (priceRange && priceValue) {
    priceRange.addEventListener('input', function() {
      priceValue.textContent = `R$ ${this.value}`;
    });
  }
}

// Set up event listeners
function setupEventListeners() {
  // Category filter clicks
  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Update active category
      document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      
      // Get selected category
      const category = this.getAttribute('data-genero');
      
      // Filter games
      filterGamesByCategory(category);
      
      // Add subtle animation
      animateGameCards();
    });
  });
  
  // Apply filters button
  const applyFiltersBtn = document.getElementById('applyFilters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      applyAllFilters();
      animateGameCards();
    });
  }
  
  // Search functionality
  const searchBtn = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchGames');
  
  if (searchBtn && searchInput) {
    // Search on button click
    searchBtn.addEventListener('click', function() {
      searchGames(searchInput.value);
    });
    
    // Search on Enter key
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        searchGames(this.value);
      }
    });
  }
  
  // Sort functionality
  const sortSelect = document.getElementById('sortGames');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      sortGames(this.value);
    });
  }
  
  // Load more games button
  const loadMoreBtn = document.getElementById('loadMoreGames');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      loadMoreGames();
    });
  }
  
  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
      const gameCard = this.closest('.game-card-immersive');
      
      if (gameCard) {
        const gameId = gameCard.getAttribute('data-game-id');
        const gameTitle = gameCard.querySelector('.game-card-title').textContent;
        const gamePrice = gameCard.querySelector('.price-current').getAttribute('data-price');
        const gameImage = gameCard.querySelector('.game-card-image').getAttribute('src');
        
        // Check if user is logged in before adding to cart
        if (window.auth && window.auth.isUserLoggedIn()) {
          addToCart({
            id: gameId,
            title: gameTitle,
            price: parseFloat(gamePrice),
            image: gameImage,
            quantity: 1
          });
          
          // Show success message
          showNotification(`${gameTitle} adicionado ao carrinho!`, 'success');
          
          // Add XP for adding to cart
          addUserXP(5);
        } else {
          // Prompt user to login
          window.auth.requireLogin(null, true);
        }
      }
    });
  });
  
  // Wishlist buttons
  document.querySelectorAll('.wishlist-button').forEach(button => {
    button.addEventListener('click', function() {
      const gameCard = this.closest('.game-card-immersive');
      
      if (gameCard) {
        const gameId = gameCard.getAttribute('data-game-id');
        
        // Check if user is logged in before adding to wishlist
        if (window.auth && window.auth.isUserLoggedIn()) {
          toggleWishlist(gameId, this);
        } else {
          // Prompt user to login
          window.auth.requireLogin(null, true);
        }
      }
    });
  });
  
  // Preview buttons
  document.querySelectorAll('.preview-button').forEach(button => {
    button.addEventListener('click', function() {
      const gameCard = this.closest('.game-card-immersive');
      
      if (gameCard) {
        const gameId = gameCard.getAttribute('data-game-id');
        showGamePreview(gameId);
      }
    });
  });
}

// Load user game profile from localStorage
function loadUserGameProfile() {
  const userProfile = JSON.parse(localStorage.getItem('userGameProfile') || '{"level": 1, "xp": 0}');
  
  // Update level
  const userLevelEl = document.getElementById('userLevel');
  if (userLevelEl) {
    userLevelEl.textContent = userProfile.level || 1;
  }
  
  // Update XP bar
  const userXpBarEl = document.getElementById('userXpBar');
  if (userXpBarEl) {
    const xpProgress = userProfile.xp % 100;
    userXpBarEl.style.width = `${xpProgress}%`;
  }
  
  // Update XP text
  const userXpTextEl = document.getElementById('userXpText');
  if (userXpTextEl) {
    const xpToNext = 100 - (userProfile.xp % 100);
    userXpTextEl.textContent = `${xpToNext} XP para o próximo nível`;
  }
  
  // Update wishlist buttons state based on user's wishlist
  updateWishlistButtonsState(userProfile.wishlist || []);
}

// Update wishlist buttons to reflect current user's wishlist
function updateWishlistButtonsState(wishlist) {
  document.querySelectorAll('.wishlist-button').forEach(button => {
    const gameCard = button.closest('.game-card-immersive');
    if (gameCard) {
      const gameId = gameCard.getAttribute('data-game-id');
      const isWishlisted = wishlist.includes(gameId);
      
      if (isWishlisted) {
        button.innerHTML = '<i class="fas fa-heart"></i>';
        button.classList.add('wishlisted');
      } else {
        button.innerHTML = '<i class="far fa-heart"></i>';
        button.classList.remove('wishlisted');
      }
    }
  });
}

// Filter games by category
function filterGamesByCategory(category) {
  const gameCards = document.querySelectorAll('.game-card-immersive');
  
  gameCards.forEach(card => {
    if (category === 'all') {
      card.style.display = 'block';
    } else {
      const gameGenres = card.getAttribute('data-generos');
      
      if (gameGenres && gameGenres.includes(category)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    }
  });
  
  // Show "no results" message if no games are visible
  const visibleGames = document.querySelectorAll('.game-card-immersive[style="display: block"]');
  const gamesGrid = document.getElementById('gamesGrid');
  
  if (visibleGames.length === 0 && gamesGrid) {
    // Check if message already exists
    let noResultsMsg = document.querySelector('.no-results-message');
    
    if (!noResultsMsg) {
      noResultsMsg = document.createElement('div');
      noResultsMsg.className = 'no-results-message';
      noResultsMsg.innerHTML = `
        <i class="fas fa-search"></i>
        <h3>Nenhum jogo encontrado</h3>
        <p>Tente ajustar seus filtros ou buscar por outro termo.</p>
      `;
      
      gamesGrid.appendChild(noResultsMsg);
    }
  } else {
    // Remove message if it exists
    const noResultsMsg = document.querySelector('.no-results-message');
    if (noResultsMsg) {
      noResultsMsg.remove();
    }
  }
}

// Apply all filters
function applyAllFilters() {
  // Get filter values
  const maxPrice = document.getElementById('priceRange').value;
  const platforms = {
    pc: document.getElementById('platform-pc').checked,
    playstation: document.getElementById('platform-ps').checked,
    xbox: document.getElementById('platform-xbox').checked
  };
  const onlyDiscounts = document.getElementById('show-discounts').checked;
  
  // Apply filters to games
  const gameCards = document.querySelectorAll('.game-card-immersive');
  
  gameCards.forEach(card => {
    // Get game info
    const priceEl = card.querySelector('.price-current');
    const price = priceEl ? parseFloat(priceEl.getAttribute('data-price')) : 0;
    const hasDiscount = card.querySelector('.discount-tag') !== null;
    
    // Get platform info (would normally come from data attributes)
    const platformElements = card.querySelectorAll('.platform-icon');
    const hasPc = Array.from(platformElements).some(el => el.textContent.includes('PC'));
    const hasPs = Array.from(platformElements).some(el => el.textContent.includes('PlayStation'));
    const hasXbox = Array.from(platformElements).some(el => el.textContent.includes('Xbox'));
    
    // Check if game meets filter criteria
    const meetsPrice = price <= maxPrice;
    const meetsPlatform = 
      (platforms.pc && hasPc) || 
      (platforms.playstation && hasPs) || 
      (platforms.xbox && hasXbox) || 
      (!platforms.pc && !platforms.playstation && !platforms.xbox); // If no platforms selected, show all
    const meetsDiscount = !onlyDiscounts || hasDiscount;
    
    // Show/hide based on filters
    if (meetsPrice && meetsPlatform && meetsDiscount) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
  
  // Show "no results" message if no games are visible
  const visibleGames = document.querySelectorAll('.game-card-immersive[style="display: block"]');
  const gamesGrid = document.getElementById('gamesGrid');
  
  if (visibleGames.length === 0 && gamesGrid) {
    // Check if message already exists
    let noResultsMsg = document.querySelector('.no-results-message');
    
    if (!noResultsMsg) {
      noResultsMsg = document.createElement('div');
      noResultsMsg.className = 'no-results-message';
      noResultsMsg.innerHTML = `
        <i class="fas fa-filter"></i>
        <h3>Nenhum jogo encontrado</h3>
        <p>Tente ajustar seus filtros para encontrar jogos.</p>
      `;
      
      gamesGrid.appendChild(noResultsMsg);
    }
  } else {
    // Remove message if it exists
    const noResultsMsg = document.querySelector('.no-results-message');
    if (noResultsMsg) {
      noResultsMsg.remove();
    }
  }
}

// Search games
function searchGames(query) {
  if (!query || query.trim() === '') {
    // If empty query, show all games
    document.querySelectorAll('.game-card-immersive').forEach(card => {
      card.style.display = 'block';
    });
    return;
  }
  
  query = query.toLowerCase().trim();
  
  // Search in game titles and genres
  const gameCards = document.querySelectorAll('.game-card-immersive');
  
  gameCards.forEach(card => {
    const title = card.querySelector('.game-card-title').textContent.toLowerCase();
    const genres = card.getAttribute('data-generos') ? card.getAttribute('data-generos').toLowerCase() : '';
    
    if (title.includes(query) || genres.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
  
  // Show "no results" message if no games are visible
  const visibleGames = document.querySelectorAll('.game-card-immersive[style="display: block"]');
  const gamesGrid = document.getElementById('gamesGrid');
  
  if (visibleGames.length === 0 && gamesGrid) {
    // Check if message already exists
    let noResultsMsg = document.querySelector('.no-results-message');
    
    if (!noResultsMsg) {
      noResultsMsg = document.createElement('div');
      noResultsMsg.className = 'no-results-message';
      noResultsMsg.innerHTML = `
        <i class="fas fa-search"></i>
        <h3>Nenhum resultado para "${query}"</h3>
        <p>Tente buscar por outro termo ou explorar as categorias.</p>
      `;
      
      gamesGrid.appendChild(noResultsMsg);
    } else {
      // Update message text
      noResultsMsg.innerHTML = `
        <i class="fas fa-search"></i>
        <h3>Nenhum resultado para "${query}"</h3>
        <p>Tente buscar por outro termo ou explorar as categorias.</p>
      `;
    }
  } else {
    // Remove message if it exists
    const noResultsMsg = document.querySelector('.no-results-message');
    if (noResultsMsg) {
      noResultsMsg.remove();
    }
  }
}

// Sort games
function sortGames(sortBy) {
  const gamesGrid = document.getElementById('gamesGrid');
  if (!gamesGrid) return;
  
  const gameCards = Array.from(gamesGrid.querySelectorAll('.game-card-immersive'));
  
  // Sort based on criteria
  gameCards.sort((a, b) => {
    if (sortBy === 'nome') {
      const titleA = a.querySelector('.game-card-title').textContent;
      const titleB = b.querySelector('.game-card-title').textContent;
      return titleA.localeCompare(titleB);
    } 
    else if (sortBy === 'preco-asc') {
      const priceA = parseFloat(a.querySelector('.price-current').getAttribute('data-price'));
      const priceB = parseFloat(b.querySelector('.price-current').getAttribute('data-price'));
      return priceA - priceB;
    }
    else if (sortBy === 'preco-desc') {
      const priceA = parseFloat(a.querySelector('.price-current').getAttribute('data-price'));
      const priceB = parseFloat(b.querySelector('.price-current').getAttribute('data-price'));
      return priceB - priceA;
    }
    else if (sortBy === 'desconto') {
      // Get discount percentage from element or default to 0
      const getDiscount = (el) => {
        const discountEl = el.querySelector('.discount-tag');
        if (discountEl) {
          return parseInt(discountEl.textContent.replace(/[^0-9]/g, ''));
        }
        return 0;
      };
      
      const discountA = getDiscount(a);
      const discountB = getDiscount(b);
      return discountB - discountA;
    }
    
    return 0;
  });
  
  // Reorder elements in DOM
  gameCards.forEach(card => gamesGrid.appendChild(card));
  
  // Apply animation
  animateGameCards();
}

// Load more games
function loadMoreGames() {
  // This is a placeholder function
  // In a real implementation, this would make an API call to load more games
  
  const loadMoreBtn = document.getElementById('loadMoreGames');
  if (loadMoreBtn) {
    // Show loading state
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Carregando...';
    loadMoreBtn.disabled = true;
    
    // Simulate loading delay
    setTimeout(() => {
      // Reset button
      loadMoreBtn.innerHTML = '<i class="fas fa-plus me-2"></i> Carregar Mais Jogos';
      loadMoreBtn.disabled = false;
      
      // Show notification
      showNotification('Não há mais jogos para carregar', 'info');
    }, 1500);
  }
}

// Update cart UI
// DEPRECATED: Use the unified updateCartCount function from cart.js
function updateCartUI() {
  // Forward to the unified cart count function if available
  if (window.updateCartCount) {
    window.updateCartCount();
  } else {
    console.log('Using legacy cart UI update function');
    const cart = JSON.parse(localStorage.getItem('gameCart') || '[]');
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount) {
      const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
      cartCount.textContent = totalItems;
      
      if (totalItems > 0) {
        cartCount.classList.add('show');
      } else {
        cartCount.classList.remove('show');
      }
    }
  }
}

// Toggle wishlist
function toggleWishlist(gameId, button) {
  // Get user profile
  let userProfile = {};
  const savedProfile = localStorage.getItem('userGameProfile');
  
  if (savedProfile) {
    try {
      userProfile = JSON.parse(savedProfile);
    } catch (e) {
      console.error('Error parsing user profile:', e);
      userProfile = { level: 1, xp: 0, wishlist: [] };
    }
  } else {
    userProfile = { level: 1, xp: 0, wishlist: [] };
  }
  
  // Initialize wishlist if it doesn't exist
  if (!userProfile.wishlist) {
    userProfile.wishlist = [];
  }
  
  // Check if game is already in wishlist
  const isWishlisted = userProfile.wishlist.includes(gameId);
  
  if (isWishlisted) {
    // Remove from wishlist
    userProfile.wishlist = userProfile.wishlist.filter(id => id !== gameId);
    
    // Update button
    button.innerHTML = '<i class="far fa-heart"></i>';
    button.classList.remove('wishlisted');
    
    // Show notification
    showNotification('Removido dos favoritos', 'info');
  } else {
    // Add to wishlist
    userProfile.wishlist.push(gameId);
    
    // Update button
    button.innerHTML = '<i class="fas fa-heart"></i>';
    button.classList.add('wishlisted');
    
    // Show notification
    showNotification('Adicionado aos favoritos!', 'success');
    
    // Add XP
    addUserXP(10);
  }
  
  // Save user profile
  localStorage.setItem('userGameProfile', JSON.stringify(userProfile));
}

// Show game preview
function showGamePreview(gameId) {
  // In a real implementation, this would fetch game details from an API
  // For now, we'll create a generic preview
  
  const modal = document.createElement('div');
  modal.className = 'quick-preview';
  modal.innerHTML = `
    <div class="preview-content">
      <div class="preview-close"><i class="fas fa-times"></i></div>
      
      <div class="preview-header">
        <img src="../assets/images/game${gameId}.png" alt="Game Preview">
        <div class="preview-header-overlay">
          <h1 class="preview-title">Detalhes do Jogo</h1>
          <div class="preview-meta">
            <div class="preview-meta-item">
              <i class="fas fa-star"></i>
              <span>4.5</span>
            </div>
            <div class="preview-meta-item">
              <i class="fas fa-gamepad"></i>
              <span>PC, PlayStation, Xbox</span>
            </div>
            <div class="preview-meta-item">
              <i class="fas fa-calendar"></i>
              <span>Lançamento: 2023</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="preview-body">
        <div class="preview-section">
          <h3 class="preview-section-title">Descrição</h3>
          <p class="preview-description">
            Informações detalhadas sobre o jogo estariam disponíveis aqui, incluindo a história,
            mecânicas de gameplay e características especiais que tornam este jogo único.
          </p>
        </div>
        
        <div class="preview-section">
          <h3 class="preview-section-title">Características</h3>
          <div class="preview-features">
            <div class="preview-feature">
              <div class="feature-icon"><i class="fas fa-check-circle"></i></div>
              <div class="feature-text">Mundo Aberto</div>
            </div>
            <div class="preview-feature">
              <div class="feature-icon"><i class="fas fa-check-circle"></i></div>
              <div class="feature-text">Multiplayer</div>
            </div>
            <div class="preview-feature">
              <div class="feature-icon"><i class="fas fa-check-circle"></i></div>
              <div class="feature-text">Gráficos em Alta Resolução</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="preview-footer">
        <div class="preview-price">
          <div class="preview-price-original">R$ 199.90</div>
          <div class="preview-price-current">R$ 149.90</div>
        </div>
        
        <div class="preview-actions">
          <button class="action-button preview-cart" data-game-id="${gameId}">
            <i class="fas fa-shopping-cart me-2"></i> Adicionar ao carrinho
          </button>
          <button class="action-button-secondary preview-wishlist" data-game-id="${gameId}">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(modal);
  
  // Fade in
  setTimeout(() => modal.classList.add('active'), 10);
  
  // Setup event listeners
  const closeBtn = modal.querySelector('.preview-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });
  }
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  });
  
  // Update wishlist button in preview
  const wishlistBtn = modal.querySelector('.preview-wishlist');
  if (wishlistBtn) {
    const userProfile = JSON.parse(localStorage.getItem('userGameProfile') || '{}');
    const wishlist = userProfile.wishlist || [];
    
    if (wishlist.includes(gameId)) {
      wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
      wishlistBtn.classList.add('wishlisted');
    }
    
    wishlistBtn.addEventListener('click', () => {
      toggleWishlist(gameId, wishlistBtn);
    });
  }
  
  // Add to cart button
  const cartBtn = modal.querySelector('.preview-cart');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      // Check if user is logged in
      if (localStorage.getItem('isLogged') !== 'true') {
        // Redirect to login page
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
        
        const currentUrl = window.location.pathname;
        window.location.href = `login.html?returnUrl=${encodeURIComponent(currentUrl)}`;
        return;
      }
      
      addToCart({
        id: gameId,
        title: 'Game ' + gameId,
        price: 149.90,
        quantity: 1
      });
      
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });
  }
  
  // Add XP for viewing details
  addUserXP(5);
}

// Add XP to user profile
function addUserXP(amount) {
  // Check if user is logged in
  if (localStorage.getItem('isLogged') !== 'true') {
    return;
  }
  
  let userProfile = {};
  const savedProfile = localStorage.getItem('userGameProfile');
  
  if (savedProfile) {
    try {
      userProfile = JSON.parse(savedProfile);
    } catch (e) {
      console.error('Error parsing user profile:', e);
      userProfile = { level: 1, xp: 0 };
    }
  } else {
    userProfile = { level: 1, xp: 0 };
  }
  
  // Add XP
  userProfile.xp = (userProfile.xp || 0) + amount;
  
  // Check for level up
  const currentLevel = userProfile.level || 1;
  const newLevel = Math.floor(userProfile.xp / 100) + 1;
  
  if (newLevel > currentLevel) {
    userProfile.level = newLevel;
    showLevelUp(newLevel);
  }
  
  // Save user profile
  localStorage.setItem('userGameProfile', JSON.stringify(userProfile));
  
  // Update UI
  updateUserProfile();
}

// Show level up notification
function showLevelUp(level) {
  const levelUp = document.createElement('div');
  levelUp.className = 'level-up-notification';
  levelUp.innerHTML = `
    <div class="level-up-icon"><i class="fas fa-arrow-up"></i></div>
    <div class="level-up-content">
      <h3>Nível ${level}</h3>
      <p>Você avançou para o nível ${level}!</p>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(levelUp);
  
  // Show animation
  setTimeout(() => levelUp.classList.add('show'), 10);
  
  // Remove after animation
  setTimeout(() => {
    levelUp.classList.remove('show');
    setTimeout(() => levelUp.remove(), 500);
  }, 4000);
}

// Update user profile UI
function updateUserProfile() {
  const savedProfile = localStorage.getItem('userGameProfile');
  if (!savedProfile) return;
  
  try {
    const userProfile = JSON.parse(savedProfile);
    
    // Update level
    const userLevelEl = document.getElementById('userLevel');
    if (userLevelEl) {
      userLevelEl.textContent = userProfile.level || 1;
    }
    
    // Update XP bar
    const userXpBarEl = document.getElementById('userXpBar');
    if (userXpBarEl) {
      const xpProgress = userProfile.xp % 100;
      userXpBarEl.style.width = `${xpProgress}%`;
    }
    
    // Update XP text
    const userXpTextEl = document.getElementById('userXpText');
    if (userXpTextEl) {
      const xpToNext = 100 - (userProfile.xp % 100);
      userXpTextEl.textContent = `${xpToNext} XP para o próximo nível`;
    }
    
    // Update user menu
    const userMenuName = document.getElementById('userMenuName');
    if (userMenuName && localStorage.getItem('nomeUsuario')) {
      userMenuName.textContent = localStorage.getItem('nomeUsuario');
    }
  } catch (e) {
    console.error('Error updating user profile UI:', e);
  }
}

// Animation for game cards
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
    }, 50 * index);
  });
}

// Show notification
function showNotification(message, type = 'info') {
  // Check if there's already a notification
  const existingNotification = document.querySelector('.game-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'game-notification';
  
  // Set icon based on type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-body">
        <span class="notification-icon"><i class="fas fa-${icon}"></i></span>
        <span class="notification-message">${message}</span>
      </div>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Add close event
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  });
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Update game display (for initial load and category changes)
function updateGameDisplay() {
  // This would normally fetch games from an API
  // For now, we'll work with what's in the HTML
  
  // Update cart UI
  updateCartUI();
  
  // Update wishlist buttons based on user profile
  const userProfile = JSON.parse(localStorage.getItem('userGameProfile') || '{}');
  updateWishlistButtonsState(userProfile.wishlist || []);
}

/**
 * Games Data Module
 * Contains the central repository of game information for BuscaGames
 */

// Define the games array with full game information
const gamesData = [
  {
    id: '1',
    title: 'God of War Ragnarok',
    description: 'Embarque com Kratos e Atreus em uma jornada épica em busca de respostas antes do profetizado Ragnarök. Juntos, pai e filho devem arriscar tudo nos Nove Reinos.',
    image: '../assets/images/game12.png',
    price: 124.95,
    originalPrice: 249.90,
    discount: 50,
    rating: 4.5,
    platforms: ['PlayStation', 'PC'],
    genres: ['Ação', 'Aventura', 'RPG'],
    releaseDate: '2022-11-09',
    developer: 'Santa Monica Studio',
    publisher: 'Sony Interactive Entertainment',
    tags: ['featured', 'bestseller']
  },
  {
    id: '2',
    title: 'Ghost of Tsushima',
    description: 'No final do século XIII, o império mongol devastou nações inteiras. A Ilha de Tsushima é tudo o que está entre o Japão continental e uma gigantesca frota invasora mongol.',
    image: '../assets/images/game13.png',
    price: 49.99,
    originalPrice: 199.99,
    discount: 75,
    rating: 4.9,
    platforms: ['PlayStation', 'PC'],
    genres: ['Ação', 'Mundo Aberto', 'Samurai'],
    releaseDate: '2020-07-17',
    developer: 'Sucker Punch Productions',
    publisher: 'Sony Interactive Entertainment',
    tags: ['new']
  },
  {
    id: '3',
    title: 'The Witcher 3: Wild Hunt',
    description: 'Você é Geralt de Rívia, mercenário matador de monstros. Diante de você está um continente devastado pela guerra e infestado de monstros para você explorar à vontade.',
    image: '../assets/images/game4.png',
    price: 79.99,
    originalPrice: 199.99,
    discount: 60,
    rating: 5.0,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genres: ['RPG', 'Fantasia', 'Aventura'],
    releaseDate: '2015-05-19',
    developer: 'CD Projekt RED',
    publisher: 'CD Projekt',
    tags: ['featured', 'bestseller']
  },
  {
    id: '4',
    title: 'Mortal Kombat 1',
    description: 'Descubra um Universo Mortal Kombat renascido, criado pelo Deus do Fogo Liu Kang. O Mortal Kombat 1 inaugura um novo era da franquia icônica com um novo sistema de luta e modos de jogo.',
    image: '../assets/images/game14.png',
    price: 99.90,
    originalPrice: 299.90,
    discount: 67,
    rating: 4.7,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genres: ['Luta', 'Ação', 'Violência'],
    releaseDate: '2023-09-19',
    developer: 'NetherRealm Studios',
    publisher: 'Warner Bros. Games',
    tags: ['featured', 'new']
  },
  {
    id: '5',
    title: 'Cyberpunk 2077',
    description: 'Cyberpunk 2077 é um RPG de ação e aventura de mundo aberto ambientado em Night City, uma megalópole obcecada por poder, glamour e modificação corporal.',
    image: '../assets/images/game2.png',
    price: 149.90,
    originalPrice: 199.90,
    discount: 25,
    rating: 4.0,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genres: ['RPG', 'Ação', 'Futurista', 'Ficção Científica'],
    releaseDate: '2020-12-10',
    developer: 'CD Projekt RED',
    publisher: 'CD Projekt',
    tags: ['featured']
  },
  {
    id: '6',
    title: 'Grand Theft Auto 5',
    description: 'Quando um jovem traficante, um ladrão de bancos aposentado e um psicopata aterrorizante se veem encrencados com algumas das figuras mais assustadoras do submundo do crime, o governo dos EUA e a indústria do entretenimento, eles devem realizar uma série de golpes ousados para sobreviver.',
    image: '../assets/images/game3.png',
    price: 89.90,
    originalPrice: 129.90,
    discount: 30,
    rating: 4.7,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genres: ['Ação', 'Mundo Aberto'],
    releaseDate: '2013-09-17',
    developer: 'Rockstar North',
    publisher: 'Rockstar Games',
    tags: ['bestseller']
  },
  {
    id: '7',
    title: 'Red Dead Redemption 2: Ultimate Edition',
    description: 'Estados Unidos, 1899. O fim da era do Velho Oeste começou. Após um assalto dar errado na cidade de Blackwater, Arthur Morgan e a gangue Van der Linde são forçados a fugir.',
    image: '../assets/images/game5.png',
    price: 239.90,
    originalPrice: 299.90,
    discount: 20,
    rating: 5.0,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genres: ['Ação', 'Aventura', 'Velho Oeste', 'Mundo Aberto'],
    releaseDate: '2018-10-26',
    developer: 'Rockstar Studios',
    publisher: 'Rockstar Games',
    tags: ['featured']
  },
  {
    id: '8',
    title: 'Baldur\'s Gate 3',
    description: 'Reúna seu grupo e retorne aos Reinos Esquecidos em uma história de companheirismo e traição, sobrevivência e sacrifício, e a atração do poder absoluto.',
    image: '../assets/images/game15.png',
    price: 199.90,
    originalPrice: 199.90,
    discount: 0,
    rating: 4.9,
    platforms: ['PC', 'PlayStation'],
    genres: ['RPG', 'Fantasia', 'Estratégia'],
    releaseDate: '2023-08-03',
    developer: 'Larian Studios',
    publisher: 'Larian Studios',
    tags: ['new', 'bestseller']
  },
  {
    id: '9',
    title: 'Rainbow Six Siege',
    description: 'Rainbow Six Siege é um jogo tático de tiro focado em estratégia, equipes e combate entre operadores.',
    image: '../assets/images/game7.png',
    price: 249.90,
    originalPrice: 329.90,
    discount: 24,
    rating: 4.8,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genres: ['RPG', 'Ação', 'Mundo Aberto', 'Difícil'],
    releaseDate: '2022-02-25',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco',
    tags: ['bestseller']
  },
  {
    id: '10',
    title: 'Resident Evil 4 Remake',
    description: 'Sobrevivência é apenas o começo. Seis anos se passaram desde o desastre biológico em Raccoon City. O agente Leon S. Kennedy, um dos sobreviventes, é enviado para resgatar a filha do presidente que foi sequestrada.',
    image: '../assets/images/game16.png',
    price: 199.90,
    originalPrice: 249.90,
    discount: 20,
    rating: 4.6,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genres: ['Terror', 'Sobrevivência', 'Ação'],
    releaseDate: '2023-03-24',
    developer: 'Capcom',
    publisher: 'Capcom',
    tags: ['new']
  },
  {
    id: '11',
    title: 'Tomb Raider',
    description: 'Tomb Raider é um jogo de ação e aventura que acompanha Lara Croft em expedições cheias de exploração, combate e enigmas.',
    image: '../assets/images/game10.png',
    price: 62.40,
    originalPrice: 62.40,
    discount: 0,
    rating: 4.2,
    platforms: ['PC', 'Xbox'],
    genres: ['RPG', 'Espaço', 'Exploração'],
    releaseDate: '2023-09-06',
    developer: 'Bethesda Game Studios',
    publisher: 'Bethesda Softworks',
    tags: ['']
  },
  {
    id: '12',
    title: 'Spider-Man 2',
    description: 'Peter Parker e Miles Morales retornam para uma nova e emocionante aventura na aclamada franquia Marvel\'s Spider-Man para PS5.',
    image: '../assets/images/game14.jpg',
    price: 349.90,
    originalPrice: 349.90,
    discount: 0,
    rating: 4.7,
    platforms: ['PlayStation'],
    genres: ['Ação', 'Aventura', 'Super-heróis'],
    releaseDate: '2023-10-20',
    developer: 'Insomniac Games',
    publisher: 'Sony Interactive Entertainment',
    tags: ['new', 'featured']
  }
];

// Function to get all games
function getAllGames() {
  return gamesData;
}

// Function to get a specific game by ID
function getGameById(id) {
  return gamesData.find(game => game.id === id);
}

// Function to get games filtered by tags
function getGamesByTags(tags) {
  if (!tags || tags.length === 0) {
    return gamesData;
  }
  
  if (typeof tags === 'string') {
    tags = [tags]; // Convert single tag to array
  }
  
  return gamesData.filter(game => {
    return tags.some(tag => game.tags.includes(tag));
  });
}

// Function to get featured games
function getFeaturedGames() {
  return getGamesByTags('featured');
}

// Function to get new games
function getNewGames() {
  return getGamesByTags('new');
}

// Function to get bestseller games
function getBestsellerGames() {
  return getGamesByTags('bestseller');
}

// Expose functions to global scope
window.gameRepository = {
  getAllGames,
  getGameById,
  getGamesByTags,
  getFeaturedGames,
  getNewGames,
  getBestsellerGames
}; 