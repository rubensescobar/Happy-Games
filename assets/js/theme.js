// Theme Switcher Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check if theme has already been initialized by theme-fix.js
  if (window.themeInitialized) {
    console.log('Theme already initialized by theme-fix.js, skipping initialization');
    return;
  }

  const themeToggle = document.getElementById('themeToggle');
  console.log('Theme toggle element found:', themeToggle); // Debug
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Create a style element to inject our overrides
  const styleElement = document.createElement('style');
  styleElement.id = 'theme-override-styles';
  document.head.appendChild(styleElement);
  
  // Function to update the injected styles
  function updateInjectedStyles(theme) {
    console.log('Updating injected styles for theme:', theme); // Debug
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
    console.log('Setting theme to:', theme); // Debug
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      console.log('Applied dark theme attribute'); // Debug
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
      console.log('Removed dark theme attribute'); // Debug
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
  console.log('Saved theme from localStorage:', savedTheme); // Debug
  
  if (savedTheme) {
    // If we have a saved preference, use it
    setTheme(savedTheme);
  } else {
    // If no saved preference, check system preference
    console.log('No saved theme, using system preference, dark mode preferred:', prefersDarkScheme.matches); // Debug
    if (prefersDarkScheme.matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }
  
  // Toggle theme when button is clicked
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      console.log('Theme toggle clicked'); // Debug
      const currentTheme = localStorage.getItem('theme') || 
                          (prefersDarkScheme.matches ? 'dark' : 'light');
      console.log('Current theme before toggle:', currentTheme); // Debug
      
      if (currentTheme === 'dark') {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    });
  } else {
    console.error('Theme toggle button not found in the DOM'); // Debug
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
    console.log('Window load event fired'); // Debug
    const currentTheme = localStorage.getItem('theme') || 
                        (prefersDarkScheme.matches ? 'dark' : 'light');
    setTheme(currentTheme);
  });
}); 