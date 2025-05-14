/**
 * Shopping Cart JavaScript
 * Handles cart functionality for BuscaGames
 */

// Cart constants
const CART_STORAGE_KEY = 'buscaGamesCart';

// Cart data
let cart = [];
let appliedPromo = null;

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
  // Load cart from localStorage
  loadCart();
  
  // Render cart items if on cart page
  if (document.getElementById('cartItems')) {
    renderCartItems();
    updateCartTotals();
    setupCartControls();
    loadRelatedGames();
  }
  
  // Update cart count in navbar
  updateCartCount();
});

// Add to cart function (can be called from any page)
function addToCart(gameOrId, quantity = 1) {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    window.auth.requireLogin(null, true);
    return;
  }
  
  let gameItem;
  
  // If gameOrId is an object (from game card)
  if (typeof gameOrId === 'object') {
    gameItem = gameOrId;
  } 
  // If gameOrId is a string (from ID)
  else {
    const game = window.gameRepository.getGameById(gameOrId);
    if (!game) {
      console.error('Game not found:', gameOrId);
      return;
    }
    
    gameItem = {
      id: game.id,
      title: game.title,
      price: game.price,
      image: game.image,
      quantity: quantity
    };
  }
  
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(item => item.id === gameItem.id);
  
  if (existingItemIndex !== -1) {
    // Update quantity
    cart[existingItemIndex].quantity += quantity;
    console.log(`Increased quantity of ${gameItem.title} to ${cart[existingItemIndex].quantity}`);
  } else {
    // Ensure quantity is set
    if (!gameItem.quantity) {
      gameItem.quantity = quantity;
    }
    
    // Add new item
    cart.push(gameItem);
    console.log(`Added ${gameItem.title} to cart`);
  }
  
  // Save cart
  saveCart();
  
  // Update UI
  updateCartCount();
  
  // Re-render cart items if on cart page
  if (document.getElementById('cartItems')) {
    renderCartItems();
    updateCartTotals();
  }
  
  // Add XP for adding to cart
  if (typeof addUserXP === 'function') {
    addUserXP(5, 'Item adicionado ao carrinho');
  }
  
  // Show notification
  showNotification(`${gameItem.title} adicionado ao carrinho!`, 'success');
  
  // Visual feedback on the button if available
  const addButton = document.querySelector(`.game-card-immersive[data-game-id="${gameItem.id}"] .add-to-cart`);
  if (addButton) {
    // Store original text
    const originalText = addButton.innerHTML;
    
    // Change button text/appearance
    addButton.innerHTML = '<i class="fas fa-check me-2"></i> Adicionado';
    addButton.classList.add('added');
    
    // Restore original state after delay
    setTimeout(() => {
      addButton.innerHTML = originalText;
      addButton.classList.remove('added');
    }, 1500);
  }
  
  // Animate cart icon
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.classList.add('cart-bounce');
    setTimeout(() => cartIcon.classList.remove('cart-bounce'), 500);
  }
  
  return true;
}

// Remove from cart
function removeFromCart(id) {
  // Find item index
  const itemIndex = cart.findIndex(item => item.id === id);
  
  if (itemIndex !== -1) {
    const removedItem = cart[itemIndex];
    
    // Remove item
    cart.splice(itemIndex, 1);
    
    // Save cart
    saveCart();
    
    // Update UI
    updateCartCount();
    
    // Re-render cart if on cart page
    if (document.getElementById('cartItems')) {
      renderCartItems();
      updateCartTotals();
    }
    
    // Show notification
    showNotification(`${removedItem.title} removido do carrinho!`, 'info');
    
    return true;
  }
  
  return false;
}

// Update cart quantity
function updateCartQuantity(id, quantity) {
  // Find item
  const item = cart.find(item => item.id === id);
  
  if (item) {
    // Update quantity
    item.quantity = parseInt(quantity);
    
    // Remove if quantity is 0
    if (item.quantity <= 0) {
      return removeFromCart(id);
    }
    
    // Save cart
    saveCart();
    
    // Update UI
    updateCartCount();
    
    // Re-render cart if on cart page
    if (document.getElementById('cartItems')) {
      renderCartItems();
      updateCartTotals();
    }
    
    return true;
  }
  
  return false;
}

// Clear cart
function clearCart() {
  // Clear cart array
  cart = [];
  
  // Clear applied promo
  appliedPromo = null;
  
  // Save cart
  saveCart();
  
  // Update UI
  updateCartCount();
  
  // Re-render cart if on cart page
  if (document.getElementById('cartItems')) {
    renderCartItems();
    updateCartTotals();
  }
  
  // Show notification
  showNotification('Carrinho esvaziado!', 'info');
  
  return true;
}

