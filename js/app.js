// app.js - entrada central: inicializa theme, language y lógica de UI general
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar Theme y Language (si están disponibles)
  if (window.Theme && typeof window.Theme.init === 'function') {
    window.Theme.init();
  }

  if (window.Language && typeof window.Language.init === 'function') {
    window.Language.init();
  }

  const getT = (key) => {
    try {
      const lang = window.Language ? window.Language.current : 'es';
      const text = window.translations && window.translations[lang] ? window.translations[lang][key] : undefined;
      return typeof text === 'string' ? text : '';
    } catch (e) {
      return '';
    }
  };

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  const sections = document.querySelectorAll("main section[id]");
  const yearNode = document.getElementById("current-year");

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  // Set initial aria-label for menu button using translations when available
  if (menuButton) {
    menuButton.setAttribute('aria-label', getT('nav.open_menu') || menuButton.getAttribute('aria-label'));
  }

  // Menú hamburguesa para mobile.
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));

      // Update accessible label using translations
      menuButton.setAttribute('aria-label', isOpen ? getT('nav.close_menu') : getT('nav.open_menu'));
    });
  }

  // Scroll suave por JavaScript al navegar por secciones internas.
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") {
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (!targetElement) {
        return;
      }

      event.preventDefault();
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });

      if (nav && nav.classList.contains("open")) {
        nav.classList.remove("open");
      }
      if (menuButton) {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute('aria-label', getT('nav.open_menu'));
      }
    });
  });

  // Micro-interacción: mostrar secciones al entrar en viewport.
  const revealNodes = document.querySelectorAll(".reveal");
  if (revealNodes.length > 0 && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("visible"));
  }

  // Estado activo de links del nav según la sección visible.
  if (sections.length > 0 && navLinks.length > 0) {
    const getCurrentSectionId = () => {
      const viewportAnchor = window.scrollY + window.innerHeight * 0.3;
      let currentSection = sections[0];

      sections.forEach((section) => {
        const sectionTop = window.scrollY + section.getBoundingClientRect().top;
        if (sectionTop <= viewportAnchor) {
          currentSection = section;
        }
      });

      return currentSection.id;
    };

    const updateActiveNav = () => {
      const currentId = `#${getCurrentSectionId()}`;
      navLinks.forEach((navLink) => {
        navLink.classList.toggle("active", navLink.getAttribute("href") === currentId);
      });
    };

    let scrollPending = false;
    const onScroll = () => {
      if (!scrollPending) {
        scrollPending = true;
        window.requestAnimationFrame(() => {
          updateActiveNav();
          scrollPending = false;
        });
      }
    };

    updateActiveNav();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActiveNav);
  }

  const copyEmailButton = document.querySelector("[data-copy-email]");

  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async () => {
      const email = copyEmailButton.dataset.email;

      if (!email) {
        return;
      }

      await navigator.clipboard.writeText(email);
      copyEmailButton.classList.add("is-copied");

      window.setTimeout(() => {
        copyEmailButton.classList.remove("is-copied");
      }, 1200);
    });
  }

  const sliders = document.querySelectorAll('[data-slider]');
  sliders.forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('.slide'));
    if (slides.length === 0) return;

    let currentIndex = 0;
    const prevButton = slider.querySelector('.slider-control.prev');
    const nextButton = slider.querySelector('.slider-control.next');

    const showSlide = (index) => {
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === index);
      });
    };

    slides.forEach((slide, slideIndex) => {
      slide.classList.remove('active');
      if (slideIndex === 0) {
        slide.classList.add('active');
      }
      const img = slide.querySelector('img');
      if (img) {
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
        img.style.display = 'block';
        img.draggable = false;
      }
    });

    const showPrevious = () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    };

    const showNext = () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    };

    if (prevButton) {
      prevButton.addEventListener('click', showPrevious);
    }

    if (nextButton) {
      nextButton.addEventListener('click', showNext);
    }

    slider.tabIndex = 0;
    slider.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        showPrevious();
      } else if (event.key === 'ArrowRight') {
        showNext();
      }
    });

    slides.forEach((slide) => {
      const img = slide.querySelector('img');
      if (img && !img.complete) {
        img.addEventListener('load', () => showSlide(currentIndex));
        img.addEventListener('error', () => showSlide(currentIndex));
      }
    });

    showSlide(currentIndex);
  });
});
