/**
 * Auth Module - Handles authentication and user session across all pages
 * Provides a unified approach to login state management for Happy-Games
 */

// Constants for localStorage keys
const AUTH_KEYS = {
  IS_LOGGED_IN: 'isLoggedIn',
  CURRENT_USER: 'currentUser',
  LOGIN_EXPIRATION: 'loginExpiration',
  USER_LEVEL: 'userLevel',
  USER_XP: 'userXP',
  CART: 'gameCart'
};

// Initialize auth functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check login status on every page load
  checkLoginStatus();

  // Set up logout functionality
  setupLogoutHandler();
});

/**
 * Check if user is logged in and update UI accordingly
 */
function checkLoginStatus() {
  // Get login state using the new key
  const isLoggedIn = localStorage.getItem(AUTH_KEYS.IS_LOGGED_IN) === 'true';
  
  // Get UI elements
  const loginNavItem = document.getElementById('loginNavItem');
  const userDropdownContainer = document.getElementById('userDropdownContainer');
  const userLevelContainer = document.getElementById('userLevelContainer');
  const userDropdownName = document.getElementById('userDropdownName');
  
  // Check for login expiration
  if (isLoggedIn && localStorage.getItem(AUTH_KEYS.LOGIN_EXPIRATION)) {
    const now = new Date();
    const expiration = new Date(localStorage.getItem(AUTH_KEYS.LOGIN_EXPIRATION));
    
    if (now > expiration) {
      // Login expired, log out user
      logoutUser();
      return;
    }
  }
  
  if (isLoggedIn) {
    // User is logged in
    const currentUser = JSON.parse(localStorage.getItem(AUTH_KEYS.CURRENT_USER) || '{}');
    
    // Update username display
    if (userDropdownName) {
      userDropdownName.textContent = currentUser.firstName || currentUser.username || 'Usuário';
    }
    
    // Show/hide appropriate menu items
    if (loginNavItem) loginNavItem.classList.add('d-none');
    if (userDropdownContainer) userDropdownContainer.classList.remove('d-none');
    if (userLevelContainer) userLevelContainer.classList.remove('d-none');
    
    // Load user's XP and level info
    updateUserLevelDisplay();
    
    // Update cart count
    updateCartCount();
  } else {
    // User is not logged in
    
    // Show/hide appropriate menu items
    if (loginNavItem) loginNavItem.classList.remove('d-none');
    if (userDropdownContainer) userDropdownContainer.classList.add('d-none');
    if (userLevelContainer) userLevelContainer.classList.add('d-none');
  }
}

/**
 * Set up the logout handler on the logout link
 */
function setupLogoutHandler() {
  const logoutLink = document.getElementById('userDropdownLogoutLink');
  
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      logoutUser();
    });
  }
}

/**
 * Log out the current user
 */
function logoutUser() {
  // Clear auth data from localStorage
  localStorage.removeItem(AUTH_KEYS.IS_LOGGED_IN);
  localStorage.removeItem(AUTH_KEYS.CURRENT_USER);
  localStorage.removeItem(AUTH_KEYS.LOGIN_EXPIRATION);
  
  // For backward compatibility
  localStorage.removeItem('isLogged');
  localStorage.removeItem('nomeUsuario');
  
  // Show logout message
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      icon: 'success',
      title: 'Logout realizado com sucesso!',
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: 'swal-custom-popup'
      }
    }).then(() => {
      window.location.reload();
    });
  } else {
    alert('Logout realizado com sucesso!');
    window.location.reload();
  }
}

/**
 * Update the level and XP display in the navbar
 */
function updateUserLevelDisplay() {
  const userLevel = parseInt(localStorage.getItem(AUTH_KEYS.USER_LEVEL)) || 1;
  const userXP = parseInt(localStorage.getItem(AUTH_KEYS.USER_XP)) || 0;
  const xpNeeded = userLevel * 100; // Simple XP calculation
  
  // Update level
  const userLevelEl = document.getElementById('userLevel');
  if (userLevelEl) {
    userLevelEl.textContent = userLevel;
  }
  
  // Update XP bar
  const userXpBarEl = document.getElementById('userXpBar');
  if (userXpBarEl) {
    const percentage = (userXP % xpNeeded) / xpNeeded * 100;
    userXpBarEl.style.width = `${percentage}%`;
  }
  
  // Update XP text
  const userXpTextEl = document.getElementById('userXpText');
  if (userXpTextEl) {
    const xpToNext = xpNeeded - (userXP % xpNeeded);
    userXpTextEl.textContent = `${xpToNext} XP para o próximo nível`;
  }
}

/**
 * Update the cart count badge in the navbar
 */
function updateCartCount() {
  const cartCountElement = document.querySelector('.cart-count');
  if (!cartCountElement) return;
  
  const cart = JSON.parse(localStorage.getItem(AUTH_KEYS.CART) || '[]');
  const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  
  cartCountElement.textContent = count;
  
  if (count > 0) {
    cartCountElement.classList.add('show');
  } else {
    cartCountElement.classList.remove('show');
  }
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
function isUserLoggedIn() {
  return localStorage.getItem(AUTH_KEYS.IS_LOGGED_IN) === 'true';
}

/**
 * Get the current logged in user
 * @returns {Object|null} User object or null if not logged in
 */
function getCurrentUser() {
  if (!isUserLoggedIn()) return null;
  return JSON.parse(localStorage.getItem(AUTH_KEYS.CURRENT_USER) || '{}');
}

/**
 * Require login to access certain features
 * @param {Function} callback Function to execute if user is logged in
 * @param {boolean} redirect Whether to redirect to login page if not logged in
 * @returns {boolean} True if user is logged in and callback was executed
 */
function requireLogin(callback, redirect = false) {
  if (isUserLoggedIn()) {
    if (typeof callback === 'function') {
      callback();
    }
    return true;
  } else {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'warning',
        title: 'Login Necessário',
        text: 'Você precisa estar logado para acessar este recurso.',
        confirmButtonText: 'Fazer Login',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'swal-custom-popup'
        }
      }).then((result) => {
        if (result.isConfirmed && redirect) {
          // Get correct login page path
          const loginPath = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
          window.location.href = loginPath;
        }
      });
    } else if (redirect) {
      const loginPath = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
      window.location.href = loginPath;
    }
    return false;
  }
}

// Export functions for use in other scripts
window.auth = {
  AUTH_KEYS,
  checkLoginStatus,
  isUserLoggedIn,
  getCurrentUser,
  requireLogin,
  logoutUser,
  updateUserLevelDisplay,
  updateCartCount
}; 