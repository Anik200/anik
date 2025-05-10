// DOM Elements
const background = document.getElementById('background');
const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const dockPanel = document.getElementById('dock-panel');

// Apply theme based on system preference or stored choice
function applyInitialTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    body.classList.add(savedTheme);
  } else {
    body.classList.add(prefersDark ? 'dark' : 'light');
  }

  toggleBtn.innerHTML = body.classList.contains('dark')
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';

  updateGradient();
}

// Update background gradient based on current theme
function updateGradient() {
  background.style.backgroundImage = body.classList.contains('dark')
    ? "linear-gradient(135deg, #0C191F, #0C404F)"
    : "linear-gradient(135deg, #55D9F6, #388297)";
}

// Toggle between light and dark themes
function toggleTheme() {
  const isDark = body.classList.contains('dark');
  body.classList.toggle('dark', !isDark);
  body.classList.toggle('light', isDark);
  localStorage.setItem('theme', isDark ? 'light' : 'dark');

  toggleBtn.innerHTML = isDark
    ? '<i class="fas fa-moon"></i>'
    : '<i class="fas fa-sun"></i>';

  updateGradient();
}

// Expand or collapse a blog post's extended content
function togglePost(postElement) {
  const content = postElement.querySelector('.expanded-content');
  if (!content) return;
  content.classList.toggle('visible');
}

// DOM ready
window.addEventListener('DOMContentLoaded', () => {
  applyInitialTheme();

  // Animate dock panel entry
  dockPanel.classList.add('collapsed');
  void dockPanel.offsetWidth;
  setTimeout(() => {
    dockPanel.classList.remove('collapsed');
    dockPanel.classList.add('expanded');
  }, 100);
});

toggleBtn.addEventListener('click', toggleTheme);
