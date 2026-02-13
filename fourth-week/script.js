// Task 4.1: Smart Quote Module Logic

/**
 * Calculates the estimated cost based on user inputs.
 * Triggered by input changes and button click.
 */
function calculateTotal() {
  // 1. Get DOM Elements
  const animalInput = document.getElementById("animal-count");
  const serviceMilking = document.getElementById("service-milking");
  const serviceFeeding = document.getElementById("service-feeding");
  const serviceTracking = document.getElementById("service-tracking");
  const resultDisplay = document.getElementById("total-price");

  // 2. Parse Values
  const count = parseInt(animalInput.value) || 0;

  // Service Costs (defined in value attributes or fixed here)
  const COST_MILKING = parseInt(serviceMilking.value);
  const COST_FEEDING = parseInt(serviceFeeding.value);
  const COST_TRACKING_PER_ANIMAL = parseInt(serviceTracking.value);

  // Base System Constants
  const BASE_SETUP_FEE = 10000; // Sabit kurulum ücreti
  const BASE_COST_PER_ANIMAL = 200; // Hayvan başına temel kurulum maliyeti

  // 3. Logic: Calculate Total
  let total = 0;

  // Maliyet hesaplaması en az 1 hayvan veya 1 hizmet seçildiğinde başlasın
  // veya sadece boşken 0 gösterelim.

  if (
    count > 0 ||
    serviceMilking.checked ||
    serviceFeeding.checked ||
    serviceTracking.checked
  ) {
    // Base Setup is applied if there is any activity
    total += BASE_SETUP_FEE;

    // Animal based costs
    total += count * BASE_COST_PER_ANIMAL;

    // Add Services
    if (serviceMilking.checked) {
      total += COST_MILKING;
    }

    if (serviceFeeding.checked) {
      total += COST_FEEDING;
    }

    if (serviceTracking.checked) {
      total += count * COST_TRACKING_PER_ANIMAL;
    }
  }

  // 4. Update DOM with Animation
  animateValue(resultDisplay, total);
}

/**
 * Animates the value change in the result display
 * @param {HTMLElement} element
 * @param {number} value
 */
function animateValue(element, value) {
  // Format as Currency
  const formatter = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formattedValue = formatter.format(value);

  // Simple visual pop effect
  element.style.transform = "scale(1.1)";
  element.textContent = formattedValue;

  setTimeout(() => {
    element.style.transform = "scale(1)";
  }, 150);
}

// Initialize on load to ensure 0 TL is shown correctly formatted if needed
document.addEventListener("DOMContentLoaded", () => {
  // Optional: Add event listeners here if not using inline onclick/onchange
  // But inline is already used in HTML.

  // Prevent negative numbers manually if needed
  const numInput = document.getElementById("animal-count");
  numInput.addEventListener("input", (e) => {
    if (e.target.value < 0) e.target.value = 0;
  });
});
