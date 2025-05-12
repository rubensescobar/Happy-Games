/**
 * Shopping Cart JavaScript
 * Handles cart functionality for BuscaGames
 */

// Sample game data (would normally come from an API)
const gameData = {
  '1': {
    id: '1',
    title: 'Cyberpunk 2077',
    image: '../assets/images/game1.png',
    price: 199.90,
    originalPrice: 299.90,
    discount: 33,
    platform: 'PC',
    genres: ['RPG', 'Ação', 'Futuro']
  },
  '2': {
    id: '2',
    title: 'The Witcher 3: Wild Hunt',
    image: '../assets/images/game2.png',
    price: 79.90,
    originalPrice: 199.90,
    discount: 60,
    platform: 'PC, PlayStation, Xbox',
    genres: ['RPG', 'Aventura', 'Fantasia']
  },
  '3': {
    id: '3',
    title: 'Red Dead Redemption 2',
    image: '../assets/images/game3.png',
    price: 239.90,
    originalPrice: 299.90,
    discount: 20,
    platform: 'PC, PlayStation, Xbox',
    genres: ['Ação', 'Aventura', 'Mundo Aberto']
  }
};

// Cart data
let cart = [];
let appliedPromo = null;

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
  // Load cart from localStorage
  loadCart();
  
  // Update user info
  updateUserInfo();
  
  // Add event listeners
  setupEventListeners();
  
  // Load related games
  loadRelatedGames();
});

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('gameCart');
  
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartUI();
    } catch (e) {
      console.error('Error parsing cart data:', e);
      cart = [];
    }
  }
  
  // Update cart items display
  renderCartItems();
  
  // Update cart totals
  updateCartTotals();
  
  // Update checkout button
  updateCheckoutButton();
  
  // Update cart count in navbar
  updateCartCount();
}

