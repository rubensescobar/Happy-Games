let user = document.querySelector('#username');
let senha = document.querySelector('#password');
const btnLogin = document.getElementById('login');

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in using auth module
    if (window.auth && window.auth.isUserLoggedIn()) {
        // Redirect to home or previous page
        redirectAfterLogin();
        return;
    }

    // Login Form Submission
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // Signup Form Submission
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
    }

    // Activate tab based on URL hash if present
    const hash = window.location.hash;
    if (hash === '#signup') {
        const signupTab = document.getElementById('signup-tab');
        if (signupTab) {
            const tabInstance = new bootstrap.Tab(signupTab);
            tabInstance.show();
        }
    }

    // Toggle password visibility
    setupPasswordToggles();
});

// Setup password visibility toggles
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
}

// Toggle password visibility
function togglePasswordVisibility(inputId, iconElement) {
    const passwordInput = document.getElementById(inputId);
    if (!passwordInput) return;
    
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    iconElement.classList.toggle('fa-eye');
    iconElement.classList.toggle('fa-eye-slash');
}

// Handle Login Form Submission
function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validate inputs
    if (!username || !password) {
        showAlert('Erro', 'Por favor, preencha todos os campos.', 'error');
        return;
    }

    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => (u.username === username || u.email === username) && u.password === password);

    if (user) {
        // Save login state with new keys
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // For backward compatibility
        localStorage.setItem('isLogged', 'true');
        localStorage.setItem('nomeUsuario', user.firstName || user.username);
        
        // Set expiration if remember me is not checked
        if (!rememberMe) {
            const expiration = new Date();
            expiration.setHours(expiration.getHours() + 2); // 2 hour expiration
            localStorage.setItem('loginExpiration', expiration.toString());
        } else {
            localStorage.removeItem('loginExpiration');
        }

        // Initialize XP if not already done
        if (!localStorage.getItem('userXP')) {
            localStorage.setItem('userXP', '0');
            localStorage.setItem('userLevel', '1');
        }
        
        showAlert('Sucesso', 'Login realizado com sucesso!', 'success', function() {
            // Redirect to home page or previous page
            redirectAfterLogin();
        });
    } else {
        showAlert('Erro', 'Nome de usuário ou senha incorretos.', 'error');
    }
}

// Handle Sign Up Form Submission
function handleSignup() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate inputs
    if (!firstName || !lastName || !email || !password) {
        showAlert('Erro', 'Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Erro', 'As senhas não coincidem.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Erro', 'A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }
    
    // Validate email format
    if (!validateEmail(email)) {
        showAlert('Erro', 'Por favor, insira um email válido.', 'error');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.email === email)) {
        showAlert('Erro', 'Este email já está em uso.', 'error');
        return;
    }
    
    // Create new user
    const username = firstName.toLowerCase() + Math.floor(Math.random() * 1000); // Generate simple username
    const newUser = {
        firstName,
        lastName,
        email,
        username,
        password,
        dateJoined: new Date().toISOString(),
        wishlist: [],
        purchaseHistory: []
    };
    
    // Add to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Initialize XP for new user
    localStorage.setItem('userXP', '100'); // Bonus XP for signing up
    localStorage.setItem('userLevel', '1');
    
    showAlert('Sucesso', 'Conta criada com sucesso! Você ganhou 100 XP de bônus.', 'success', function() {
        // Automatically log in the new user
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // For backward compatibility
        localStorage.setItem('isLogged', 'true');
        localStorage.setItem('nomeUsuario', newUser.firstName);
        
        // Redirect to home page after successful registration
        redirectAfterLogin();
    });
}

// Helper function to validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Helper function to display alerts with SweetAlert2
function showAlert(title, message, type, callback) {
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
}

// Redirect after login or signup
function redirectAfterLogin() {
    // Check for a redirect parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    
    if (redirect) {
        // Decode the URL and redirect
        window.location.href = decodeURIComponent(redirect);
    } else {
        // Default redirect to home
        window.location.href = '../index.html';
    }
}