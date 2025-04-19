let user = document.querySelector('#username');
let senha = document.querySelector('#password');
const btnLogin = document.getElementById('login');

btnLogin.addEventListener('click', () => {
    if (user.value === '' || senha.value === '') {
        alert('[ERRO] Verifique os dados e tente novamente!');
    } else if (senha.value.length < 6) {
        alert('[ERRO] A senha deve conter no mínimo 6 caracteres!');
    } else if (senha.value.length > 16) {
        alert('[ERRO] A senha deve conter no máximo 16 caracteres!');
    } else {
        alert(`LOGIN EFETUADO COM SUCESSO!\n Seja Bem-vindo de volta, ${user.value}`);

        // Salva o estado de login e o nome do usuário
        localStorage.setItem('isLogged', 'true');
        localStorage.setItem('nomeUsuario', user.value); // <-- CORRIGIDO

        // Troca ícone de login para ícone de usuário (caso esteja na mesma página)
        const loginIcon = document.getElementById('loginIcon');
        if (loginIcon) {
            loginIcon.classList.remove('fa-right-to-bracket');
            loginIcon.classList.add('fa-user');
        }

        // Redireciona após login
        setTimeout(function () {
            window.location.href = '../index.html';
        }, 2000);
    }
});