// Render cart items
function renderCartItems() {
  const cartItemsContainer = document.getElementById('cartItems');
  if (!cartItemsContainer) return;
  
  // Clear existing items
  cartItemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    // Show empty cart message
    cartItemsContainer.innerHTML = `
      <div class="empty-cart-message">
        <i class="fas fa-shopping-cart"></i>
        <h3>Seu carrinho está vazio</h3>
        <p>Adicione jogos ao seu carrinho para continuar</p>
        <a href="games.html" class="btn-continue-shopping">Explorar jogos</a>
      </div>
    `;
    return;
  }
  
  // Add each cart item
  cart.forEach(item => {
    // Get game details from sample data
    // In a real app, this data would come from an API
    const game = gameData[item.id] || {
      id: item.id,
      title: item.title || `Game ${item.id}`,
      image: `../assets/images/game${item.id}.png`,
      price: item.price || 99.99,
      discount: 0,
      platform: 'PC',
      genres: ['Ação']
    };
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.dataset.id = item.id;
    
    // Calculate total for this item
    const itemTotal = game.price * item.quantity;
    
    cartItem.innerHTML = `
      <div class="product">
        <div class="product-image">
          <img src="${game.image}" alt="${game.title}">
        </div>
        <div class="product-details">
          <a href="games.html?id=${game.id}" class="product-title">${game.title}</a>
          <div class="product-meta">
            <div class="product-platform">
              <i class="fas fa-desktop"></i> ${game.platform}
            </div>
            <div class="product-genre">
              <i class="fas fa-gamepad"></i> ${game.genres.join(', ')}
            </div>
          </div>
        </div>
      </div>
      
      <div class="price" data-label="Preço:">
        ${game.originalPrice ? `<span class="original-price">R$ ${game.originalPrice.toFixed(2)}</span>` : ''}
        R$ ${game.price.toFixed(2)}
      </div>
      
      <div class="quantity" data-label="Quantidade:">
        <div class="quantity-control">
          <button class="quantity-btn decrease"><i class="fas fa-minus"></i></button>
          <input type="text" class="quantity-input" value="${item.quantity}" min="1" max="99" readonly>
          <button class="quantity-btn increase"><i class="fas fa-plus"></i></button>
        </div>
      </div>
      
      <div class="total" data-label="Total:">
        R$ ${itemTotal.toFixed(2)}
      </div>
      
      <div class="remove">
        <button class="remove-btn" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
    
    cartItemsContainer.appendChild(cartItem);
    
    // Add event listeners for this item
    const decreaseBtn = cartItem.querySelector('.decrease');
    const increaseBtn = cartItem.querySelector('.increase');
    const removeBtn = cartItem.querySelector('.remove-btn');
    
    decreaseBtn.addEventListener('click', () => updateItemQuantity(item.id, -1));
    increaseBtn.addEventListener('click', () => updateItemQuantity(item.id, 1));
    removeBtn.addEventListener('click', () => removeCartItem(item.id));
  });
}

// Update item quantity
function updateItemQuantity(itemId, change) {
  // Find the item in the cart
  const itemIndex = cart.findIndex(item => item.id === itemId);
  if (itemIndex === -1) return;
  
  // Update quantity
  cart[itemIndex].quantity += change;
  
  // Remove item if quantity is 0 or less
  if (cart[itemIndex].quantity <= 0) {
    removeCartItem(itemId);
    return;
  }
  
  // Update cart in localStorage
  saveCart();
  
  // Update cart UI
  const cartItem = document.querySelector(`.cart-item[data-id="${itemId}"]`);
  if (cartItem) {
    // Update quantity input
    const quantityInput = cartItem.querySelector('.quantity-input');
    if (quantityInput) {
      quantityInput.value = cart[itemIndex].quantity;
    }
    
    // Update total
    const totalDisplay = cartItem.querySelector('.total');
    if (totalDisplay) {
      const game = gameData[itemId] || { price: cart[itemIndex].price };
      const itemTotal = game.price * cart[itemIndex].quantity;
      totalDisplay.innerHTML = `R$ ${itemTotal.toFixed(2)}`;
    }
    
    // Highlight the changed item
    cartItem.classList.add('highlight');
    setTimeout(() => cartItem.classList.remove('highlight'), 500);
  }
  
  // Update cart totals
  updateCartTotals();
  
  // Update checkout button
  updateCheckoutButton();
  
  // Update cart count in navbar
  updateCartCount();
  
  // Add XP for updating cart
  addUserXP(1, 'Atualização de carrinho');
}

// Remove item from cart
function removeCartItem(itemId) {
  // Find the item element
  const cartItem = document.querySelector(`.cart-item[data-id="${itemId}"]`);
  
  if (cartItem) {
    // Animate removal
    cartItem.classList.add('removing');
    
    setTimeout(() => {
      // Find the item in the cart
      const itemIndex = cart.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return;
      
      // Remove from cart array
      cart.splice(itemIndex, 1);
      
      // Update cart in localStorage
      saveCart();
      
      // Re-render cart items
      renderCartItems();
      
      // Update cart totals
      updateCartTotals();
      
      // Update checkout button
      updateCheckoutButton();
      
      // Update cart count in navbar
      updateCartCount();
      
      // Show notification
      showNotification('Item removido do carrinho', 'info');
    }, 300);
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('gameCart', JSON.stringify(cart));
}

// Update cart totals
function updateCartTotals() {
  const subtotalEl = document.getElementById('cartSubtotal');
  const discountEl = document.getElementById('cartDiscount');
  const totalEl = document.getElementById('cartTotal');
  
  if (!subtotalEl || !discountEl || !totalEl) return;
  
  // Calculate subtotal
  let subtotal = 0;
  let discount = 0;
  
  cart.forEach(item => {
    const game = gameData[item.id] || { price: item.price, discount: 0 };
    const itemPrice = game.price * item.quantity;
    subtotal += itemPrice;
    
    if (game.originalPrice) {
      const itemDiscount = (game.originalPrice - game.price) * item.quantity;
      discount += itemDiscount;
    }
  });
  
  // Apply promo code if available
  let promoDiscount = 0;
  if (appliedPromo) {
    promoDiscount = (subtotal * appliedPromo.discount) / 100;
    discount += promoDiscount;
  }
  
  // Update DOM
  subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
  discountEl.textContent = `-R$ ${discount.toFixed(2)}`;
  totalEl.textContent = `R$ ${(subtotal - discount).toFixed(2)}`;
}

// Update checkout button state
function updateCheckoutButton() {
  const checkoutBtn = document.getElementById('checkoutButton');
  if (!checkoutBtn) return;
  
  if (cart.length > 0) {
    checkoutBtn.disabled = false;
  } else {
    checkoutBtn.disabled = true;
  }
}

// Update cart count in navbar
function updateCartCount() {
  const cartCount = document.querySelector('.cart-count');
  if (!cartCount) return;
  
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.textContent = totalItems;
  
  if (totalItems > 0) {
    cartCount.classList.add('show');
  } else {
    cartCount.classList.remove('show');
  }
}

// Set up event listeners
function setupEventListeners() {
  // Clear cart button
  const clearCartBtn = document.getElementById('clearCart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
  }
  
  // Checkout button
  const checkoutBtn = document.getElementById('checkoutButton');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToCheckout);
  }
  
  // Apply promo code
  const applyPromoBtn = document.getElementById('applyPromo');
  if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', applyPromoCode);
  }
}

// Clear cart
function clearCart() {
  if (cart.length === 0) return;
  
  // Show confirmation dialog using sweetalert2 if available
  if (window.Swal) {
    Swal.fire({
      title: 'Tem certeza?',
      text: "Você deseja remover todos os itens do carrinho?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, limpar carrinho',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear cart
        cart = [];
        saveCart();
        renderCartItems();
        updateCartTotals();
        updateCheckoutButton();
        updateCartCount();
        
        // Show success message
        Swal.fire(
          'Limpo!',
          'Seu carrinho foi esvaziado com sucesso.',
          'success'
        );
      }
    });
  } else {
    // Without sweetalert2, use standard confirm dialog
    if (confirm("Tem certeza que deseja remover todos os itens do carrinho?")) {
      // Clear cart
      cart = [];
      saveCart();
      renderCartItems();
      updateCartTotals();
      updateCheckoutButton();
      updateCartCount();
      
      // Show notification
      showNotification('Carrinho esvaziado com sucesso', 'success');
    }
  }
}

// Proceed to checkout
function proceedToCheckout() {
  // In a real app, this would redirect to a checkout page
  // For this demo, we'll just show a success message
  
  if (window.Swal) {
    Swal.fire({
      title: 'Compra finalizada com sucesso!',
      text: 'Obrigado por comprar conosco! Você receberá um email com os detalhes da sua compra.',
      icon: 'success',
      confirmButtonColor: '#14853a',
      confirmButtonText: 'Continuar'
    }).then((result) => {
      // Clear cart
      cart = [];
      saveCart();
      renderCartItems();
      updateCartTotals();
      updateCheckoutButton();
      updateCartCount();
      
      // Add XP for purchase
      addUserXP(50, 'Realizou uma compra');
      
      // Add achievement for first purchase
      addAchievement('first-purchase', 'Primeiro Jogo', 'Comprou seu primeiro jogo', 'shopping-cart', 25);
      
      // Add activity
      addActivity('purchase', 'Realizou uma compra', 'shopping-cart');
    });
  } else {
    alert('Compra finalizada com sucesso! Obrigado por comprar conosco!');
    
    // Clear cart
    cart = [];
    saveCart();
    renderCartItems();
    updateCartTotals();
    updateCheckoutButton();
    updateCartCount();
    
    // Add XP for purchase
    addUserXP(50, 'Realizou uma compra');
    
    // Add achievement for first purchase
    addAchievement('first-purchase', 'Primeiro Jogo', 'Comprou seu primeiro jogo', 'shopping-cart', 25);
    
    // Add activity
    addActivity('purchase', 'Realizou uma compra', 'shopping-cart');
  }
}

// Apply promo code
function applyPromoCode() {
  const promoInput = document.getElementById('promoCode');
  if (!promoInput) return;
  
  const promoCode = promoInput.value.trim().toUpperCase();
  
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
  
  // In a real app, these would be recommended based on cart contents
  // For this demo, we'll just show a few sample games
  const relatedGameIds = ['1', '2', '3'];
  
  relatedGameIds.forEach(gameId => {
    const game = gameData[gameId] || {
      id: gameId,
      title: `Game ${gameId}`,
      image: `../assets/images/game${gameId}.png`,
      price: 99.99,
      originalPrice: 199.99,
      discount: 50,
      platform: 'PC',
      genres: ['Ação']
    };
    
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card-immersive';
    gameCard.dataset.gameId = game.id;
    
    // Create game card HTML
    gameCard.innerHTML = `
      <div class="game-card-image-container">
        <img src="${game.image}" alt="${game.title}" class="game-card-image">
        <div class="game-card-glare"></div>
      </div>
      
      ${game.discount ? `<div class="discount-tag">-${game.discount}%</div>` : ''}
      
      <div class="game-card-overlay">
        <h3 class="game-card-title">${game.title}</h3>
        
        <div class="game-card-platform">
          <span class="platform-icon"><i class="fas fa-desktop"></i> ${game.platform}</span>
        </div>
        
        <div class="genre-tags">
          ${game.genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
        </div>
        
        <div class="game-card-price">
          ${game.originalPrice ? `<span class="price-original">R$ ${game.originalPrice.toFixed(2)}</span>` : ''}
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
    
    relatedGamesContainer.appendChild(gameCard);
    
    // Add event listeners
    const addToCartBtn = gameCard.querySelector('.add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => addToCart(game));
    }
    
    const wishlistBtn = gameCard.querySelector('.wishlist-button');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', () => addToWishlist(game.id));
    }
    
    const previewBtn = gameCard.querySelector('.preview-button');
    if (previewBtn) {
      previewBtn.addEventListener('click', () => showGamePreview(game.id));
    }
  });
}

