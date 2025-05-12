/**
 * Immersive Gaming Experience
 * Interactive JavaScript for BuscaGames
 */

// DOM Elements
const gameCardElements = document.querySelectorAll('.game-card-immersive');
const achievementBars = document.querySelectorAll('.achievement-bar');
const navbarElement = document.querySelector('.navbar-immersive');

// Game Library Data
let gameLibrary = [];
let filteredGames = [];
let userProfile = {
  level: 1,
  xp: 0,
  achievements: [],
  rewards: [],
  wishlist: [],
  collection: []
};

// Initialize on document ready
document.addEventListener('DOMContentLoaded', () => {
  initializeGameCards();
  initializeAchievements();
  initializeFilters();
  setupEventListeners();
  loadUserData();
  initializeCart();
  
  // Animate items on page load
  setTimeout(() => {
    document.querySelectorAll('.animate-on-load').forEach(item => {
      item.classList.add('animate-in');
    });
  }, 100);
  
  // Make showNotification available globally
  window.showNotification = showNotification;
  
  // Make showCartPreview available globally
  window.showCartPreview = showCartPreview;
});

// Game Cards Initialization
function initializeGameCards() {
  gameCardElements.forEach(card => {
    // 3D Tilt effect
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      
      // Update glare position
      const glare = card.querySelector('.game-card-glare');
      if (glare) {
        glare.style.setProperty('--x', `${x}px`);
        glare.style.setProperty('--y', `${y}px`);
      }
    });
    
    // Reset transform on mouse leave
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
    
    // Quick preview
    const previewBtn = card.querySelector('.preview-button');
    if (previewBtn) {
      previewBtn.addEventListener('click', e => {
        e.preventDefault();
        const gameId = card.dataset.gameId;
        openGamePreview(gameId);
      });
    }

    // Add to cart with animation
    const addToCartBtn = card.querySelector('.add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', e => {
        e.preventDefault();
        addToCart(card);
      });
    }
    
    // Wishlist toggle
    const wishlistBtn = card.querySelector('.wishlist-button');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', e => {
        e.preventDefault();
        toggleWishlist(card.dataset.gameId, wishlistBtn);
      });
    }
    
    // Progress bar animation (for owned games)
    const progressBar = card.querySelector('.progress-bar');
    if (progressBar && card.classList.contains('owned')) {
      setTimeout(() => {
        const progress = parseInt(progressBar.dataset.progress);
        progressBar.style.width = `${progress}%`;
      }, 500);
    }
  });
}

// Add to cart with animation
function addToCart(card) {
  // Get game info
  const gameId = card.dataset.gameId;
  const gameTitle = card.querySelector('.game-card-title').textContent;
  const gamePrice = card.querySelector('.price-current').dataset.price;
  
  // Create floating element for animation
  const btnRect = card.querySelector('.add-to-cart').getBoundingClientRect();
  const cartIcon = document.querySelector('.cart-icon');
  
  if (!cartIcon) return;
  
  const cartRect = cartIcon.getBoundingClientRect();
  
  const floatingEl = document.createElement('div');
  floatingEl.className = 'floating-game';
  floatingEl.style.top = `${btnRect.top}px`;
  floatingEl.style.left = `${btnRect.left}px`;
  floatingEl.innerHTML = `<i class="fas fa-gamepad"></i>`;
  document.body.appendChild(floatingEl);
  
  // Animate to cart
  setTimeout(() => {
    floatingEl.style.top = `${cartRect.top + 10}px`;
    floatingEl.style.left = `${cartRect.left + 10}px`;
    floatingEl.style.opacity = '0';
    floatingEl.style.transform = 'scale(0.2)';
    
    // Add wiggle effect to cart icon
    cartIcon.classList.add('wiggle');
    setTimeout(() => cartIcon.classList.remove('wiggle'), 500);
    
    // Remove floating element after animation
    setTimeout(() => {
      document.body.removeChild(floatingEl);
      
      // Update cart count
      updateCart(gameId, gameTitle, gamePrice);
      
      // Show notification
      showNotification(`${gameTitle} adicionado ao carrinho!`, 'success');
      
      // Add XP and check level up
      addUserXP(25, 'Jogo adicionado ao carrinho');
    }, 600);
  }, 100);
}

