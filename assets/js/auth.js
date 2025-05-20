/**
 * Auth Module - Handles all authentication features across the application
 * Combines functionality from auth.js, login.js, and login-validation.js
 */

// Constants for localStorage keys
const AUTH_KEYS = {
  USERS: 'buscaGames_users',
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
  
  // Set up login form handler
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', validateLoginCredentials);
  }
  
  // Set up registration form handler
  const signupBtn = document.getElementById('signupBtn');
  if (signupBtn) {
    // Remove any previous listeners and add our own
    signupBtn.removeEventListener('click', validateRegistrationForm);
    signupBtn.addEventListener('click', validateRegistrationForm);
  }
  
  // Setup password toggles
  setupPasswordToggles();
  
  // Check if restricted page access should be enforced
  checkRestrictedAccess();
  
  // Activate tab based on URL hash if present
  const hash = window.location.hash;
  if (hash === '#signup') {
    const signupTab = document.getElementById('signup-tab');
    if (signupTab) {
      const tabInstance = new bootstrap.Tab(signupTab);
      tabInstance.show();
    }
  }
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
 * Validate login credentials
 */
function validateLoginCredentials() {
  // Get login form data
  const usernameField = document.getElementById('loginUsername');
  const passwordField = document.getElementById('loginPassword');
  const rememberMeField = document.getElementById('rememberMe');
  
  const username = usernameField.value.trim();
  const password = passwordField.value;
  const rememberMe = rememberMeField ? rememberMeField.checked : false;
  
  // Reset validation states
  resetValidationStates();
  
  // Validate input fields
  let isValid = true;
  
  if (!username) {
    usernameField.classList.add('is-invalid');
    isValid = false;
  } else {
    usernameField.classList.add('is-valid');
  }
  
  if (!password) {
    passwordField.classList.add('is-invalid');
    isValid = false;
  } else {
    passwordField.classList.add('is-valid');
  }
  
  // Stop if basic validation failed
  if (!isValid) {
    return false;
  }
  
  // Retrieve registered users from localStorage
  const users = JSON.parse(localStorage.getItem(AUTH_KEYS.USERS)) || [];
  
  // Check if user exists and password matches
  const user = users.find(user => 
    (user.username === username || user.email === username) && 
    user.password === password
  );
  
  if (user) {
    // Login successful
    loginUser(user, rememberMe);
    return true;
  } else {
    // Login failed - both fields are invalid (credentials don't match)
    usernameField.classList.remove('is-valid');
    usernameField.classList.add('is-invalid');
    passwordField.classList.remove('is-valid');
    passwordField.classList.add('is-invalid');
    
    // Show error message
    showMessage('Acesso Negado', 'Nome de usuário ou senha incorretos.', 'error');
    return false;
  }
}

/**
 * Login user with provided credentials
 * @param {Object} user User object with credentials
 * @param {boolean} rememberMe Whether to remember the login
 */
function loginUser(user, rememberMe = false) {
  // Store current user data
  localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(user));
  localStorage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'true');
  
  // For compatibility with existing system
  localStorage.setItem('isLogged', 'true');
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('nomeUsuario', user.firstName);
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  // Set expiration if remember me is not checked
  if (!rememberMe) {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 2); // 2 hour expiration
    localStorage.setItem(AUTH_KEYS.LOGIN_EXPIRATION, expiration.toString());
  } else {
    localStorage.removeItem(AUTH_KEYS.LOGIN_EXPIRATION);
  }
  
  // Initialize XP if not already done
  if (!localStorage.getItem(AUTH_KEYS.USER_XP)) {
    localStorage.setItem(AUTH_KEYS.USER_XP, '0');
    localStorage.setItem(AUTH_KEYS.USER_LEVEL, '1');
  }
  
  // Show success message and redirect
  showMessage('Bem-vindo', `Login realizado com sucesso, ${user.firstName}!`, 'success', redirectAfterLogin);
}

/**
 * Validate registration data and register a new user
 */