// Add to cart
function addToCart(game) {
  // Check if item is already in cart
  const existingItem = cart.find(item => item.id === game.id);
  
  if (existingItem) {
    // Update quantity
    existingItem.quantity += 1;
  } else {
    // Add new item
    cart.push({
      id: game.id,
      title: game.title,
      price: game.price,
      quantity: 1
    });
  }
  
  // Save cart
  saveCart();
  
  // Re-render cart
  renderCartItems();
  
  // Update totals
  updateCartTotals();
  
  // Update checkout button
  updateCheckoutButton();
  
  // Update cart count in navbar
  updateCartCount();
  
  // Show notification
  showNotification(`${game.title} adicionado ao carrinho!`, 'success');
  
  // Add XP
  addUserXP(5, 'Adicionou item ao carrinho');
}

// Add to wishlist
function addToWishlist(gameId) {
  // Load user profile
  let userProfile = localStorage.getItem('userGameProfile');
  
  if (!userProfile) {
    // Create new profile if it doesn't exist
    userProfile = {
      wishlist: []
    };
  } else {
    try {
      userProfile = JSON.parse(userProfile);
      
      if (!userProfile.wishlist) {
        userProfile.wishlist = [];
      }
    } catch (e) {
      console.error('Error parsing user profile:', e);
      userProfile = { wishlist: [] };
    }
  }
  
  // Check if already in wishlist
  const isWishlisted = userProfile.wishlist.includes(gameId);
  
  if (isWishlisted) {
    // Remove from wishlist
    userProfile.wishlist = userProfile.wishlist.filter(id => id !== gameId);
    showNotification('Removido dos favoritos', 'info');
  } else {
    // Add to wishlist
    userProfile.wishlist.push(gameId);
    showNotification('Adicionado aos favoritos!', 'success');
    
    // Add XP
    addUserXP(10, 'Adicionou jogo aos favoritos');
    
    // Check for wishlist-5 achievement
    if (userProfile.wishlist.length >= 5) {
      addAchievement('wishlist-5', 'Colecionador Iniciante', 'Adicionou 5 jogos à lista de favoritos', 'heart', 15);
    }
  }
  
  // Save user profile
  localStorage.setItem('userGameProfile', JSON.stringify(userProfile));
}

