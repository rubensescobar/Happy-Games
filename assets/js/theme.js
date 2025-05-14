// Theme Switcher Functionality
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Create a style element to inject our overrides
  const styleElement = document.createElement('style');
  styleElement.id = 'theme-override-styles';
  document.head.appendChild(styleElement);
  
  // Function to update the injected styles
  function updateInjectedStyles(theme) {
    const styleSheet = styleElement.sheet;
    
    // Clear existing rules
    while (styleSheet.cssRules.length > 0) {
      styleSheet.deleteRule(0);
    }
    
    if (theme === 'light') {
      // Add light theme overrides with maximum specificity
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
      `, 0);
    }
  }
  
  // Function to set the theme
  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      }
      localStorage.setItem('theme', 'dark');
      
      // Remove any forced light mode styles on about-card
      const aboutCards = document.querySelectorAll('.about-card');
      aboutCards.forEach(card => {
        card.style.backgroundColor = '';
        card.style.background = '';
        card.style.backgroundImage = '';
      });
      
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      }
      localStorage.setItem('theme', 'light');
      
      // Directly set light mode styles on about-card
      const aboutCards = document.querySelectorAll('.about-card');
      aboutCards.forEach(card => {
        card.style.backgroundColor = '#f8f8f8';
        card.style.background = '#f8f8f8';
        card.style.backgroundImage = 'none';
        card.style.border = '1px solid #7e57c2';
      });
    }
    
    // Update the injected styles
    updateInjectedStyles(theme);
  }
  
  // Check for saved user preference, if any
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme) {
    // If we have a saved preference, use it
    setTheme(savedTheme);
  } else {
    // If no saved preference, check system preference
    if (prefersDarkScheme.matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }
  
  // Toggle theme when button is clicked
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = localStorage.getItem('theme') || 
                          (prefersDarkScheme.matches ? 'dark' : 'light');
      
      if (currentTheme === 'dark') {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    });
  }
  
  // Listen for changes in system preference
  prefersDarkScheme.addEventListener('change', function(e) {
    const savedTheme = localStorage.getItem('theme');
    
    // Only apply system preference if user hasn't set a preference
    if (!savedTheme) {
      if (e.matches) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    }
  });
  
  // Apply theme again to handle elements that may load after initial DOM content loaded
  window.addEventListener('load', function() {
    const currentTheme = localStorage.getItem('theme') || 
                        (prefersDarkScheme.matches ? 'dark' : 'light');
    setTheme(currentTheme);
  });
}); 