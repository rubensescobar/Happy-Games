let user = document.querySelector('#username');
let senha = document.querySelector('#password');
const btnLogin = document.getElementById('login');

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('isLogged') === 'true') {
        // Show welcome back message
        Swal.fire({
            icon: 'info',
            title: 'Já Logado',
            text: `Você já está logado como ${localStorage.getItem('nomeUsuario')}!`,
            customClass: {
                confirmButton: 'btn btn-danger'
            },
            buttonsStyling: false
        }).then(() => {
            // Redirect to home or previous page
            const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
            window.location.href = returnUrl || '../index.html';
        });
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

btnLogin.addEventListener('click', () => {
    // Check if fields are empty
    if (user.value === '' || senha.value === '') {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Preencha os dados de login',
            customClass: {
                confirmButton: 'btn btn-danger'
            },
            buttonsStyling: false
        });
        return;
    } 
    
    // Check password length
    if (senha.value.length < 6) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'A senha deve conter no mínimo 6 caracteres',
            customClass: {
                confirmButton: 'btn btn-danger'
            },
            buttonsStyling: false
        });
        return;
    } 
    
    if (senha.value.length > 16) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'A senha deve conter no máximo 16 caracteres',
            customClass: {
                confirmButton: 'btn btn-danger'
            },
            buttonsStyling: false
        });
        return;
    }
    
    // In a real application, this would validate credentials with a server
    // For this demo, we'll just accept any valid format login
    
    // Show success message
    Swal.fire({
        icon: 'success',
        html: `<strong>Login realizado com sucesso!</strong><br><br>Seja bem-vindo de volta, ${user.value}!`,
        customClass: {
            confirmButton: 'btn btn-danger'
        },
        buttonsStyling: false
    });

    // Store user data in localStorage
    localStorage.setItem('isLogged', 'true');
    localStorage.setItem('nomeUsuario', user.value);
    
    // Create or update user profile
    let userGameProfile = JSON.parse(localStorage.getItem('userGameProfile') || '{}');
    
    // Initialize profile if it doesn't exist
    if (!userGameProfile.level) {
        userGameProfile = {
            level: 1,
            xp: 0,
            wishlist: [],
            library: [],
            achievements: [],
            joinDate: new Date().toISOString()
        };
    }
    
    // Save updated profile
    localStorage.setItem('userGameProfile', JSON.stringify(userGameProfile));

    // Update UI elements if present
    const loginIcon = document.getElementById('loginIcon');
    if (loginIcon) {
        loginIcon.classList.remove('fa-right-to-bracket');
        loginIcon.classList.add('fa-user');
    }

    // Redirect to home page after a short delay
    setTimeout(function() {
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        window.location.href = returnUrl || '../index.html';
    }, 2000);
});