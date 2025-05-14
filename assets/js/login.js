let user = document.querySelector('#username');
let senha = document.querySelector('#password');
const btnLogin = document.getElementById('login');

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        // Redirect to profile page or show logged in state
        updateUIForLoggedInUser();
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

    // Logout functionality
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
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
    const togglePasswordIcon = document.querySelector("#verNovaSenha");
    if (togglePasswordIcon) {
        togglePasswordIcon.addEventListener("click", function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
        });
    }
});

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
        // Save login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
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
            // Redirect to home page after successful login
            window.location.href = '../index.html';
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
        
        // Redirect to home page after successful registration
        window.location.href = '../index.html';
    });
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    showAlert('Sucesso', 'Logout realizado com sucesso!', 'success', function() {
        // Redirect to home page or refresh current page
        window.location.reload();
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

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const loginNavItem = document.getElementById('loginNavItem');
    const logoutNavItem = document.getElementById('logoutNavItem');
    
    if (loginNavItem && logoutNavItem) {
        loginNavItem.style.display = 'none';
        logoutNavItem.style.display = 'block';
    }
    
    // Check for login expiration
    const expirationTime = localStorage.getItem('loginExpiration');
    if (expirationTime) {
        const now = new Date();
        const expiration = new Date(expirationTime);
        
        if (now > expiration) {
            // Login expired, log out user
            handleLogout();
            return;
        }
    }
    
    // Display user name if on profile page
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        const userMenuName = document.getElementById('userMenuName');
        if (userMenuName) {
            userMenuName.textContent = currentUser.firstName;
        }
    }
}