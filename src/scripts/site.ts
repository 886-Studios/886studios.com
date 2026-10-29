import "./analytics";

const select = <T extends Element>(selector: string) => document.querySelector<T>(selector);
const selectAll = <T extends Element>(selector: string) => Array.from(document.querySelectorAll<T>(selector));
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => element.getClientRects().length > 0);

const scrollToImmediately = (top: number) => {
  const rootStyle = document.documentElement.style;
  const previousScrollBehavior = rootStyle.scrollBehavior;

  rootStyle.scrollBehavior = "auto";
  window.scrollTo({ top, left: 0, behavior: "auto" });
  rootStyle.scrollBehavior = previousScrollBehavior;
};

function initNavChrome() {
  const nav = select<HTMLElement>(".site-nav");
  const hamburger = select<HTMLButtonElement>(".nav-hamburger");
  const drawer = select<HTMLElement>("#mobile-drawer");
  const overlay = drawer?.querySelector<HTMLElement>(".mobile-drawer-overlay");
  const closeButton = drawer?.querySelector<HTMLButtonElement>(".mobile-drawer-close");
  const main = select<HTMLElement>("#main-content");
  const footer = select<HTMLElement>(".site-footer");
  const desktopViewport = window.matchMedia("(min-width: 881px)");
  const hoverPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const sectionDrawers = selectAll<HTMLDetailsElement>("[data-nav-group]");
  let hoverOpenedSection: HTMLDetailsElement | null = null;
  let sectionCloseTimer: number | undefined;
  let previouslyFocusedElement: HTMLElement | null = null;
  let previousBodyOverflow = "";
  let previousHtmlOverflow = "";
  let previousBodyPosition = "";
  let previousBodyTop = "";
  let previousBodyWidth = "";
  let lockedScrollY = 0;
  let navScrollFrame = 0;

  if (!nav || !hamburger || !drawer || !overlay || !closeButton) return;

  const cancelSectionClose = () => {
    window.clearTimeout(sectionCloseTimer);
    sectionCloseTimer = undefined;
  };

  const closeSectionDrawers = () => {
    cancelSectionClose();
    hoverOpenedSection = null;
    sectionDrawers.forEach((section) => { section.open = false; });
  };

  sectionDrawers.forEach((section) => {
    const trigger = section.querySelector("summary");
    section.addEventListener("pointerenter", (event) => {
      if (!desktopViewport.matches || !hoverPointer.matches || event.pointerType !== "mouse") return;

      cancelSectionClose();
      if (section.open) return;

      closeSectionDrawers();
      section.open = true;
      hoverOpenedSection = section;
    });
    section.addEventListener("pointerleave", () => {
      if (hoverOpenedSection !== section) return;

      cancelSectionClose();
      sectionCloseTimer = window.setTimeout(() => {
        sectionCloseTimer = undefined;
        if (hoverOpenedSection === section && !section.contains(document.activeElement)) {
          section.open = false;
          hoverOpenedSection = null;
        }
      }, 180);
    });
    trigger?.addEventListener("click", (event) => {
      event.preventDefault();
      // Clicking a hover-open menu keeps it open until explicitly dismissed.
      const shouldOpen = hoverOpenedSection === section || !section.open;
      closeSectionDrawers();
      section.open = shouldOpen;
    });
    section.addEventListener("focusout", (event) => {
      if (event.relatedTarget instanceof Node && !section.contains(event.relatedTarget)) {
        section.open = false;
        if (hoverOpenedSection === section) {
          cancelSectionClose();
          hoverOpenedSection = null;
        }
      }
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Node && !sectionDrawers.some((section) => section.contains(target))) {
      closeSectionDrawers();
    }
  });

  const updateNav = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  const queueNavUpdate = () => {
    if (navScrollFrame) return;

    navScrollFrame = window.requestAnimationFrame(() => {
      navScrollFrame = 0;
      updateNav();
    });
  };

  const openDrawer = () => {
    closeSectionDrawers();
    previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : hamburger;
    drawer.setAttribute("aria-hidden", "false");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Close menu");
    hamburger.classList.add("is-open");
    drawer.classList.add("is-open");
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    nav.setAttribute("inert", "");
    previousBodyOverflow = document.body.style.overflow;
    previousHtmlOverflow = document.documentElement.style.overflow;
    previousBodyPosition = document.body.style.position;
    previousBodyTop = document.body.style.top;
    previousBodyWidth = document.body.style.width;
    lockedScrollY = window.scrollY;
    document.documentElement.classList.add("mobile-menu-open");
    document.body.classList.add("mobile-menu-open");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.width = "100%";
    closeButton.focus({ preventScroll: true });
  };

  const closeDrawer = () => {
    if (!drawer.classList.contains("is-open")) return;

    drawer.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open menu");
    hamburger.classList.remove("is-open");
    drawer.classList.remove("is-open");
    main?.removeAttribute("inert");
    footer?.removeAttribute("inert");
    nav.removeAttribute("inert");
    document.documentElement.classList.remove("mobile-menu-open");
    document.body.classList.remove("mobile-menu-open");
    document.documentElement.style.overflow = previousHtmlOverflow;
    document.body.style.overflow = previousBodyOverflow;
    document.body.style.position = previousBodyPosition;
    document.body.style.top = previousBodyTop;
    document.body.style.width = previousBodyWidth;
    scrollToImmediately(lockedScrollY);
    const focusTarget = previouslyFocusedElement?.getClientRects().length
      ? previouslyFocusedElement
      : nav.querySelector<HTMLElement>("a[href]");
    focusTarget?.focus({ preventScroll: true });
    previouslyFocusedElement = null;
    previousBodyOverflow = "";
    previousHtmlOverflow = "";
    previousBodyPosition = "";
    previousBodyTop = "";
    previousBodyWidth = "";
    lockedScrollY = 0;
  };

  const trapDrawerFocus = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements(drawer);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) {
      event.preventDefault();
      closeButton.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  updateNav();
  window.addEventListener("scroll", queueNavUpdate, { passive: true });
  hamburger.addEventListener("click", () => {
    if (drawer.classList.contains("is-open")) {
      closeDrawer();
      return;
    }

    openDrawer();
  });
  closeButton.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  drawer.addEventListener("keydown", trapDrawerFocus);
  drawer.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a[href]")) closeDrawer();
  });
  desktopViewport.addEventListener("change", (event) => {
    closeSectionDrawers();
    if (event.matches) closeDrawer();
  });
  hoverPointer.addEventListener("change", closeSectionDrawers);
  window.addEventListener("pagehide", closeDrawer);
  window.addEventListener("pagehide", closeSectionDrawers);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openSection = sectionDrawers.find((section) => section.open);
    closeSectionDrawers();
    openSection?.querySelector("summary")?.focus();
    closeDrawer();
  });
}

