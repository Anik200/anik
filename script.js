const background = document.getElementById('background');
const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const dockPanel = document.getElementById('dock-panel');

// Update gradient based on current theme
function updateGradient() {
  if (body.classList.contains('dark')) {
    background.style.backgroundImage = "linear-gradient(135deg, #0C191F, #0C404F)";
  } else {
    background.style.backgroundImage = "linear-gradient(135deg, #55D9F6, #388297)";
  }
}

// Toggle theme
toggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  body.classList.toggle('light');
  toggleBtn.innerHTML = body.classList.contains('dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  updateGradient();
});

// On load: expand the dock panel smoothly
window.addEventListener('DOMContentLoaded', () => {
  updateGradient();

  // Force reflow for animation
  dockPanel.classList.add('collapsed');
  void dockPanel.offsetWidth;

  setTimeout(() => {
    dockPanel.classList.remove('collapsed');
    dockPanel.classList.add('expanded');
  }, 100);
});
