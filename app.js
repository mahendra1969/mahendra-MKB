/**
 * MAHENDRA - ACADEMIC RESEARCH PROFILE & WORKBENCH
 * Interactive Geospatial Earth Observation & Crop Yield Simulator
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initSpectralEngine();
  initYieldForecaster();
  initParcelExplorer();
  initPublicationsHub();
  initCVTabs();
  initContactForm();
});

/* ==========================================================================
   1. THEME TOGGLE (DARK / LIGHT)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Check saved theme or default to dark
  const savedTheme = localStorage.getItem('mahendra_theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('mahendra_theme', newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }
}

/* ==========================================================================
   2. MOBILE MENU
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });

    // Close when clicking any nav link
    const mobileLinks = drawer.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   3. SPECTRAL BAND & VEGETATION INDEX ENGINE
   ========================================================================== */
const indexFormulas = {
  NDVI: {
    name: "Normalized Difference Vegetation Index (NDVI)",
    range: "Range: -1.0 to +1.0",
    math: "$$\\text{NDVI} = \\frac{\\text{NIR (B8)} - \\text{Red (B4)}}{\\text{NIR (B8)} + \\text{Red (B4)}}$$",
    desc: "Primary indicator for canopy greenness, photosynthetic capacity, and above-ground biomass. Peak values during heading indicate high potential yield.",
    calc: (nir, red, rededge, swir) => (nir - red) / (nir + red)
  },
  EVI: {
    name: "Enhanced Vegetation Index (EVI)",
    range: "Range: -1.0 to +1.0",
    math: "$$\\text{EVI} = 2.5 \\times \\frac{\\text{NIR} - \\text{Red}}{\\text{NIR} + 6\\text{Red} - 7.5\\text{Blue} + 1}$$",
    desc: "Optimized for dense closed-canopy crops (e.g. dense sugarcane or irrigated wheat) by reducing atmospheric haze and canopy background noise without saturation.",
    calc: (nir, red, rededge, swir) => {
      const blue = 0.04;
      return 2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1));
    }
  },
  NDRE: {
    name: "Normalized Difference Red Edge (NDRE)",
    range: "Range: -1.0 to +1.0",
    math: "$$\\text{NDRE} = \\frac{\\text{NIR (B8)} - \\text{RedEdge (B5)}}{\\text{NIR (B8)} + \\text{RedEdge (B5)}}$$",
    desc: "Leverages Sentinel-2 Red-Edge bands (B5/B6) to accurately measure leaf chlorophyll concentration and nitrogen uptake during late vegetative and reproductive stages.",
    calc: (nir, red, rededge, swir) => (nir - rededge) / (nir + rededge)
  },
  SAVI: {
    name: "Soil-Adjusted Vegetation Index (SAVI)",
    range: "Range: -1.0 to +1.0",
    math: "$$\\text{SAVI} = \\frac{(1 + L)(\\text{NIR} - \\text{Red})}{\\text{NIR} + \\text{Red} + L} \\quad [L = 0.5]$$",
    desc: "Corrects for bright soil background reflectance in early crop emergence and sparse arid agriculture where bare soil dominates pixel spectral signatures.",
    calc: (nir, red, rededge, swir) => {
      const L = 0.5;
      return ((1 + L) * (nir - red)) / (nir + red + L);
    }
  },
  NDWI: {
    name: "Normalized Difference Water Index (NDWI - Gao)",
    range: "Range: -1.0 to +1.0",
    math: "$$\\text{NDWI} = \\frac{\\text{NIR (B8)} - \\text{SWIR (B11)}}{\\text{NIR (B8)} + \\text{SWIR (B11)}}$$",
    desc: "Sensitive to liquid canopy water content and plant internal moisture stress. Crucial for detecting early pre-visual drought stress in rainfed crops.",
    calc: (nir, red, rededge, swir) => (nir - swir) / (nir + swir)
  },
  GNDVI: {
    name: "Green Normalized Difference Vegetation Index (GNDVI)",
    range: "Range: -1.0 to +1.0",
    math: "$$\\text{GNDVI} = \\frac{\\text{NIR (B8)} - \\text{Green (B3)}}{\\text{NIR (B8)} + \\text{Green (B3)}}$$",
    desc: "Provides enhanced sensitivity to chlorophyll absorption variations over standard NDVI during late grain-filling and senescence phases.",
    calc: (nir, red, rededge, swir) => {
      const green = 0.12;
      return (nir - green) / (nir + green);
    }
  }
};