// Toggle wishlist
function toggleWishlist(gameId, button) {
  const isWishlisted = button.classList.contains('active');
  
  if (isWishlisted) {
    // Remove from wishlist
    userProfile.wishlist = userProfile.wishlist.filter(id => id !== gameId);
    button.classList.remove('active');
    button.innerHTML = '<i class="far fa-heart"></i>';
    
    showNotification('Removido dos favoritos', 'info');
  } else {
    // Add to wishlist
    userProfile.wishlist.push(gameId);
    button.classList.add('active');
    button.innerHTML = '<i class="fas fa-heart"></i>';
    
    // Pulse animation
    button.classList.add('pulse');
    setTimeout(() => button.classList.remove('pulse'), 1000);
    
    showNotification('Adicionado aos favoritos!', 'success');
    
    // Add XP
    addUserXP(10, 'Jogo adicionado aos favoritos');
  }
  
  // Save user data
  saveUserData();
}

// Update cart
function updateCart(gameId, title, price) {
  let cart = JSON.parse(localStorage.getItem('gameCart')) || [];
  
  // Check if game is already in cart
  const existingItem = cart.find(item => item.id === gameId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: gameId,
      title: title,
      price: parseFloat(price),
      quantity: 1
    });
  }
  
  // Save cart
  localStorage.setItem('gameCart', JSON.stringify(cart));
  
  // Update cart count in UI
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
      cartCount.classList.add('show');
    }
  }
}

// Open game preview
function openGamePreview(gameId) {
  // Get game data (would normally fetch from API)
  const gameData = gameLibrary.find(game => game.id === gameId) || {
    id: gameId,
    title: 'Game Preview',
    description: 'Game description would go here.',
    price: 99.99,
    discount: 30,
    rating: 4.5,
    features: ['Feature 1', 'Feature 2', 'Feature 3']
  };
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'quick-preview';
  modal.innerHTML = `
    <div class="preview-content">
      <div class="preview-close"><i class="fas fa-times"></i></div>
      
      <div class="preview-header">
        <img src="../assets/images/game${gameId || '1'}.png" alt="${gameData.title}">
        <div class="preview-header-overlay">
          <h1 class="preview-title">${gameData.title}</h1>
          <div class="preview-meta">
            <div class="preview-meta-item">
              <i class="fas fa-star"></i>
              <span>${gameData.rating || 4.5}</span>
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
          <p class="preview-description">${gameData.description || 'Descrição detalhada do jogo estaria aqui, incluindo informações sobre a história, gameplay e características especiais.'}</p>
        </div>
        
        <div class="preview-section">
          <h3 class="preview-section-title">Características</h3>
          <div class="preview-features">
            ${(gameData.features || ['Multiplayer', 'Open World', 'High Resolution']).map(feature => `
              <div class="preview-feature">
                <div class="feature-icon"><i class="fas fa-check-circle"></i></div>
                <div class="feature-text">${feature}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="preview-footer">
        <div class="preview-price">
          ${gameData.discount ? `<div class="preview-price-original">R$ ${((gameData.price || 99.99) * (100 / (100 - gameData.discount))).toFixed(2)}</div>` : ''}
          <div class="preview-price-current">R$ ${gameData.price || 99.99}</div>
        </div>
        
        <div class="preview-actions">
          <button class="action-button preview-cart"><i class="fas fa-shopping-cart me-2"></i> Adicionar ao carrinho</button>
          <button class="action-button-secondary preview-wishlist"><i class="far fa-heart"></i></button>
        </div>
      </div>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(modal);
  
  // Fade in
  setTimeout(() => modal.classList.add('active'), 10);
  
  // Handle close
  const closeBtn = modal.querySelector('.preview-close');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => document.body.removeChild(modal), 300);
  });
  
  // Handle buttons
  const cartBtn = modal.querySelector('.preview-cart');
  const wishlistBtn = modal.querySelector('.preview-wishlist');
  
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      updateCart(gameId, gameData.title, gameData.price);
      
      // Show success message
      showNotification(`${gameData.title} adicionado ao carrinho!`, 'success');
      
      // Close modal
      modal.classList.remove('active');
      setTimeout(() => document.body.removeChild(modal), 300);
      
      // Add XP
      addUserXP(25, 'Jogo adicionado ao carrinho');
    });
  }
  
  if (wishlistBtn) {
    // Check if already in wishlist
    const isWishlisted = userProfile.wishlist.includes(gameId);
    
    if (isWishlisted) {
      wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
      wishlistBtn.classList.add('active');
    }
    
    wishlistBtn.addEventListener('click', () => {
      toggleWishlist(gameId, wishlistBtn);
    });
  }
  
  // Add XP for viewing details
  addUserXP(5, 'Visualizou detalhes do jogo');
}

