/* ================================================================
   app.js — AgriSense AI  SPA (hash-router, all pages, interactivity)
   Depends on: icons.js, db.js, style.css
   ================================================================ */

(() => {
  "use strict";

  // ── Globals ──
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const app = () => $("#app");

  // ── Navigation links ──
  const NAV_LINKS = [
    { hash: "#/", label: "Home" },
    { hash: "#/dashboard", label: "Dashboard" },
    { hash: "#/recommend", label: "Crop Recommendation" },
    { hash: "#/diagnose", label: "Disease Detection" },
    { hash: "#/weather", label: "Weather" },
    { hash: "#/market", label: "Market" },
    { hash: "#/schemes", label: "Schemes" },
    { hash: "#/about", label: "About" },
    { hash: "#/contact", label: "Contact" },
  ];

  const LANGUAGES = ["English", "हिन्दी", "தமிழ்", "తెలుగు", "मराठी"];

  // ── State ──
  let currentLang = "English";
  let mobileMenuOpen = false;
  let langDropdownOpen = false;
  let isOffline = !navigator.onLine;

  // ── Disease detection state ──
  let diagMethod = "upload";  // "upload" or "camera"
  let diagImageFile = null;   // File object
  let diagImageURL = null;    // Object URL for preview
  let diagLoading = false;
  let diagResult = null;      // API response
  let diagError = null;
  let diagStream = null;      // MediaStream for camera

  // ── Weather live state ──
  let weatherData = null;     // live API data
  let weatherLoading = false;
  let weatherError = null;

  // ============================================================
  //  TOAST SYSTEM
  // ============================================================

  function showToast(message, type = "info") {
    let container = $(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const t = document.createElement("div");
    t.className = `toast toast-${type}`;
    t.textContent = message;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  // ============================================================
  //  DARK MODE
  // ============================================================

  function isDark() {
    return document.documentElement.classList.contains("dark");
  }

  function applyTheme() {
    const stored = localStorage.getItem("agrisense-theme");
    if (stored === "dark") document.documentElement.classList.add("dark");
  }

  function toggleTheme() {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("agrisense-theme", next ? "dark" : "light");
    render(); // re-render to update sun/moon icon
  }

  // ============================================================
  //  NAVBAR
  // ============================================================

  function renderNavbar() {
    const hash = location.hash || "#/";
    return `
    <header class="navbar glass">
      <nav class="navbar-inner">
        <a href="#/" class="navbar-brand">
          <span class="navbar-brand-icon">${Icons.leaf(20)}</span>
          <span class="navbar-brand-text">AgriSense AI</span>
        </a>

        <div class="navbar-links">
          ${NAV_LINKS.map(l => `
            <a href="${l.hash}" class="navbar-link ${hash === l.hash || (l.hash === '#/' && hash === '') ? 'active' : ''}">${l.label}</a>
          `).join("")}
        </div>

        <div class="navbar-actions">
          <div class="dropdown" id="lang-dropdown">
            <button class="btn-ghost btn-icon" aria-label="Select language" onclick="App.toggleLangDropdown()">${Icons.globe(20)}</button>
            <div class="dropdown-menu ${langDropdownOpen ? 'open' : ''}" id="lang-menu">
              ${LANGUAGES.map(l => `
                <button class="dropdown-item" onclick="App.setLang('${l}')">${l} ${currentLang === l ? '✓' : ''}</button>
              `).join("")}
            </div>
          </div>

          <button class="btn-ghost btn-icon" aria-label="Toggle dark mode" onclick="App.toggleTheme()">
            ${isDark() ? Icons.sun(20) : Icons.moon(20)}
          </button>

          <a href="#/login" aria-label="Farmer profile">
            <div class="avatar">RK</div>
          </a>

          <button class="btn-ghost btn-icon navbar-hamburger" aria-label="${mobileMenuOpen ? 'Close menu' : 'Open menu'}" onclick="App.toggleMobileMenu()">
            ${mobileMenuOpen ? Icons.x(20) : Icons.menu(20)}
          </button>
        </div>
      </nav>

      <div class="mobile-nav ${mobileMenuOpen ? 'open' : ''}" id="mobile-nav">
        <div>
          ${NAV_LINKS.map(l => `
            <a href="${l.hash}" class="mobile-nav-link ${hash === l.hash ? 'active' : ''}" onclick="App.closeMobileMenu()">${l.label}</a>
          `).join("")}
        </div>
      </div>
    </header>`;
  }

  // ============================================================
  //  FOOTER
  // ============================================================

  function renderFooter() {
    return `
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <div class="flex items-center gap-2">
            <span class="navbar-brand-icon">${Icons.leaf(20)}</span>
            <span class="navbar-brand-text">AgriSense AI</span>
          </div>
          <p class="mt-4 text-sm text-muted-foreground" style="max-width:20rem">
            AI powered crop recommendation for Indian farmers — soil, weather and market intelligence in one place.
          </p>
        </div>
        <div>
          <h3 class="footer-heading">Quick links</h3>
          <ul class="footer-links">
            <li><a href="#/recommend">Crop recommendation</a></li>
            <li><a href="#/weather">Weather</a></li>
            <li><a href="#/market">Market prices</a></li>
            <li><a href="#/schemes">Government schemes</a></li>
          </ul>
        </div>
        <div>
          <h3 class="footer-heading">Legal</h3>
          <ul class="footer-links">
            <li>Privacy policy</li>
            <li>Terms of use</li>
            <li>Data protection</li>
            <li>Accessibility</li>
          </ul>
        </div>
        <div>
          <h3 class="footer-heading">Connect</h3>
          <ul class="footer-links">
            <li>support@agrisense.ai</li>
            <li>1800-180-1551 (Kisan Call Centre)</li>
            <li>Twitter · YouTube · WhatsApp</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">© ${new Date().getFullYear()} AgriSense AI · Built for Smart India Hackathon</div>
    </footer>`;
  }

  // ============================================================
  //  PAGE HEADER
  // ============================================================

  function pageHeader(title, subtitle) {
    return `
    <div class="page-header">
      <div class="page-header-inner anim-fade-up">
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
    </div>`;
  }

  // ============================================================
  //  SECTION HEADER
  // ============================================================

  function sectionHeader(eyebrow, title, subtitle) {
    let html = '<div class="section-header anim-fade-up">';
    if (eyebrow) html += `<span class="section-eyebrow">${eyebrow}</span>`;
    if (title) html += `<h2 class="section-title">${title}</h2>`;
    if (subtitle) html += `<p class="section-subtitle">${subtitle}</p>`;
    html += '</div>';
    return html;
  }

  // ============================================================
  //  HOME PAGE
  // ============================================================

  const HOME_FEATURES = [
    { icon: "sprout", title: "AI Crop Recommendation", body: "Best-fit crops ranked by confidence for your exact plot." },
    { icon: "flaskConical", title: "Soil Analysis", body: "N-P-K, pH, moisture and organic carbon interpreted for you." },
    { icon: "cloudSun", title: "Live Weather", body: "Hyper-local forecast with sowing and irrigation advisories." },
    { icon: "leaf", title: "Fertilizer Suggestion", body: "Organic and chemical doses with a schedule and cost." },
    { icon: "activity", title: "Crop Health Monitoring", body: "Track growth stages and catch pest risk early." },
    { icon: "indianRupee", title: "Market Prices", body: "Nearby mandi rates with weekly and monthly trends." },
    { icon: "landmark", title: "Government Schemes", body: "Eligibility, benefits and direct application links." },
    { icon: "barChart3", title: "Farm Analytics", body: "Yield history, profit tracking and season comparisons." },
    { icon: "languages", title: "Multilingual", body: "English, Hindi, Tamil, Telugu, Marathi and more." },
    { icon: "mic", title: "Voice Assistance", body: "Speak your farm details, hear the recommendation back." },
  ];

  const HOME_STEPS = [
    { title: "Enter farm details", body: "Location, farm size, season and soil values — or scan a soil card." },
    { title: "AI analyses soil + weather", body: "The model weighs 20+ agronomic signals for your district." },
    { title: "Best crops recommended", body: "Ranked crops with confidence, profit and water needs." },
    { title: "Farmer starts cultivation", body: "Follow the fertilizer schedule and weather advisories." },
  ];

  function renderHome() {
    return `
    <section class="gradient-hero hero text-primary-foreground">
      <div class="hero-grid">
        <div class="anim-fade-up">
          <span class="hero-tag glass-dark">Smart India Hackathon · Agriculture</span>
          <h1 class="hero-title">AI Powered Crop Recommendation System</h1>
          <p class="hero-subtitle">Helping farmers make smarter farming decisions using artificial intelligence — soil, weather, and market signals combined into one clear answer.</p>
          <div class="flex flex-wrap gap-3 mt-8">
            <a href="#/recommend" class="btn btn-accent">${Icons.arrowRight(16)} Get Recommendation</a>
            <a href="#how" class="btn btn-hero-outline">Learn More</a>
          </div>
          <dl class="hero-stats">
            ${[["22+", "Crops modelled"], ["94%", "Model accuracy"], ["10", "Languages"]].map(([k, v]) => `
              <div><dt>${k}</dt><dd>${v}</dd></div>
            `).join("")}
          </dl>
        </div>
        <div class="anim-scale-in">
          <div class="hero-image-wrap glass-dark">
            <img src="assets/images/hero-farming.jpg" width="1536" height="1024"
                 alt="Farmer using an AI dashboard beside terraced crop fields" loading="lazy">
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      ${sectionHeader("Features", "Everything a farm needs, in one app", "Built for low-bandwidth phones and first-time smartphone users.")}
      <div class="grid grid-3 sm-grid-1 lg-grid-3" style="grid-template-columns: repeat(3, 1fr)">
        ${HOME_FEATURES.map((f, i) => `
          <div class="anim-fade-up delay-${(i % 3) + 1}">
            <div class="card card-lift p-6 shadow-soft" style="height:100%">
              <span class="feature-icon">${Icons[f.icon](20)}</span>
              <h3 class="mt-4 text-lg font-semibold">${f.title}</h3>
              <p class="mt-2 text-sm text-muted-foreground">${f.body}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </section>

    <div class="bg-muted-40">
      <section class="section" id="how">
        ${sectionHeader("How it works", "From farm details to a confident decision", "")}
        <ol class="grid" style="max-width:56rem;margin-inline:auto">
          ${HOME_STEPS.map((s, i) => `
            <li class="flex gap-5 card p-6 shadow-soft anim-fade-left delay-${i + 1}" style="border-radius:var(--radius-3xl)">
              <span class="step-number">${i + 1}</span>
              <div class="min-w-0">
                <h3 class="text-lg font-semibold">${s.title}</h3>
                <p class="mt-1 text-sm text-muted-foreground">${s.body}</p>
              </div>
            </li>
          `).join("")}
        </ol>
      </section>
    </div>

    <section class="section">
      <div class="cta-banner gradient-hero text-primary-foreground">
        <h2 class="text-3xl font-semibold" style="font-size:clamp(1.5rem,4vw,2.25rem)">Ready to plan this season?</h2>
        <p class="mx-auto mt-3" style="max-width:36rem;opacity:.85">Answer five short steps and get a ranked crop plan with fertilizer schedule and expected profit.</p>
        <a href="#/recommend" class="btn btn-accent mt-8">Get Recommendation</a>
      </div>
    </section>`;
  }

  // ============================================================
  //  DASHBOARD PAGE
  // ============================================================

  function renderDashboard() {
    const dashActions = [
      { hash: "#/recommend", icon: "sprout", label: "Recommend crop" },
      { hash: "#/weather", icon: "cloudSun", label: "Weather" },
      { hash: "#/market", icon: "indianRupee", label: "Market prices" },
      { hash: "#/recommend", icon: "flaskConical", label: "Soil health" },
      { hash: "#/dashboard", icon: "history", label: "History" },
      { hash: "#/login", icon: "user", label: "Profile" },
    ];

    return `
    ${pageHeader("Namaste, Ramesh 👋", "Kharif season · Nashik, Maharashtra · 3.2 acres")}
    <div class="container py-10">
      <div class="grid" style="grid-template-columns: repeat(3, 1fr)">

        <!-- Weather card -->
        <div class="card p-6 shadow-soft anim-fade-up">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">Today's weather</h2>
            ${Icons.cloudSun(20)}
          </div>
          <p class="mt-4 text-4xl font-semibold">29°C</p>
          <p class="text-sm text-muted-foreground">Partly cloudy · Humidity 68% · Wind 12 km/h</p>
          <p class="mt-4 text-sm" style="border-radius:var(--radius-2xl);background:color-mix(in oklab,var(--accent) 60%,transparent);padding:0.75rem;color:var(--accent-foreground)">
            Rain expected tomorrow — avoid irrigation today.
          </p>
        </div>

        <!-- Latest recommendation -->
        <div class="card p-6 shadow-soft anim-fade-up delay-1">
          <h2 class="font-semibold">Latest recommendation</h2>
          <div class="flex items-center gap-3 mt-4">
            <span style="font-size:2.25rem">🌾</span>
            <div>
              <p class="text-lg font-semibold">Rice (Paddy)</p>
              <p class="text-sm text-muted-foreground">12 Jul 2026</p>
            </div>
          </div>
          <p class="mt-4 text-sm text-muted-foreground">Confidence</p>
          <div class="progress mt-2"><div class="progress-bar" style="width:94%"></div></div>
          <p class="mt-2 text-sm font-medium">94% match</p>
        </div>

        <!-- Farm summary -->
        <div class="card p-6 shadow-soft anim-fade-up delay-2">
          <h2 class="font-semibold">Farm summary</h2>
          <dl class="mt-4 grid gap-3 text-sm">
            ${[["Farm size","3.2 acres"],["Soil type","Clay loam"],["Irrigation","Drip"],["Previous crop","Groundnut"],["Organic","Partial"]].map(([k,v]) => `
              <div class="flex justify-between gap-4">
                <dt class="text-muted-foreground">${k}</dt>
                <dd class="font-medium">${v}</dd>
              </div>
            `).join("")}
          </dl>
        </div>

        <!-- Notifications -->
        <div class="card p-6 shadow-soft anim-fade-up" style="grid-column:span 2">
          <div class="flex items-center gap-2">
            ${Icons.bell(16)}
            <h2 class="font-semibold">Notifications &amp; government updates</h2>
          </div>
          <ul class="mt-4 grid gap-3">
            ${notifications.map(n => `
              <li class="notification-item">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-medium">${n.title}</p>
                  <span class="badge ${n.tone === 'warn' ? 'badge-destructive' : 'badge-secondary'}">${n.tone === 'warn' ? 'Alert' : 'Update'}</span>
                </div>
                <p class="mt-1 text-sm text-muted-foreground">${n.body}</p>
              </li>
            `).join("")}
          </ul>
        </div>

        <!-- Quick actions -->
        <div class="card p-6 shadow-soft anim-fade-up delay-1">
          <h2 class="font-semibold">Quick actions</h2>
          <div class="grid grid-2 mt-4 gap-3">
            ${dashActions.map(a => `
              <a href="${a.hash}" class="quick-action card-lift">
                ${Icons[a.icon](20)}
                ${a.label}
              </a>
            `).join("")}
          </div>
        </div>

        <!-- History table -->
        <div class="card p-6 shadow-soft anim-fade-up" style="grid-column:span 3">
          <h2 class="font-semibold">Previous recommendations</h2>
          <div class="overflow-x-auto mt-4">
            <table class="table">
              <thead><tr>
                <th>Date</th><th>Crop</th><th>Confidence</th><th>Weather</th><th>Yield</th>
              </tr></thead>
              <tbody>
                ${recommendHistory.map(h => `
                  <tr>
                    <td>${h.date}</td>
                    <td class="font-medium">${h.crop}</td>
                    <td>${h.confidence}%</td>
                    <td>${h.weather}</td>
                    <td>${h.yield}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ============================================================
  //  RECOMMEND PAGE (5-step wizard)
  // ============================================================

  let recStep = 0;
  let recValues = {};
  let recPrefs = ["Maximum profit"];
  let recLoading = false;
  let recResult = false;

  const STEP_TITLES = ["Farmer details", "Farm details", "Soil details", "Weather", "Preference"];
  const STEP_FIELDS = {
    0: [
      { name: "name", label: "Full name", placeholder: "Ramesh Kumar" },
      { name: "phone", label: "Phone number", placeholder: "98765 43210", type: "tel" },
      { name: "state", label: "State", placeholder: "Maharashtra" },
      { name: "district", label: "District", placeholder: "Nashik" },
      { name: "village", label: "Village", placeholder: "Ozar" },
    ],
    1: [
      { name: "size", label: "Farm size (acres)", placeholder: "3.2", type: "number" },
      { name: "season", label: "Season", placeholder: "Kharif" },
      { name: "previous", label: "Previous crop", placeholder: "Groundnut" },
      { name: "water", label: "Water source", placeholder: "Borewell" },
      { name: "irrigation", label: "Irrigation method", placeholder: "Drip" },
      { name: "organic", label: "Organic farming", placeholder: "Partial" },
    ],
    2: [
      { name: "soil", label: "Soil type", placeholder: "Clay loam" },
      { name: "ph", label: "pH value", placeholder: "6.4", type: "number" },
      { name: "n", label: "Nitrogen (kg/ha)", placeholder: "280", type: "number" },
      { name: "p", label: "Phosphorus (kg/ha)", placeholder: "42", type: "number" },
      { name: "k", label: "Potassium (kg/ha)", placeholder: "190", type: "number" },
      { name: "moisture", label: "Moisture (%)", placeholder: "24", type: "number" },
      { name: "carbon", label: "Organic carbon (%)", placeholder: "0.72", type: "number" },
      { name: "micro", label: "Micronutrients (optional)", placeholder: "Zn, Fe" },
    ],
    3: [
      { name: "temp", label: "Temperature (°C)", placeholder: "29", type: "number" },
      { name: "humidity", label: "Humidity (%)", placeholder: "68", type: "number" },
      { name: "rainfall", label: "Rainfall (mm)", placeholder: "180", type: "number" },
      { name: "wind", label: "Wind speed (km/h)", placeholder: "12", type: "number" },
      { name: "sun", label: "Sunlight hours", placeholder: "8.4", type: "number" },
    ],
  };

  const PREFERENCES = [
    "Maximum profit", "Low investment", "Short duration crop", "Organic farming",
    "High yield", "Cash crop", "Food crop", "Export crop",
  ];

  function renderRecommend() {
    const best = crops[0];
    const alts = crops.slice(1);

    return `
    ${pageHeader("Crop recommendation", "Five short steps — takes about two minutes")}
    <div class="container py-10" style="max-width:56rem">

      <!-- Step indicators -->
      <div class="mb-8">
        <div class="flex flex-wrap gap-2">
          ${STEP_TITLES.map((t, i) => `
            <span class="badge ${i === recStep ? 'badge-default' : i < recStep ? 'badge-secondary' : 'badge-outline'}">
              ${i < recStep ? Icons.check(12) : ''} ${i + 1}. ${t}
            </span>
          `).join("")}
        </div>
        <div class="progress mt-4"><div class="progress-bar" style="width:${((recStep + 1) / 5) * 100}%"></div></div>
      </div>

      <!-- Form card -->
      <div class="card p-6 shadow-soft" style="border-radius:var(--radius-3xl)" id="rec-form-card">
        <h2 class="text-xl font-semibold">${STEP_TITLES[recStep]}</h2>

        ${recStep < 4 ? `
          <div class="grid grid-2 sm-grid-1 mt-6 gap-5">
            ${STEP_FIELDS[recStep].map(f => `
              <div class="grid gap-2">
                <label class="label" for="rec-${f.name}">${f.label}</label>
                <input class="input" id="rec-${f.name}" type="${f.type || 'text'}"
                       placeholder="${f.placeholder}" value="${recValues[f.name] || ''}"
                       onchange="App.setRecValue('${f.name}', this.value)" oninput="App.setRecValue('${f.name}', this.value)">
              </div>
            `).join("")}
            ${recStep === 0 ? `
              <div style="grid-column:1/-1">
                <button class="btn btn-outline btn-sm" onclick="App.useGPS()">
                  ${Icons.mapPin(16)} Use GPS location
                </button>
              </div>
            ` : ''}
            ${recStep === 3 ? `
              <p class="text-sm text-muted-foreground" style="grid-column:1/-1">
                Values auto-fetched from the nearest weather station. You can edit them if the API is unavailable.
              </p>
            ` : ''}
          </div>
        ` : `
          <div class="grid grid-2 sm-grid-1 mt-6 gap-3">
            ${PREFERENCES.map(p => `
              <button class="pref-chip ${recPrefs.includes(p) ? 'active' : ''}"
                      onclick="App.togglePref('${p}')">${p}</button>
            `).join("")}
          </div>
        `}

        <!-- Navigation -->
        <div class="flex flex-wrap items-center justify-between gap-3 mt-8">
          <button class="btn btn-ghost" ${recStep === 0 ? 'disabled' : ''} onclick="App.recBack()">
            ${Icons.chevronLeft(16)} Back
          </button>
          ${recStep < 4 ? `
            <button class="btn btn-primary" onclick="App.recNext()">Continue ${Icons.chevronRight(16)}</button>
          ` : `
            <button class="btn btn-primary" onclick="App.recSubmit()" ${recLoading ? 'disabled' : ''}>
              ${Icons.sparkles(16)} ${recLoading ? 'Analysing…' : 'Recommend Crop'}
            </button>
          `}
        </div>
      </div>

      <!-- Loading skeleton -->
      ${recLoading ? `
        <div class="mt-8 grid gap-4">
          <div class="skeleton" style="height:12rem"></div>
          <div class="grid grid-3 sm-grid-1 gap-4">
            <div class="skeleton" style="height:10rem"></div>
            <div class="skeleton" style="height:10rem"></div>
            <div class="skeleton" style="height:10rem"></div>
          </div>
        </div>
      ` : ''}

      <!-- Results -->
      ${recResult ? `
        <div class="mt-10 grid gap-6 anim-fade-up">

          <!-- Best crop card -->
          <div class="card gradient-hero overflow-hidden p-8 text-primary-foreground shadow-lift" style="border-radius:var(--radius-3xl)">
            <div class="flex flex-wrap items-center gap-6">
              <span class="result-emoji">${best.emoji}</span>
              <div class="min-w-0">
                <p class="text-sm" style="opacity:.8">Recommended crop</p>
                <h2 class="text-3xl font-semibold">${best.name}</h2>
                <p class="text-sm" style="font-style:italic;opacity:.75">${best.scientific}</p>
                <div class="flex flex-wrap gap-2 mt-3">
                  <span class="glass-dark" style="border-radius:9999px;padding:0.25rem 0.75rem;font-size:0.75rem">Confidence ${best.confidence}%</span>
                  <span class="glass-dark" style="border-radius:9999px;padding:0.25rem 0.75rem;font-size:0.75rem">Suitability ${best.suitability}%</span>
                </div>
              </div>
            </div>
            <div class="grid sm-grid-1 mt-8 gap-4" style="grid-template-columns:1fr 1fr">
              <div>
                <h3 class="text-sm font-semibold">Why this crop?</h3>
                <ul class="mt-3 grid gap-2 text-sm" style="opacity:.9">
                  ${best.reasons.map(r => `<li class="flex gap-2">${Icons.check(16)} ${r}</li>`).join("")}
                </ul>
              </div>
              <div class="result-meta-grid">
                ${[["Duration",best.duration],["Expected yield",best.yield],["Water need",best.water],["Profit",best.profit],
                   ["Investment",best.investment],["Difficulty",best.difficulty],["Best sowing",best.sowing],["Harvest",best.harvest]].map(([k,v]) => `
                  <div class="result-meta-item glass-dark">
                    <dt>${k}</dt><dd>${v}</dd>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- Alternatives -->
          <div>
            <h3 class="text-xl font-semibold">Alternative recommendations</h3>
            <div class="grid grid-3 sm-grid-1 mt-4 gap-4">
              ${alts.map(c => `
                <div class="card card-lift p-6 shadow-soft" style="border-radius:var(--radius-3xl)">
                  <span style="font-size:2.25rem">${c.emoji}</span>
                  <h4 class="mt-3 font-semibold">${c.name}</h4>
                  <p class="mt-1 text-sm text-muted-foreground">${c.confidence}% confidence · ${c.suitability}% suitable</p>
                  <dl class="mt-3 grid gap-1 text-sm text-muted-foreground">
                    <div class="flex justify-between"><dt>Profit</dt><dd class="font-medium text-foreground">${c.profit}</dd></div>
                    <div class="flex justify-between"><dt>Duration</dt><dd class="font-medium text-foreground">${c.duration}</dd></div>
                  </dl>
                  <button class="btn btn-outline btn-sm w-full mt-4" onclick="App.toast('${c.name} added to comparison')">Compare</button>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Fertilizer table -->
          <div class="card p-6 shadow-soft" style="border-radius:var(--radius-3xl)">
            <h3 class="text-xl font-semibold">Fertilizer recommendation</h3>
            <div class="overflow-x-auto mt-4">
              <table class="table">
                <thead><tr>
                  <th>Input</th><th>Type</th><th>Quantity</th><th>Application</th><th>Cost</th>
                </tr></thead>
                <tbody>
                  ${fertilizers.map(f => `
                    <tr>
                      <td class="font-medium">${f.name}</td>
                      <td>${f.type}</td><td>${f.qty}</td><td>${f.when}</td><td>${f.cost}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
            <button class="btn btn-primary mt-6" onclick="App.toast('PDF export queued', 'success')">Download as PDF</button>
          </div>
        </div>
      ` : ''}
    </div>`;
  }

  // ============================================================
  //  WEATHER PAGE
  // ============================================================

  // OpenWeatherMap icon code to emoji
  function owmEmoji(iconCode) {
    if (!iconCode) return "☀️";
    const map = {
      "01d": "☀️", "01n": "🌙", "02d": "⛅", "02n": "⛅",
      "03d": "☁️", "03n": "☁️", "04d": "☁️", "04n": "☁️",
      "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌧️",
      "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️",
      "50d": "🌫️", "50n": "🌫️",
    };
    return map[iconCode] || "☀️";
  }

  // Day name from date string
  function dayName(dateStr) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date(dateStr).getDay()];
  }

  async function fetchLiveWeather() {
    weatherLoading = true;
    render();

    try {
      // Get user location
      const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
      });

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const resp = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}`);
      if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
      const data = await resp.json();

      if (data.success) {
        weatherData = data;
        weatherLoading = false;
        weatherError = null;
      } else {
        throw new Error(data.error || "Weather fetch failed");
      }
    } catch (err) {
      weatherLoading = false;
      weatherError = err.message;
      console.warn("Weather fetch failed:", err);
    }
    render();
  }

  function renderWeather() {
    // Loading state
    if (weatherLoading) {
      return `
      ${pageHeader("Weather", "Fetching your location and live weather data…")}
      <div class="container py-10">
        <div class="grid" style="grid-template-columns:repeat(3,1fr)">
          ${Array(6).fill('').map(() => '<div class="skeleton" style="height:8rem"></div>').join('')}
        </div>
        <div class="mt-8 flex justify-center items-center gap-3">
          <div class="spinner"></div>
          <p class="text-sm text-muted-foreground">Loading weather data…</p>
        </div>
      </div>`;
    }

    // Error state (but still show fallback)
    if (weatherError && !weatherData) {
      // Fall through to use mock data, but show a note
    }

    // Use live data if available, otherwise fall back to mock
    const live = weatherData && weatherData.current;
    const cityName = live ? live.city : "Nashik, Maharashtra";
    const dataSource = live ? "live" : "cached sample";

    const metrics = live ? [
      { icon: "thermometer", label: "Temperature", value: `${Math.round(live.temp)}°C` },
      { icon: "droplets", label: "Humidity", value: `${live.humidity}%` },
      { icon: "wind", label: "Wind", value: `${live.wind_speed} km/h` },
      { icon: "cloudRain", label: "Clouds", value: `${live.clouds}%` },
      { icon: "cloudSun", label: "Feels like", value: `${Math.round(live.feels_like)}°C` },
      { icon: "activity", label: "Pressure", value: `${live.pressure} hPa` },
    ] : [
      { icon: "thermometer", label: "Temperature", value: "29°C" },
      { icon: "droplets", label: "Humidity", value: "68%" },
      { icon: "wind", label: "Wind", value: "12 km/h" },
      { icon: "cloudRain", label: "Rain chance", value: "35%" },
      { icon: "sun", label: "UV index", value: "7 (High)" },
      { icon: "cloudSun", label: "Sunlight", value: "8.4 hrs" },
    ];

    const liveForecast = weatherData && weatherData.forecast && weatherData.forecast.length;
    const forecastData = liveForecast ? weatherData.forecast : forecast;

    const weatherEmoji = (icon) => icon === "rain" ? "🌧️" : icon === "cloud" ? "⛅" : "☀️";

    return `
    ${pageHeader("Weather", `${cityName} · ${dataSource} data`)}
    <div class="container py-10">

      ${weatherError ? `
        <div class="error-card mb-8 anim-fade-up">
          <div class="error-card-icon">${Icons.alertTriangle(24)}</div>
          <p class="mt-3 font-semibold">Could not fetch live weather</p>
          <p class="mt-1 text-sm text-muted-foreground">${weatherError}</p>
          <button class="btn btn-outline btn-sm mt-4" onclick="App.retryWeather()">${Icons.refreshCw(14)} Retry</button>
        </div>
      ` : ''}

      ${live ? `<p class="mb-4 text-sm text-muted-foreground">${live.description.charAt(0).toUpperCase() + live.description.slice(1)}</p>` : ''}

      <div class="grid" style="grid-template-columns:repeat(3,1fr)">
        ${metrics.map((n, i) => `
          <div class="card card-lift p-6 shadow-soft anim-fade-up delay-${(i % 3) + 1}" style="border-radius:var(--radius-3xl)">
            <span class="text-primary">${Icons[n.icon](20)}</span>
            <p class="mt-3 text-sm text-muted-foreground">${n.label}</p>
            <p class="text-2xl font-semibold">${n.value}</p>
          </div>
        `).join("")}
      </div>

      <h2 class="mt-12 text-2xl font-semibold">${liveForecast ? '5 day forecast' : '7 day forecast'}</h2>
      <div class="grid mt-4" style="grid-template-columns:repeat(${liveForecast ? forecastData.length : 7},1fr)">
        ${liveForecast ? forecastData.map(d => `
          <div class="card card-lift p-5 text-center shadow-soft anim-fade-up" style="border-radius:var(--radius-3xl)">
            <p class="text-sm font-medium text-muted-foreground">${dayName(d.date)}</p>
            <p class="mt-2" style="font-size:1.875rem">${owmEmoji(d.icon)}</p>
            <p class="mt-2 font-semibold">${Math.round(d.temp_max)}°</p>
            <p class="text-xs text-muted-foreground">${Math.round(d.temp_min)}° · ${d.rain_chance}% rain</p>
          </div>
        `).join("") : forecast.map(d => `
          <div class="card card-lift p-5 text-center shadow-soft anim-fade-up" style="border-radius:var(--radius-3xl)">
            <p class="text-sm font-medium text-muted-foreground">${d.day}</p>
            <p class="mt-2" style="font-size:1.875rem">${weatherEmoji(d.icon)}</p>
            <p class="mt-2 font-semibold">${d.temp}°</p>
            <p class="text-xs text-muted-foreground">${d.min}° · ${d.rain}% rain</p>
          </div>
        `).join("")}
      </div>

      <div class="advisory-card mt-12 shadow-soft anim-fade-up">
        <h2 class="text-lg font-semibold">Farming advice</h2>
        <ul class="mt-3 grid gap-2">
          <li>Heavy rain expected Wednesday (80 mm) — skip irrigation today and tomorrow.</li>
          <li>Delay urea top-dressing until after the rain to avoid nutrient runoff.</li>
          <li>Check field drainage channels before Tuesday evening.</li>
          <li>Good spraying window: Friday morning, low wind and no rain.</li>
        </ul>
      </div>
    </div>`;
  }

  // ============================================================
  //  MARKET PAGE
  // ============================================================

  let marketQuery = "";

  function renderMarket() {
    const filtered = marketPrices.filter(r =>
      r.crop.toLowerCase().includes(marketQuery.toLowerCase()) ||
      r.market.toLowerCase().includes(marketQuery.toLowerCase())
    );

    return `
    ${pageHeader("Market prices", "Live mandi rates from nearby markets, updated daily")}
    <div class="container py-10">

      <div class="search-wrap">
        ${Icons.search(16)}
        <input class="input input-with-icon" placeholder="Search crop or mandi" aria-label="Search crop or mandi"
               value="${marketQuery}" oninput="App.setMarketQuery(this.value)">
      </div>

      <div class="grid mt-6" style="grid-template-columns:repeat(3,1fr)">
        ${filtered.length ? filtered.map(r => {
          const up = r.price >= r.prev;
          const delta = Math.abs(r.price - r.prev);
          return `
            <div class="card card-lift p-6 shadow-soft anim-fade-up" style="border-radius:var(--radius-3xl)">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="truncate font-semibold">${r.crop}</h3>
                  <p class="text-sm text-muted-foreground">${r.market}</p>
                </div>
                <span class="badge ${up ? 'badge-secondary' : 'badge-destructive'} shrink-0">
                  ${up ? Icons.trendingUp(12) : Icons.trendingDown(12)} ₹${delta}
                </span>
              </div>
              <p class="mt-4 text-3xl font-semibold">₹${r.price.toLocaleString("en-IN")}</p>
              <p class="text-xs text-muted-foreground">${r.unit} · yesterday ₹${r.prev.toLocaleString("en-IN")}</p>
            </div>`;
        }).join("") : '<p class="text-sm text-muted-foreground">No markets matched your search.</p>'}
      </div>

      <div class="card mt-10 p-6 shadow-soft anim-fade-up" style="border-radius:var(--radius-3xl)">
        <h2 class="text-lg font-semibold">5 week price trend</h2>
        <div class="chart-container">
          <canvas id="price-chart"></canvas>
        </div>
        <p class="mt-4 text-sm text-muted-foreground">
          Best selling market this week: <span class="font-medium text-foreground">Rajkot Mandi</span> for groundnut at ₹6,420/quintal.
        </p>
      </div>
    </div>`;
  }

  // ── Canvas Chart ──
  function drawPriceChart() {
    const canvas = $("#price-chart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 20, right: 20, bottom: 40, left: 55 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const allVals = priceTrend.flatMap(d => [d.rice, d.maize, d.cotton]);
    const minV = Math.min(...allVals) - 200;
    const maxV = Math.max(...allVals) + 200;

    const x = (i) => pad.left + (i / (priceTrend.length - 1)) * plotW;
    const y = (v) => pad.top + (1 - (v - minV) / (maxV - minV)) * plotH;

    // grid
    const style = getComputedStyle(document.documentElement);
    ctx.strokeStyle = style.getPropertyValue("--border").trim() || "#e5e7eb";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const gy = pad.top + (plotH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(w - pad.right, gy); ctx.stroke();
    }

    // labels
    ctx.fillStyle = style.getPropertyValue("--muted-foreground").trim() || "#6b7280";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "center";
    priceTrend.forEach((d, i) => ctx.fillText(d.week, x(i), h - pad.bottom + 24));
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const v = minV + ((maxV - minV) / 4) * (4 - i);
      ctx.fillText(Math.round(v).toLocaleString(), pad.left - 8, pad.top + (plotH / 4) * i + 4);
    }

    // lines
    const lines = [
      { key: "rice", color: style.getPropertyValue("--chart-1").trim() || "#294936" },
      { key: "maize", color: style.getPropertyValue("--chart-2").trim() || "#5B8266" },
      { key: "cotton", color: style.getPropertyValue("--chart-3").trim() || "#3E6259" },
    ];

    lines.forEach(line => {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      priceTrend.forEach((d, i) => {
        const px = x(i), py = y(d[line.key]);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.stroke();
    });

    // legend
    ctx.font = "11px Inter, sans-serif";
    const legendX = pad.left;
    const legendY = h - 4;
    lines.forEach((line, i) => {
      const lx = legendX + i * 80;
      ctx.fillStyle = line.color;
      ctx.fillRect(lx, legendY - 8, 12, 3);
      ctx.fillStyle = style.getPropertyValue("--muted-foreground").trim() || "#6b7280";
      ctx.textAlign = "left";
      ctx.fillText(line.key.charAt(0).toUpperCase() + line.key.slice(1), lx + 16, legendY);
    });
  }

  // ============================================================
  //  DISEASE DIAGNOSIS PAGE
  // ============================================================

  // Disease prevention tips lookup
  const DISEASE_TIPS = {
    "healthy": ["Your plant looks healthy! Continue with regular care.", "Maintain proper irrigation and nutrition."],
    "default": [
      "Remove and destroy infected plant parts immediately.",
      "Apply appropriate fungicide as recommended by your local agriculture department.",
      "Ensure proper spacing between plants for air circulation.",
      "Avoid overhead irrigation to reduce leaf wetness.",
      "Consider resistant varieties for the next planting season.",
    ],
  };

  function initUploadZone() {
    const zone = $(".upload-zone");
    if (!zone) return;
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        diagImageFile = file;
        diagImageURL = URL.createObjectURL(file);
        diagResult = null;
        diagError = null;
        render();
      }
    });
  }

  function renderDiagnose() {
    const confLevel = diagResult
      ? (diagResult.confidence >= 0.8 ? "high" : diagResult.confidence >= 0.5 ? "medium" : "low")
      : "";
    const isHealthy = diagResult && diagResult.disease_status.toLowerCase() === "healthy";
    const tips = diagResult
      ? (isHealthy ? DISEASE_TIPS.healthy : DISEASE_TIPS.default)
      : [];

    return `
    ${pageHeader("Plant disease detection", "Upload or capture a leaf photo for AI-powered diagnosis")}
    <div class="container py-10" style="max-width:56rem">

      <!-- Method toggle -->
      <div class="method-toggle mb-8 anim-fade-up">
        <button class="${diagMethod === 'upload' ? 'active' : ''}" onclick="App.setDiagMethod('upload')">
          ${Icons.upload(16)} Upload
        </button>
        <button class="${diagMethod === 'camera' ? 'active' : ''}" onclick="App.setDiagMethod('camera')">
          ${Icons.camera(16)} Camera
        </button>
      </div>

      <!-- Upload / Camera area -->
      <div class="card p-6 shadow-soft anim-fade-up" style="border-radius:var(--radius-3xl)">

        ${diagMethod === "upload" && !diagImageURL ? `
          <div class="upload-zone" id="diag-upload-zone">
            <input type="file" accept="image/*" onchange="App.handleDiagFile(this)" id="diag-file-input">
            <div class="upload-zone-icon">${Icons.upload(24)}</div>
            <div class="upload-zone-text">
              <p><strong>Click to upload</strong> or drag and drop</p>
              <p class="mt-1 text-xs">PNG, JPG or WEBP (max 10 MB)</p>
            </div>
          </div>
        ` : ''}

        ${diagMethod === "camera" && !diagImageURL ? `
          <div class="camera-container">
            <video id="diag-camera-video" autoplay playsinline muted></video>
            <div class="camera-controls">
              <button class="camera-btn" onclick="App.capturePhoto()" aria-label="Capture photo">
                ${Icons.camera(20)}
              </button>
            </div>
          </div>
        ` : ''}

        ${diagImageURL ? `
          <div class="image-preview">
            <img src="${diagImageURL}" alt="Selected plant leaf">
            <div class="image-preview-overlay">
              <button class="btn btn-ghost btn-icon" onclick="App.clearDiagImage()" aria-label="Remove image"
                      style="background:oklch(0 0 0 / 0.5);color:#fff;border-radius:50%">
                ${Icons.x(16)}
              </button>
            </div>
          </div>

          <div class="flex justify-center mt-6">
            <button class="btn btn-primary" onclick="App.submitDiagnosis()" ${diagLoading ? 'disabled' : ''}>
              ${diagLoading ? '<div class="spinner" style="width:1rem;height:1rem;border-width:2px;margin:0"></div> Analysing…' : `${Icons.sparkles(16)} Analyse leaf`}
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Loading skeleton -->
      ${diagLoading ? `
        <div class="mt-8 grid gap-4">
          <div class="skeleton" style="height:10rem"></div>
          <div class="skeleton" style="height:6rem"></div>
        </div>
      ` : ''}

      <!-- Error -->
      ${diagError && !diagLoading ? `
        <div class="error-card mt-8 anim-fade-up">
          <div class="error-card-icon">${Icons.alertTriangle(24)}</div>
          <p class="mt-3 font-semibold">Analysis failed</p>
          <p class="mt-1 text-sm text-muted-foreground">${diagError}</p>
          <button class="btn btn-outline btn-sm mt-4" onclick="App.submitDiagnosis()">${Icons.refreshCw(14)} Retry</button>
        </div>
      ` : ''}

      <!-- Results -->
      ${diagResult && !diagLoading ? `
        <div class="mt-8 anim-fade-up">
          <div class="card diagnosis-result shadow-soft">
            <div class="diagnosis-result-header">
              <div class="diagnosis-result-icon ${isHealthy ? 'healthy' : 'diseased'}">
                ${isHealthy ? Icons.shieldCheck(28) : Icons.alertTriangle(28)}
              </div>
              <div class="min-w-0">
                <h2 class="text-xl font-semibold">${diagResult.plant_name}</h2>
                <p class="mt-1">
                  <span class="badge ${isHealthy ? 'badge-secondary' : 'badge-destructive'}">
                    ${isHealthy ? 'Healthy' : diagResult.disease_status}
                  </span>
                </p>
                <div class="diagnosis-confidence">
                  <span class="text-sm text-muted-foreground">Confidence</span>
                  <div class="diagnosis-confidence-bar">
                    <div class="diagnosis-confidence-fill ${confLevel}" style="width:${Math.round(diagResult.confidence * 100)}%"></div>
                  </div>
                  <span class="text-sm font-semibold">${Math.round(diagResult.confidence * 100)}%</span>
                </div>
              </div>
            </div>

            <dl class="diagnosis-meta">
              <div><dt>Plant</dt><dd>${diagResult.plant_name}</dd></div>
              <div><dt>Status</dt><dd>${diagResult.disease_status}</dd></div>
              <div><dt>Model</dt><dd>${diagResult.model_used || 'ResNet50'}</dd></div>
              <div><dt>Confident</dt><dd>${diagResult.is_confident ? 'Yes' : 'Low confidence'}</dd></div>
            </dl>
          </div>

          <!-- Prevention tips -->
          <div class="card p-6 shadow-soft mt-6" style="border-radius:var(--radius-3xl)">
            <h3 class="text-lg font-semibold">${isHealthy ? 'Care tips' : 'Treatment & prevention'}</h3>
            <ul class="mt-4 grid gap-2">
              ${tips.map(t => `
                <li class="flex gap-2 text-sm">
                  <span class="text-primary shrink-0">${Icons.check(16)}</span>
                  ${t}
                </li>
              `).join("")}
            </ul>
          </div>
        </div>
      ` : ''}

      <!-- Supported plants info -->
      <div class="card p-6 shadow-soft mt-8 anim-fade-up" style="border-radius:var(--radius-3xl)">
        <h3 class="text-lg font-semibold">Supported plants</h3>
        <p class="mt-2 text-sm text-muted-foreground">Our AI model can detect diseases in:</p>
        <div class="flex flex-wrap gap-2 mt-3">
          ${["Apple", "Blueberry", "Cherry", "Corn", "Grape", "Orange", "Peach", "Pepper", "Potato", "Raspberry", "Soybean", "Squash", "Strawberry", "Tomato"].map(p => `
            <span class="badge badge-outline">${p}</span>
          `).join("")}
        </div>
      </div>
    </div>`;
  }

  // ============================================================
  //  SCHEMES PAGE
  // ============================================================

  function renderSchemes() {
    return `
    ${pageHeader("Government schemes", "Central and state support you may be eligible for")}
    <div class="container py-10">
      <div class="grid" style="grid-template-columns:repeat(2,1fr)">
        ${schemes.map(s => `
          <div class="card card-lift p-6 shadow-soft anim-fade-up" style="border-radius:var(--radius-3xl)">
            <h2 class="text-xl font-semibold">${s.name}</h2>
            <p class="mt-3 text-sm text-muted-foreground">
              <span class="font-medium text-foreground">Benefits: </span>${s.benefit}
            </p>
            <p class="mt-2 text-sm text-muted-foreground">
              <span class="font-medium text-foreground">Eligibility: </span>${s.eligibility}
            </p>
            <div class="flex flex-wrap gap-3 mt-6">
              <a href="${s.link}" target="_blank" rel="noreferrer noopener" class="btn btn-primary btn-sm">Apply now</a>
              <a href="${s.link}" target="_blank" rel="noreferrer noopener" class="btn btn-outline btn-sm">
                Official link ${Icons.externalLink(14)}
              </a>
            </div>
          </div>
        `).join("")}
      </div>
    </div>`;
  }

  // ============================================================
  //  ABOUT PAGE
  // ============================================================

  function renderAbout() {
    return `
    ${pageHeader("About AgriSense AI", "Agronomy, data science and farmer-first design")}
    <section class="section">
      <div class="grid gap-6" style="max-width:56rem;margin-inline:auto">
        <div class="card p-8 shadow-soft anim-fade-up" style="border-radius:var(--radius-3xl)">
          <h2 class="text-2xl font-semibold">Our mission</h2>
          <p class="mt-3 text-muted-foreground">
            More than half of India's workforce depends on agriculture, yet crop choice is still often made on habit
            or hearsay. AgriSense AI turns soil test values, local weather and mandi trends into one clear,
            explainable recommendation — in the farmer's own language.
          </p>
        </div>
        <div class="grid gap-6" style="grid-template-columns:repeat(2,1fr)">
          <div class="card p-8 shadow-soft anim-fade-up delay-1" style="border-radius:var(--radius-3xl)">
            <h3 class="text-xl font-semibold">How the model works</h3>
            <ul class="mt-3 grid gap-2 text-sm text-muted-foreground">
              <li>Gradient-boosted classifier trained on district-level yield records</li>
              <li>Soil N-P-K, pH, moisture and organic carbon as primary features</li>
              <li>Seasonal rainfall, temperature and humidity from weather APIs</li>
              <li>Explainability layer surfaces the reasons behind every result</li>
            </ul>
          </div>
          <div class="card p-8 shadow-soft anim-fade-up delay-2" style="border-radius:var(--radius-3xl)">
            <h3 class="text-xl font-semibold">Built for the field</h3>
            <ul class="mt-3 grid gap-2 text-sm text-muted-foreground">
              <li>Works on low-end phones and patchy networks</li>
              <li>Voice input and read-aloud recommendations</li>
              <li>Ten Indian languages at launch</li>
              <li>Offline-first design for remote villages</li>
            </ul>
          </div>
        </div>
      </div>
    </section>`;
  }

  // ============================================================
  //  CONTACT PAGE
  // ============================================================

  let contactErrors = {};

  function renderContact() {
    return `
    ${pageHeader("Contact & support", "We answer in your language, seven days a week")}
    <div class="container py-10">
      <div class="grid" style="grid-template-columns:repeat(2,1fr)">

        <!-- Contact form -->
        <div class="card p-6 shadow-soft anim-fade-up" style="border-radius:var(--radius-3xl)">
          <h2 class="text-xl font-semibold">Send a message</h2>
          <form class="mt-6 grid gap-4" id="contact-form" onsubmit="App.submitContact(event)" novalidate>
            <div class="grid gap-2">
              <label class="label" for="c-name">Name</label>
              <input class="input" id="c-name" name="name" maxlength="100">
              ${contactErrors.name ? `<p class="field-error">${contactErrors.name}</p>` : ''}
            </div>
            <div class="grid gap-2">
              <label class="label" for="c-email">Email</label>
              <input class="input" id="c-email" name="email" type="email" maxlength="255">
              ${contactErrors.email ? `<p class="field-error">${contactErrors.email}</p>` : ''}
            </div>
            <div class="grid gap-2">
              <label class="label" for="c-message">Message</label>
              <textarea class="textarea" id="c-message" name="message" rows="5" maxlength="1000"></textarea>
              ${contactErrors.message ? `<p class="field-error">${contactErrors.message}</p>` : ''}
            </div>
            <button type="submit" class="btn btn-primary">Send message</button>
          </form>
        </div>

        <!-- Info + FAQ -->
        <div class="grid gap-6">
          <div class="card p-6 shadow-soft anim-fade-up delay-1" style="border-radius:var(--radius-3xl)">
            <h2 class="text-xl font-semibold">Reach us</h2>
            <ul class="mt-4 grid gap-3 text-sm">
              <li class="flex items-center gap-3"><span class="text-primary">${Icons.mail(16)}</span> support@agrisense.ai</li>
              <li class="flex items-center gap-3"><span class="text-primary">${Icons.phone(16)}</span> 1800-180-1551</li>
              <li class="flex items-center gap-3"><span class="text-primary">${Icons.mapPin(16)}</span> Field office, Ozar, Nashik 422206</li>
            </ul>
            <div class="map-embed">
              <iframe title="AgriSense AI field office location"
                      src="https://www.google.com/maps?q=Nashik,Maharashtra&output=embed"
                      loading="lazy"></iframe>
            </div>
          </div>

          <div class="card p-6 shadow-soft anim-fade-up delay-2" style="border-radius:var(--radius-3xl)">
            <h2 class="text-xl font-semibold">FAQ</h2>
            <div class="mt-2" id="faq-accordion">
              ${faqs.map((f, i) => `
                <div class="accordion-item">
                  <button class="accordion-trigger" onclick="App.toggleAccordion(${i})" id="faq-trigger-${i}">
                    <span>${f.q}</span>
                    ${Icons.chevronDown(16)}
                  </button>
                  <div class="accordion-content" id="faq-content-${i}">${f.a}</div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ============================================================
  //  LOGIN PAGE
  // ============================================================

  let loginTab = "login";

  function renderLogin() {
    return `
    ${pageHeader("Farmer login", "Access your dashboard, saved farms and recommendation history")}
    <div class="container py-12" style="max-width:28rem">
      <div class="card p-6 shadow-soft anim-fade-up" style="border-radius:var(--radius-3xl)">

        <!-- Tabs -->
        <div class="tabs-list">
          <button class="tab-trigger ${loginTab === 'login' ? 'active' : ''}" onclick="App.setLoginTab('login')">Login</button>
          <button class="tab-trigger ${loginTab === 'register' ? 'active' : ''}" onclick="App.setLoginTab('register')">Register</button>
          <button class="tab-trigger ${loginTab === 'otp' ? 'active' : ''}" onclick="App.setLoginTab('otp')">OTP</button>
        </div>

        <!-- Login tab -->
        <div class="tab-content ${loginTab === 'login' ? 'active' : ''}">
          <div class="mt-6 grid gap-4">
            <div class="grid gap-2">
              <label class="label" for="login-phone">Phone number</label>
              <input class="input" id="login-phone" type="tel" placeholder="98765 43210">
            </div>
            <div class="grid gap-2">
              <label class="label" for="login-pass">Password</label>
              <input class="input" id="login-pass" type="password" placeholder="••••••••">
            </div>
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2">
                <input type="checkbox" class="checkbox"> <span>Remember me</span>
              </label>
              <button class="text-primary" style="font-size:0.875rem" onclick="App.toast('Reset link sent')">Forgot password?</button>
            </div>
            <button class="btn btn-primary" onclick="App.toast('Signed in (demo)', 'success')">Login</button>
          </div>
        </div>

        <!-- Register tab -->
        <div class="tab-content ${loginTab === 'register' ? 'active' : ''}">
          <div class="mt-6 grid gap-4">
            <div class="grid gap-2">
              <label class="label" for="reg-name">Full name</label>
              <input class="input" id="reg-name" placeholder="Ramesh Kumar">
            </div>
            <div class="grid gap-2">
              <label class="label" for="reg-phone">Phone number</label>
              <input class="input" id="reg-phone" type="tel" placeholder="98765 43210">
            </div>
            <div class="grid gap-2">
              <label class="label" for="reg-village">Village</label>
              <input class="input" id="reg-village" placeholder="Ozar, Nashik">
            </div>
            <button class="btn btn-primary" onclick="App.toast('Account created (demo)', 'success')">Create account</button>
          </div>
        </div>

        <!-- OTP tab -->
        <div class="tab-content ${loginTab === 'otp' ? 'active' : ''}">
          <div class="mt-6 grid gap-4">
            <div class="grid gap-2">
              <label class="label" for="otp-phone">Phone number</label>
              <input class="input" id="otp-phone" type="tel" placeholder="98765 43210">
            </div>
            <button class="btn btn-primary" onclick="App.sendOTP()">Send OTP</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ============================================================
  //  404 PAGE
  // ============================================================

  function render404() {
    return `
    <div class="flex justify-center items-center" style="min-height:60vh;padding:2rem">
      <div class="text-center" style="max-width:28rem">
        <h1 class="text-7xl font-bold">404</h1>
        <h2 class="mt-4 text-xl font-semibold">Page not found</h2>
        <p class="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div class="mt-6">
          <a href="#/" class="btn btn-primary">Go home</a>
        </div>
      </div>
    </div>`;
  }

  // ============================================================
  //  ROUTER
  // ============================================================

  const ROUTES = {
    "#/": renderHome,
    "#/dashboard": renderDashboard,
    "#/recommend": renderRecommend,
    "#/diagnose": renderDiagnose,
    "#/weather": renderWeather,
    "#/market": renderMarket,
    "#/schemes": renderSchemes,
    "#/about": renderAbout,
    "#/contact": renderContact,
    "#/login": renderLogin,
  };

  function render() {
    const hash = location.hash || "#/";
    const routeFn = ROUTES[hash] || render404;

    // Offline banner
    const offlineBanner = isOffline
      ? `<div class="offline-banner">${Icons.wifiOff(14)} You are offline — cached data is shown</div>`
      : '';

    const content = offlineBanner + renderNavbar() + '<main>' + routeFn() + '</main>' + renderFooter();
    app().innerHTML = content;

    // Close dropdown after render
    langDropdownOpen = false;

    // Scroll to top on page change
    window.scrollTo(0, 0);

    // Init scroll animations
    requestAnimationFrame(initAnimations);

    // Draw chart if on market page
    if (hash === "#/market") {
      requestAnimationFrame(() => requestAnimationFrame(drawPriceChart));
    }

    // Fetch weather if on weather page and no data yet
    if (hash === "#/weather" && !weatherData && !weatherLoading && !isOffline) {
      fetchLiveWeather();
    }

    // Init drag-drop if on diagnose page
    if (hash === "#/diagnose") {
      requestAnimationFrame(initUploadZone);
    }

    // Update document title
    updateTitle(hash);
  }

  function updateTitle(hash) {
    const titles = {
      "#/": "AgriSense AI — AI Crop Recommendation for Farmers",
      "#/dashboard": "Farmer Dashboard — AgriSense AI",
      "#/recommend": "AI Crop Recommendation — AgriSense AI",
      "#/diagnose": "Plant Disease Detection — AgriSense AI",
      "#/weather": "Farm Weather & Advisories — AgriSense AI",
      "#/market": "Mandi Market Prices & Trends — AgriSense AI",
      "#/schemes": "Government Schemes for Farmers — AgriSense AI",
      "#/about": "About AgriSense AI — Our Mission for Farmers",
      "#/contact": "Contact & Support — AgriSense AI",
      "#/login": "Farmer Login — AgriSense AI",
    };
    document.title = titles[hash] || "AgriSense AI";
  }

  // ============================================================
  //  SCROLL ANIMATIONS (IntersectionObserver)
  // ============================================================

  function initAnimations() {
    const els = $$(".anim-fade-up, .anim-fade-left, .anim-scale-in");
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "-60px" });
    els.forEach(el => observer.observe(el));
  }

  // ============================================================
  //  PUBLIC API (called from onclick handlers)
  // ============================================================

  window.App = {
    toggleTheme,
    toast: showToast,

    toggleMobileMenu() {
      mobileMenuOpen = !mobileMenuOpen;
      const nav = $("#mobile-nav");
      if (nav) nav.classList.toggle("open", mobileMenuOpen);
      // Update hamburger icon
      const btn = $(".navbar-hamburger");
      if (btn) btn.innerHTML = mobileMenuOpen ? Icons.x(20) : Icons.menu(20);
    },

    closeMobileMenu() {
      mobileMenuOpen = false;
    },

    toggleLangDropdown() {
      langDropdownOpen = !langDropdownOpen;
      const menu = $("#lang-menu");
      if (menu) menu.classList.toggle("open", langDropdownOpen);
    },

    setLang(lang) {
      currentLang = lang;
      langDropdownOpen = false;
      const menu = $("#lang-menu");
      if (menu) menu.classList.remove("open");
      showToast(`Language set to ${lang}`);
    },

    // Recommend page
    setRecValue(key, val) {
      recValues[key] = val;
    },

    recNext() {
      if (recStep === 0 && !(recValues.name || "").trim()) {
        showToast("Please enter your name to continue.", "error");
        return;
      }
      recStep = Math.min(4, recStep + 1);
      render();
    },

    recBack() {
      recStep = Math.max(0, recStep - 1);
      render();
    },

    togglePref(p) {
      if (recPrefs.includes(p)) {
        recPrefs = recPrefs.filter(x => x !== p);
      } else {
        recPrefs.push(p);
      }
      render();
    },

    async recSubmit() {
      recLoading = true;
      recResult = false;
      render();

      const payload = {
        N: parseInt(recValues.n) || 0,
        P: parseInt(recValues.p) || 0,
        K: parseInt(recValues.k) || 0,
        ph: parseFloat(recValues.ph) || 6.5,
        rainfall: parseFloat(recValues.rainfall) || 200,
        temperature: recValues.temp ? parseFloat(recValues.temp) : null,
        humidity: recValues.humidity ? parseFloat(recValues.humidity) : null,
      };

      try {
        const resp = await fetch(ENDPOINTS.predictCrop, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
        const data = await resp.json();

        if (data.success) {
          // Map API response to the crop data structure for display
          const predicted = data.prediction;
          const matchedCrop = crops.find(c =>
            c.name.toLowerCase().includes(predicted.toLowerCase()) ||
            predicted.toLowerCase().includes(c.id)
          );

          if (matchedCrop) {
            // Move matched crop to first position for display
            const idx = crops.indexOf(matchedCrop);
            if (idx > 0) {
              crops.unshift(crops.splice(idx, 1)[0]);
            }
          }

          // Save to IndexedDB for history
          saveRecommendation(data, payload).catch(() => {});

          recLoading = false;
          recResult = true;
          showToast(`Recommendation ready — ${data.prediction} (top 3: ${data.top_3.join(", ")})`, "success");
          render();
        } else {
          throw new Error(data.error || "Prediction failed");
        }
      } catch (err) {
        console.warn("Crop prediction API failed:", err);

        if (!navigator.onLine) {
          // Queue for offline sync
          await queueSyncAction("crop_recommendation", payload);
          recLoading = false;
          showToast("You're offline. Request queued and will sync when connected.", "info");
          render();
        } else {
          // Fallback to mock data
          recLoading = false;
          recResult = true;
          showToast(`API unavailable — showing sample recommendation. (${err.message})`, "error");
          render();
        }
      }
    },

    useGPS() {
      recValues.state = "Maharashtra";
      recValues.district = "Nashik";
      recValues.village = "Ozar";
      showToast("Location detected: Ozar, Nashik", "success");
      render();
    },

    // Market page
    setMarketQuery(q) {
      marketQuery = q;
      // Re-render only market content area
      render();
    },

    // Contact page
    submitContact(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd);
      const errs = {};
      if (!data.name || !data.name.trim()) errs.name = "Name is required";
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Enter a valid email";
      if (!data.message || data.message.trim().length < 5) errs.message = "Tell us a bit more";
      contactErrors = errs;
      if (Object.keys(errs).length) { render(); return; }
      contactErrors = {};
      showToast("Message sent — our team replies within one working day.", "success");
      render();
    },

    // FAQ accordion
    toggleAccordion(i) {
      const trigger = $(`#faq-trigger-${i}`);
      const content = $(`#faq-content-${i}`);
      if (!trigger || !content) return;
      const isOpen = content.classList.contains("open");
      // Close all
      $$(".accordion-content").forEach(c => c.classList.remove("open"));
      $$(".accordion-trigger").forEach(t => t.classList.remove("open"));
      if (!isOpen) {
        content.classList.add("open");
        trigger.classList.add("open");
      }
    },

    // Login tabs
    setLoginTab(tab) {
      loginTab = tab;
      render();
    },

    sendOTP() {
      const phone = $("#otp-phone");
      if (phone && phone.value.trim().length >= 10) {
        showToast("OTP sent to " + phone.value, "success");
      } else {
        showToast("Enter a valid number", "error");
      }
    },

    // ── Disease diagnosis page ──
    setDiagMethod(method) {
      // Stop any active camera stream
      if (diagStream) {
        diagStream.getTracks().forEach(t => t.stop());
        diagStream = null;
      }
      diagMethod = method;
      diagImageFile = null;
      diagImageURL = null;
      diagResult = null;
      diagError = null;
      render();
      if (method === "camera") {
        requestAnimationFrame(() => App.startCamera());
      }
    },

    handleDiagFile(input) {
      const file = input.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        showToast("Please select an image file (JPG, PNG)", "error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast("Image too large. Maximum size is 10 MB.", "error");
        return;
      }
      diagImageFile = file;
      diagImageURL = URL.createObjectURL(file);
      diagResult = null;
      diagError = null;
      render();
    },

    clearDiagImage() {
      if (diagImageURL) URL.revokeObjectURL(diagImageURL);
      diagImageFile = null;
      diagImageURL = null;
      diagResult = null;
      diagError = null;
      render();
    },

    async startCamera() {
      try {
        diagStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
        });
        const video = $("#diag-camera-video");
        if (video) {
          video.srcObject = diagStream;
          video.play();
        }
      } catch (err) {
        showToast("Camera access denied. Please use file upload instead.", "error");
        diagMethod = "upload";
        render();
      }
    },

    capturePhoto() {
      const video = $("#diag-camera-video");
      if (!video) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      // Stop stream
      if (diagStream) {
        diagStream.getTracks().forEach(t => t.stop());
        diagStream = null;
      }

      canvas.toBlob((blob) => {
        diagImageFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
        diagImageURL = URL.createObjectURL(blob);
        diagResult = null;
        diagError = null;
        render();
      }, "image/jpeg", 0.9);
    },

    async submitDiagnosis() {
      if (!diagImageFile) {
        showToast("Please select or capture an image first.", "error");
        return;
      }

      diagLoading = true;
      diagError = null;
      render();

      const formData = new FormData();
      formData.append("file", diagImageFile);

      try {
        const resp = await fetch(ENDPOINTS.analyzeDis, {
          method: "POST",
          body: formData,
        });

        if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
        const data = await resp.json();

        if (data.success) {
          diagResult = data;
          diagLoading = false;
          const status = data.disease_status.toLowerCase() === "healthy" ? "healthy" : data.disease_status;
          showToast(`Analysis complete — ${data.plant_name}: ${status}`, "success");
          render();
        } else {
          throw new Error(data.error || "Analysis failed");
        }
      } catch (err) {
        diagLoading = false;
        diagError = err.message;
        showToast(`Disease detection failed: ${err.message}`, "error");
        render();
      }
    },

    // ── Weather ──
    retryWeather() {
      weatherError = null;
      weatherData = null;
      weatherLoading = false;
      fetchLiveWeather();
    },
  };

  // ============================================================
  //  INIT
  // ============================================================

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (langDropdownOpen && !e.target.closest("#lang-dropdown")) {
      langDropdownOpen = false;
      const menu = $("#lang-menu");
      if (menu) menu.classList.remove("open");
    }
  });

  // Route changes
  window.addEventListener("hashchange", () => {
    // Stop camera if navigating away from diagnose page
    if (diagStream) {
      diagStream.getTracks().forEach(t => t.stop());
      diagStream = null;
    }
    render();
  });

  // Online/offline listeners
  window.addEventListener("online", () => { isOffline = false; render(); });
  window.addEventListener("offline", () => { isOffline = true; render(); });

  // Listen for sync completion from Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SYNC_COMPLETE") {
        showToast("Offline requests synced successfully!", "success");
      }
    });
  }

  // Initial render
  applyTheme();
  if (!location.hash) location.hash = "#/";
  render();

  // Resize handler for chart
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (location.hash === "#/market") drawPriceChart();
    }, 200);
  });
})();