const bandPresets = {
  false_color: { nir: 0.65, red: 0.08, rededge: 0.28, swir: 0.14, label: "False Color NIR (B8, B4, B3) - High vegetation contrast" },
  true_color: { nir: 0.35, red: 0.15, rededge: 0.20, swir: 0.22, label: "Natural RGB (B4, B3, B2) - True visual perspective" },
  swir_agri: { nir: 0.58, red: 0.11, rededge: 0.24, swir: 0.09, label: "SWIR Agriculture (B11, B8, B4) - Canopy moisture detection" },
  red_edge: { nir: 0.62, red: 0.07, rededge: 0.32, swir: 0.15, label: "Red-Edge Chlorophyll (B8A, B5, B4) - Nitrogen mapping" }
};

let currentActiveIndex = 'NDVI';

function initSpectralEngine() {
  const sliderNir = document.getElementById('slider-nir');
  const sliderRed = document.getElementById('slider-red');
  const sliderRedEdge = document.getElementById('slider-rededge');
  const sliderSwir = document.getElementById('slider-swir');

  const valNir = document.getElementById('val-nir');
  const valRed = document.getElementById('val-red');
  const valRedEdge = document.getElementById('val-rededge');
  const valSwir = document.getElementById('val-swir');

  const computedValueEl = document.getElementById('computed-index-value');
  const statusBadgeEl = document.getElementById('calc-status-badge');
  const progressBarEl = document.getElementById('index-progress-bar');

  const formulaNameEl = document.getElementById('formula-name');
  const formulaStatusEl = document.getElementById('formula-status');
  const formulaMathEl = document.getElementById('formula-math');
  const formulaDescEl = document.getElementById('formula-desc');

  function updateCalculations() {
    const nir = parseFloat(sliderNir.value);
    const red = parseFloat(sliderRed.value);
    const rededge = parseFloat(sliderRedEdge.value);
    const swir = parseFloat(sliderSwir.value);

    valNir.textContent = nir.toFixed(2);
    valRed.textContent = red.toFixed(2);
    valRedEdge.textContent = rededge.toFixed(2);
    valSwir.textContent = swir.toFixed(2);

    const calcFn = indexFormulas[currentActiveIndex].calc;
    let result = calcFn(nir, red, rededge, swir);
    result = Math.max(-1.0, Math.min(1.0, result));

    computedValueEl.textContent = result.toFixed(3);

    // Dynamic interpretation badge
    let statusText = "Moderate Vegetation";
    let badgeBg = "rgba(245, 158, 11, 0.15)";
    let badgeColor = "var(--brand-amber)";

    if (result > 0.70) {
      statusText = "Dense Canopy & High Vigor";
      badgeBg = "rgba(16, 185, 129, 0.15)";
      badgeColor = "var(--brand-green)";
    } else if (result > 0.45) {
      statusText = "Moderate Vigor / Developing";
      badgeBg = "rgba(6, 182, 212, 0.15)";
      badgeColor = "var(--brand-cyan)";
    } else if (result > 0.20) {
      statusText = "Sparse Canopy / Early Stage";
      badgeBg = "rgba(245, 158, 11, 0.15)";
      badgeColor = "var(--brand-amber)";
    } else {
      statusText = "Bare Soil / Severe Water Stress";
      badgeBg = "rgba(239, 68, 68, 0.15)";
      badgeColor = "var(--brand-red)";
    }

    statusBadgeEl.textContent = statusText;
    statusBadgeEl.style.backgroundColor = badgeBg;
    statusBadgeEl.style.color = badgeColor;

    // Progress bar fill (map -0.2..1.0 to 0..100%)
    const pct = Math.max(0, Math.min(100, ((result + 0.2) / 1.2) * 100));
    progressBarEl.style.width = `${pct}%`;

    // Trigger yield forecaster update when spectral sliders change
    triggerYieldUpdate();
  }

  // Bind sliders
  [sliderNir, sliderRed, sliderRedEdge, sliderSwir].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', updateCalculations);
    }
  });

  // Preset buttons
  const presetBtns = document.querySelectorAll('.preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetKey = btn.getAttribute('data-preset');
      const preset = bandPresets[presetKey];
      if (preset) {
        sliderNir.value = preset.nir;
        sliderRed.value = preset.red;
        sliderRedEdge.value = preset.rededge;
        sliderSwir.value = preset.swir;
        updateCalculations();
        showToast(`Loaded Preset: ${preset.label}`);
      }
    });
  });

  // Index chips
  const indexChips = document.querySelectorAll('.chip-btn');
  indexChips.forEach(chip => {
    chip.addEventListener('click', () => {
      indexChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const idxKey = chip.getAttribute('data-index');
      currentActiveIndex = idxKey;

      const idxData = indexFormulas[idxKey];
      if (idxData) {
        formulaNameEl.textContent = idxData.name;
        formulaStatusEl.textContent = idxData.range;
        formulaMathEl.textContent = idxData.math;
        formulaDescEl.textContent = idxData.desc;
        updateCalculations();
      }
    });
  });

  updateCalculations();
}

