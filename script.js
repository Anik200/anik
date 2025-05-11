// DOM Elements
const background = document.getElementById('background');
const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const dockPanel = document.getElementById('dock-panel');

// Update background gradient based on current theme
function updateGradient() {
  background.style.backgroundImage = body.classList.contains('dark')
    ? "linear-gradient(135deg, #0C191F, #146d87)"
    : "linear-gradient(135deg, #55D9F6, #0e3d4a)";
}

// Toggle between light and dark themes
function toggleTheme() {
  body.classList.toggle('dark');
  body.classList.toggle('light');
  toggleBtn.innerHTML = body.classList.contains('dark')
    ? '<i class="fas fa-sun"></i>'  // Change to sun icon for dark theme
    : '<i class="fas fa-moon"></i>';  // Change to moon icon for light theme
  updateGradient();
}

// Function to apply theme based on system preference
function setThemeBasedOnSystem() {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (prefersDark) {
    body.classList.add('dark');
    body.classList.remove('light');
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i>'; // Set sun icon for dark theme
  } else {
    body.classList.add('light');
    body.classList.remove('dark');
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; // Set moon icon for light theme
  }
}

// Listen for changes in system theme preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setThemeBasedOnSystem);

// Set the theme when the page loads
setThemeBasedOnSystem();

// Run once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  updateGradient();
  // Expand or collapse a blog post's extended content
function togglePost(postElement) {
  const content = postElement.querySelector('.expanded-content');
  if (!content) return;
  content.classList.toggle('visible');

  // Animate dock panel entry
  dockPanel.classList.add('collapsed');
  void dockPanel.offsetWidth; // Force reflow
  setTimeout(() => {
    dockPanel.classList.remove('collapsed');
    dockPanel.classList.add('expanded');
  }, 100);
});

// Set up theme toggle button
toggleBtn.addEventListener('click', toggleTheme);
