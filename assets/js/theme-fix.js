// Simple theme toggle fix
(function() {
  // Run on page load
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Theme fix script loaded');
    
    // Get theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) {
      console.error('Theme toggle button not found');
      return;
    }
    
    console.log('Theme toggle button found');
    
    // Get saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // Set initial theme
    applyTheme(currentTheme);
    
    // Add click handler
    themeToggle.addEventListener('click', function() {
      console.log('Theme toggle clicked');
      
      // Toggle theme
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
    
    // Set flag to indicate theme has been initialized
    window.themeInitialized = true;
  });
  
  // Function to apply theme
  function applyTheme(theme) {
    console.log('Applying theme:', theme);
    
    // Get theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    
    if (theme === 'dark') {
      // Apply dark theme
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      }
      localStorage.setItem('theme', 'dark');
    } else {
      // Apply light theme
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      }
      localStorage.setItem('theme', 'light');
    }
  }
})(); 