/* ==========================================================================
   4. IN-SEASON MACHINE LEARNING YIELD FORECASTER
   ========================================================================== */
const cropBaselines = {
  wheat: { name: "Wheat (Triticum aestivum)", baseYield: 4.65, maxYield: 6.2, unit: "t/ha", leadTime: "4 Weeks Pre-Harvest" },
  rice: { name: "Paddy Rice (Oryza sativa)", baseYield: 5.80, maxYield: 7.8, unit: "t/ha", leadTime: "5 Weeks Pre-Harvest" },
  maize: { name: "Maize / Corn (Zea mays)", baseYield: 7.20, maxYield: 9.8, unit: "t/ha", leadTime: "3 Weeks Pre-Harvest" },
  soybean: { name: "Soybean (Glycine max)", baseYield: 3.10, maxYield: 4.4, unit: "t/ha", leadTime: "4 Weeks Pre-Harvest" },
  mustard: { name: "Mustard / Rapeseed", baseYield: 1.85, maxYield: 2.6, unit: "t/ha", leadTime: "3 Weeks Pre-Harvest" }
};

const stageFactors = {
  tillering: { weight: 0.65, name: "Tillering / Early Vegetative" },
  jointing: { weight: 0.85, name: "Jointing / Stem Elongation" },
  heading: { weight: 1.05, name: "Heading / Flowering (Peak NDVI)" },
  grain_filling: { weight: 1.00, name: "Grain Filling / Milking" },
  maturity: { weight: 0.95, name: "Physiological Maturity" }
};

const modelMetrics = {
  cnn_lstm: { name: "Spatio-Temporal CNN-LSTM", r2: 0.892, rmse: "0.31 t/ha", mape: "5.8%", uncert: 0.28 },
  transformer: { name: "Temporal Vision Transformer", r2: 0.914, rmse: "0.27 t/ha", mape: "4.9%", uncert: 0.24 },
  xgboost: { name: "Extreme Gradient Boosting", r2: 0.865, rmse: "0.38 t/ha", mape: "7.1%", uncert: 0.35 },
  random_forest: { name: "Random Forest Regressor", r2: 0.838, rmse: "0.42 t/ha", mape: "8.4%", uncert: 0.40 }
};