// Initialize achievement animations
function initializeAchievements() {
  if (!achievementBars.length) return;
  
  // Use Intersection Observer for scroll animations
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const progress = parseInt(bar.dataset.progress) || 0;
        
        // Animate progress bar
        setTimeout(() => {
          bar.style.width = `${progress}%`;
        }, 300);
        
        // Unobserve after animation
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.2 });
  
  // Observe each achievement bar
  achievementBars.forEach(bar => {
    observer.observe(bar);
  });
}

// Initialize filters
function initializeFilters() {
  const filterForm = document.getElementById('gameFilters');
  if (!filterForm) return;
  
  // Range slider for price
  const priceRange = document.getElementById('priceRange');
  const priceOutput = document.getElementById('priceOutput');
  
  if (priceRange && priceOutput) {
    priceRange.addEventListener('input', () => {
      priceOutput.textContent = `R$ ${priceRange.value}`;
    });
  }
  
  // Filter submission
  filterForm.addEventListener('submit', e => {
    e.preventDefault();
    applyFilters();
  });
  
  // Filter reset
  const resetBtn = document.getElementById('resetFilters');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetFilters);
  }
}

// Apply filters
function applyFilters() {
  // Get filter values
  const category = document.getElementById('categoryFilter')?.value;
  const platform = document.getElementById('platformFilter')?.value;
  const maxPrice = document.getElementById('priceRange')?.value;
  const searchTerm = document.getElementById('searchGames')?.value.toLowerCase();
  
  // Start with all games
  filteredGames = [...gameLibrary];
  
  // Apply category filter
  if (category && category !== 'all') {
    filteredGames = filteredGames.filter(game => game.category === category);
  }
  
  // Apply platform filter
  if (platform && platform !== 'all') {
    filteredGames = filteredGames.filter(game => game.platforms.includes(platform));
  }
  
  // Apply price filter
  if (maxPrice) {
    filteredGames = filteredGames.filter(game => game.price <= parseFloat(maxPrice));
  }
  
  // Apply search filter
  if (searchTerm) {
    filteredGames = filteredGames.filter(game => {
      return game.title.toLowerCase().includes(searchTerm) || 
             game.description.toLowerCase().includes(searchTerm);
    });
  }
  
  // Update UI
  updateGameDisplay();
  
  // Show filter tags
  updateFilterTags(category, platform, maxPrice, searchTerm);
  
  // Add XP for using filters
  addUserXP(5, 'Usou filtros de busca');
}

// Update filter tags
function updateFilterTags(category, platform, maxPrice, searchTerm) {
  const tagsContainer = document.getElementById('filterTags');
  if (!tagsContainer) return;
  
  // Clear existing tags
  tagsContainer.innerHTML = '';
  
  // Add category tag
  if (category && category !== 'all') {
    addFilterTag(tagsContainer, 'Categoria', category);
  }
  
  // Add platform tag
  if (platform && platform !== 'all') {
    addFilterTag(tagsContainer, 'Plataforma', platform);
  }
  
  // Add price tag
  if (maxPrice) {
    addFilterTag(tagsContainer, 'Preço máximo', `R$ ${maxPrice}`);
  }
  
  // Add search tag
  if (searchTerm) {
    addFilterTag(tagsContainer, 'Busca', searchTerm);
  }
}

