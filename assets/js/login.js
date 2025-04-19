let user = document.querySelector('#username');
let senha = document.querySelector('#password');
const btnLogin = document.getElementById('login');

btnLogin.addEventListener('click', () => {
    if (user.value === '' || senha.value === '') {
        Swal.fire({
            icon: 'error',
            title: 'Verifique os dados e tente novamente!',
            text: 'Preencha os dados de login',
            customClass: {
              confirmButton: 'btn btn-danger'
            },
            buttonsStyling: false
        });
    } else if (senha.value.length < 6) {
        Swal.fire({
            icon: 'error',
            title: 'Verifique os dados e tente novamente!',
            text: 'A senha deve conter no mínimo 6 caracteres',
            customClass: {
              confirmButton: 'btn btn-danger'
            },
            buttonsStyling: false
        });
    } else if (senha.value.length > 16) {
        Swal.fire({
            icon: 'error',
            title: 'Verifique os dados e tente novamente!',
            text: ' A senha deve conter no máximo 16 caracteres',
            customClass: {
              confirmButton: 'btn btn-danger'
            },
            buttonsStyling: false
        });
    } else {
        Swal.fire({
            icon: 'success',
            text: `LOGIN EFETUADO COM SUCESSO!\n\n Seja Bem-vindo de volta, ${user.value}!`,
            customClass: {
              confirmButton: 'btn btn-danger'
            },
            buttonsStyling: false
        });

        localStorage.setItem('isLogged', 'true');
        localStorage.setItem('nomeUsuario', user.value);

        const loginIcon = document.getElementById('loginIcon');
        if (loginIcon) {
            loginIcon.classList.remove('fa-right-to-bracket');
            loginIcon.classList.add('fa-user');
        }

        setTimeout(function () {
            window.location.href = '../index.html';
        }, 2000);
    }
});