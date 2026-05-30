/**
 * ============================================================
 *  PRATIK RAUT PORTFOLIO — script.js
 *
 *  Sections:
 *  01. Config & Constants
 *  02. DOM Helpers
 *  03. Loader
 *  04. Navbar – scroll shadow & active link tracking
 *  05. Mobile Menu
 *  06. Dark / Light Mode Toggle
 *  07. Smooth Scrolling
 *  08. Typewriter Animation
 *  09. Scroll Reveal
 *  10. Animated Skill Progress Bars
 *  11. Resume Modal
 *  12. Back-to-Top Button
 *  13. Footer – current year
 *  14. Init
 * ============================================================
 */

'use strict';

/* ============================================================
   01. Config & Constants
============================================================ */

/** Typewriter strings cycled in the hero section */
const TYPEWRITER_STRINGS = [
  'M.Sc. Industrial Mathematics Student',
  'Software Developer',
  'Data Analysis Enthusiast',
  'Machine Learning Explorer',
  'Problem Solver',
];

/** Path to your actual resume PDF – update before going live */
const RESUME_PDF_PATH = 'Resume.pdf';

/** Offset (px) subtracted when scrolling to a section (navbar height) */
const SCROLL_OFFSET = 72;

/* ============================================================
   02. DOM Helpers
============================================================ */

/**
 * Shorthand querySelector.
 * @param {string} selector
 * @param {Document|Element} [ctx=document]
 * @returns {Element|null}
 */
const $ = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Shorthand querySelectorAll returning a real Array.
 * @param {string} selector
 * @param {Document|Element} [ctx=document]
 * @returns {Element[]}
 */
const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

/* ============================================================
   03. Loader
============================================================ */

/**
 * Hides the full-page loader once the page has loaded.
 * Adds the `.hidden` class (CSS handles the fade-out transition).
 */
function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  const hideLoader = () => loader.classList.add('hidden');

  if (document.readyState === 'complete') {
    // Already loaded (e.g. cached page)
    setTimeout(hideLoader, 600);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 600), { once: true });
  }
}

/* ============================================================
   04. Navbar – scroll shadow & active link tracking
============================================================ */

/**
 * Adds `.scrolled` shadow to navbar when page is scrolled,
 * and highlights the nav link whose section is in the viewport.
 */
function initNavbar() {
  const navbar   = $('#navbar');
  const navLinks = $$('.nav-link');
  const sections = $$('section[id], header[id]');

  if (!navbar) return;

  const onScroll = () => {
    // Shadow
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    // Active link
    let currentId = 'home';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - SCROLL_OFFSET - 20) {
        currentId = sec.id;
      }
    });

    navLinks.forEach(link => {
      const isActive = link.getAttribute('data-section') === currentId;
      link.classList.toggle('active', isActive);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ============================================================
   05. Mobile Menu
============================================================ */

/**
 * Toggles the mobile navigation drawer open / closed.
 * Closes it automatically when a link is tapped or the user
 * taps outside the navbar.
 */
function initMobileMenu() {
  const btn      = $('#mobile-menu-btn');
  const navLinks = $('#nav-links');
  if (!btn || !navLinks) return;

  const toggle = (force) => {
    const open = typeof force === 'boolean' ? force : !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  };

  // Hamburger click
  btn.addEventListener('click', () => toggle());

  // Close when a link is tapped
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !navLinks.contains(e.target)) {
      toggle(false);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(false);
  });
}

/* ============================================================
   06. Dark / Light Mode Toggle
============================================================ */

/**
 * Reads persisted preference from localStorage, applies it,
 * and wires the toggle button to switch themes.
 */
