// Cart header item fix for light theme
(function() {
  // Apply fix immediately when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart header fix loaded');
    applyCartHeaderFix();
    
    // Also apply on window load
    window.addEventListener('load', applyCartHeaderFix);
    
    // Set up observer for theme changes
    setupObserver();
    
    // Apply again after a short delay to catch any race conditions
    setTimeout(applyCartHeaderFix, 100);
    setTimeout(applyCartHeaderFix, 500);
  });
  
  function applyCartHeaderFix() {
    // Check if light theme is active
    const isLightTheme = document.body.classList.contains('light-theme') || 
                        !document.documentElement.hasAttribute('data-theme');
    
    if (isLightTheme) {
      console.log('Applying cart header fix for light theme');
      
      // Get all cart header items
      const headerItems = document.querySelectorAll('.cart-header-item');
      
      // Apply styles directly
      headerItems.forEach(item => {
        item.style.cssText = 'color: var(--color-purpledark) !important; opacity: 0.9 !important;';
      });
    }
  }
  
  function setupObserver() {
    // Create observer to watch for theme changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function() {
        // Apply fix whenever classes or attributes change
        applyCartHeaderFix();
      });
    });
    
    // Watch for class changes on body (for body.light-theme)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Watch for data-theme attribute changes on html element
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    console.log('Set up observer for theme changes');
  }
})(); 