function initCachedPageAnimationReplay() {
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;

    selectAll<HTMLElement>(".hero-h1, .hero-sub, .hero-actions, .eyebrow").forEach((element) => {
      element.style.animationName = "none";
      void element.getBoundingClientRect();
      element.style.animationName = "";
    });
  });
}

function initScrollReveal() {
  const revealElements = selectAll<HTMLElement>(".reveal");
  if (revealElements.length === 0) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((element) => {
    element.classList.add("is-pending");
    observer.observe(element);
  });
}

function initPortfolioReturnPosition() {
  const storageKey = "886:portfolio-scroll-y";
  const isPortfolioIndex = window.location.pathname.replace(/\/$/, "") === "/portfolio";

  const restorePortfolioPosition = async () => {
    if (!isPortfolioIndex) return;

    let storedPosition: string | null;
    try {
      storedPosition = window.sessionStorage.getItem(storageKey);
      window.sessionStorage.removeItem(storageKey);
    } catch {
      return;
    }
    if (!storedPosition) return;
    const scrollY = Number.parseInt(storedPosition, 10);
    if (!Number.isFinite(scrollY)) return;

    // Font swaps can wrap the heading and shift every company row on mobile.
    // Restore after the final layout and the browser's own page restoration.
    await document.fonts.ready;
    window.requestAnimationFrame(() => {
      scrollToImmediately(scrollY);
    });
  };

  if (isPortfolioIndex) {
    if (document.readyState === "complete") void restorePortfolioPosition();

    selectAll<HTMLAnchorElement>(".portfolio-directory .portfolio-link").forEach((link) => {
      link.addEventListener("click", () => {
        try {
          window.sessionStorage.setItem(storageKey, String(window.scrollY));
        } catch {
          // Navigation still works when the browser blocks session storage.
        }
      });
    });
  }

  window.addEventListener("pageshow", restorePortfolioPosition);
}

initNavChrome();
initCachedPageAnimationReplay();
initPortfolioReturnPosition();
initScrollReveal();