function initThemeToggle() {
  const btn  = $('#theme-toggle');
  const icon = $('#theme-icon');
  const html = document.documentElement;
  if (!btn) return;

  const STORAGE_KEY = 'portfolio-theme';

  /** Apply a theme ('light' | 'dark') */
  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  // Restore saved preference, or respect OS preference
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

/* ============================================================
   07. Smooth Scrolling
============================================================ */

/**
 * Intercepts all in-page anchor clicks and scrolls smoothly,
 * accounting for the fixed navbar height.
 */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    // Let modal links be handled by the modal handler
    if (href === '#resume-modal') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

/* ============================================================
   08. Typewriter Animation
============================================================ */

/**
 * Cycles through TYPEWRITER_STRINGS, typing and erasing each
 * string character by character.
 */
function initTypewriter() {
  const el = $('#typewriter-text');
  if (!el) return;

  let strIndex  = 0;   // current string
  let charIndex = 0;   // current character position
  let isErasing = false;

  const TYPING_SPEED  = 80;   // ms per character typed
  const ERASING_SPEED = 40;   // ms per character erased
  const PAUSE_FULL    = 1800; // ms pause after fully typed
  const PAUSE_EMPTY   = 400;  // ms pause before typing next

  const tick = () => {
    const current = TYPEWRITER_STRINGS[strIndex];

    if (isErasing) {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isErasing = false;
        strIndex  = (strIndex + 1) % TYPEWRITER_STRINGS.length;
        setTimeout(tick, PAUSE_EMPTY);
        return;
      }
      setTimeout(tick, ERASING_SPEED);
    } else {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        isErasing = true;
        setTimeout(tick, PAUSE_FULL);
        return;
      }
      setTimeout(tick, TYPING_SPEED);
    }
  };

  setTimeout(tick, 700); // brief delay on first load
}

/* ============================================================
   09. Scroll Reveal
============================================================ */

/**
 * Uses IntersectionObserver to add `.visible` to elements
 * with the `.reveal` class when they enter the viewport.
 * Falls back to showing all elements if IO is unsupported.
 */
function initScrollReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // only animate once
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   10. Animated Skill Progress Bars
============================================================ */

/**
 * Watches each `.skill-item__fill` element; when it enters
 * the viewport, sets its width to the value in `data-width`
 * triggering the CSS width transition.
 */
function initSkillBars() {
  const bars = $$('.skill-item__fill');
  if (!bars.length) return;

  if (!('IntersectionObserver' in window)) {
    bars.forEach(bar => {
      bar.style.width = (bar.dataset.width || 0) + '%';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar   = entry.target;
          const width = bar.dataset.width || 0;
          // Small delay so the reveal animation plays first
          setTimeout(() => { bar.style.width = width + '%'; }, 200);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.4 }
  );

  bars.forEach(bar => observer.observe(bar));
}

/* ============================================================
   11. Resume Modal
============================================================ */

/**
 * Opens / closes the resume modal.
 * Traps focus inside while open and restores it on close.
 * Closes on overlay click or Escape key.
 */
function initModal() {
  const overlay     = $('#resume-modal');
  const closeBtn    = $('#close-modal');
  const downloadBtn = $('#download-resume-btn');

  // All buttons that open the modal
  const openTriggers = [
    $('#view-resume-btn'),
    $('#footer-resume-btn'),
  ].filter(Boolean);

  if (!overlay) return;

  let previouslyFocused = null;

  // ---------- Open ----------
  const openModal = () => {
    previouslyFocused = document.activeElement;
    overlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    // Focus the close button for accessibility
    setTimeout(() => closeBtn && closeBtn.focus(), 50);
  };

  // ---------- Close ----------
  const closeModal = () => {
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
    previouslyFocused && previouslyFocused.focus();
  };

  // Wire open triggers
  openTriggers.forEach(btn => btn.addEventListener('click', openModal));

  // Close button
  closeBtn && closeBtn.addEventListener('click', closeModal);

  // Click on overlay backdrop
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) closeModal();
  });

  // Download button
  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(RESUME_PDF_PATH, '_blank', 'noopener,noreferrer');
    });
  }

  // Focus trap inside modal (Tab key)
  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = $$('button, a, input, [tabindex]:not([tabindex="-1"])', overlay);
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

/* ============================================================
   12. Back-to-Top Button
============================================================ */

/**
 * Shows / hides the back-to-top button based on scroll depth.
 * Clicking it smoothly scrolls back to the top.
 */
function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  const SHOW_THRESHOLD = 400; // px

  const onScroll = () => {
    if (window.scrollY > SHOW_THRESHOLD) {
      btn.removeAttribute('hidden');
    } else {
      btn.setAttribute('hidden', '');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   13. Footer – current year
============================================================ */

/** Inserts the current 4-digit year into #current-year. */
function initFooterYear() {
  const el = $('#current-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   14. Init
============================================================ */

/**
 * Boot all features once the DOM is ready.
 * Using DOMContentLoaded ensures scripts in <head> also work,
 * but since script.js is at the end of <body> the DOM is
 * already parsed – this is just defensive future-proofing.
 */
function init() {
  initLoader();
  initNavbar();
  initMobileMenu();
  initThemeToggle();
  initSmoothScroll();
  initTypewriter();
  initScrollReveal();
  initSkillBars();
  initModal();
  initBackToTop();
  initFooterYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}