// Theme Switcher Functionality
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Function to set the theme
  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      }
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      }
      localStorage.setItem('theme', 'light');
    }
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
}); 