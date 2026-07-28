// Lógica principal de navegación e interacciones suaves.
document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  const sections = document.querySelectorAll("main section[id]");
  const yearNode = document.getElementById("current-year");

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  // Menú hamburguesa para mobile.
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
      );
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
        menuButton.setAttribute("aria-label", "Abrir menú de navegación");
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
  if (sections.length > 0 && navLinks.length > 0 && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentId = `#${entry.target.id}`;
            navLinks.forEach((navLink) => {
              navLink.classList.toggle("active", navLink.getAttribute("href") === currentId);
            });
          }
        });
      },
      {
        threshold: 0.45,
        rootMargin: "-15% 0px -45% 0px",
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
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
});