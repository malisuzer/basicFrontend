const API_URL = "https://api.npoint.io/433d2b54b3c3bb324e23";

// State Management
let announcementsData = [];
let myTasks = [];
let currentFilter = "hayvanlar"; // Start with animal emergencies by default

// DOM Elements
const grid = document.getElementById("announcements-grid");
const categoryContainer = document.getElementById("category-filters");
const tasksList = document.getElementById("my-tasks-list");
const taskCount = document.getElementById("task-count");
const filterAllBtn = document.querySelector('.filter-btn[data-category="all"]');
const offlineBanner = document.getElementById("offline-banner");
const pulseIndicator = document.querySelector(".pulse-indicator");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const themeToggle = document.getElementById("theme-toggle");
const toggleMapBtn = document.getElementById("toggle-map-btn");
const mapContainer = document.getElementById("map-container");

// Map State
let leafletMap = null;
let mapMarkers = [];

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadTasksFromLocal();
  initNetworkListeners();
  initEventListeners();
  fetchData();
});

function initEventListeners() {
  searchInput.addEventListener("input", renderAnnouncements);
  sortSelect.addEventListener("change", renderAnnouncements);
  themeToggle.addEventListener("click", toggleTheme);
  toggleMapBtn.addEventListener("click", toggleMap);
}

// Network Status
function initNetworkListeners() {
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
  updateNetworkStatus();
}

function updateNetworkStatus() {
  if (navigator.onLine) {
    offlineBanner.classList.add("hidden");
    pulseIndicator.innerHTML = '<span class="pulse"></span> Canlı Akış';
    pulseIndicator.style.color = "var(--success-color)";
    pulseIndicator.style.background = "rgba(16, 185, 129, 0.1)";
    pulseIndicator.style.borderColor = "rgba(16, 185, 129, 0.2)";

    // Refresh data if coming back online
    if (announcementsData.length === 0) {
      fetchData();
    }
  } else {
    offlineBanner.classList.remove("hidden");
    pulseIndicator.innerHTML =
      '<i class="fa-solid fa-cloud-arrow-down"></i> Çevrimdışı Bellek';
    pulseIndicator.style.color = "var(--warning-color)";
    pulseIndicator.style.background = "rgba(245, 158, 11, 0.1)";
    pulseIndicator.style.borderColor = "rgba(245, 158, 11, 0.2)";
  }
}

// Data Fetching
async function fetchData() {
  try {
    renderSkeletons(); // Show loading state

    if (!navigator.onLine) {
      handleOfflineData();
      return;
    }

    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    announcementsData = data; // API returns a flat array directly

    // Cache for offline
    localStorage.setItem(
      "cachedAnnouncements",
      JSON.stringify(announcementsData),
    );

    processData();
  } catch (error) {
    console.error("Fetch error:", error);
    handleOfflineData();
  }
}