const stressPenalties = {
  none: 1.0,
  mild_drought: 0.86,
  heat_wave: 0.78,
  severe_stress: 0.62
};

function triggerYieldUpdate() {
  const cropSelect = document.getElementById('select-crop');
  const stageSelect = document.getElementById('select-stage');
  const modelSelect = document.getElementById('select-model');
  const stressSelect = document.getElementById('select-stress');

  if (!cropSelect || !stageSelect || !modelSelect || !stressSelect) return;

  const crop = cropBaselines[cropSelect.value];
  const stage = stageFactors[stageSelect.value];
  const model = modelMetrics[modelSelect.value];
  const stressFactor = stressPenalties[stressSelect.value];

  // Get current NDVI from slider engine
  const nir = parseFloat(document.getElementById('slider-nir')?.value || 0.58);
  const red = parseFloat(document.getElementById('slider-red')?.value || 0.09);
  const currentNdvi = Math.max(0.1, (nir - red) / (nir + red));

  // Predictive yield calculation formula
  const ndviMultiplier = 0.55 + (currentNdvi * 0.65);
  const predicted = crop.baseYield * (stage.weight / 1.0) * ndviMultiplier * stressFactor;
  const clampedYield = Math.max(0.5, Math.min(crop.maxYield, predicted));

  // Update UI Elements
  document.getElementById('yield-crop-title').textContent = `${crop.name} Projected Harvest Yield`;
  document.getElementById('lead-time-tag').textContent = crop.leadTime;
  document.getElementById('predicted-yield-val').textContent = clampedYield.toFixed(2);
  document.getElementById('yield-uncertainty').textContent = `± ${(model.uncert * (clampedYield / crop.baseYield)).toFixed(2)} t/ha (95% CI)`;

  document.getElementById('model-r2').textContent = model.r2.toFixed(3);
  document.getElementById('model-rmse').textContent = model.rmse;
  document.getElementById('model-mape').textContent = model.mape;
  document.getElementById('active-model-tag').textContent = model.name;

  const pctDiff = (((clampedYield - crop.baseYield) / crop.baseYield) * 100);
  const sign = pctDiff >= 0 ? "+" : "";
  const benchmarkEl = document.getElementById('model-benchmark');
  benchmarkEl.textContent = `${sign}${pctDiff.toFixed(1)}% vs Avg`;
  benchmarkEl.style.color = pctDiff >= 0 ? "var(--brand-green)" : "var(--brand-red)";
}

function initYieldForecaster() {
  const selects = ['select-crop', 'select-stage', 'select-model', 'select-stress'];
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', triggerYieldUpdate);
    }
  });
  triggerYieldUpdate();
}

/* ==========================================================================
   5. INTERACTIVE PARCEL EXPLORER
   ========================================================================== */
