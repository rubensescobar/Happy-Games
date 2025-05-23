/**
 * Profile JavaScript
 * Handles user profile functionality for BuscaGames
 */

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  if (window.auth && !window.auth.isUserLoggedIn()) {
    // Redirect to login page
    window.auth.requireLogin(null, true);
    return;
  }
  
  // Initialize profile page
  initializeProfilePage();
  
  // Setup event listeners
  setupEventListeners();
});

// Initialize profile page
function initializeProfilePage() {
  // Load user data 
  loadUserData();
  
  // Load user game data
  loadUserGameData();
  
  // Load activity history
  loadActivityHistory();
  
  // Update achievements
  updateAchievements();
}

// Load user data from localStorage
function loadUserData() {
  const currentUser = window.auth ? window.auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Update profile header
  updateProfileHeader(currentUser);
  
  // Update profile forms
  populateProfileForms(currentUser);
}

// Update profile header with user info
function updateProfileHeader(user) {
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileJoinDate = document.getElementById('profileJoinDate');
  const profileAvatar = document.getElementById('profileAvatar');
  
  if (profileName) {
    profileName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário';
  }
  
  if (profileEmail) {
    profileEmail.textContent = user.email || 'usuario@exemplo.com';
  }
  
  if (profileJoinDate && user.dateJoined) {
    const joinDate = new Date(user.dateJoined);
    profileJoinDate.textContent = joinDate.toLocaleDateString('pt-BR');
  }
  
  // Set default avatar if none exists
  if (profileAvatar && !user.avatar) {
    profileAvatar.src = '../assets/images/avatar-default.png';
  }
}

// Populate profile forms with user data
function populateProfileForms(user) {
  // Personal information form
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const emailInput = document.getElementById('email');
  const usernameInput = document.getElementById('username');
  
  if (firstNameInput) firstNameInput.value = user.firstName || '';
  if (lastNameInput) lastNameInput.value = user.lastName || '';
  if (emailInput) emailInput.value = user.email || '';
  if (usernameInput) usernameInput.value = user.username || '';
  
  // Address information
  const addressInput = document.getElementById('address');
  const cityInput = document.getElementById('city');
  const stateInput = document.getElementById('state');
  const zipInput = document.getElementById('zip');
  
  if (addressInput) addressInput.value = user.address || '';
  if (cityInput) cityInput.value = user.city || '';
  if (stateInput) stateInput.value = user.state || '';
  if (zipInput) zipInput.value = user.zip || '';
}

// Load user game data
function loadUserGameData() {
  const userLevel = parseInt(localStorage.getItem('userLevel')) || 1;
  const userXP = parseInt(localStorage.getItem('userXP')) || 0;
  const xpNeeded = userLevel * 100;
  const xpPercentage = (userXP % xpNeeded) / xpNeeded * 100;
  
  // Update level and XP in profile
  const profileLevel = document.getElementById('profileLevel');
  const profileXP = document.getElementById('profileXP');
  const profileXPBar = document.getElementById('profileXPBar');
  
  if (profileLevel) profileLevel.textContent = userLevel;
  if (profileXP) profileXP.textContent = `${userXP % xpNeeded} / ${xpNeeded} XP`;
  if (profileXPBar) profileXPBar.style.width = `${xpPercentage}%`;
  
  // Load wishlist
  loadWishlist();
  
  // Load purchase history
  loadPurchaseHistory();
}

