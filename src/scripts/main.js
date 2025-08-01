// -----------------------------------------------------------------------------
// JavaScript principal
// -----------------------------------------------------------------------------

// Elementos do DOM
const themeToggle = document.querySelector('.nav__theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.getElementById('nav__link');
const header = document.getElementById('header');
const body = document.body;

// Função para alternar tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  // Atualizar aria-pressed
  themeToggle.setAttribute('aria-pressed', newTheme === 'dark');

  // Feedback visual
  themeToggle.classList.add('nav__theme-toggle--animating');
  setTimeout(() => {
    themeToggle.classList.remove('nav__theme-toggle--animating');
  }, 300);
}

// Função para definir tema inicial
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemTheme = prefersDarkScheme.matches ? 'dark' : 'light';
  const theme = savedTheme || systemTheme;

  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.setAttribute('aria-pressed', theme === 'dark');
}

// Event listeners
themeToggle.addEventListener('click', toggleTheme);
prefersDarkScheme.addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    const theme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }
});

// Toggle do menu mobile
function toggleMobileMenu() {
  const isOpen = navToggle.getAttribute('aria-expanded') === true;

  navToggle.setAttribute('aria-expanded', !isOpen);
  navToggle.setAttribute(
    'aria-label',
    isOpen ? 'Abrir menu de navegação' : 'Fechar menu de navegação'
  );
  navMenu.classList.toggle('nav__menu--open');
  body.classList.toggle('no-scroll');

  // Criar/remover overlay
  if (!isOpen) {
    createOverlay();
  } else {
    removeOverlay();
  }
}

// Criar overlay
function createOverlay() {
  const overlay = document.createElement('div');
  overlay.classList.add('nav-overlay', 'nav-overlay--active');
  overlay.addEventListener('click', toggleMobileMenu);
  body.appendChild(overlay);
}

// Remover overlay
function removeOverlay() {
  const overlay = document.querySelector('.nav-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// Fechar menu ao clicar em link
function closeMenuOnLinkClick() {
  if (window.innerWidth < 1024) {
    toggleMobileMenu();
  }
}

// Header scroll effect
function handleHeaderScroll() {
  if (window.scrollY > 50) {
    header.classList.add('header--scrolled');
  } else {
    header.classList.remove('header--scrolled');
  }
}

// Navegação ativa baseada no scroll
function setActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 100;

  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop;
    const sectionId = section.getAttribute('id');
    const correspondingLink = document.querySelector(
      `.nav__link[href="#${sectionId}"]`
    );

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach((link) => link.classList.remove('nav__link--active'));
      if (correspondingLink) {
        correspondingLink.classList.add('nav__link--active');
      }
    }
  });
}

// Navegação por teclado
function handleKeyboardNavigation(e) {
  const focusableElements = navMenu.querySelectorAll('a, button');
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  if (e.key === 'Escape' && navMenu.classList.contains('nav__menu--open')) {
    toggleMobileMenu();
    navToggle.focus();
  }
}

// Event Listeners
navToggle.addEventListener('click', toggleMobileMenu);
navLinks.forEach((link) =>
  link.addEventListener('click', closeMenuOnLinkClick)
);
window.addEventListener('scroll', handleHeaderScroll);
window.addEventListener('scroll', setActiveNavLink);
navMenu.addEventListener('keydown', handleKeyboardNavigation);

// Prevenir foco em elementos inativos quando menu está fechado
const observer = new MutationObserver(() => {
  const isMenuOpen = navMenu.classList.contains('nav__menu--open');
  const menuLinks = navMenu.querySelectorAll('a, button');

  menuLinks.forEach((link) => {
    link.setAttribute('tabindex', isMenuOpen ? '0' : '-1');
  });
});

observer.observe(navMenu, { attributes: true, attributeFilter: ['class'] });

// Inicializar tema
initializeTheme();

// Inicialização
handleHeaderScroll();