const parcelData = {
  1: {
    title: "Plot #01 - North (Wheat PBW-550)",
    crop: "Wheat (PBW-550)",
    ndvi: "0.84",
    yield: "5.2 t/ha",
    status: "Optimal Health",
    desc: "Sentinel-2 B8/B4 ratio and Red-Edge B5 indicate robust canopy nitrogen. Projected yield is 11.2% above multi-year regional baseline."
  },
  2: {
    title: "Plot #02 - East Basin (Wheat HD-2967)",
    crop: "Wheat (HD-2967)",
    ndvi: "0.59",
    yield: "3.9 t/ha",
    status: "Mild Moisture Stress",
    desc: "NDWI index shows a 14% drop in canopy moisture over the last 10 days. Irrigation advised within 48 hours to preserve grain filling."
  },
  3: {
    title: "Plot #03 - Central (Paddy Rice PR-126)",
    crop: "Paddy Rice (PR-126)",
    ndvi: "0.88",
    yield: "6.4 t/ha",
    status: "High Vigor & SAR σ°",
    desc: "Sentinel-1 SAR C-band dual-pol (VH/VV) radar backscatter indicates standing water and rapid tiller expansion. Cloud-resilient forecast confirmed."
  },
  4: {
    title: "Plot #04 - South Edge (Mustard / Oilseed)",
    crop: "Mustard / Oilseed",
    ndvi: "0.38",
    yield: "1.4 t/ha",
    status: "Heat Shock Anomaly",
    desc: "Thermal anomaly detected via MODIS LST (3.4°C above baseline). Accelerated siliqua drying requires thermal mitigation strategy."
  },
  5: {
    title: "Plot #05 - West Meadow (Maize Hybrid)",
    crop: "Maize Hybrid",
    ndvi: "0.81",
    yield: "7.1 t/ha",
    status: "Canopy Closed",
    desc: "Full vegetative canopy closure reached at V10 stage. Spatio-temporal CNN-LSTM projects record ear biomass."
  },
  6: {
    title: "Plot #06 - River Canal (Wheat DBW-187)",
    crop: "Wheat (DBW-187)",
    ndvi: "0.86",
    yield: "5.4 t/ha",
    status: "Full Irrigation",
    desc: "Canopy temperature depression (CTD) remains optimal. Minimal spatial heterogeneity across the 240-hectare parcel."
  }
};

function initParcelExplorer() {
  const parcelCards = document.querySelectorAll('.parcel-card');
  const titleEl = document.getElementById('p-selected-title');
  const msgEl = document.getElementById('p-selected-msg');

  parcelCards.forEach(card => {
    card.addEventListener('click', () => {
      parcelCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const parcelId = card.getAttribute('data-parcel');
      const data = parcelData[parcelId];
      if (data && titleEl && msgEl) {
        titleEl.textContent = data.title;
        msgEl.textContent = data.desc;
        showToast(`Inspecting ${data.crop}`);
      }
    });
  });

  // Activate first parcel by default
  if (parcelCards[0]) {
    parcelCards[0].classList.add('active');
  }
}

/* ==========================================================================
   6. PUBLICATIONS & BIBTEX HUB
   ========================================================================== */
