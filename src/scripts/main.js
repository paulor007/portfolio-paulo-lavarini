// -----------------------------------------------------------------------------
// JavaScript principal - ARQUIVO COMPLETO E CORRIGIDO
// -----------------------------------------------------------------------------

// Elementos do DOM
const themeToggle = document.querySelector('.nav__theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav__link'); // CORREÇÃO: querySelectorAll ao invés de getElementById
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

// Event listeners para tema
themeToggle.addEventListener('click', toggleTheme);
prefersDarkScheme.addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    const theme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }
});

// Toggle do menu mobile
function toggleMobileMenu() {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true'; // CORREÇÃO: Comparação com string

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
  // CORREÇÃO: Verificar se já existe overlay
  if (document.querySelector('.nav-overlay')) return;

  const overlay = document.createElement('div');
  overlay.classList.add('nav-overlay');
  overlay.addEventListener('click', toggleMobileMenu);
  body.appendChild(overlay);

  // CORREÇÃO: Adicionar classe active após criação para animação
  requestAnimationFrame(() => {
    overlay.classList.add('nav-overlay--active');
  });
}

// Remover overlay
function removeOverlay() {
  const overlay = document.querySelector('.nav-overlay');
  if (overlay) {
    overlay.classList.remove('nav-overlay--active');
    // CORREÇÃO: Aguardar animação antes de remover
    setTimeout(() => overlay.remove(), 300);
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

// ADIÇÃO: Smooth scroll para links internos
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');

      // Verifica se é apenas "#" (não fazer nada)
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        const offset = 100; // Altura do header
        const targetPosition = target.offsetTop - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    });
  });
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

// Typewriter Effect
class Typewriter {
  constructor(element) {
    this.element = element;
    this.words = JSON.parse(element.dataset.words || '[]');
    this.textElement = element.querySelector('.hero__typewriter-text');
    this.cursorElement = element.querySelector('.hero__typewriter-cursor'); // ADIÇÃO: Referência ao cursor
    this.wordIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.typeSpeed = 100;
    this.deleteSpeed = 50;
    this.waitTime = 2000;

    console.log('Typewriter iniciado com palavras:', this.words); // Debug

    // Inicia o efeito
    this.type();
  }

  type() {
    // Palavra atual
    const currentWord = this.words[this.wordIndex];

    // Está apagando?
    if (this.isDeleting) {
      // Remove um caractere
      this.textElement.textContent = currentWord.substring(
        0,
        this.charIndex - 1
      );
      this.charIndex--;

      // Terminou de apagar?
      if (this.charIndex === 0) {
        this.isDeleting = false;
        // Próxima palavra
        this.wordIndex = (this.wordIndex + 1) % this.words.length;
        // Pequena pausa antes de começar a digitar
        setTimeout(() => this.type(), 500);
        return;
      }
    } else {
      // Adiciona um caractere
      this.textElement.textContent = currentWord.substring(
        0,
        this.charIndex + 1
      );
      this.charIndex++;

      // Terminou de digitar?
      if (this.charIndex === currentWord.length) {
        this.isDeleting = true;
        // Pausa antes de começar a apagar
        setTimeout(() => this.type(), this.waitTime);
        return;
      }
    }

    // Velocidade de digitação
    const speed = this.isDeleting ? this.deleteSpeed : this.typeSpeed;
    setTimeout(() => this.type(), speed);
  }
}

// ADIÇÃO: Animações de scroll (fade-in)
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Opcional: parar de observar após animar
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar todos elementos com classe fade-in
  document.querySelectorAll('.fade-in').forEach((el) => {
    observer.observe(el);
  });
}

// ADIÇÃO: Inicialização geral quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar tema
  initializeTheme();

  // Inicializar header scroll
  handleHeaderScroll();

  // Inicializar smooth scroll
  initSmoothScroll();

  // Inicializar typewriter
  const typewriterElement = document.querySelector('.hero__typewriter');
  if (typewriterElement) {
    new Typewriter(typewriterElement);
  } else {
    console.log(
      'Elemento typewriter não encontrado - pode não estar na página home'
    );
  }

  // Inicializar animações de scroll
  initScrollAnimations();

  // ADIÇÃO: Filtros de projetos (se existirem)
  const filterBtns = document.querySelectorAll('.filter__btn');
  const projectCards = document.querySelectorAll('.project__card');

  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Remove active de todos
        filterBtns.forEach((b) => b.classList.remove('active'));
        // Adiciona active no clicado
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        // Mostra/esconde projetos
        projectCards.forEach((card) => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'block';
            card.classList.add('fade-in');
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ADIÇÃO: Formulário de contato (se existir)
  const contactForm = document.querySelector('.contact__form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Aqui você pode adicionar lógica para enviar o formulário
      // Por enquanto, apenas mostra um alerta
      alert('Mensagem enviada com sucesso! Entrarei em contato em breve.');
      contactForm.reset();
    });
  }
});

// Log para debug
console.log('Main.js carregado com sucesso!');