function handleOfflineData() {
  const cached = localStorage.getItem("cachedAnnouncements");
  if (cached) {
    announcementsData = JSON.parse(cached);
    processData();
  } else {
    grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>İnternet bağlantınız yok ve önbellekte veri bulunamadı.</p>
            </div>`;
  }
}

function processData() {
  renderCategories();
  renderAnnouncements();
}

// Rendering
function renderCategories() {
  // Determine unique categories
  const categories = [
    ...new Set(announcementsData.map((item) => item.kategori)),
  ];

  categoryContainer.innerHTML = "";
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.category = cat;
    const labels = {
      gida: "Gıda",
      barinma: "Barınma",
      saglik: "Sağlık",
      hayvanlar: "Hayvanlar 🐾",
      egitim: "Eğitim",
      esya: "Eşya",
      psikoloji: "Psikoloji",
      lojistik: "Lojistik",
      cocuk: "Çocuk",
      is: "İş / İstihdam",
    };
    btn.textContent = labels[cat] || cat;
    if (cat === currentFilter) {
      btn.classList.add("active");
    }
    btn.addEventListener("click", handleFilterClick);
    categoryContainer.appendChild(btn);
  });

  // Re-attach listener to 'all' button
  if (currentFilter === "all") {
    filterAllBtn.classList.add("active");
  } else {
    filterAllBtn.classList.remove("active");
  }
  filterAllBtn.addEventListener("click", handleFilterClick);
}

function handleFilterClick(e) {
  const btns = document.querySelectorAll(".filter-btn");
  btns.forEach((b) => b.classList.remove("active"));

  e.target.classList.add("active");
  currentFilter = e.target.dataset.category;

  renderAnnouncements();
}

function renderAnnouncements() {
  grid.innerHTML = "";

  let filteredData = [...announcementsData]; // Clone array for sorting

  // 1. Category Filter
  if (currentFilter !== "all") {
    filteredData = filteredData.filter(
      (item) => item.kategori === currentFilter,
    );
  }

  // 2. Search Filter
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filteredData = filteredData.filter(
      (item) =>
        item.baslik.toLowerCase().includes(searchTerm) ||
        item.detay.toLowerCase().includes(searchTerm) ||
        item.konum.toLowerCase().includes(searchTerm),
    );
  }

  // 3. Sorting
  const sortValue = sortSelect.value;
  if (sortValue === "newest") {
    filteredData.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
  } else if (sortValue === "oldest") {
    filteredData.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
  } else if (sortValue === "urgent") {
    filteredData.sort((a, b) => (b.acil === true) - (a.acil === true)); // Acil olanlar öne
  }

  if (filteredData.length === 0) {
    grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p>Arama veya filtre kriterlerinize uyan ilan bulunamadı.</p>
            </div>`;
    updateMap(filteredData);
    return;
  }

  filteredData.forEach((item) => {
    const isTaskTaken = myTasks.some((task) => task.id === item.id);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
            <div class="card-header">
                <div class="badges-group">
                    <span class="badge ${item.tip === "ihtiyac" ? "ihtiyac" : "destek"}">
                        ${item.tip === "ihtiyac" ? "İhtiyaç" : "Destek"}
                    </span>
                    ${item.acil ? '<span class="badge acil"><i class="fa-solid fa-bolt"></i> Acil</span>' : ""}
                </div>
            </div>
            
            <h3 class="card-title">${item.baslik}</h3>
            <p class="card-description">${item.detay}</p>
            
            <div class="card-meta">
                <span class="meta-item"><i class="fa-solid fa-location-dot"></i> ${item.konum}</span>
                <span class="meta-item"><i class="fa-solid fa-calendar-day"></i> ${formatDate(item.tarih)}</span>
            </div>
            
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <button class="action-btn take" onclick="takeTask(${item.id})" ${isTaskTaken ? "disabled" : ""} style="margin-top: 0; flex: 1;">
                    ${isTaskTaken ? '<i class="fa-solid fa-check"></i> Üstlenildi' : '<i class="fa-solid fa-hand-holding-heart"></i> Ben Üstleniyorum'}
                </button>
                <button class="action-btn share-btn" onclick="shareTask(${item.id})" style="margin-top: 0; width: auto; padding: 0.75rem 1rem; background: var(--surface-hover); color: var(--text-primary); border: 1px solid var(--border-color);" title="İlanı Paylaş">
                    <i class="fa-solid fa-share-nodes"></i>
                </button>
            </div>
        `;
    grid.appendChild(card);
  });

  updateMap(filteredData);
}

// Task Management (LocalStorage)
window.takeTask = function (id) {
  const item = announcementsData.find((i) => i.id === id);
  if (!item) return;

  // Check if already taken
  if (myTasks.some((t) => t.id === item.id)) return;

  myTasks.push(item);
  saveTasksToLocal();
  renderTasksList();

  // Update main grid button state
  renderAnnouncements();

  showToast("Görev başarıyla üstlenildi!", "success");
};

window.removeTask = function (id) {
  myTasks = myTasks.filter((t) => t.id !== id);
  saveTasksToLocal();
  renderTasksList();
  renderAnnouncements(); // Update button state

  showToast("Görev bırakıldı.", "warning");
};

function saveTasksToLocal() {
  localStorage.setItem("myTasks", JSON.stringify(myTasks));
}

window.shareTask = function (id) {
  const item = announcementsData.find((i) => i.id === id);
  if (!item) return;

  const shareText = `📌 Afet Destek Ağı:\n[${item.acil ? "ACİL " : ""}${item.tip.toUpperCase()}] ${item.baslik}\n📍 ${item.konum}\n\nDetay: ${item.detay}`;

  // Copy to clipboard
  navigator.clipboard
    .writeText(shareText)
    .then(() => {
      showToast(
        "İlan kopyalandı! İstediğiniz yerde paylaşabilirsiniz.",
        "info",
      );
    })
    .catch((err) => {
      console.error("Kopyalama başarısız:", err);
      showToast("Kopyalama başarısız oldu.", "error");
    });
};

function loadTasksFromLocal() {
  const saved = localStorage.getItem("myTasks");
  if (saved) {
    myTasks = JSON.parse(saved);
  }
  renderTasksList();
}

function renderTasksList() {
  taskCount.textContent = myTasks.length;

  if (myTasks.length === 0) {
    tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-folder-open"></i>
                <p>Henüz bir görev üstlenmediniz.</p>
            </div>
        `;
    return;
  }

  tasksList.innerHTML = "";
  myTasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = "task-item";
    div.innerHTML = `
            <h4>${task.baslik}</h4>
            <p><i class="fa-solid fa-location-dot"></i> ${task.konum}</p>
            <button class="remove-task" onclick="removeTask(${task.id})" title="Görevi Bırak">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
    tasksList.appendChild(div);
  });
}

// Utils
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderSkeletons() {
  grid.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    grid.innerHTML += `
            <div class="card" style="border-color: transparent;">
                <div class="skeleton skeleton-title" style="width: 30%; height: 20px; margin-bottom: 1rem;"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width: 60%"></div>
                <div class="skeleton" style="height: 40px; margin-top: 1rem;"></div>
            </div>
        `;
  }
}

// --- Advanced App Features ---

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    themeToggle.innerHTML = '<i class="fa-regular fa-sun"></i>';
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-theme");
  const isLight = document.body.classList.contains("light-theme");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  themeToggle.innerHTML = isLight
    ? '<i class="fa-regular fa-sun"></i>'
    : '<i class="fa-regular fa-moon"></i>';
}

// Toast Notifications
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon =
    type === "success"
      ? "fa-circle-check"
      : type === "error"
        ? "fa-circle-xmark"
        : "fa-circle-exclamation";

  toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Map Functionality (Leaflet)
function initMap() {
  if (leafletMap || typeof L === "undefined") return;

  // Center of Turkey approximately
  leafletMap = L.map("map-container").setView([39.9, 32.8], 5);

  // Add OpenStreetMap tiles (free)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(leafletMap);
}

function toggleMap() {
  mapContainer.classList.toggle("hidden");
  if (mapContainer.classList.contains("hidden")) {
    toggleMapBtn.textContent = "Haritayı Göster";
  } else {
    toggleMapBtn.textContent = "Haritayı Gizle";
    if (!leafletMap) initMap();
    setTimeout(() => leafletMap.invalidateSize(), 100); // Fix display bug when unhiding
  }
}

// Simple lookup for generating coordinates based on city text (Since API lacks Lat/Lng)
const cityCoordinates = {
  Düzce: [40.84, 31.15],
  Sakarya: [40.75, 30.37],
  Hatay: [36.2, 36.16],
  İzmir: [38.42, 27.14],
  Ankara: [39.92, 32.85],
  Kahramanmaraş: [37.57, 36.92],
  Bursa: [40.18, 29.06],
  Kocaeli: [40.76, 29.91],
  Gaziantep: [37.06, 37.38],
  Online: [39.9, 32.8], // Default center for online
};

function updateMap(data) {
  if (typeof L === "undefined" || !document.getElementById("map-container"))
    return;
  if (!leafletMap && !mapContainer.classList.contains("hidden")) initMap();
  if (!leafletMap) return; // Map is hidden and not initialized

  // Clear existing markers
  mapMarkers.forEach((marker) => leafletMap.removeLayer(marker));
  mapMarkers = [];

  data.forEach((item) => {
    // Very basic coordinate resolution matching text to known cities
    let coords = [39.9, 32.8]; // Default Fallback

    for (const [city, cityCoords] of Object.entries(cityCoordinates)) {
      if (item.konum.includes(city)) {
        // Add tiny random offset so markers in same city don't completely overlap
        coords = [
          cityCoords[0] + (Math.random() - 0.5) * 0.05,
          cityCoords[1] + (Math.random() - 0.5) * 0.05,
        ];
        break;
      }
    }

    // Custom marker colors based on type
    const markerColor =
      item.tip === "ihtiyac" ? (item.acil ? "red" : "orange") : "green";

    const markerHtmlStyles = `
          background-color: ${markerColor};
          width: 20px;
          height: 20px;
          display: block;
          left: -10px;
          top: -10px;
          position: relative;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 5px rgba(0,0,0,0.5);
        `;

    const customIcon = L.divIcon({
      className: "custom-pin",
      iconAnchor: [0, 0],
      popupAnchor: [0, -10],
      html: `<span style="${markerHtmlStyles}"></span>`,
    });

    const marker = L.marker(coords, { icon: customIcon })
      .bindPopup(
        `<b>${item.baslik}</b><br>${item.konum}<br><br><span style="color: ${markerColor}; font-weight: bold;">${item.tip.toUpperCase()}</span>`,
      )
      .addTo(leafletMap);

    mapMarkers.push(marker);
  });
}