const paperAbstracts = {
  paper1: {
    type: "Journal Article",
    year: "2025",
    title: "Multi-Temporal Optical (Sentinel-2) and SAR (Sentinel-1) Fusion for High-Resolution In-Season Paddy Rice Yield Forecasting in Cloud-Prone Agroecosystems",
    authors: "Mahendra, S. K. Sharma, A. Sengupta, and R. K. Verma",
    journal: "Remote Sensing of Environment (Elsevier), Vol. 308, pp. 114210",
    abstract: "Continuous cloud contamination during the South Asian monsoon season has historically severely limited optical satellite-based agricultural monitoring of paddy rice. In this study, we formulate a pixel-level and parcel-level multi-sensor data fusion pipeline synergizing 10-meter Sentinel-2 MSI multi-spectral reflectance with Sentinel-1 C-band synthetic aperture radar (SAR) dual-polarization backscatter (VV and VH). We engineered a deep recurrent spatio-temporal CNN-LSTM architecture that assimilates cross-polarized radar ratios (VH/VV) and optical Red-Edge vegetation indices (NDRE, CIred-edge). Across 850 GPS-verified crop cutting experiment (CCE) plots, our framework achieved an R² of 0.88 and reduced harvest yield prediction RMSE to 0.28 tonnes/hectare up to 5 weeks prior to harvest, even with 65% optical cloud contamination.",
    highlight: "Demonstrated that combining C-band SAR backscatter with optical red-edge indices overcomes monsoon cloud bottlenecks, yielding 0.28 t/ha prediction RMSE.",
    bibtex: `@article{mahendra2025multitemporal,
  title={Multi-Temporal Optical (Sentinel-2) and SAR (Sentinel-1) Fusion for High-Resolution In-Season Paddy Rice Yield Forecasting in Cloud-Prone Agroecosystems},
  author={Mahendra and Sharma, S. K. and Sengupta, A. and Verma, R. K.},
  journal={Remote Sensing of Environment},
  volume={308},
  pages={114210},
  year={2025},
  publisher={Elsevier},
  doi={10.1016/j.rse.2025.114210}
}`
  },
  paper2: {
    type: "Journal Article",
    year: "2024",
    title: "Assessing Terminal Heat Stress and Regional Wheat Yield Vulnerability in the Indo-Gangetic Plains Using Spatio-Temporal Transformers and Reanalysis Climate Coupling",
    authors: "Mahendra, V. Patel, and N. C. Roy",
    journal: "ISPRS Journal of Photogrammetry and Remote Sensing, Vol. 211, pp. 88–104",
    abstract: "Terminal heat waves during the reproductive and grain-filling stages pose severe risks to wheat yields across the breadbasket regions of South Asia. We coupled 30-meter Landsat-8/9 and 10-meter Sentinel-2 multi-temporal vegetation indices with hourly ERA5-Land reanalysis climate variables (Tmax, vapor pressure deficit, and surface net solar radiation) to construct a self-attention Temporal Vision Transformer (ViT). The model evaluates spatial vulnerability across 18 agro-climatic districts, capturing compound drought-heat anomalies. Model validation yielded R² = 0.914 and MAPE = 4.9%, delivering district-level yield loss warnings 30 days ahead of combine harvesting.",
    highlight: "Spatio-temporal transformer network coupled with ERA5 climate anomalies captures terminal heat stress dynamics with 91.4% yield prediction accuracy.",
    bibtex: `@article{mahendra2024heatstress,
  title={Assessing Terminal Heat Stress and Regional Wheat Yield Vulnerability in the Indo-Gangetic Plains Using Spatio-Temporal Transformers and Reanalysis Climate Coupling},
  author={Mahendra and Patel, V. and Roy, N. C.},
  journal={ISPRS Journal of Photogrammetry and Remote Sensing},
  volume={211},
  pages={88--104},
  year={2024},
  publisher={Elsevier},
  doi={10.1016/j.isprsjprs.2024.04.012}
}`
  },
  paper3: {
    type: "Journal Article",
    year: "2024",
    title: "Cloud-Scale Google Earth Engine Architecture for Automated In-Season Crop Phenology Profiling and Biomass Anomaly Tracking",
    authors: "Mahendra and S. K. Sharma",
    journal: "Computers and Electronics in Agriculture, Vol. 222, pp. 109033",
    abstract: "Near-real-time extraction of agricultural crop phenology over regional extents requires massive parallel computing. We developed an open-source, serverless cloud pipeline on Google Earth Engine (GEE) utilizing harmonic regression and asymmetric Gaussian smoothing over 45,000+ Sentinel-2 and Landsat-9 surface reflectance tiles. The framework automatically delineates Start of Season (SOS), Peak of Season (POS), and End of Season (EOS) at 10-meter resolution and delivers automated biomass anomaly alerts to agricultural extension officers.",
    highlight: "Automated Google Earth Engine cloud pipeline processing 45k+ tiles for real-time phenology tracking and biomass anomaly alerting.",
    bibtex: `@article{mahendra2024gee,
  title={Cloud-Scale Google Earth Engine Architecture for Automated In-Season Crop Phenology Profiling and Biomass Anomaly Tracking},
  author={Mahendra and Sharma, S. K.},
  journal={Computers and Electronics in Agriculture},
  volume={222},
  pages={109033},
  year={2024},
  publisher={Elsevier},
  doi={10.1016/j.compag.2024.109033}
}`
  },
  paper4: {
    type: "IEEE Conference",
    year: "2024",
    title: "Cross-Scale Calibration of Sentinel-2 Red-Edge Indices Using UAV Multi-Spectral Imagery for Smallholder Field Yield Estimation",
    authors: "Mahendra, A. Sengupta, and S. K. Sharma",
    journal: "IEEE International Geoscience and Remote Sensing Symposium (IGARSS 2024), Athens, Greece",
    abstract: "Smallholder agricultural parcels (< 0.5 ha) suffer from mixed pixel effects in medium-resolution satellite sensors. We deployed UAV flights equipped with 5-band multi-spectral sensors (MicaSense RedEdge) at 4.5 cm resolution synchronized with Sentinel-2 orbital overpasses. By modeling sub-pixel spatial heterogeneity and canopy structure, we established cross-scale radiometric transfer functions that enhanced satellite yield model correlation by 18.4%.",
    highlight: "Calibrated 10m Sentinel-2 red-edge indices using centimeter-grade UAV multi-spectral flights over smallholder agricultural plots.",
    bibtex: `@inproceedings{mahendra2024crossscale,
  title={Cross-Scale Calibration of Sentinel-2 Red-Edge Indices Using UAV Multi-Spectral Imagery for Smallholder Field Yield Estimation},
  author={Mahendra and Sengupta, A. and Sharma, S. K.},
  booktitle={2024 IEEE International Geoscience and Remote Sensing Symposium (IGARSS)},
  pages={4125--4129},
  year={2024},
  organization={IEEE},
  doi={10.1109/IGARSS53475.2024.10642101}
}`
  },
  paper5: {
    type: "ISPRS Conference",
    year: "2023",
    title: "Comparative Analysis of Gradient Boosting vs. Recurrent Neural Networks for Pre-Harvest Maize Yield Estimation",
    authors: "Mahendra, R. K. Verma, and S. K. Sharma",
    journal: "The International Archives of the Photogrammetry, Remote Sensing and Spatial Information Sciences, Vol. XLVIII-M-1",
    abstract: "This paper presents an extensive benchmark of ensemble tree regressors (Random Forest, XGBoost, LightGBM) versus deep recurrent neural networks (LSTM, GRU, Bi-LSTM) for maize yield forecasting across 6 continuous agricultural growing seasons.",
    highlight: "Benchmarked tree ensemble methods against recurrent neural networks across multi-year maize growing cycles.",
    bibtex: `@inproceedings{mahendra2023comparative,
  title={Comparative Analysis of Gradient Boosting vs. Recurrent Neural Networks for Pre-Harvest Maize Yield Estimation},
  author={Mahendra and Verma, R. K. and Sharma, S. K.},
  booktitle={ISPRS TC III Symposium},
  volume={XLVIII-M-1},
  pages={245--252},
  year={2023}
}`
  },
  paper6: {
    type: "Open Benchmark Dataset",
    year: "2025",
    title: "AgriYield-Bench: A Multi-Modal Satellite (Sentinel-1/2, Landsat-9) and Ground-Truth Crop Yield Dataset for 10,000+ Verified Field Parcels",
    authors: "Mahendra, S. K. Sharma, et al.",
    journal: "Zenodo Open Access Repository / Under Review at Scientific Data",
    abstract: "AgriYield-Bench provides an open-access multi-modal agricultural benchmark dataset comprising cloud-masked Sentinel-2 time series, Sentinel-1 SAR dual-pol backscatter, ERA5 climate daily aggregates, SoilGrids properties, and ground-truth harvest yield records spanning 5 years across 10,000+ agricultural field parcels.",
    highlight: "Standardized open-access multi-modal satellite & ground-truth dataset released on Zenodo to benchmark agricultural AI algorithms.",
    bibtex: `@dataset{mahendra2025agriyield,
  author={Mahendra and Sharma, S. K. and others},
  title={AgriYield-Bench: A Multi-Modal Satellite and Ground-Truth Crop Yield Dataset},
  year={2025},
  publisher={Zenodo},
  doi={10.5281/zenodo.14892011}
}`
  }
};

