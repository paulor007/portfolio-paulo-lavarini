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

class CounterAnimation {
  constructor(element, options = {}) {
    this.element = element;
    this.target = parseInt(element.dataset.target) || 0;
    this.suffix = element.dataset.suffix || '';
    this.prefix = element.dataset.prefix || '';
    this.duration = options.duration || 2500;
    this.delay = options.delay || 0;
    this.once = options.once !== false; // Anima apenas uma vez por padrão
    this.animated = false;
  }

  // Diferentes funções de easing
  static easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeOutElastic: (t) => {
      const p = 0.3;
      return (
        Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1
      );
    },
  };

  animate(easingFunction = CounterAnimation.easing.easeOutQuad) {
    // Se já foi animado e once é true, não anima novamente
    if (this.animated && this.once) return;

    const start = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - start - this.delay;

      if (elapsed < 0) {
        requestAnimationFrame(updateCounter);
        return;
      }

      const progress = Math.min(elapsed / this.duration, 1);
      const easedProgress = easingFunction(progress);
      const current = Math.floor(easedProgress * this.target);

      // Atualiza o texto com prefixo e sufixo
      this.element.textContent = this.prefix + current + this.suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        this.element.textContent = this.prefix + this.target + this.suffix;
        this.animated = true;
      }
    };

    requestAnimationFrame(updateCounter);
  }

  reset() {
    this.element.textContent = this.prefix + '0' + this.suffix;
    this.animated = false;
  }
}

// Inicializar contadores
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.about__stats-item-number');
  const counterInstances = [];

  counters.forEach((counter, index) => {
    const instance = new CounterAnimation(counter, {
      duration: 2000,
      delay: index * 200, // Delay escalonado
      once: true,
    });
    counterInstances.push(instance);
  });

  // Observer para iniciar animação
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counterInstances.forEach((counter) => {
            counter.animate(CounterAnimation.easing.easeOutQuad);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.3,
    }
  );

  const statsSection = document.querySelector('.about__stats');
  if (statsSection) {
    observer.observe(statsSection);
  }
});

// ========================================
// ANIMAÇÃO DAS BARRAS DE HABILIDADES
// ========================================

// Função para animar as barras de progresso
function animateSkillBars(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const progressBars = entry.target.querySelectorAll(
        '.skills__item-progress'
      );
      const percentages = entry.target.querySelectorAll(
        '.skills__item-percentage'
      );

      progressBars.forEach((bar, index) => {
        const progress = bar.dataset.progress;
        const percentage = percentages[index];

        // Delay para cada barra
        setTimeout(() => {
          // Anima a barra
          bar.style.width = `${progress}%`;

          // Anima o contador
          animateSkillPercentage(percentage, progress);
        }, index * 100); // 100ms de delay entre cada barra
      });

      // Para de observar após animar
      observer.unobserve(entry.target);
    }
  });
}

// Função para animar a porcentagem
function animateSkillPercentage(element, target) {
  const duration = 1500; // 1.5 segundos
  const start = 0;
  const increment = target / (duration / 16); // 60 FPS
  let current = start;

  const updatePercentage = () => {
    current += increment;

    if (current < target) {
      element.textContent = `${Math.floor(current)}%`;
      requestAnimationFrame(updatePercentage);
    } else {
      element.textContent = `${target}%`;
    }
  };

  updatePercentage();
}

// Observer para as skills
const skillsObserver = new IntersectionObserver(animateSkillBars, {
  threshold: 0.2,
  rootMargin: '0px 0px -50px 0px',
});

// Inicializar observer das skills
document.addEventListener('DOMContentLoaded', () => {
  // Observar cada categoria individualmente para animação escalonada
  const skillCategories = document.querySelectorAll('.skills__category');
  skillCategories.forEach((category) => {
    skillsObserver.observe(category);
  });
});

// ========================================
// FILTROS DE PROJETOS
// ========================================

// Função para filtrar projetos
function initProjectFilters() {
  const filterButtons = document.querySelectorAll('.projects__filter');
  const projectCards = document.querySelectorAll('.projects__card');

  if (filterButtons.length === 0) return;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      // Atualizar botão ativo
      filterButtons.forEach((btn) =>
        btn.classList.remove('projects__filter--active')
      );
      button.classList.add('projects__filter--active');

      // Filtrar projetos com animação
      projectCards.forEach((card, index) => {
        const category = card.dataset.category;

        if (filter === 'all' || category === filter) {
          // Mostrar com delay
          setTimeout(() => {
            card.style.display = 'flex';
            card.style.animation = 'fadeInUp 0.6s ease-out forwards';
          }, index * 50);
        } else {
          // Esconder
          card.style.animation = 'fadeOut 0.3s ease-out forwards';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });

      // Atualizar contadores (opcional)
      updateFilterCounts();
    });
  });
}

