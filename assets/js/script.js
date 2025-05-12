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

    // Check login status and update UI
    checkLoginStatus();

    // Handle contact form submission
    setupContactForm();
});

// Check login status and update UI
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("isLogged") === "true";
    const storedUserName = localStorage.getItem("nomeUsuario");
    const loginIcon = document.getElementById("loginIcon");
    const userNameSpan = document.getElementById("nomeUsuario") || document.getElementById("userMenuName");
    const loginNavItem = document.getElementById("loginNavItem");
    const logoutNavItem = document.getElementById("logoutNavItem");
    const userLevelContainer = document.getElementById("userLevelContainer");
    const logoutLink = document.getElementById("logoutLink");
    const loginLink = loginIcon?.closest("a");

    // Get login href based on current path
    function getLoginHref() {
        const path = window.location.pathname;
        if (path === "/" || path.endsWith("index.html")) {
            return "pages/login.html";
        }
        return "login.html";
    }
  
    // Set login link href
    if (loginLink) {
        loginLink.setAttribute("href", getLoginHref());
    }
  
    if (isLoggedIn) {
        // Update login icon and username
        if (loginIcon) {
            loginIcon.classList.remove("fa-right-to-bracket");
            loginIcon.classList.add("fa-user");
        }
      
        if (userNameSpan) {
            userNameSpan.textContent = storedUserName;
        }
      
        // Show/hide appropriate menu items
        if (loginNavItem) loginNavItem.classList.add("d-none");
        if (logoutNavItem) logoutNavItem.classList.remove("d-none");
        if (userLevelContainer) userLevelContainer.classList.remove("d-none");
        
        // Load user game profile data if available
        loadUserGameProfile();
    } else {
        // Update login icon and text
        if (loginIcon) {
            loginIcon.classList.remove("fa-user");
            loginIcon.classList.add("fa-right-to-bracket");
        }
        
        if (userNameSpan) {
            userNameSpan.textContent = "Login";
        }
        
        // Show/hide appropriate menu items
        if (loginNavItem) loginNavItem.classList.remove("d-none");
        if (logoutNavItem) logoutNavItem.classList.add("d-none");
        if (userLevelContainer) userLevelContainer.classList.add("d-none");
    }

    // Set up logout functionality
    if (logoutLink) {
        logoutLink.addEventListener("click", e => {
            e.preventDefault();

            localStorage.removeItem("isLogged");
            localStorage.removeItem("nomeUsuario");

            // Show success message using SweetAlert if available
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Logout realizado com sucesso!',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'swal-custom-popup'
                    }
                }).then(() => {
                    location.reload();
                });
            } else {
                location.reload();
            }
        });
    }
}

// Load user game profile data
function loadUserGameProfile() {
    // Get user profile from localStorage
    const userProfile = JSON.parse(localStorage.getItem('userGameProfile') || '{"level": 1, "xp": 0}');
    
    // Update level display
    const userLevelEl = document.getElementById('userLevel');
    if (userLevelEl) {
        userLevelEl.textContent = userProfile.level || 1;
    }
    
    // Update XP bar
    const userXpBarEl = document.getElementById('userXpBar');
    if (userXpBarEl) {
        const xpProgress = userProfile.xp % 100;
        userXpBarEl.style.width = `${xpProgress}%`;
    }
    
    // Update XP text
    const userXpTextEl = document.getElementById('userXpText');
    if (userXpTextEl) {
        const xpToNext = 100 - (userProfile.xp % 100);
        userXpTextEl.textContent = `${xpToNext} XP para o próximo nível`;
    }
    
    // Update cart count
    updateCartCount();
}