let activeModalPaperId = null;

function initPublicationsHub() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const pubCards = document.querySelectorAll('.pub-card');
  const searchInput = document.getElementById('pub-search-input');

  function filterPublications() {
    const activeTab = document.querySelector('.filter-tab.active')?.getAttribute('data-filter') || 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    pubCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const keywords = card.getAttribute('data-keywords') || '';
      const title = card.querySelector('.pub-title')?.textContent.toLowerCase() || '';
      const authors = card.querySelector('.pub-authors')?.textContent.toLowerCase() || '';

      const matchesTab = activeTab === 'all' || category === activeTab;
      const matchesSearch = query === '' || 
        keywords.includes(query) || 
        title.includes(query) || 
        authors.includes(query);

      if (matchesTab && matchesSearch) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterPublications();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterPublications);
  }

  // Abstract Modal Handlers
  const modal = document.getElementById('abstract-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const dismissBtn = document.getElementById('modal-dismiss-btn');
  const copyBibFromModalBtn = document.getElementById('modal-copy-bib-btn');

  const viewAbstractBtns = document.querySelectorAll('.view-abstract-btn');
  viewAbstractBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const paperId = btn.getAttribute('data-paper-id');
      const paper = paperAbstracts[paperId];
      if (paper && modal) {
        activeModalPaperId = paperId;
        document.getElementById('modal-pub-type').textContent = paper.type;
        document.getElementById('modal-pub-year').textContent = paper.year;
        document.getElementById('modal-pub-title').textContent = paper.title;
        document.getElementById('modal-pub-authors').textContent = paper.authors;
        document.getElementById('modal-pub-abstract').textContent = paper.abstract;
        document.getElementById('modal-pub-highlight').textContent = paper.highlight;

        modal.classList.add('open');
      }
    });
  });

  const closeModal = () => {
    if (modal) modal.classList.remove('open');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (dismissBtn) dismissBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Copy BibTeX buttons
  const copyBibBtns = document.querySelectorAll('.copy-bibtex-btn');
  copyBibBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const paperId = btn.getAttribute('data-paper-id');
      copyBibTeXForPaper(paperId);
    });
  });

  if (copyBibFromModalBtn) {
    copyBibFromModalBtn.addEventListener('click', () => {
      if (activeModalPaperId) {
        copyBibTeXForPaper(activeModalPaperId);
      }
    });
  }
}

