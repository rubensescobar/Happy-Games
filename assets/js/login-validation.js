/**
 * Login and Registration Validation
 * Handles user authentication independently from the game logic
 */

// Constants for localStorage keys
const AUTH_STORAGE_KEYS = {
  USERS: 'buscaGames_users', // Key for storing registered users
  CURRENT_USER: 'buscaGames_currentUser', // Key for current user data
  IS_LOGGED_IN: 'buscaGames_isLoggedIn' // Key for login state
};

// Initialize auth validation on page load
document.addEventListener('DOMContentLoaded', function() {
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
  
  // Check if restricted page access should be enforced
  checkRestrictedAccess();
});

/**
 * Validate login credentials
 */
function validateLoginCredentials() {
  // Get login form data
  const usernameField = document.getElementById('loginUsername');
  const passwordField = document.getElementById('loginPassword');
  const username = usernameField.value.trim();
  const password = passwordField.value;
  
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
  const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.USERS)) || [];
  
  // Check if user exists and password matches
  const user = users.find(user => 
    (user.username === username || user.email === username) && 
    user.password === password
  );
  
  if (user) {
    // Login successful
    loginUser(user);
    return true;
  } else {
    // Login failed - both fields are invalid (credentials don't match)
    usernameField.classList.remove('is-valid');
    usernameField.classList.add('is-invalid');
    passwordField.classList.remove('is-valid');
    passwordField.classList.add('is-invalid');
    
    // Show error message
    showValidationMessage('Acesso Negado', 'Nome de usuário ou senha incorretos.', 'error');
    return false;
  }
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
  const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.USERS)) || [];
  
  // Check if user with email already exists
  if (users.some(user => user.email === email)) {
    emailField.classList.remove('is-valid');
    emailField.classList.add('is-invalid');
    showValidationMessage('Erro', 'Este email já está cadastrado.', 'error');
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
    registeredAt: new Date().toISOString()
  };
  
  // Add user to registered users
  users.push(newUser);
  
  // Save updated users array
  localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Show success message
  showValidationMessage('Sucesso', 'Cadastro realizado com sucesso!', 'success', function() {
    // Login the newly registered user
    loginUser(newUser);
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
 * Login user with provided credentials
 * @param {Object} user User object with credentials
 */
function loginUser(user) {
  // Store current user data
  localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  localStorage.setItem(AUTH_STORAGE_KEYS.IS_LOGGED_IN, 'true');
  
  // For compatibility with existing system
  localStorage.setItem('isLogged', 'true');
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('nomeUsuario', user.firstName);
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  // Show success message and redirect
  showValidationMessage('Bem-vindo', `Login realizado com sucesso, ${user.firstName}!`, 'success', function() {
    // Redirect after login
    redirectAfterLogin();
  });
}

/**
 * Log out the current user
 */
function logoutUser() {
  // Clear auth data
  localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(AUTH_STORAGE_KEYS.IS_LOGGED_IN);
  
  // For compatibility with existing system
  localStorage.removeItem('isLogged');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('nomeUsuario');
  localStorage.removeItem('currentUser');
  
  // Reload the page to update UI
  window.location.reload();
}

/**
 * Check if current page is restricted and user is logged in
 */
function checkRestrictedAccess() {
  // List of restricted pages that require login
  const restrictedPages = [
    'profile.html',
    'cart.html',
    'wishlist.html',
    'library.html'
  ];
  
  // Get current page filename
  const currentPage = window.location.pathname.split('/').pop();
  
  // Check if current page is restricted
  if (restrictedPages.includes(currentPage)) {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem(AUTH_STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    
    if (!isLoggedIn) {
      // Redirect to login page with a return URL
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `login.html?redirect=${returnUrl}`;
    }
  }
}

/**
 * Validate email format
 * @param {string} email Email to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a unique user ID
 * @returns {string} Unique ID
 */
function generateUserId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Display validation message to user
 * @param {string} title Title of the message
 * @param {string} message Message content
 * @param {string} type Type of message (success, error, info, warning)
 * @param {Function} callback Optional callback after message is closed
 */
function showValidationMessage(title, message, type, callback) {
  if (typeof Swal !== 'undefined') {
    // Use SweetAlert2 if available
    Swal.fire({
      title: title,
      text: message,
      icon: type,
      confirmButtonText: 'OK',
      confirmButtonColor: '#8B1A1A',
      background: 'var(--color-dark)',
      color: 'var(--color-white-cottom)'
    }).then(() => {
      if (callback) callback();
    });
  } else {
    // Fallback to regular alert
    alert(`${title}: ${message}`);
    if (callback) callback();
  }
}

/**
 * Redirect after login
 */
function redirectAfterLogin() {
  // Check if there's a redirect parameter in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect');
  
  if (redirect) {
    // Redirect to the requested page
    window.location.href = decodeURIComponent(redirect);
  } else {
    // Default redirect to homepage
    window.location.href = window.location.pathname.includes('/pages/') 
      ? '../index.html' 
      : 'index.html';
  }
}

/**
 * Check if a user is currently logged in
 * @returns {boolean} True if user is logged in
 */
function isUserLoggedIn() {
  return localStorage.getItem(AUTH_STORAGE_KEYS.IS_LOGGED_IN) === 'true';
}

/**
 * Get current logged in user data
 * @returns {Object|null} User object or null if not logged in
 */
function getCurrentUser() {
  if (!isUserLoggedIn()) return null;
  
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER));
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Export validation functions for use in other scripts
window.authValidation = {
  validateLoginCredentials,
  validateRegistrationForm,
  isUserLoggedIn,
  getCurrentUser,
  logoutUser,
  checkRestrictedAccess
}; 