// Update cart count badge
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return;
    
    const cart = JSON.parse(localStorage.getItem('gameCart') || '[]');
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElement.textContent = itemCount;
    
    if (itemCount > 0) {
        cartCountElement.classList.add('show');
    } else {
        cartCountElement.classList.remove('show');
    }
}

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
                Swal.fire({
                    icon: "error",
                    title: "Campos obrigatórios",
                    html: "Por favor, preencha corretamente os campos:<br><br>" + validationMessage,
                    customClass: {
                        confirmButton: "btn btn-danger",
                    },
                    buttonsStyling: false,
                });
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Mensagem enviada!",
                    text: "Obrigado pelo contato. Retornaremos em breve!",
                    customClass: {
                        confirmButton: "btn btn-danger",
                    },
                    buttonsStyling: false,
                }).then(() => {
                    contactForm.reset();
                });
            }
        });
    }
}

// Validações auxiliares
function checkPasswordMinLength(inputElement) {
    if (inputElement.value !== "") {
        if (inputElement.value.length < 8) {
            const toast = Swal.mixin({
                toast: true,
                position: "center",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: (toastInstance) => {
                    toastInstance.addEventListener("mouseenter", Swal.stopTimer);
                    toastInstance.addEventListener("mouseleave", Swal.resumeTimer);
                },
            });
            toast.fire({
                icon: "error",
                title: "A nova senha deve ter no mínimo 8 caracteres!",
            });
            inputElement.value = "";
            inputElement.focus();
        }
    }
}

function validateRegistration() {
    let message = "";
    const firstNameInput = document.getElementById("first_name");
    const lastNameInput = document.getElementById("last_name");
    const emailInput = document.getElementById("email");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    const firstName = firstNameInput?.value || "";
    const lastName = lastNameInput?.value || "";
    const email = emailInput?.value || "";
    const newPassword = newPasswordInput?.value || "";
    const confirmPassword = confirmPasswordInput?.value || "";

    if (firstName === "") message += "- Nome<br>";
    if (lastName === "") message += "- Sobrenome<br>";
    if (email === "") message += "- Email<br>";
    if (newPassword === "") message += "- Senha<br>";
    if (confirmPassword === "") message += "- Confirmar Senha<br>";

    if (message !== "") {
        Swal.fire({
            icon: "error",
            title: "Dados Incompletos!",
            html: "Por favor, preencha os seguintes campos:<br><br>" + message,
            customClass: {
                confirmButton: "btn btn-danger",
            },
            buttonsStyling: false,
        });
    } else if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: "error",
            title: "As senhas não coincidem",
            text: "A nova senha e a confirmação de senha não são iguais.",
            customClass: {
                confirmButton: "btn btn-danger",
            },
            buttonsStyling: false,
        });
    } else {
        // Create user profile
        let userGameProfile = JSON.parse(localStorage.getItem('userGameProfile') || '{}');
        
        if (!userGameProfile.level) {
            userGameProfile = {
                level: 1,
                xp: 0,
                wishlist: [],
                library: [],
                achievements: [],
                hasPersonalInfo: true,
                joinDate: new Date().toISOString()
            };
        }
        
        // Set login information
        localStorage.setItem('isLogged', 'true');
        localStorage.setItem('nomeUsuario', firstName);
        localStorage.setItem('userGameProfile', JSON.stringify(userGameProfile));
        
        // Show success message
        Swal.fire({
            icon: "success",
            title: "Cadastro Realizado!",
            text: `Bem-vindo(a) ao BuscaGames, ${firstName}!`,
            customClass: {
                confirmButton: "btn btn-danger",
            },
            buttonsStyling: false,
        }).then(() => {
            window.location.href = '../index.html';
        });
    }
}

function validateEmail(inputElement) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (inputElement.value !== "") {
        if (!regex.test(inputElement.value)) {
            const toast = Swal.mixin({
                toast: true,
                position: "center",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                didOpen: (toastInstance) => {
                    toastInstance.addEventListener("mouseenter", Swal.stopTimer);
                    toastInstance.addEventListener("mouseleave", Swal.resumeTimer);
                },
            });
            toast.fire({
                icon: "error",
                title: "<center>E-mail inválido. <br>Insira um e-mail válido!</center>",
            });
            inputElement.value = "";
            setTimeout(() => {
                inputElement.focus();
            }, 1750);
        }
    }
}  