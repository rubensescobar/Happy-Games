document.addEventListener('DOMContentLoaded', function() {
  if (window.themeInitialized) {
    console.log('Theme already initialized, skipping');
    return;
  }
  
  const themeToggle = document.getElementById('themeToggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Style element for overrides
  const styleElement = document.createElement('style');
  styleElement.id = 'theme-override-styles';
  document.head.appendChild(styleElement);
  
  function updateInjectedStyles(theme) {
    const styleSheet = styleElement.sheet;
    while (styleSheet.cssRules.length > 0) styleSheet.deleteRule(0);
    
    if (theme === 'light') {
      styleSheet.insertRule(`
        html:root:not([data-theme="dark"]) .about-card {
          background-color: #f8f8f8 !important;
          background: #f8f8f8 !important;
          background-image: none !important;
          border: 1px solid #7e57c2 !important;
        }
      `, 0);
      styleSheet.insertRule(`
        html:root:not([data-theme="dark"]) .about-card::before {
          opacity: 0 !important;
          display: none !important;
        }
      `, 1);
    }
  }
  
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem('theme', 'dark');
      
      document.querySelectorAll('.about-card').forEach(card => {
        card.style.backgroundColor = '';
        card.style.background = '';
        card.style.backgroundImage = '';
        card.style.border = '';
      });
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      localStorage.setItem('theme', 'light');
      
      document.querySelectorAll('.about-card').forEach(card => {
        card.style.backgroundColor = '#f8f8f8';
        card.style.background = '#f8f8f8';
        card.style.backgroundImage = 'none';
        card.style.border = '1px solid #7e57c2';
      });
    }
    updateInjectedStyles(theme);
    console.log('Theme applied:', theme);
  }
  
  // Inicializa tema conforme localStorage ou preferencia do sistema
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme(prefersDarkScheme.matches ? 'dark' : 'light');
  }
  
  // Listener do botão
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
  
  // Escuta mudanças na preferencia do sistema
  prefersDarkScheme.addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
  
  // Aplica novamente ao carregar tudo para garantir
  window.addEventListener('load', () => {
    const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    applyTheme(currentTheme);
  });
  
  window.themeInitialized = true;
});