// Add a filter tag
function addFilterTag(container, label, value) {
  const tag = document.createElement('div');
  tag.className = 'filter-tag';
  tag.innerHTML = `
    <span>${label}: ${value}</span>
    <span class="filter-tag-remove">×</span>
  `;
  
  // Add click event for removal
  tag.querySelector('.filter-tag-remove').addEventListener('click', () => {
    tag.remove();
    
    // Reset corresponding filter
    if (label === 'Categoria') {
      document.getElementById('categoryFilter').value = 'all';
    } else if (label === 'Plataforma') {
      document.getElementById('platformFilter').value = 'all';
    } else if (label === 'Preço máximo') {
      document.getElementById('priceRange').value = document.getElementById('priceRange').max;
      document.getElementById('priceOutput').textContent = `R$ ${document.getElementById('priceRange').max}`;
    } else if (label === 'Busca') {
      document.getElementById('searchGames').value = '';
    }
    
    // Reapply filters
    applyFilters();
  });
  
  container.appendChild(tag);
}

// Reset filters
function resetFilters() {
  const form = document.getElementById('gameFilters');
  if (!form) return;
  
  // Reset form
  form.reset();
  
  // Reset price output
  const priceRange = document.getElementById('priceRange');
  const priceOutput = document.getElementById('priceOutput');
  
  if (priceRange && priceOutput) {
    priceOutput.textContent = `R$ ${priceRange.max}`;
  }
  
  // Clear filter tags
  const tagsContainer = document.getElementById('filterTags');
  if (tagsContainer) {
    tagsContainer.innerHTML = '';
  }
  
  // Reset to all games
  filteredGames = [...gameLibrary];
  updateGameDisplay();
}