// Função para atualizar contadores
function updateFilterCounts() {
  const filters = document.querySelectorAll('.projects__filter');
  const allCards = document.querySelectorAll('.projects__card');

  filters.forEach((filter) => {
    const filterType = filter.dataset.filter;
    const count =
      filterType === 'all'
        ? allCards.length
        : document.querySelectorAll(
            `.projects__card[data-category="${filterType}"]`
          ).length;

    const countElement = filter.querySelector('.projects__filter-count');
    if (countElement) {
      countElement.textContent = count;
    }
  });
}

// Animação de fade out
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(20px);
    }
  }
`;
document.head.appendChild(style);

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  initProjectFilters();
});

// ========================================
// LAZY LOADING DE IMAGENS
// ========================================

// Observer para carregar imagens sob demanda
const imageObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;

        if (src) {
          img.src = src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      }
    });
  },
  {
    rootMargin: '50px 0px',
  }
);

// Observar todas as imagens dos projetos
document.addEventListener('DOMContentLoaded', () => {
  const projectImages = document.querySelectorAll('.projects__image[data-src]');
  projectImages.forEach((img) => imageObserver.observe(img));
});

// -----------------------------------------------------------------------------
// Contact Form JavaScript Module
// Path: src/scripts/modules/contact.js
// -----------------------------------------------------------------------------

class ContactForm {
  constructor() {
    this.form = document.getElementById('contact-form');
    this.formInputs = this.form?.querySelectorAll('input, select, textarea');
    this.messageCounter = document.getElementById('message-count');
    this.messageTextarea = document.getElementById('message');
    this.successMessage = this.form?.querySelector(
      '.contact__form-message--success'
    );
    this.errorMessage = this.form?.querySelector(
      '.contact__form-message--error'
    );

    this.maxMessageLength = 500;
    this.isSubmitting = false;

    this.init();
  }

  init() {
    if (!this.form) return;

    this.setupEventListeners();
    this.setupPhoneMask();
    this.setupMessageCounter();
    this.setupFormValidation();
  }

  // Event Listeners
  setupEventListeners() {
    // Form submit
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Reset form
    this.form.addEventListener('reset', () => this.handleReset());

    // Real-time validation
    this.formInputs.forEach((input) => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });

    // Privacy checkbox custom validation
    const privacyCheckbox = document.getElementById('privacy');
    if (privacyCheckbox) {
      privacyCheckbox.addEventListener('change', () => {
        this.validateField(privacyCheckbox);
      });
    }
  }

  // Phone mask (Brazilian format)
  setupPhoneMask() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');

      if (value.length > 0) {
        if (value.length <= 2) {
          value = `(${value}`;
        } else if (value.length <= 6) {
          value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length <= 10) {
          value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        } else {
          value = `(${value.slice(0, 2)}) ${value.slice(2, 3)} ${value.slice(3, 7)}-${value.slice(7, 11)}`;
        }
      }

      e.target.value = value;
    });
  }

  // Message character counter
  setupMessageCounter() {
    if (!this.messageTextarea || !this.messageCounter) return;

    this.messageTextarea.addEventListener('input', (e) => {
      const length = e.target.value.length;
      this.messageCounter.textContent = length;

      // Change color when approaching limit
      const counterElement = this.messageCounter.parentElement;
      if (length > this.maxMessageLength * 0.9) {
        counterElement.style.color = 'var(--color-warning)';
      } else if (length > this.maxMessageLength) {
        counterElement.style.color = 'var(--color-error)';
        e.target.value = e.target.value.substring(0, this.maxMessageLength);
      } else {
        counterElement.style.color = '';
      }
    });
  }

  // Form validation setup
  setupFormValidation() {
    // Custom validation messages in Portuguese
    this.validationMessages = {
      name: {
        required: 'Por favor, informe seu nome',
        pattern: 'Nome deve conter apenas letras e espaços',
        minLength: 'Nome deve ter pelo menos 3 caracteres',
      },
      email: {
        required: 'Por favor, informe seu email',
        pattern: 'Por favor, informe um email válido',
        email: 'Formato de email inválido',
      },
      phone: {
        pattern: 'Formato de telefone inválido',
        minLength: 'Telefone incompleto',
      },
      subject: {
        required: 'Por favor, selecione um assunto',
      },
      message: {
        required: 'Por favor, escreva sua mensagem',
        minLength: 'Mensagem deve ter pelo menos 10 caracteres',
        maxLength: `Mensagem não pode exceder ${this.maxMessageLength} caracteres`,
      },
      privacy: {
        required: 'Você precisa aceitar a política de privacidade',
      },
    };
  }

  // Validate individual field
  validateField(field) {
    const fieldName = field.name;
    const fieldValue =
      field.type === 'checkbox' ? field.checked : field.value.trim();
    const errorElement = document.getElementById(`${fieldName}-error`);

    if (!errorElement) return true;

    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (field.hasAttribute('required') && !fieldValue) {
      isValid = false;
      errorMessage =
        this.validationMessages[fieldName]?.required || 'Campo obrigatório';
    }

    // Email validation
    else if (field.type === 'email' && fieldValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fieldValue)) {
        isValid = false;
        errorMessage =
          this.validationMessages[fieldName]?.email || 'Email inválido';
      }
    }

    // Phone validation
    else if (fieldName === 'phone' && fieldValue) {
      const phoneRegex = /^\(\d{2}\)\s?\d?\s?\d{4}-?\d{4}$/;
      if (!phoneRegex.test(fieldValue)) {
        isValid = false;
        errorMessage =
          this.validationMessages[fieldName]?.pattern || 'Telefone inválido';
      }
    }

    // Name validation
    else if (fieldName === 'name' && fieldValue) {
      if (fieldValue.length < 3) {
        isValid = false;
        errorMessage =
          this.validationMessages[fieldName]?.minLength || 'Nome muito curto';
      } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(fieldValue)) {
        isValid = false;
        errorMessage =
          this.validationMessages[fieldName]?.pattern || 'Nome inválido';
      }
    }

    // Message validation
    else if (fieldName === 'message' && fieldValue) {
      if (fieldValue.length < 10) {
        isValid = false;
        errorMessage =
          this.validationMessages[fieldName]?.minLength ||
          'Mensagem muito curta';
      } else if (fieldValue.length > this.maxMessageLength) {
        isValid = false;
        errorMessage =
          this.validationMessages[fieldName]?.maxLength ||
          'Mensagem muito longa';
      }
    }

    // Update UI
    if (!isValid) {
      this.showError(field, errorMessage);
    } else {
      this.clearError(field);
      this.showSuccess(field);
    }

    return isValid;
  }

  // Show error message
  showError(field, message) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
    field.classList.add('error');
    field.classList.remove('success');
  }

  // Clear error message
  clearError(field) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
    field.classList.remove('error');
  }

  // Show success state
  showSuccess(field) {
    if (field.value.trim() || field.type === 'checkbox') {
      field.classList.add('success');
    }
  }

  // Handle form submission
  async handleSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;

    // Validate all fields
    let isFormValid = true;
    this.formInputs.forEach((input) => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      this.showFormMessage(
        'error',
        'Por favor, corrija os erros no formulário'
      );
      return;
    }

    // Prepare form data
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    // Start submission
    this.setSubmittingState(true);

    try {
      // Simulate API call (replace with actual endpoint)
      await this.sendFormData(data);

      // Success
      this.showFormMessage(
        'success',
        'Mensagem enviada com sucesso! Responderei em breve.'
      );
      this.form.reset();
      this.handleReset();
    } catch (error) {
      // Error
      console.error('Erro ao enviar formulário:', error);
      this.showFormMessage(
        'error',
        'Erro ao enviar mensagem. Por favor, tente novamente.'
      );
    } finally {
      this.setSubmittingState(false);
    }
  }

  // Send form data (replace with actual API call)
  async sendFormData(data) {
    // Exemplo de integração com FormSubmit, EmailJS ou sua própria API

    // Para FormSubmit.co (exemplo):
    // const response = await fetch('https://formsubmit.co/ajax/seu-email@gmail.com', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json'
    //   },
    //   body: JSON.stringify(data)
    // });

    // Simulação de delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular sucesso em 90% dos casos
        if (Math.random() > 0.1) {
          resolve({ success: true });
        } else {
          reject(new Error('Erro simulado'));
        }
      }, 2000);
    });
  }

  // Set submitting state
  setSubmittingState(isSubmitting) {
    this.isSubmitting = isSubmitting;
    const submitButton = this.form.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = isSubmitting;

      if (isSubmitting) {
        submitButton.innerHTML = `
          <i class="fas fa-spinner fa-spin"></i>
          <span>Enviando...</span>
        `;
      } else {
        submitButton.innerHTML = `
          <i class="fas fa-paper-plane"></i>
          <span>Enviar Mensagem</span>
        `;
      }
    }
  }

  // Show form message (success or error)
  showFormMessage(type, message) {
    const messageElement =
      type === 'success' ? this.successMessage : this.errorMessage;
    const otherElement =
      type === 'success' ? this.errorMessage : this.successMessage;

    if (messageElement) {
      messageElement.querySelector('p').textContent = message;
      messageElement.hidden = false;

      // Auto hide after 5 seconds
      setTimeout(() => {
        messageElement.hidden = true;
      }, 5000);
    }

    if (otherElement) {
      otherElement.hidden = true;
    }

    // Scroll to message
    messageElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Handle form reset
  handleReset() {
    // Clear all errors and success states
    this.formInputs.forEach((input) => {
      this.clearError(input);
      input.classList.remove('success');
    });

    // Reset counter
    if (this.messageCounter) {
      this.messageCounter.textContent = '0';
    }

    // Hide messages
    if (this.successMessage) this.successMessage.hidden = true;
    if (this.errorMessage) this.errorMessage.hidden = true;
  }

  // Public method to update email service configuration
  setEmailService(service, config) {
    this.emailService = service;
    this.emailConfig = config;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = new ContactForm();

  // Export for global use if needed
  window.contactForm = contactForm;
});

// Export for ES6 modules
export default ContactForm;
