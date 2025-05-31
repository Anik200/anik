// DOM Elements
const background = document.getElementById('background');
const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const dockPanel = document.getElementById('dock-panel');

// Update background gradient based on current theme (default linear only)
function updateGradient() {
  const isDark = body.classList.contains('dark');
  const linear = isDark
    ? 'linear-gradient(135deg, #0C191F, #146d87)'
    : 'linear-gradient(135deg, #55D9F6, #0e3d4a)';

  background.style.backgroundImage = linear;
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

// Set theme based on system preference
function setThemeBasedOnSystem() {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (prefersDark) {
    body.classList.add('dark');
    body.classList.remove('light');
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    body.classList.add('light');
    body.classList.remove('dark');
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// Typing animation for heading
function typeText(elementId, text, speed = 100) {
  const element = document.getElementById(elementId);
  let i = 0;

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Cursor-following gradient (mouse + touch)
function updateCursorGradient(x, y) {
  const xPercent = (x / window.innerWidth) * 100;
  const yPercent = (y / window.innerHeight) * 100;

  const isDark = body.classList.contains('dark');
  const glowColor = isDark
    ? 'rgba(0, 255, 255, 0.1)'
    : 'rgba(255, 255, 255, 0.15)';

  const radial = `radial-gradient(circle at ${xPercent}% ${yPercent}%, ${glowColor}, transparent 60%)`;
  const linear = isDark
    ? 'linear-gradient(135deg, #0C191F, #146d87)'
    : 'linear-gradient(135deg, #55D9F6, #0e3d4a)';

  background.style.backgroundImage = `${radial}, ${linear}`;
}

// Add event listeners for both mouse and touch
document.addEventListener('mousemove', (e) => {
  updateCursorGradient(e.clientX, e.clientY);
});

document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    updateCursorGradient(touch.clientX, touch.clientY);
  }
}, { passive: true });

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setThemeBasedOnSystem);

// Setup on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  setThemeBasedOnSystem();
  updateGradient();

  // Animate dock panel entry
  dockPanel.classList.add('collapsed');
  void dockPanel.offsetWidth; // Force reflow
  setTimeout(() => {
    dockPanel.classList.remove('collapsed');
    dockPanel.classList.add('expanded');
  }, 100);

  // Typing heading
  typeText("typed-heading", "Anik Biswas", 120);

  // Theme toggle button
  toggleBtn.addEventListener('click', toggleTheme);
});