// Load cart from localStorage
function loadCart() {
  try {
    // First check for cart in the new storage location
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      cart = JSON.parse(savedCart);
    } else {
      // Check for cart in the old storage location
      const oldCart = localStorage.getItem('gameCart');
      if (oldCart) {
        // Migrate from old cart to new cart
        cart = JSON.parse(oldCart);
        console.log('Migrating from old cart storage to new unified cart');
        // Save to new location
        saveCart();
        // Remove old cart data
        localStorage.removeItem('gameCart');
      } else {
        cart = [];
      }
    }
  } catch (error) {
    console.error('Error loading cart:', error);
    cart = [];
  }
}

// Save cart to localStorage
function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

// Update cart count in navbar
function updateCartCount() {
  const cartCountElement = document.querySelector('.cart-count');
  if (!cartCountElement) return;
  
  // Calculate total number of items
  const count = cart.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
  
  // Update count
  cartCountElement.textContent = count;
  
  // Add visual indicator if there are items
  if (count > 0) {
    cartCountElement.classList.add('show');
  } else {
    cartCountElement.classList.remove('show');
  }
}

// Render cart items in cart page
function renderCartItems() {
  const cartItemsContainer = document.getElementById('cartItems');
  if (!cartItemsContainer) return;
  
  // Clear container
  cartItemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    // Show empty cart message
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon"><i class="fas fa-shopping-cart"></i></div>
        <h3>Seu Carrinho Está Vazio</h3>
        <p>Explore nossa loja e adicione jogos incríveis ao seu carrinho!</p>
        <a href="../pages/games.html" class="btn btn-primary">Explorar Jogos</a>
      </div>
    `;
    return;
  }
  
  // Add items
  cart.forEach(item => {
    const cartItemElement = document.createElement('div');
    cartItemElement.className = 'cart-item';
    cartItemElement.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="cart-item-details">
        <h3 class="cart-item-title">${item.title}</h3>
        <div class="cart-item-price">R$ ${(item.price).toFixed(2)}</div>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-btn quantity-decrease" data-id="${item.id}">-</button>
        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-id="${item.id}">
        <button class="quantity-btn quantity-increase" data-id="${item.id}">+</button>
      </div>
      <div class="cart-item-subtotal">
        R$ ${(item.price * item.quantity).toFixed(2)}
      </div>
      <div class="cart-item-remove">
        <button class="remove-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
      </div>
    `;
    
    cartItemsContainer.appendChild(cartItemElement);
  });
  
  // Add event listeners for quantity buttons
  document.querySelectorAll('.quantity-decrease').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const item = cart.find(item => item.id === id);
      
      if (item) {
        updateCartQuantity(id, Math.max(1, item.quantity - 1));
      }
    });
  });
  
  document.querySelectorAll('.quantity-increase').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const item = cart.find(item => item.id === id);
      
      if (item) {
        updateCartQuantity(id, item.quantity + 1);
      }
    });
  });
  
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function() {
      const id = this.getAttribute('data-id');
      const quantity = parseInt(this.value) || 1;
      
      updateCartQuantity(id, quantity);
    });
  });
  
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      removeFromCart(id);
    });
  });
}

// Update cart totals
function updateCartTotals() {
  const cartTotalElement = document.getElementById('cartTotal');
  const cartSubtotalElement = document.getElementById('cartSubtotal');
  const cartDiscountElement = document.getElementById('cartDiscount');
  const promoCodeElement = document.getElementById('promoCode');
  
  if (!cartTotalElement) return;
  
  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate discount
  let discount = 0;
  if (appliedPromo) {
    discount = subtotal * (appliedPromo.discount / 100);
  }
  
  // Calculate total
  const total = subtotal - discount;
  
  // Update UI
  if (cartSubtotalElement) {
    cartSubtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
  }
  
  if (cartDiscountElement) {
    cartDiscountElement.textContent = `- R$ ${discount.toFixed(2)}`;
    
    // Show or hide discount row
    const discountRow = cartDiscountElement.closest('.summary-row');
    if (discountRow) {
      discountRow.style.display = discount > 0 ? 'flex' : 'none';
    }
  }
  
  cartTotalElement.textContent = `R$ ${total.toFixed(2)}`;
  
  // Update promo code field
  if (promoCodeElement && appliedPromo) {
    promoCodeElement.value = appliedPromo.code;
  }
}

// Set up cart controls
function setupCartControls() {
  const applyPromoBtn = document.getElementById('applyPromo');
  const clearCartBtn = document.getElementById('clearCart');
  const checkoutBtn = document.getElementById('proceedToCheckout');
  
  if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', function() {
      applyPromoCode();
    });
  }
  
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function() {
      clearCart();
    });
  }
  
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      proceedToCheckout();
    });
  }
}