function validateRegistrationForm() {
  // Get registration form fields
  const firstNameField = document.getElementById('firstName');
  const lastNameField = document.getElementById('lastName');
  const emailField = document.getElementById('signupEmail');
  const passwordField = document.getElementById('signupPassword');
  const confirmPasswordField = document.getElementById('confirmPassword');
  
  // Get field values
  const firstName = firstNameField.value.trim();
  const lastName = lastNameField.value.trim();
  const email = emailField.value.trim();
  const password = passwordField.value;
  const confirmPassword = confirmPasswordField.value;
  
  // Reset validation states
  resetValidationStates();
  
  // Validate individual fields
  let isValid = true;
  
  // First name validation
  if (!firstName) {
    firstNameField.classList.add('is-invalid');
    isValid = false;
  } else {
    firstNameField.classList.add('is-valid');
  }
  
  // Last name validation
  if (!lastName) {
    lastNameField.classList.add('is-invalid');
    isValid = false;
  } else {
    lastNameField.classList.add('is-valid');
  }
  
  // Email validation
  if (!email) {
    emailField.classList.add('is-invalid');
    isValid = false;
  } else if (!isValidEmail(email)) {
    emailField.classList.add('is-invalid');
    isValid = false;
  } else {
    emailField.classList.add('is-valid');
  }
  
  // Password validation
  if (!password) {
    passwordField.classList.add('is-invalid');
    isValid = false;
  } else if (password.length < 6) {
    passwordField.classList.add('is-invalid');
    isValid = false;
  } else {
    passwordField.classList.add('is-valid');
  }
  
  // Confirm password validation
  if (!confirmPassword) {
    confirmPasswordField.classList.add('is-invalid');
    isValid = false;
  } else if (password !== confirmPassword) {
    confirmPasswordField.classList.add('is-invalid');
    isValid = false;
  } else {
    confirmPasswordField.classList.add('is-valid');
  }
  
  // Stop if basic validation failed
  if (!isValid) {
    return false;
  }
  
  // Retrieve existing users
  const users = JSON.parse(localStorage.getItem(AUTH_KEYS.USERS)) || [];
  
  // Check if user with email already exists
  if (users.some(user => user.email === email)) {
    emailField.classList.remove('is-valid');
    emailField.classList.add('is-invalid');
    showMessage('Erro', 'Este email já está cadastrado.', 'error');
    return false;
  }
  
  // Generate unique username based on first name
  const baseUsername = firstName.toLowerCase().replace(/\s+/g, '');
  let username = baseUsername;
  let counter = 1;
  
  // Ensure username is unique
  while (users.some(user => user.username === username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  // Create new user object
  const newUser = {
    id: generateUserId(),
    firstName,
    lastName,
    email,
    username,
    password,
    registeredAt: new Date().toISOString(),
    wishlist: [],
    purchaseHistory: []
  };
  
  // Add user to registered users
  users.push(newUser);
  
  // Save updated users array
  localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
  
  // Initialize XP for new user
  localStorage.setItem(AUTH_KEYS.USER_XP, '100'); // Bonus XP for signing up
  localStorage.setItem(AUTH_KEYS.USER_LEVEL, '1');
  
  // Show success message
  showMessage('Sucesso', 'Cadastro realizado com sucesso! Você ganhou 100 XP de bônus.', 'success', function() {
    // Login the newly registered user
    loginUser(newUser, true);
  });
  
  return true;
}

/**
 * Reset all validation states on form fields
 */
function resetValidationStates() {
  // Get all form inputs
  const inputs = document.querySelectorAll('.form-control');
  
  // Remove validation classes
  inputs.forEach(input => {
    input.classList.remove('is-valid', 'is-invalid');
  });
}

/**
 * Check if current page requires authentication
 */
function checkRestrictedAccess() {
  const restrictedPages = ['profile.html', 'cart.html', 'quests.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (restrictedPages.includes(currentPage) && !isUserLoggedIn()) {
    // User is not logged in and trying to access a restricted page
    showMessage('Acesso Restrito', 'Você precisa estar logado para acessar esta página.', 'warning', function() {
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `login.html?redirect=${returnUrl}`;
    });
  }
}

/**
 * Setup password visibility toggles
 */
function setupPasswordToggles() {
  const toggleLoginPassword = document.getElementById('toggleLoginPassword');
  if (toggleLoginPassword) {
      toggleLoginPassword.addEventListener('click', function() {
          togglePasswordVisibility('loginPassword', this);
      });
  }

  const toggleSignupPassword = document.getElementById('toggleSignupPassword');
  if (toggleSignupPassword) {
      toggleSignupPassword.addEventListener('click', function() {
          togglePasswordVisibility('signupPassword', this);
      });
  }

  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  if (toggleConfirmPassword) {
      toggleConfirmPassword.addEventListener('click', function() {
          togglePasswordVisibility('confirmPassword', this);
      });
  }
}

/**
 * Toggle password visibility between text and password
 */
function togglePasswordVisibility(inputId, iconElement) {
  const passwordInput = document.getElementById(inputId);
  if (!passwordInput) return;
  
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  iconElement.classList.toggle('fa-eye');
  iconElement.classList.toggle('fa-eye-slash');
}

/**
 * Helper function to validate email format
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Generate unique user ID
 */
function generateUserId() {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * Display message to user using SweetAlert2 if available
 */
function showMessage(title, message, type, callback) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: title,
      text: message,
      icon: type,
      confirmButtonText: 'OK',
      confirmButtonColor: '#8B1A1A',
      background: 'var(--color-dark)',
      color: 'var(--color-white-cottom)',
      customClass: {
        popup: 'swal-custom-popup'
      }
    }).then(() => {
      if (callback) callback();
    });
  } else {
    alert(`${title}: ${message}`);
    if (callback) callback();
  }
}

/**
 * Redirect after login or signup
 */
function redirectAfterLogin() {
  // Check for a redirect parameter in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect');
  
  if (redirect) {
    // Decode the URL and redirect
    window.location.href = decodeURIComponent(redirect);
  } else {
    // Get the correct path to home
    const currentPath = window.location.pathname;
    const homePath = currentPath.includes('/pages/') ? '../index.html' : 'index.html';
    window.location.href = homePath;
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
  updateCartCount,
  validateLoginCredentials,
  validateRegistrationForm
}; 