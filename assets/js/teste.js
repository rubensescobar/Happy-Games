// Selecionando o botão de toggle e a sidebar
const toggleSidebarButton = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebarMenu");
const sidebarLinks = sidebar.querySelectorAll('a'); // Todos os links na sidebar

// Alternando a visibilidade da sidebar ao clicar no botão de menu
toggleSidebarButton.addEventListener("click", function () {
  sidebar.classList.toggle("show");
});

// Fechar a sidebar quando um link for clicado
sidebarLinks.forEach(link => {
  link.addEventListener("click", function () {
    sidebar.classList.remove("show");
  });
});



const categorias = document.querySelectorAll('.list-group-item');
const jogos = document.querySelectorAll('.jogo');

categorias.forEach(categoria => {
  categoria.addEventListener('click', (e) => {
    e.preventDefault();
    const generoSelecionado = categoria.getAttribute('data-genero');

    jogos.forEach(jogo => {
      const generos = jogo.getAttribute('data-generos').split(',');
      if (generos.includes(generoSelecionado)) {
        jogo.style.display = 'block';
      } else {
        jogo.style.display = 'none';
      }
    });
  });
});