// Update game display
function updateGameDisplay() {
  const gameContainer = document.getElementById('gameLibrary');
  if (!gameContainer) return;
  
  // No games found
  if (filteredGames.length === 0) {
    gameContainer.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon"><i class="fas fa-search"></i></div>
        <h3>Nenhum jogo encontrado</h3>
        <p>Tente ajustar seus filtros ou buscar por algo diferente.</p>
        <button class="filter-reset" id="resetFilters">Limpar filtros</button>
      </div>
    `;
    
    // Add event listener to reset button
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetFilters);
    }
    
    return;
  }
  
  // Convert games to HTML
  const gamesHTML = filteredGames.map(game => createGameCard(game)).join('');
  gameContainer.innerHTML = gamesHTML;
  
  // Initialize new cards
  initializeGameCards();
}

// Create game card HTML
function createGameCard(game) {
  const isWishlisted = userProfile.wishlist.includes(game.id);
  const isOwned = userProfile.collection.includes(game.id);
  
  return `
    <div class="game-card-immersive ${isOwned ? 'owned' : ''}" data-game-id="${game.id}">
      <div class="game-card-image-container">
        <img src="../assets/images/game${game.id || Math.floor(Math.random() * 10) + 1}.png" alt="${game.title}" class="game-card-image">
        <div class="game-card-glare"></div>
      </div>
      
      ${game.discount ? `<div class="discount-tag">-${game.discount}%</div>` : ''}
      
      <div class="game-badges">
        ${game.featured ? '<div class="game-badge featured"><i class="fas fa-star"></i> Destaque</div>' : ''}
        ${game.new ? '<div class="game-badge new"><i class="fas fa-certificate"></i> Novo</div>' : ''}
        ${game.bestseller ? '<div class="game-badge bestseller"><i class="fas fa-award"></i> Mais Vendido</div>' : ''}
      </div>
      
      <div class="game-card-overlay">
        <h3 class="game-card-title">${game.title}</h3>
        
        <div class="game-card-platform">
          ${game.platforms?.map(platform => `
            <span class="platform-icon"><i class="fas fa-${platform === 'PC' ? 'desktop' : platform === 'PlayStation' ? 'playstation' : 'xbox'}"></i> ${platform}</span>
          `).join('') || '<span class="platform-icon"><i class="fas fa-desktop"></i> PC</span>'}
        </div>
        
        <div class="genre-tags">
          ${game.genres?.map(genre => `<span class="genre-tag">${genre}</span>`).join('') || '<span class="genre-tag">Ação</span>'}
        </div>
        
        <div class="game-card-rating">
          <div class="rating-stars">
            ${generateStars(game.rating || 4.5)}
          </div>
          <span class="rating-number">${game.rating || 4.5}</span>
        </div>
        
        <div class="game-card-price">
          ${game.discount ? `<span class="price-original">R$ ${((game.price || 99.99) * (100 / (100 - game.discount))).toFixed(2)}</span>` : ''}
          <span class="price-current" data-price="${game.price || 99.99}">R$ ${game.price || 99.99}</span>
        </div>
        
        <div class="game-card-actions">
          <button class="action-button add-to-cart"><i class="fas fa-shopping-cart me-2"></i> Adicionar</button>
          <button class="action-button-secondary wishlist-button ${isWishlisted ? 'active' : ''}">
            <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <button class="action-button-secondary preview-button">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      
      ${isOwned ? `
        <div class="game-progress">
          <div class="progress-bar" data-progress="${game.progress || Math.floor(Math.random() * 100)}"></div>
        </div>
      ` : ''}
    </div>
  `;
}

// Generate star rating
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let starsHTML = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }
  
  // Half star
  if (hasHalfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>';
  }
  
  return starsHTML;
}

// Setup event listeners
function setupEventListeners() {
  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (navbarElement) {
      if (window.scrollY > 50) {
        navbarElement.classList.add('scrolled');
      } else {
        navbarElement.classList.remove('scrolled');
      }
    }
  });
  
  // View options
  const viewOptions = document.querySelectorAll('.view-option');
  viewOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove active class from all options
      viewOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to clicked option
      option.classList.add('active');
      
      // Change view
      const view = option.dataset.view;
      changeView(view);
    });
  });
  
  // Sort options
  const sortSelect = document.getElementById('sortGames');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortGames(sortSelect.value);
    });
  }
}

// Change view
function changeView(view) {
  const gameLibrary = document.getElementById('gameLibrary');
  if (!gameLibrary) return;
  
  // Remove existing view classes
  gameLibrary.classList.remove('grid-view', 'list-view', 'compact-view');
  
  // Add new view class
  gameLibrary.classList.add(`${view}-view`);
  
  // Add XP for changing view
  addUserXP(2, 'Alterou visualização de jogos');
}

// Sort games
function sortGames(sortBy) {
  if (!filteredGames.length) return;
  
  switch (sortBy) {
    case 'price-asc':
      filteredGames.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filteredGames.sort((a, b) => b.price - a.price);
      break;
    case 'rating-desc':
      filteredGames.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      filteredGames.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      break;
    case 'name-asc':
      filteredGames.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      // Default: featured
      filteredGames.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
  
  // Update display
  updateGameDisplay();
  
  // Add XP for sorting
  addUserXP(2, 'Ordenou jogos');
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
    <div class="notification-icon"><i class="fas fa-${icon}"></i></div>
    <div class="notification-content">${message}</div>
    <div class="notification-close"><i class="fas fa-times"></i></div>
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

// Add XP to user
function addUserXP(amount, action) {
  userProfile.xp += amount;
  
  // Check for level up
  const newLevel = Math.floor(userProfile.xp / 100) + 1;
  
  if (newLevel > userProfile.level) {
    // Level up!
    userProfile.level = newLevel;
    
    // Show level up notification
    showLevelUp(newLevel);
    
    // Check for rewards
    checkLevelRewards(newLevel);
  }
  
  // Update level indicator
  const levelIndicator = document.getElementById('userLevel');
  if (levelIndicator) {
    levelIndicator.textContent = userProfile.level;
  }
  
  // Update XP bar
  const xpBar = document.getElementById('userXpBar');
  if (xpBar) {
    const xpProgress = (userProfile.xp % 100);
    xpBar.style.width = `${xpProgress}%`;
  }
  
  // Save user data
  saveUserData();
  
  // Add to XP log (for debugging)
  console.log(`+${amount} XP: ${action}`);
}

// Show level up animation
function showLevelUp(level) {
  // Create level up element
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

// Check for level rewards
function checkLevelRewards(level) {
  // Define rewards for levels
  const rewards = {
    2: { type: 'discount', value: '5% de desconto no próximo jogo' },
    3: { type: 'feature', value: 'Desbloqueado: Listas personalizadas' },
    5: { type: 'discount', value: '10% de desconto no próximo jogo' },
    7: { type: 'feature', value: 'Desbloqueado: Recomendações avançadas' },
    10: { type: 'gift', value: 'Jogo grátis: Space Adventure' }
  };
  
  // Check if there's a reward for this level
  if (rewards[level]) {
    // Add to user's rewards
    userProfile.rewards.push({
      level: level,
      ...rewards[level]
    });
    
    // Save user data
    saveUserData();
    
    // Show reward notification
    showRewardNotification(rewards[level]);
  }
}

// Show reward notification
function showRewardNotification(reward) {
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'reward-notification';
  
  // Set icon based on reward type
  let icon = 'gift';
  if (reward.type === 'discount') icon = 'percent';
  if (reward.type === 'feature') icon = 'unlock';
  
  notification.innerHTML = `
    <div class="reward-icon"><i class="fas fa-${icon}"></i></div>
    <div class="reward-content">
      <h3>Recompensa Desbloqueada!</h3>
      <p>${reward.value}</p>
      <button class="reward-claim">Resgatar</button>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Add claim event
  const claimBtn = notification.querySelector('.reward-claim');
  claimBtn.addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
    
    // Show claimed message
    showNotification('Recompensa resgatada com sucesso!', 'success');
  });
}