// Load user wishlist
function loadWishlist() {
  const wishlistContainer = document.getElementById('wishlistItems');
  if (!wishlistContainer) return;
  
  const userProfile = window.getUserGameProfile(); // Get the unified user profile
  const wishlist = userProfile.wishlist || []; // Access the wishlist array from the profile
  
  if (wishlist.length === 0) {
    wishlistContainer.innerHTML = '<p class="empty-list-message">Sua lista de desejos está vazia</p>';
    return;
  }
  
  // For demo purposes, create placeholder items
  let wishlistHTML = '';
  
  wishlist.forEach(gameId => {
    wishlistHTML += `
      <div class="wishlist-item">
        <div class="game-image">
          <img src="../assets/images/game${gameId}.png" alt="Game ${gameId}">
        </div>
        <div class="game-info">
          <h4>Jogo ${gameId}</h4>
          <div class="game-price">R$ 99.90</div>
        </div>
        <div class="wishlist-actions">
          <button class="btn btn-primary btn-sm"><i class="fas fa-shopping-cart"></i> Comprar</button>
          <button class="btn btn-outline-danger btn-sm remove-wishlist" data-id="${gameId}">
            <i class="fas fa-times"></i>
          </button>
        </div>
          </div>
        `;
  });
  
  wishlistContainer.innerHTML = wishlistHTML;
  
  // Add event listeners for wishlist removal
  document.querySelectorAll('.remove-wishlist').forEach(button => {
    button.addEventListener('click', function() {
      const gameId = this.getAttribute('data-id');
      removeFromWishlist(gameId);
      loadWishlist(); // Reload wishlist display
    });
  });
}

// Load purchase history
function loadPurchaseHistory() {
  const purchaseContainer = document.getElementById('purchaseHistory');
  if (!purchaseContainer) return;
  
  // Use buscaGamesCart instead of purchaseHistory for consistency across the site
  const cart = JSON.parse(localStorage.getItem('buscaGamesCart')) || [];
  const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
  
  // Combine cart data with purchase history for a complete view
  const purchases = purchaseHistory.length > 0 ? purchaseHistory : [];
  
  if (purchases.length === 0) {
    purchaseContainer.innerHTML = '<p class="empty-list-message">Você ainda não realizou nenhuma compra</p>';
    return;
  }
  
  let purchaseHTML = '';
  
  purchases.forEach((purchase, index) => {
    const date = new Date(purchase.date).toLocaleDateString('pt-BR');
    
    purchaseHTML += `
      <div class="purchase-item">
        <div class="purchase-header">
          <span class="purchase-id">Pedido #${(index + 1000).toString().padStart(6, '0')}</span>
          <span class="purchase-date">${date}</span>
          <span class="purchase-total">R$ ${purchase.total.toFixed(2)}</span>
        </div>
        <div class="purchase-games">
    `;
    
    purchase.items.forEach(item => {
      purchaseHTML += `
        <div class="purchase-game">
          <img src="${item.image || `../assets/images/game${item.id}.png`}" alt="${item.title}">
          <span>${item.title}</span>
          <span>${item.quantity}x</span>
          <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `;
    });
    
    purchaseHTML += `
        </div>
      </div>
    `;
  });
  
  purchaseContainer.innerHTML = purchaseHTML;
}

// Load activity history
function loadActivityHistory() {
  const activityContainer = document.getElementById('activityTimeline');
  if (!activityContainer) return;
  
  const activities = JSON.parse(localStorage.getItem('userActivity')) || [];
  
  // Get cart data to add purchase activities if not already recorded
  const buscaGamesCart = JSON.parse(localStorage.getItem('buscaGamesCart')) || [];
  
  if (activities.length === 0 && buscaGamesCart.length === 0) {
    activityContainer.innerHTML = '<p class="empty-list-message">Nenhuma atividade recente</p>';
    return;
  }
  
  let activityHTML = '';
  
  // Add cart items as purchase activities if they exist
  if (buscaGamesCart.length > 0) {
    buscaGamesCart.forEach(item => {
      activityHTML += `
        <div class="timeline-item">
          <div class="timeline-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="timeline-content">
            <h4>Jogo adicionado ao carrinho</h4>
            <p>Você adicionou <span class="highlight">${item.title}</span> ao carrinho</p>
            <div class="timeline-time">Recentemente</div>
          </div>
        </div>
      `;
    });
  }
  
  // Add existing recorded activities
  activities.slice(0, 5).forEach(activity => {
    const date = new Date(activity.date).toLocaleDateString('pt-BR');
    const time = new Date(activity.date).toLocaleTimeString('pt-BR');
    
    activityHTML += `
      <div class="timeline-item">
        <div class="timeline-icon">
          <i class="fas fa-${activity.icon || 'circle'}"></i>
        </div>
        <div class="timeline-content">
          <div class="timeline-message">${activity.message}</div>
          <div class="timeline-time">${date} às ${time}</div>
        </div>
      </div>
    `;
  });
  
  activityContainer.innerHTML = activityHTML;
}