// Apply promo code
function applyPromoCode() {
  const promoCodeInput = document.getElementById('promoCode');
  if (!promoCodeInput) return;
  
  const promoCode = promoCodeInput.value.trim();
  
  if (!promoCode) {
    showNotification('Por favor, digite um código de cupom', 'error');
    return;
  }
  
  // Sample promo codes
  const availablePromos = {
    'WELCOME10': { code: 'WELCOME10', discount: 10, description: '10% de desconto' },
    'GAMES20': { code: 'GAMES20', discount: 20, description: '20% de desconto' },
    'FIAP30': { code: 'FIAP30', discount: 30, description: '30% de desconto para alunos FIAP' }
  };
  
  if (availablePromos[promoCode]) {
    // Apply promo
    appliedPromo = availablePromos[promoCode];
    
    // Update totals
    updateCartTotals();
    
    // Show success notification
    showNotification(`Cupom "${promoCode}" aplicado com sucesso: ${appliedPromo.description}`, 'success');
    
    // Add XP for using promo code
    addUserXP(5, 'Utilizou cupom de desconto');
  } else {
    showNotification('Cupom inválido ou expirado', 'error');
  }
}

// Load related games
function loadRelatedGames() {
  const relatedGamesContainer = document.getElementById('relatedGames');
  if (!relatedGamesContainer) return;
  
  // Clear container
  relatedGamesContainer.innerHTML = '';
  
  // Get random selection of games
  const allGames = window.gameRepository.getAllGames();
  const cartGameIds = cart.map(item => item.id);
  const availableGames = allGames.filter(game => !cartGameIds.includes(game.id));
  
  // Shuffle and pick up to 4 games
  const shuffledGames = availableGames.sort(() => 0.5 - Math.random()).slice(0, 4);
  
  // Render games
  shuffledGames.forEach(game => {
    renderGameCard(game, relatedGamesContainer);
  });
}

// Render a game card
function renderGameCard(game, container) {
  const gameCard = document.createElement('div');
  gameCard.className = 'game-card-immersive';
  gameCard.dataset.gameId = game.id;
  
  // Calculate discount if exists
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
    addToCartBtn.addEventListener('click', () => addToCart(game.id));
  }
  
  const wishlistBtn = gameCard.querySelector('.wishlist-button');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => toggleWishlist(game.id));
  }
  
  const previewBtn = gameCard.querySelector('.preview-button');
  if (previewBtn) {
    previewBtn.addEventListener('click', () => showGamePreview(game.id));
  }
}

// Checkout function
function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification('Seu carrinho está vazio!', 'error');
    return;
  }
  
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    window.auth.requireLogin(null, true);
    return;
  }
  
  // For demo, show success message
  showNotification('Pedido Confirmado! Seu pedido foi processado com sucesso. Obrigado por comprar conosco!', 'success');
  
  // Clear cart
  clearCart();
  
  // Add XP for purchase
  addUserXP(50, 'Compra realizada');
  
  // Redirect to home
  window.location.href = '../index.html';
}