// Load user data
function loadUserData() {
  const savedData = localStorage.getItem('userGameProfile');
  
  if (savedData) {
    userProfile = JSON.parse(savedData);
    
    // Update UI
    updateUserUI();
  }
  
  // Update cart count
  const cart = JSON.parse(localStorage.getItem('gameCart')) || [];
  const cartCount = document.querySelector('.cart-count');
  
  if (cartCount) {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
      cartCount.classList.add('show');
    }
  }
}

// Save user data
function saveUserData() {
  localStorage.setItem('userGameProfile', JSON.stringify(userProfile));
}

// Update user UI
function updateUserUI() {
  // Update level
  const levelIndicator = document.getElementById('userLevel');
  if (levelIndicator) {
    levelIndicator.textContent = userProfile.level;
  }
  
  // Update XP bar
  const xpBar = document.getElementById('userXpBar');
  if (xpBar) {
    const xpProgress = (userProfile.xp % 100);
    xpBar.style.width = `${xpProgress}%`;
  }
  
  // Update XP text
  const xpText = document.getElementById('userXpText');
  if (xpText) {
    const xpToNext = 100 - (userProfile.xp % 100);
    xpText.textContent = `${xpToNext} XP para o próximo nível`;
  }
}

// Sample game data (for testing, would normally come from an API)
// This could be loaded dynamically from your backend
function loadSampleGames() {
  gameLibrary = [
    {
      id: '1',
      title: 'Cyberpunk 2077',
      description: 'An open-world, action-adventure RPG set in the megalopolis of Night City.',
      price: 199.90,
      discount: 30,
      rating: 4.2,
      platforms: ['PC', 'PlayStation', 'Xbox'],
      genres: ['RPG', 'Ação', 'Futuro'],
      featured: true,
      new: false,
      bestseller: true,
      releaseDate: '2020-12-10'
    },
    {
      id: '2',
      title: 'The Witcher 3: Wild Hunt',
      description: 'A story-driven, open world RPG set in a visually stunning fantasy universe.',
      price: 79.90,
      discount: 60,
      rating: 4.9,
      platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
      genres: ['RPG', 'Aventura', 'Fantasia'],
      featured: true,
      new: false,
      bestseller: true,
      releaseDate: '2015-05-19'
    },
    {
      id: '3',
      title: 'Red Dead Redemption 2',
      description: 'An epic tale of life in America\'s unforgiving heartland.',
      price: 239.90,
      discount: 20,
      rating: 4.8,
      platforms: ['PC', 'PlayStation', 'Xbox'],
      genres: ['Ação', 'Aventura', 'Mundo Aberto'],
      featured: true,
      new: false,
      bestseller: true,
      releaseDate: '2018-10-26'
    }
  ];
  
  // Initialize to show all games
  filteredGames = [...gameLibrary];
}

