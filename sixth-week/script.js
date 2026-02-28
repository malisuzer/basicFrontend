// ================================================================
// Q-Farm Main JS – Task 4.1 Calculator + Task 5.2 Dark Mode (BB8)
// ================================================================

/* ──────────────────────────────────────────────
   TASK 5.2: DARK / LIGHT MODE (localStorage + BB8 Toggle)
────────────────────────────────────────────── */

/**
 * Reads saved theme from localStorage and applies it on page load.
 * Also syncs the BB8 checkbox state.
 */
function initTheme() {
  const saved = localStorage.getItem("qfarm-theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  // Sync BB8 checkbox: checked = dark mode (night sky)
  const cb = document.getElementById("theme-toggle");
  if (cb) cb.checked = saved === "dark";
}

/**
 * Toggles between light and dark theme.
 * @param {boolean} isDark - true when BB8 checkbox is checked (night)
 */
function toggleTheme(isDark) {
  const next = isDark ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("qfarm-theme", next);
}

// Apply theme before DOM is painted (prevents flash)
initTheme();

/* ──────────────────────────────────────────────
   TASK 4.1: SMART QUOTE CALCULATOR
────────────────────────────────────────────── */

/**
 * Calculates the estimated cost based on user inputs.
 * Triggered by input changes and button click.
 */
function calculateTotal() {
  const animalInput = document.getElementById("animal-count");
  const serviceMilking = document.getElementById("service-milking");
  const serviceFeeding = document.getElementById("service-feeding");
  const serviceTracking = document.getElementById("service-tracking");
  const resultDisplay = document.getElementById("total-price");

  if (!animalInput) return; // Guard: not on calculator page

  const count = parseInt(animalInput.value) || 0;

  const COST_MILKING = parseInt(serviceMilking.value);
  const COST_FEEDING = parseInt(serviceFeeding.value);
  const COST_TRACKING_PER_ANIMAL = parseInt(serviceTracking.value);
  const BASE_SETUP_FEE = 10000;
  const BASE_COST_PER_ANIMAL = 200;

  let total = 0;

  if (
    count > 0 ||
    serviceMilking.checked ||
    serviceFeeding.checked ||
    serviceTracking.checked
  ) {
    total += BASE_SETUP_FEE;
    total += count * BASE_COST_PER_ANIMAL;
    if (serviceMilking.checked) total += COST_MILKING;
    if (serviceFeeding.checked) total += COST_FEEDING;
    if (serviceTracking.checked) total += count * COST_TRACKING_PER_ANIMAL;
  }

  animateValue(resultDisplay, total);
}

/**
 * Animates the price display with a pop effect.
 * @param {HTMLElement} element
 * @param {number} value
 */
function animateValue(element, value) {
  const formatter = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  element.style.transform = "scale(1.12)";
  element.textContent = formatter.format(value);
  setTimeout(() => {
    element.style.transform = "scale(1)";
  }, 180);
}

/* ──────────────────────────────────────────────
   DOM READY: helpers
────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  /* Block negative numbers in animal input */
  const numInput = document.getElementById("animal-count");
  if (numInput) {
    numInput.addEventListener("input", (e) => {
      if (parseInt(e.target.value) < 0) e.target.value = 0;
    });
  }

  /* ── Scroll Reveal Animation ── */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: just show everything
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ── Animated Counter (Stats Section) ── */
  const counters = document.querySelectorAll(".stat-number[data-target]");
  if (counters.length > 0) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );
    counters.forEach((counter) => countObserver.observe(counter));
  }
});

/**
 * Animates a counter from 0 to the data-target value.
 * @param {HTMLElement} el
 */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800; // ms
  const step = 16; // ~60fps
  const totalSteps = duration / step;
  let current = 0;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3); // cubic ease-out

  let frame = 0;
  const timer = setInterval(() => {
    frame++;
    const progress = easeOut(frame / totalSteps);
    current = Math.min(Math.round(progress * target), target);
    el.textContent = current.toLocaleString("tr-TR");
    if (current >= target) clearInterval(timer);
  }, step);
}