// Show game preview modal
function showGamePreview(gameId) {
  // Get game data from repository
  const game = window.gameRepository.getGameById(gameId);
  if (!game) {
    console.error('Game not found:', gameId);
    return;
  }
  
  // Create modal HTML
  const modal = document.createElement('div');
  modal.className = 'game-preview-modal';
  modal.innerHTML = `
    <div class="preview-content">
      <div class="preview-close"><i class="fas fa-times"></i></div>
      
      <div class="preview-header">
        <img src="${game.image}" alt="${game.title}" class="preview-image">
        <div class="preview-header-overlay">
          <h2 class="preview-title">${game.title}</h2>
          <div class="preview-meta">
            <div class="preview-meta-item">
              <i class="fas fa-star"></i>
              <span>${game.rating.toFixed(1)}</span>
            </div>
            <div class="preview-meta-item">
              <i class="fas fa-gamepad"></i>
              <span>${game.platforms.join(', ')}</span>
            </div>
            <div class="preview-meta-item">
              <i class="fas fa-calendar"></i>
              <span>Lançamento: ${formatDate(game.releaseDate)}</span>
            </div>
          </div>
          <div class="preview-tags">
            ${game.genres.map(genre => `<span class="preview-tag">${genre}</span>`).join('')}
          </div>
        </div>
      </div>
      
      <div class="preview-body">
        <div class="preview-section">
          <h3 class="preview-section-title">Descrição</h3>
          <p class="preview-description">${game.description}</p>
        </div>
        
        <div class="preview-details">
          <div class="preview-detail-item">
            <strong>Desenvolvedor:</strong> ${game.developer || 'N/A'}
          </div>
          <div class="preview-detail-item">
            <strong>Publicador:</strong> ${game.publisher || 'N/A'}
          </div>
          <div class="preview-detail-item">
            <strong>Plataformas:</strong> ${game.platforms.join(', ')}
          </div>
          <div class="preview-detail-item">
            <strong>Gêneros:</strong> ${game.genres.join(', ')}
          </div>
        </div>
      </div>
      
      <div class="preview-footer">
        <div class="preview-price">
          ${game.discount > 0 ? `<div class="preview-price-original">R$ ${game.originalPrice.toFixed(2)}</div>` : ''}
          <div class="preview-price-current">R$ ${game.price.toFixed(2)}</div>
        </div>
        
        <div class="preview-actions">
          <button class="action-button preview-cart" data-game-id="${game.id}">
            <i class="fas fa-shopping-cart me-2"></i> Adicionar ao carrinho
          </button>
          <button class="action-button-secondary preview-wishlist" data-game-id="${game.id}">
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
  
  // Handle close
  const closeBtn = modal.querySelector('.preview-close');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  });
  
  // Handle add to cart
  const cartBtn = modal.querySelector('.preview-cart');
  cartBtn.addEventListener('click', () => {
    addToCart(game.id);
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  });
  
  // Handle wishlist
  const wishlistBtn = modal.querySelector('.preview-wishlist');
  wishlistBtn.addEventListener('click', () => {
    toggleWishlist(game.id);
  });
  
  // Add XP for viewing details
  addUserXP(5);
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Check if user is logged in
function isUserLoggedIn() {
  return localStorage.getItem('isLogged') === 'true';
}

// Add XP to user profile
function addUserXP(amount, reason = '') {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
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
  const xpForNextLevel = currentLevel * 100;
  
  if (userProfile.xp >= xpForNextLevel) {
    userProfile.level = currentLevel + 1;
    userProfile.xp -= xpForNextLevel;
    
    // Show level up notification
    showNotification('Nível Aumentado! Parabéns! Você alcançou o nível ' + userProfile.level + '!', 'success');
  }
  
  // Save user profile
  localStorage.setItem('userGameProfile', JSON.stringify(userProfile));
  
  // Update UI
  updateUserProfile();
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
      const percentage = (xpProgress / 100) * 100;
      userXpBarEl.style.width = `${percentage}%`;
    }
    
    // Update XP text
    const userXpTextEl = document.getElementById('userXpText');
    if (userXpTextEl) {
      const xpToNext = 100 - (userProfile.xp % 100);
      userXpTextEl.textContent = `${xpToNext} XP para o próximo nível`;
    }
  } catch (e) {
    console.error('Error updating user profile UI:', e);
  }
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

// Toggle wishlist
function toggleWishlist(gameId) {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    window.auth.requireLogin(null, true);
    return;
  }
  
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
  
  // Initialize wishlist if not exists
  if (!userProfile.wishlist) {
    userProfile.wishlist = [];
  }
  
  // Check if game is already in wishlist
  const gameIndex = userProfile.wishlist.indexOf(gameId);
  const game = window.gameRepository.getGameById(gameId);
  
  if (gameIndex === -1) {
    // Add to wishlist
    userProfile.wishlist.push(gameId);
    
    // Show notification
    showNotification(`${game.title} adicionado aos favoritos!`, 'success');
    
    // Add XP
    addUserXP(1);
  } else {
    // Remove from wishlist
    userProfile.wishlist.splice(gameIndex, 1);
    
    // Show notification
    showNotification(`${game.title} removido dos favoritos!`, 'info');
  }
  
  // Save user profile
  localStorage.setItem('userGameProfile', JSON.stringify(userProfile));
  
  // Update wishlist buttons
  updateWishlistButtonsState(userProfile.wishlist);
}

// Update wishlist button states
function updateWishlistButtonsState(wishlist = []) {
  if (!wishlist || wishlist.length === 0) return;
  
  document.querySelectorAll('.wishlist-button, .preview-wishlist').forEach(button => {
    const gameId = button.getAttribute('data-game-id') || button.closest('[data-game-id]')?.getAttribute('data-game-id');
    
    if (gameId && wishlist.includes(gameId)) {
      button.innerHTML = '<i class="fas fa-heart"></i>';
      button.classList.add('active');
    } else {
      button.innerHTML = '<i class="far fa-heart"></i>';
      button.classList.remove('active');
    }
  });
}

// Expose core cart functions globally
window.cart = {
  addToCart: addToCart,
  removeFromCart: removeFromCart,
  updateCartQuantity: updateCartQuantity,
  clearCart: clearCart,
  loadCart: loadCart,
  saveCart: saveCart,
  getCart: () => cart // Add a getter for the cart array
};

// For backwards compatibility 
window.updateCartUI = updateCartCount;