(() => {
  const nav = document.getElementById("nav");
  const toggler = document.querySelector(".navbar-toggler");
  if (!nav || !toggler) return;
  const docLang = (document.documentElement.getAttribute("lang") || "es").toLowerCase();
  const labels = docLang.startsWith("en")
    ? { open: "Open menu", close: "Close menu" }
    : { open: "Abrir menú", close: "Cerrar menú" };
  const bootstrapWarning = docLang.startsWith("en")
    ? "Bootstrap is not available. Accessible menu was not initialized."
    : "Bootstrap no está disponible. El menú accesible no se inicializó.";
  if (!window.bootstrap) {
    if (window.location.hostname === "localhost" || window.location.protocol === "file:") {
      console.warn(bootstrapWarning);
    }
    return;
  }

  const collapse = bootstrap.Collapse.getOrCreateInstance(nav, { toggle: false });
  let lastFocused = null;
  const focusWithoutScroll = (el) => {
    if (!el || typeof el.focus !== "function") return;
    try {
      el.focus({ preventScroll: true });
    } catch (_error) {
      el.focus();
    }
  };

  const getFocusable = () =>
    Array.from(
      nav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.offsetParent !== null);

  const syncAriaLabel = () => {
    const isOpen = toggler.getAttribute("aria-expanded") === "true";
    toggler.setAttribute("aria-label", isOpen ? labels.close : labels.open);
    toggler.classList.toggle("is-open", isOpen);
  };

  const firstLink = nav.querySelector(".nav-link");

  nav.addEventListener("show.bs.collapse", () => {
    lastFocused = document.activeElement;
    syncAriaLabel();
  });

  nav.addEventListener("hide.bs.collapse", () => {
    syncAriaLabel();
  });

  nav.addEventListener("shown.bs.collapse", () => {
    syncAriaLabel();
    if (firstLink) focusWithoutScroll(firstLink);
  });

  nav.addEventListener("hidden.bs.collapse", () => {
    syncAriaLabel();
    focusWithoutScroll(lastFocused || toggler);
  });

  nav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (nav.classList.contains("show")) {
        collapse.hide();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!nav.classList.contains("show")) return;

    if (event.key === "Escape") {
      collapse.hide();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusable();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (!nav.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  syncAriaLabel();
})();
