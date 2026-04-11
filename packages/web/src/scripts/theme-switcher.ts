const STORAGE_KEY = 'tokx-theme';
const THEMES = [
  'dark',
  'light',
  'dracula',
  'nord',
  'catppuccin',
  'synthwave',
  'matrix',
  'bloodmoon',
  'midnight',
  'gruvbox',
  'cyberpunk',
  'nebula',
  'solarized',
  'rosepine',
  'monokai',
] as const;
type ThemeName = (typeof THEMES)[number];

function getStoredTheme(): ThemeName {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && THEMES.includes(stored as ThemeName)) {
    return stored as ThemeName;
  }
  return 'dark';
}

function applyTheme(theme: ThemeName): void {
  if (theme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  localStorage.setItem(STORAGE_KEY, theme);

  const options = document.querySelectorAll('.theme-option');
  for (const opt of options) {
    const isActive = opt.getAttribute('data-theme') === theme;
    opt.classList.toggle('active', isActive);
    opt.setAttribute('aria-selected', String(isActive));
  }

  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function initThemeSwitcher(): void {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const dropdown = document.getElementById('theme-dropdown');
  if (!toggleBtn || !dropdown) return;

  const stored = getStoredTheme();
  applyTheme(stored);

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });

  const options = dropdown.querySelectorAll('.theme-option');
  for (const opt of options) {
    opt.addEventListener('click', () => {
      const theme = opt.getAttribute('data-theme') as ThemeName;
      applyTheme(theme);
      dropdown.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  }

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  const randomBtn = document.getElementById('theme-random-btn');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const current = getStoredTheme();
      const others = THEMES.filter((t) => t !== current);
      const random = others[Math.floor(Math.random() * others.length)];
      applyTheme(random);
      dropdown.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  }
}