function copyBibTeXForPaper(paperId) {
  const paper = paperAbstracts[paperId];
  if (paper && paper.bibtex) {
    navigator.clipboard.writeText(paper.bibtex).then(() => {
      showToast("✓ BibTeX citation copied to clipboard!");
    }).catch(() => {
      showToast("Citation ready to copy.");
    });
  }
}

/* ==========================================================================
   7. ACADEMIC CV TABS
   ========================================================================== */
function initCVTabs() {
  const tabBtns = document.querySelectorAll('.cv-tab-btn');
  const panes = document.querySelectorAll('.cv-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const tabTarget = btn.getAttribute('data-cv-tab');
      const targetPane = document.getElementById(`pane-${tabTarget}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   8. CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('collab-form');
  const feedback = document.getElementById('form-feedback');

  if (form && feedback) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('c-name').value;
      const topic = document.getElementById('c-topic').value;

      feedback.className = "form-feedback success";
      feedback.innerHTML = `✓ Thank you, <strong>${name}</strong>! Your inquiry regarding <em>${topic.replace(/_/g, ' ')}</em> has been recorded. Mahendra will get back to you via email shortly.`;
      
      form.reset();
      showToast("Academic inquiry transmitted successfully.");
    });
  }
}

/* ==========================================================================
   9. TOAST NOTIFICATIONS
   ========================================================================== */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
