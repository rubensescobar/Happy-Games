// script.js - Basic functionality for the BuscaGames site

document.addEventListener('DOMContentLoaded', function() {
  // If the auth module is available, use it instead of local login check
  if (window.auth) {
    // The auth module will handle everything
    console.log('Using auth module for login state');
  } else {
    // Fallback to old login check method
    checkUserLogin();
  }
});

// Legacy function - only used if auth.js is not loaded
function checkUserLogin() {
  const loginNavItem = document.getElementById('loginNavItem');
  const logoutNavItem = document.getElementById('logoutNavItem');
  const userLevelContainer = document.getElementById('userLevelContainer');
  
  // Check local storage for login state using isLogged key
  const isLoggedIn = localStorage.getItem('isLogged') === 'true';
  
  if (isLoggedIn) {
    // User is logged in
    const userName = localStorage.getItem('nomeUsuario') || 'Usuário';
    
    // Update display
    if (loginNavItem) loginNavItem.classList.add('d-none');
    if (logoutNavItem) {
    logoutNavItem.classList.remove('d-none');
    const userMenuName = logoutNavItem.querySelector('#userMenuName');
    if (userMenuName) userMenuName.textContent = userName;
    }
    
    // Show XP level info
    if (userLevelContainer) userLevelContainer.classList.remove('d-none');
  } else {
    // User is not logged in
    if (loginNavItem) loginNavItem.classList.remove('d-none');
    if (logoutNavItem) logoutNavItem.classList.add('d-none');
    
    // Hide XP level info
    if (userLevelContainer) userLevelContainer.classList.add('d-none');
  }
}

// Function to save the game image as the Steam banner
function saveAsSteamBanner(gameId) {
  console.log(`Saving game ${gameId} banner for Steam`);
  // This would typically use a server-side API call
  alert('Imagem salva como banner do Steam!');
}

// Utility function to format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
}

document.addEventListener("DOMContentLoaded", function () {
    // Toggle password visibility
    const toggleNewPasswordIcon = document.querySelector("#verNovaSenha");
    const toggleConfirmPasswordIcon = document.querySelector("#verConfirmarNovaSenha");
    const newPasswordInput = document.querySelector("#newPassword");
    const confirmPasswordInput = document.querySelector("#confirmPassword");

    if (toggleNewPasswordIcon) {
        toggleNewPasswordIcon.addEventListener("click", function () {
            const type = newPasswordInput.getAttribute("type") === "password" ? "text" : "password";
            newPasswordInput.setAttribute("type", type);
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
        });
    }

    if (toggleConfirmPasswordIcon) {
        toggleConfirmPasswordIcon.addEventListener("click", function () {
            const type = confirmPasswordInput.getAttribute("type") === "password" ? "text" : "password";
            confirmPasswordInput.setAttribute("type", type);
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
        });
    }

    // Handle contact form submission
    setupContactForm();
});

// Set up contact form submission
function setupContactForm() {
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("contactName").value.trim();
            const email = document.getElementById("contactEmail").value.trim();
            const subject = document.getElementById("contactSubject").value.trim();
            const message = document.getElementById("contactMessage").value.trim();

            let validationMessage = "";

            if (!name) validationMessage += "- Nome<br>";
            if (!email) validationMessage += "- Email<br>";
            if (!subject) validationMessage += "- Assunto<br>";
            if (!message) validationMessage += "- Mensagem<br>";

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                validationMessage += "- E-mail inválido<br>";
            }

            if (validationMessage) {
                // Show error message
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Preencha todos os campos corretamente',
                        html: `Os seguintes campos estão incorretos:<br>${validationMessage}`,
                        confirmButtonText: 'Ok'
                    });
                } else {
                    alert(`Preencha todos os campos corretamente. Os seguintes campos estão incorretos:\n${validationMessage.replace(/<br>/g, '\n')}`);
                }
                return;
            }

            // Show success message
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Mensagem Enviada!',
                    text: 'Obrigado por entrar em contato. Retornaremos em breve.',
                    confirmButtonText: 'Ok'
                });
            } else {
                alert('Mensagem enviada! Obrigado por entrar em contato. Retornaremos em breve.');
            }

            // Reset form
            contactForm.reset();
        });
    }
}

// Check password minimum length (for registration page)
function checkPasswordMinLength(inputElement) {
    if (!inputElement) return;
    
    const value = inputElement.value;
    const minLength = 6;
    const messageElement = document.getElementById("password-strength");
    
    if (!messageElement) return;
    
    if (value.length < minLength) {
        messageElement.textContent = `A senha deve ter pelo menos ${minLength} caracteres`;
        messageElement.classList.add("text-danger");
        messageElement.classList.remove("text-success");
        return false;
    } else {
        messageElement.textContent = "Senha válida";
        messageElement.classList.remove("text-danger");
        messageElement.classList.add("text-success");
        return true;
    }
}

// Validate registration form
function validateRegistration() {
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const terms = document.getElementById("terms");
    
    let isValid = true;
    
    // Clear previous error messages
    document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
    
    // Validate name
    if (!name.value.trim()) {
        document.getElementById("name-error").textContent = "Por favor, insira seu nome";
        isValid = false;
    }
    
    // Validate email
    if (!validateEmail(email)) {
        document.getElementById("email-error").textContent = "Por favor, insira um e-mail válido";
        isValid = false;
    }
    
    // Validate password
    if (!checkPasswordMinLength(password)) {
        isValid = false;
    }
    
    // Validate terms
    if (terms && !terms.checked) {
        document.getElementById("terms-error").textContent = "Você precisa aceitar os termos";
        isValid = false;
    }
    
    if (isValid) {
        // Registration successful
        console.log("Registration validated, proceeding...");
        
        // Store user information (in a real app, this would be sent to the server)
        const userData = {
            name: name.value.trim(),
            email: email.value.trim(),
            registrationDate: new Date().toISOString()
        };
        
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("isLoggedIn", "true");
        
        // Show success message
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Registro concluído!',
                text: 'Seu cadastro foi realizado com sucesso.',
                confirmButtonText: 'Ok'
            }).then(() => {
                // Redirect to home or profile page
                window.location.href = "index.html";
            });
        } else {
            alert('Registro concluído! Seu cadastro foi realizado com sucesso.');
            window.location.href = "index.html";
        }
    }
    
    return isValid;
}

// Validate email format
function validateEmail(inputElement) {
    if (!inputElement) return false;
    
    const value = inputElement.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailRegex.test(value);
}  