// Update achievements display
function updateAchievements() {
  const achievementsContainer = document.getElementById('achievementsList');
  if (!achievementsContainer) return;
  
  const achievements = JSON.parse(localStorage.getItem('userAchievements')) || [];
  
  if (achievements.length === 0) {
    achievementsContainer.innerHTML = '<p class="empty-list-message">Nenhuma conquista desbloqueada</p>';
    return;
  }
  
  let achievementsHTML = '';
  
  achievements.forEach(achievement => {
    achievementsHTML += `
      <div class="achievement-item ${achievement.unlocked ? 'unlocked' : ''}">
        <div class="achievement-icon">
          <i class="fas fa-${achievement.icon || 'trophy'}"></i>
        </div>
        <div class="achievement-content">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
          <div class="achievement-xp">+${achievement.xp} XP</div>
        </div>
      </div>
    `;
  });
  
  achievementsContainer.innerHTML = achievementsHTML;
}

// Setup event listeners
function setupEventListeners() {
  // Profile form submission
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveProfileChanges();
    });
  }
  
  // Password form submission
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      changePassword();
    });
  }
  
  // Tab switching
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Update active tab
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Update active content
      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      
      // Add to browser history without page reload
      history.pushState(null, '', `#${tabId}`);
    });
  });
  
  // Initialize theme toggle button if it exists
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    console.log('Initializing theme toggle in profile.js');
    // Set initial icon based on current theme
    const currentTheme = localStorage.getItem('theme') || 
                        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Ensure click event is properly set up (just in case theme.js doesn't catch it)
    themeToggle.addEventListener('click', function() {
      console.log('Theme toggle clicked in profile.js');
      const currentTheme = localStorage.getItem('theme') || 
                          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      
      if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
      }
    });
  }
}

// Save profile changes
function saveProfileChanges() {
  // Get form values
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email').value;
  
  // Get current user
  let currentUser = window.auth ? window.auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Update user data
  currentUser.firstName = firstName;
  if (lastName) currentUser.lastName = lastName.value;
  currentUser.email = email;
  
  // Get address fields if they exist
  const address = document.getElementById('address');
  const city = document.getElementById('city');
  const state = document.getElementById('state');
  const zip = document.getElementById('zip');
  
  if (address) currentUser.address = address.value;
  if (city) currentUser.city = city.value;
  if (state) currentUser.state = state.value;
  if (zip) currentUser.zip = zip.value;
  
  // Save updated user data
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('nomeUsuario', firstName); // For backward compatibility
  
  // Show success message
  Swal.fire({
    title: 'Perfil Atualizado',
    text: 'Suas informações foram atualizadas com sucesso!',
    icon: 'success',
    confirmButtonText: 'OK'
  }).then(() => {
    // Reload user data
    loadUserData();
  });
}

// Change password
function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validate inputs
  if (!currentPassword || !newPassword || !confirmPassword) {
    Swal.fire({
      title: 'Erro',
      text: 'Por favor, preencha todos os campos.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  if (newPassword !== confirmPassword) {
    Swal.fire({
      title: 'Erro',
      text: 'A nova senha e a confirmação de senha não coincidem.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  if (newPassword.length < 6) {
    Swal.fire({
      title: 'Erro',
      text: 'A nova senha deve ter pelo menos 6 caracteres.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  // Get current user
  const currentUser = window.auth ? window.auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Verify current password
  if (currentUser.password !== currentPassword) {
    Swal.fire({
      title: 'Erro',
      text: 'A senha atual está incorreta.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  // Update user password
  currentUser.password = newPassword;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Update users array
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(user => user.email === currentUser.email);
  
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  // Show success message
  Swal.fire({
    title: 'Senha Alterada',
    text: 'Sua senha foi alterada com sucesso!',
    icon: 'success',
    confirmButtonText: 'OK'
  }).then(() => {
    // Clear password fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  });
}
