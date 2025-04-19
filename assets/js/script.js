document.addEventListener("DOMContentLoaded", function () {
    const verNovaSenha = document.querySelector("#verNovaSenha");
    const verConfirmarNovaSenha = document.querySelector("#verConfirmarNovaSenha");
    const newpassword = document.querySelector("#newPassword");
    const confirmPassword = document.querySelector("#confirmPassword");
  
    if (verNovaSenha) {
      verNovaSenha.addEventListener("click", function () {
        const type = newpassword.getAttribute("type") === "password" ? "text" : "password";
        newpassword.setAttribute("type", type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
      });
    }
  
    if (verConfirmarNovaSenha) {
      verConfirmarNovaSenha.addEventListener("click", function () {
        const type = confirmPassword.getAttribute("type") === "password" ? "text" : "password";
        confirmPassword.setAttribute("type", type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
      });
    }
});

function checkMinCaracteres(input){
    if(input.value != ""){
        if(input.value.length < 8){
            const Toast = Swal.mixin({
                toast: true,
                position: 'center',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });
            Toast.fire({
                icon: 'error',
                title: 'A nova senha deve ter no mínimo 8 caracteres!'
            });
            input.value = '';
            input.focus();
        }
    }
}

function validateRegistration(){
    var Mensagem = "";
    var firstName = document.getElementById("first_name").value;
    var lastName = document.getElementById("last_name").value;
    var email = document.getElementById("email").value;
    var newpassword = document.getElementById("newPassword").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
  
    if (firstName == "") {
      Mensagem += "- Nome<br>";
    }
    if (lastName == "") {
        Mensagem += "- Sobrenome<br>";
    }
    if (email == "") {
      Mensagem += "- Email<br>";
    }
    if (newpassword == "") {
      Mensagem += "- Senha<br>";
    }
    if (confirmPassword == "") {
      Mensagem += "- Confirmar Senha<br>";
    }
    if (Mensagem !== "") {
      Swal.fire({
      icon: 'error',
      title: 'Dados Incompletos!',
      html: 'Por favor, preencha os seguintes campos:<br><br>' + Mensagem,
      customClass: {
        confirmButton: 'btn btn-danger'
      },
      buttonsStyling: false
      })
    } else {
      if (newpassword !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'As senhas não coincidem',
          text: 'A nova senha e a confirmação de senha não são iguais.',
          customClass: {
            confirmButton: 'btn btn-danger'
          },
          buttonsStyling: false
        });
      } else {
        form.submit();
      }
    }
}
  
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if(email.value != ''){
        if (!regex.test(email.value)) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'center',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });
            Toast.fire({
                icon: 'error',
                title: '<center>E-mail inválido. <br>Insira um e-mail válido!</center>'
            });
            email.value = '';
            setTimeout(function() {
                email.focus();
            }, 1750);
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const estouLogado = localStorage.getItem("isLogged");
    const nome = localStorage.getItem('nomeUsuario');
    const loginIcon = document.getElementById("loginIcon");
    const nomeSpan = document.getElementById('nomeUsuario');
    const loginLink = loginIcon?.closest("a"); // pega o <a> que envolve o ícone

    if (estouLogado === "true") {
        if (loginIcon) {
            loginIcon.classList.remove('fa-right-to-bracket');
            loginIcon.classList.add('fa-user');
        }

        if (nomeSpan) {
            nomeSpan.textContent = nome;
        }

        if (loginLink) {
            loginLink.setAttribute("href", "#"); // não redireciona
        }
    } else {
        if (loginLink) {
            loginLink.setAttribute("href", "/pages/login.html"); // redireciona para login
        }
    }
});