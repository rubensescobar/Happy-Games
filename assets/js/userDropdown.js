/**
 * User Dropdown Menu functionality
 * Handles the dropdown toggle and conditional menu items based on current page
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the user dropdown
  initUserDropdown();
});

/**
 * Initialize the user dropdown functionality
 */
function initUserDropdown() {
  const userDropdownToggle = document.getElementById('userDropdownToggle');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  
  if (!userDropdownToggle || !userDropdownMenu) return;
  
  // Toggle dropdown when clicking the arrow
  userDropdownToggle.addEventListener('click', function(e) {
    e.preventDefault();
    userDropdownMenu.classList.toggle('show');
  });
  
  // Close the dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!userDropdownToggle.contains(e.target) && !userDropdownMenu.contains(e.target)) {
      userDropdownMenu.classList.remove('show');
    }
  });
  
  // Customize dropdown based on current page
  customizeDropdownForCurrentPage();
}

/**
 * Customize the dropdown menu based on current page
 */
function customizeDropdownForCurrentPage() {
  // Get the current page path
  const currentPath = window.location.pathname;
  const isProfilePage = currentPath.includes('profile.html');
  
  // Get the profile link element
  const profileLink = document.getElementById('userDropdownProfileLink');
  
  // If on profile page, hide the profile link
  if (isProfilePage && profileLink) {
    profileLink.style.display = 'none';
  }
} 