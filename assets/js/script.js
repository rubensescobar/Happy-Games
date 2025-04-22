document.addEventListener("DOMContentLoaded", function () {
    // Alternar visibilidade das senhas
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

    const isLoggedIn      = localStorage.getItem("isLogged") === "true";
    const storedUserName  = localStorage.getItem("nomeUsuario");
    const loginIcon       = document.getElementById("loginIcon");
    const userNameSpan    = document.getElementById("nomeUsuario");
    const loginNavItem    = document.getElementById("loginNavItem");
    const logoutNavItem   = document.getElementById("logoutNavItem");
    const logoutLink      = document.getElementById("logoutLink");
    const loginLink       = loginIcon?.closest("a");
  
    function getLoginHref() {
      const path = window.location.pathname;
      if (path === "/" || path.endsWith("index.html")) {
        return "pages/login.html";
      }
      return "login.html";
    }
  
    if (loginLink) {
      loginLink.setAttribute("href", getLoginHref());
    }
  
    if (isLoggedIn) {
      loginIcon?.classList.replace("fa-right-to-bracket", "fa-user");
      if (userNameSpan) {
        userNameSpan.textContent = storedUserName;
      }
      loginNavItem && (loginNavItem.style.display = "block");
      logoutNavItem && (logoutNavItem.style.display = "block");
    } else {
      loginIcon?.classList.replace("fa-user", "fa-right-to-bracket");
      
      if (userNameSpan) {
        userNameSpan.textContent = "Login";
      }
      loginNavItem && (loginNavItem.style.display = "block");
      logoutNavItem && (logoutNavItem.style.display = "none");
    }
  
    if (logoutLink) {
      logoutLink.addEventListener("click", e => {
        e.preventDefault();

        localStorage.removeItem("isLogged");
        localStorage.removeItem("nomeUsuario");

        location.reload();
      });
    }

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
});

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
        document.querySelector("form")?.submit();
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