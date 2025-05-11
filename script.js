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
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
  updateGradient();
}

// Expand or collapse a blog post's extended content
function togglePost(postElement) {
  const content = postElement.querySelector('.expanded-content');
  if (!content) return;
  content.classList.toggle('visible');
}

// Run once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  updateGradient();

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