// Enhanced Shopping Cart Functions
function initializeCart() {
  loadCartFromStorage();
  updateCartUI();
  
  // Add event listener for cart icon
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', function(e) {
      e.preventDefault();
      showCartPreview();
    });
  }
}

function loadCartFromStorage() {
  const savedCart = localStorage.getItem('gameCart');
  if (savedCart) {
    try {
      return JSON.parse(savedCart);
    } catch (e) {
      console.error('Error parsing cart data:', e);
      return [];
    }
  }
  return [];
}

function updateCartUI() {
  const cart = loadCartFromStorage();
  const cartCount = document.querySelector('.cart-count');
  
  if (cartCount) {
    const totalItems = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
      cartCount.classList.add('show');
    } else {
      cartCount.classList.remove('show');
    }
  }
}

function showCartPreview() {
  const cart = loadCartFromStorage() || [];
  
  // Create modal for cart preview
  const modal = document.createElement('div');
  modal.className = 'cart-preview';
  
  // Calculate cart totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = cart.reduce((total, item) => {
    const game = gameLibrary.find(g => g.id === item.id);
    if (game && game.discount) {
      return total + ((game.price * game.discount / 100) * item.quantity);
    }
    return total;
  }, 0);
  
  // Generate HTML for cart items
  let cartItemsHTML = '';
  if (cart.length === 0) {
    cartItemsHTML = `<div class="empty-cart">
      <i class="fas fa-shopping-cart"></i>
      <p>Seu carrinho está vazio</p>
      <a href="pages/games.html" class="btn-continue-shopping">Explorar jogos</a>
    </div>`;
  } else {
    cartItemsHTML = `
      <div class="cart-items">
        ${cart.map(item => `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
              <img src="assets/images/game${item.id}.png" alt="${item.title}">
            </div>
            <div class="cart-item-details">
              <h4 class="cart-item-title">${item.title}</h4>
              <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
              <button class="quantity-btn decrease">-</button>
              <span class="quantity-value">${item.quantity}</span>
              <button class="quantity-btn increase">+</button>
            </div>
            <div class="cart-item-total">
              R$ ${(item.price * item.quantity).toFixed(2)}
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `).join('')}
      </div>
      
      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>R$ ${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Desconto:</span>
          <span>-R$ ${discount.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>R$ ${(subtotal - discount).toFixed(2)}</span>
        </div>
        
        <div class="cart-actions">
          <a href="pages/checkout.html" class="btn-checkout">Finalizar Compra</a>
          <button class="btn-continue-shopping">Continuar Comprando</button>
        </div>
      </div>
    `;
  }
  
  modal.innerHTML = `
    <div class="cart-preview-content">
      <div class="cart-preview-header">
        <h3>Seu Carrinho<span class="cart-count-badge">${cart.length}</span></h3>
        <button class="cart-preview-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="cart-preview-body">
        ${cartItemsHTML}
      </div>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(modal);
  
  // Fade in
  setTimeout(() => modal.classList.add('active'), 10);
  
  // Setup event listeners
  setupCartPreviewEvents(modal);
}

function setupCartPreviewEvents(modal) {
  // Close button
  const closeBtn = modal.querySelector('.cart-preview-close');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  });
  
  // Continue shopping
  const continueBtn = modal.querySelector('.btn-continue-shopping');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });
  }
  
  // Remove item buttons
  const removeButtons = modal.querySelectorAll('.cart-item-remove');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const itemId = this.getAttribute('data-id');
      removeFromCart(itemId);
      
      // Update preview
      const itemElement = this.closest('.cart-item');
      itemElement.classList.add('removing');
      setTimeout(() => {
        itemElement.remove();
        updateCartPreview(modal);
      }, 300);
    });
  });
  
  // Quantity buttons
  const decreaseBtns = modal.querySelectorAll('.quantity-btn.decrease');
  const increaseBtns = modal.querySelectorAll('.quantity-btn.increase');
  
  decreaseBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const itemElement = this.closest('.cart-item');
      const itemId = itemElement.getAttribute('data-id');
      updateCartItemQuantity(itemId, -1, itemElement, modal);
    });
  });
  
  increaseBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const itemElement = this.closest('.cart-item');
      const itemId = itemElement.getAttribute('data-id');
      updateCartItemQuantity(itemId, 1, itemElement, modal);
    });
  });
  
  // Click outside to close
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  });
}

function updateCartItemQuantity(itemId, change, itemElement, modal) {
  const cart = loadCartFromStorage();
  const item = cart.find(item => item.id === itemId);
  
  if (item) {
    item.quantity += change;
    
    // Remove item if quantity becomes 0
    if (item.quantity <= 0) {
      const index = cart.findIndex(item => item.id === itemId);
      cart.splice(index, 1);
      
      // Animate removal
      itemElement.classList.add('removing');
      setTimeout(() => {
        itemElement.remove();
        updateCartPreview(modal);
      }, 300);
    } else {
      // Update quantity display
      const quantityElement = itemElement.querySelector('.quantity-value');
      quantityElement.textContent = item.quantity;
      
      // Update total price
      const totalElement = itemElement.querySelector('.cart-item-total');
      const price = item.price;
      totalElement.textContent = `R$ ${(price * item.quantity).toFixed(2)}`;
      
      // Highlight the change
      itemElement.classList.add('updating');
      setTimeout(() => itemElement.classList.remove('updating'), 300);
      
      // Update cart summary
      updateCartPreview(modal);
    }
    
    // Save updated cart
    localStorage.setItem('gameCart', JSON.stringify(cart));
    
    // Update cart indicator
    updateCartUI();
  }
}

function updateCartPreview(modal) {
  const cart = loadCartFromStorage();
  const countBadge = modal.querySelector('.cart-count-badge');
  
  if (countBadge) {
    countBadge.textContent = cart.length;
  }
  
  // If cart is empty, update the entire preview
  if (cart.length === 0) {
    const previewBody = modal.querySelector('.cart-preview-body');
    previewBody.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Seu carrinho está vazio</p>
        <a href="pages/games.html" class="btn-continue-shopping">Explorar jogos</a>
      </div>
    `;
    return;
  }
  
  // Update summary
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = cart.reduce((total, item) => {
    const game = gameLibrary.find(g => g.id === item.id);
    if (game && game.discount) {
      return total + ((game.price * game.discount / 100) * item.quantity);
    }
    return total;
  }, 0);
  
  const summaryElements = modal.querySelectorAll('.summary-row span:last-child');
  if (summaryElements.length >= 3) {
    summaryElements[0].textContent = `R$ ${subtotal.toFixed(2)}`;
    summaryElements[1].textContent = `-R$ ${discount.toFixed(2)}`;
    summaryElements[2].textContent = `R$ ${(subtotal - discount).toFixed(2)}`;
  }
}

function removeFromCart(itemId) {
  let cart = loadCartFromStorage();
  cart = cart.filter(item => item.id !== itemId);
  localStorage.setItem('gameCart', JSON.stringify(cart));
  
  // Update cart indicator
  updateCartUI();
  
  // Show notification
  showNotification('Item removido do carrinho', 'info');
} 