// Show game preview
function showGamePreview(gameId) {
  const game = gameData[gameId] || {
    id: gameId,
    title: `Game ${gameId}`,
    image: `../assets/images/game${gameId}.png`,
    price: 99.99,
    originalPrice: 199.99,
    discount: 50,
    platform: 'PC',
    genres: ['Ação'],
    description: 'Descrição detalhada do jogo estaria aqui, incluindo informações sobre a história, gameplay e características especiais.'
  };
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'quick-preview';
  modal.innerHTML = `
    <div class="preview-content">
      <div class="preview-close"><i class="fas fa-times"></i></div>
      
      <div class="preview-header">
        <img src="${game.image}" alt="${game.title}">
        <div class="preview-header-overlay">
          <h1 class="preview-title">${game.title}</h1>
          <div class="preview-meta">
            <div class="preview-meta-item">
              <i class="fas fa-star"></i>
              <span>4.5</span>
            </div>
            <div class="preview-meta-item">
              <i class="fas fa-gamepad"></i>
              <span>${game.platform}</span>
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
          <p class="preview-description">${game.description}</p>
        </div>
        
        <div class="preview-section">
          <h3 class="preview-section-title">Características</h3>
          <div class="preview-features">
            <div class="preview-feature">
              <div class="feature-icon"><i class="fas fa-check-circle"></i></div>
              <div class="feature-text">Multiplayer</div>
            </div>
            <div class="preview-feature">
              <div class="feature-icon"><i class="fas fa-check-circle"></i></div>
              <div class="feature-text">Open World</div>
            </div>
            <div class="preview-feature">
              <div class="feature-icon"><i class="fas fa-check-circle"></i></div>
              <div class="feature-text">High Resolution</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="preview-footer">
        <div class="preview-price">
          ${game.originalPrice ? `<div class="preview-price-original">R$ ${game.originalPrice.toFixed(2)}</div>` : ''}
          <div class="preview-price-current">R$ ${game.price.toFixed(2)}</div>
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
  
  // Handle add to cart
  const cartBtn = modal.querySelector('.preview-cart');
  cartBtn.addEventListener('click', () => {
    addToCart(game);
    modal.classList.remove('active');
    setTimeout(() => document.body.removeChild(modal), 300);
  });
  
  // Handle wishlist
  const wishlistBtn = modal.querySelector('.preview-wishlist');
  wishlistBtn.addEventListener('click', () => {
    addToWishlist(game.id);
    
    // Update button state
    let userProfile = JSON.parse(localStorage.getItem('userGameProfile') || '{"wishlist":[]}');
    const isWishlisted = userProfile.wishlist.includes(game.id);
    
    if (isWishlisted) {
      wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
      wishlistBtn.classList.add('active');
    } else {
      wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
      wishlistBtn.classList.remove('active');
    }
  });
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => document.body.removeChild(modal), 300);
    }
  });
  
  // Add XP for viewing details
  addUserXP(5, 'Visualizou detalhes do jogo');
}

// Update user info
function updateUserInfo() {
  let userProfile = JSON.parse(localStorage.getItem('userGameProfile') || '{"level":1,"xp":0}');
  
  // Update rewards level
  const rewardsLevelEl = document.getElementById('rewardsLevel');
  const rewardsFillEl = document.getElementById('rewardsFill');
  const rewardsXPEl = document.getElementById('rewardsXP');
  
  if (rewardsLevelEl && rewardsFillEl && rewardsXPEl) {
    const level = userProfile.level || 1;
    const xp = userProfile.xp || 0;
    const xpProgress = xp % 100;
    
    rewardsLevelEl.textContent = level;
    rewardsFillEl.style.width = `${xpProgress}%`;
    rewardsXPEl.textContent = `${xpProgress}/100 XP`;
  }
  
  // Update user level in navbar
  const userLevelEl = document.getElementById('userLevel');
  const userXpBarEl = document.getElementById('userXpBar');
  const userXpTextEl = document.getElementById('userXpText');
  
  if (userLevelEl && userXpBarEl && userXpTextEl) {
    const level = userProfile.level || 1;
    const xp = userProfile.xp || 0;
    const xpProgress = xp % 100;
    const xpForNextLevel = 100 - xpProgress;
    
    userLevelEl.textContent = level;
    userXpBarEl.style.width = `${xpProgress}%`;
    userXpTextEl.textContent = `${xpForNextLevel} XP para o próximo nível`;
  }
}

// Add XP to user
function addUserXP(amount, action) {
  let userProfile = JSON.parse(localStorage.getItem('userGameProfile') || '{"level":1,"xp":0}');
  
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
  
  // Update user info display
  updateUserInfo();
  
  // Log XP gain (for debugging)
  console.log(`+${amount} XP: ${action}`);
}

// Show level up notification
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

// Add achievement
function addAchievement(id, name, description, icon, xp) {
  let userProfile = JSON.parse(localStorage.getItem('userGameProfile') || '{"achievements":[]}');
  
  // Check if achievement already exists
  if (!userProfile.achievements) {
    userProfile.achievements = [];
  }
  
  const hasAchievement = userProfile.achievements.some(a => a.id === id);
  
  if (!hasAchievement) {
    // Add achievement
    userProfile.achievements.push({
      id,
      name,
      description,
      icon,
      date: new Date().toISOString(),
      completed: true
    });
    
    // Save user profile
    localStorage.setItem('userGameProfile', JSON.stringify(userProfile));
    
    // Add XP
    addUserXP(xp, `Conquista: ${name}`);
    
    // Show achievement notification
    showAchievementNotification(name, description, icon);
  }
}

// Show achievement notification
function showAchievementNotification(name, description, icon) {
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-notification-icon">
      <i class="fas fa-${icon || 'trophy'}"></i>
    </div>
    <div class="achievement-notification-content">
      <h3>Nova Conquista!</h3>
      <h4>${name}</h4>
      <p>${description}</p>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Remove after animation
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 500);
  }, 5000);
}

// Add activity to user profile
function addActivity(type, message, icon) {
  let userProfile = JSON.parse(localStorage.getItem('userGameProfile') || '{"activities":[]}');
  
  // Add activity
  if (!userProfile.activities) {
    userProfile.activities = [];
  }
  
  userProfile.activities.unshift({
    type,
    message,
    icon,
    date: new Date().toISOString()
  });
  
  // Limit to 20 activities
  if (userProfile.activities.length > 20) {
    userProfile.activities = userProfile.activities.slice(0, 20);
  }
  
  // Save user profile
  localStorage.setItem('userGameProfile', JSON.stringify(userProfile));
}

// Show notification
function showNotification(message, type = 'info') {
  // Check if parent script has showNotification function
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
  // Fallback implementation
  const notification = document.createElement('div');
  notification.className = `game-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">${message}</div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
  
  // Add close event
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    });
  }
} 