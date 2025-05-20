// A simple script to add theme functionality to all pages
// This is meant to be run with Node.js

const fs = require('fs');
const path = require('path');
const pagesDir = path.join(__dirname, 'pages');

// Get all HTML files in the pages directory
const htmlFiles = fs.readdirSync(pagesDir)
  .filter(file => file.endsWith('.html'));

// Process each HTML file
htmlFiles.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 1. Add theme.css to the head section if not already added
  if (!content.includes('href="../assets/CSS/theme.css"')) {
    content = content.replace(
      /(link rel="stylesheet" href="..\/assets\/CSS\/[^"]+\.css">)/,
      '$1\n  <link rel="stylesheet" href="../assets/CSS/theme.css">'
    );
    modified = true;
  }
  
  // 2. Add theme toggle button to navbar (before user level container) if not already added
  if (!content.includes('id="themeToggle"')) {
    content = content.replace(
      /<div class="navbar-nav ms-auto">\s+(?:<!-- User Level -->)/,
      `<div class="navbar-nav ms-auto">
          <!-- Theme Toggle -->
          <div class="theme-toggle-container me-3">
            <button id="themeToggle" class="theme-toggle" aria-label="Toggle dark/light mode">
              <i class="fas fa-moon"></i>
            </button>
          </div>
          
          <!-- User Level -->`
    );
    modified = true;
  }
  
  // 3. Add theme.js script before closing body tag if not already added
  if (!content.includes('src="../assets/js/theme.js"')) {
    // Try to find the last script tag before the closing body tag
    if (content.match(/<script src="[^"]+"><\/script>\s+<\/body>/)) {
      content = content.replace(
        /(<script src="[^"]+"><\/script>)(\s+<\/body>)/,
        '$1\n  <script src="../assets/js/theme.js"></script>$2'
      );
    } else {
      // If no match, try to insert before </body>
      content = content.replace(
        /(\s+)<\/body>/,
        '$1  <script src="../assets/js/theme.js"></script>\n$1</body>'
      );
    }
    modified = true;
  }
  
  // Save the modified file
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`No changes needed for ${file}`);
  }
});

console.log('All pages updated successfully!'); 