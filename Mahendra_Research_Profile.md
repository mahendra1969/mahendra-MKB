# Academic Research Profile & Curriculum Vitae

**Mahendra**  
*Doctoral Research Scholar & Spatial Data Scientist*  
**Specialization:** Remote Sensing Applications in Agriculture & Crop Yield Analysis  
**Laboratory:** Geospatial Earth Observation & Agricultural Intelligence Laboratory  
**Email:** `mahendra.research@geospatial-agro.ac.in`  
**ORCID:** [0000-0002-8453-870X](https://orcid.org/0000-0002-8453-870X) | **Vidwan ID:** [169983](http://vidwan.inflibnet.ac.in/profile/169983) | **Google Scholar:** [Mahendra](https://scholar.google.com/citations?user=0wydcyYAAAAJ&hl=en) | **ResearchGate:** [Mahendra](https://researchgate.net) | **GitHub:** [@mahendra1969](https://github.com/mahendra1969)

---

## 1. Executive Research Statement

My research focuses on **Earth Observation (EO) satellite remote sensing, multi-sensor data fusion, and machine learning architectures for in-season agricultural crop monitoring and high-resolution pre-harvest yield forecasting**.

Faced with climate volatility, extreme thermal stress events, and erratic monsoons, regional food systems require timely, spatially explicit, and scalable crop yield assessments. My work addresses this challenge by:
1. **Synergizing Optical & Radar Satellites:** Combining 10m multi-spectral optical data (Sentinel-2 MSI, Landsat-8/9) with Synthetic Aperture Radar (Sentinel-1 C-band SAR) to overcome monsoon cloud contamination in subtropical agroecosystems.
2. **Developing Spatio-Temporal Deep Learning:** Engineering Vision Transformers and CNN-LSTM models constrained by crop phenology and biophysical radiative transfer models (PROSAIL) to estimate harvest yield 4–6 weeks prior to harvest.
3. **Coupling Agro-Meteorology and Soil Properties:** Integrating ERA5-Land reanalysis climate variables (Tmax, VPD, solar radiation), CHIRPS precipitation, MODIS land surface temperature (LST), and SoilGrids physicochemical data to model compound drought-heat vulnerability.
4. **Cloud-Scale Open Science:** Deploying automated geospatial processing workflows on Google Earth Engine (GEE) and publishing open benchmark datasets (e.g., *AgriYield-Bench*) to advance reproducible agricultural AI research.

---

## 2. Research Focus & Methodologies

```
                     ┌────────────────────────────────────────────────────────┐
                     │                 Multi-Sensor Earth Observation         │
                     │  • Sentinel-2 MSI (10m)    • Sentinel-1 C-Band SAR     │
                     │  • Landsat-8/9 OLI (30m)   • PlanetScope (3m High-Res) │
                     │  • MODIS / VIIRS           • UAV Multi-Spectral (4.5cm)│
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                                                 ▼
                     ┌────────────────────────────────────────────────────────┐
                     │            Feature Engineering & Physics-Informed ML   │
                     │  • Vegetation Indices (NDVI, NDRE, EVI, SAVI, NDWI)    │
                     │  • SAR Dual-Pol Backscatter (VV, VH, RVI, Ratios)     │
                     │  • ERA5-Land Climate Reanalysis (Tmax, VPD, Radiation) │
                     │  • Radiative Transfer Modeling (PROSAIL LAI / Cab)     │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                                                 ▼
                     ┌────────────────────────────────────────────────────────┐
                     │              Predictive Modeling & Architectures       │
                     │  • Spatio-Temporal CNN-LSTM & Temporal Transformers    │
                     │  • Extreme Gradient Boosting (XGBoost) & Random Forest │
                     │  • Phenology Curve Extraction (SOS, POS, EOS via GEE)  │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                                                 ▼
                     ┌────────────────────────────────────────────────────────┐
                     │                Operational Agricultural Outputs        │
                     │  • Pre-Harvest Crop Yield Forecasts (R² > 0.88)        │
                     │  • In-Season Heat/Drought Stress Anomaly Alerts        │
                     │  • Sub-Field Yield Gap Maps & Insurance Benchmarks     │
                     └────────────────────────────────────────────────────────┘
```

### Core Methodological Pillars:
- **Optical-SAR Synergies:** Leveraging Sentinel-2 Red-Edge bands ($B5, B6, B7, B8A$) for chlorophyll detection and Sentinel-1 cross-polarization ($VH/VV$) to track canopy geometric structure through cloud-covered monsoon periods.
- **Physics-Guided Deep Learning:** Embedding domain constraints (growing degree days, water balance equations) into loss functions to prevent unphysical yield predictions under extreme climate anomalies.
- **Cross-Scale Calibration:** Utilizing centimeter-resolution drone multi-spectral flights (MicaSense RedEdge) to calibrate 10m satellite pixels over fragmented smallholder farms (<0.5 ha).

---

## 3. Selected Peer-Reviewed Publications

### Journal Articles

1. **Mahendra**, Sharma, S. K., Sengupta, A., & Verma, R. K. (2025).  
   *Multi-Temporal Optical (Sentinel-2) and SAR (Sentinel-1) Fusion for High-Resolution In-Season Paddy Rice Yield Forecasting in Cloud-Prone Agroecosystems.*  
   **Remote Sensing of Environment**, 308, 114210.  
   **Impact Factor:** 9.6 | **DOI:** [10.1016/j.rse.2025.114210](https://doi.org/10.1016/j.rse.2025.114210)  
   *Contribution:* Proposed a multi-sensor CNN-LSTM architecture that achieved $R^2 = 0.88$ and an RMSE of $0.28\text{ t/ha}$ under 65% monsoon cloud contamination.

2. **Mahendra**, Patel, V., & Roy, N. C. (2024).  
   *Assessing Terminal Heat Stress and Regional Wheat Yield Vulnerability in the Indo-Gangetic Plains Using Spatio-Temporal Transformers and Reanalysis Climate Coupling.*  
   **ISPRS Journal of Photogrammetry and Remote Sensing**, 211, 88–104.  
   **Impact Factor:** 7.5 | **DOI:** [10.1016/j.isprsjprs.2024.04.012](https://doi.org/10.1016/j.isprsjprs.2024.04.012)  
   *Contribution:* Coupled Landsat-8/9 and Sentinel-2 with hourly ERA5-Land climate data into a Temporal Vision Transformer, providing 30-day pre-harvest warnings ($R^2 = 0.914$).

3. **Mahendra**, & Sharma, S. K. (2024).  
   *Cloud-Scale Google Earth Engine Architecture for Automated In-Season Crop Phenology Profiling and Biomass Anomaly Tracking.*  
   **Computers and Electronics in Agriculture**, 222, 109033.  
   **Impact Factor:** 6.8 | **DOI:** [10.1016/j.compag.2024.109033](https://doi.org/10.1016/j.compag.2024.109033)  
   *Contribution:* Engineered a serverless GEE pipeline processing >45,000 Sentinel-2 tiles to extract smoothed harmonic phenology metrics.

### International Conference Proceedings

4. **Mahendra**, Sengupta, A., & Sharma, S. K. (2024).  
   *Cross-Scale Calibration of Sentinel-2 Red-Edge Indices Using UAV Multi-Spectral Imagery for Smallholder Field Yield Estimation.*  
   **IEEE International Geoscience and Remote Sensing Symposium (IGARSS 2024)**, Athens, Greece, pp. 4125–4129.  
   **DOI:** [10.1109/IGARSS53475.2024.10642101](https://doi.org/10.1109/IGARSS53475.2024.10642101)

5. **Mahendra**, Verma, R. K., & Sharma, S. K. (2023).  
   *Comparative Analysis of Gradient Boosting vs. Recurrent Neural Networks for Pre-Harvest Maize Yield Estimation.*  
   **ISPRS TC III Symposium**, Vol. XLVIII-M-1, pp. 245–252.

### Open Benchmark Datasets & Preprints

6. **Mahendra**, Sharma, S. K., et al. (2025).  
   *AgriYield-Bench: A Multi-Modal Satellite (Sentinel-1/2, Landsat-9) and Ground-Truth Crop Yield Dataset for 10,000+ Verified Field Parcels.*  
   **Zenodo Open Access Repository** (Under Review at *Scientific Data*).  
   **DOI:** [10.5281/zenodo.14892011](https://doi.org/10.5281/zenodo.14892011)

---

## 4. Academic Background & Education

- **Ph.D. in Remote Sensing & Agricultural Geospatial Sciences** *(2022 – Present)*  
  *Geospatial Earth Observation & Agricultural Intelligence Laboratory*  
  *Dissertation:* "Multi-Sensor Satellite Data Assimilation and Deep Spatio-Temporal Modeling for Regional Agricultural Crop Yield Forecasting and Stress Dynamics."  
  *Advisor:* Prof. S. K. Sharma

- **M.Tech / M.Sc. in Remote Sensing & GIS (Distinction)** *(2019 – 2021)*  
  *Department of Geoinformatics*  
  *Focus:* Agricultural Remote Sensing, Digital Image Processing, Hyperspectral Indices.  
  *Honors:* Ranked 1st in Cohort (University Gold Medal).

- **B.Tech / B.Sc. in Agricultural Engineering / Geomatics** *(2015 – 2019)*  
  *College of Agricultural Engineering & Technology*  
  *Focus:* Soil & Water Engineering, Crop Physiology, GPS/GNSS, Spatial Statistics.

---

## 5. Grants, Fellowships & Honors

- **IEEE GRSS Travel Grant Award** (2024) – IEEE Geoscience and Remote Sensing Society for oral presentation at IGARSS 2024, Athens, Greece.
- **National Senior Research Fellowship (SRF)** (2023) – Ministry of Science and Technology for doctoral research in Geospatial Earth Observation.
- **Best Research Paper Presentation Award** (2023) – National Symposium on Advances in Remote Sensing for Sustainable Agriculture.
- **University Gold Medal for Academic Excellence** (2021) – Highest CGPA in Master's Program in Remote Sensing & GIS.

---

## 6. Computational & Geospatial Toolkit

| Category | Technologies & Tools |
|---|---|
| **Earth Observation Datasets** | Sentinel-2 (MSI), Sentinel-1 (C-band SAR), Landsat-8/9 (OLI/TIRS), PlanetScope (3m), MODIS (MOD13Q1, MOD11A2), ERA5-Land, CHIRPS, SoilGrids |
| **Cloud Platforms & Big Spatial Data** | Google Earth Engine (GEE Python/JS API), Sentinel Hub API, STAC, Cloud-Optimized GeoTIFFs (COG), AWS S3 Geospatial Open Data, Dask |
| **Machine Learning & Deep Learning** | PyTorch, TensorFlow/Keras, Scikit-learn, XGBoost, LightGBM, Spatio-Temporal CNN-LSTM, Vision Transformers (ViT), SHAP, PROSAIL |
| **GIS & Image Processing Software** | QGIS, ArcGIS Pro, ESA SNAP (SAR Toolbox), GDAL/OGR, Rasterio, GeoPandas, Xarray, Shapely, R (`sf`, `terra`, `rgee`), LaTeX / Overleaf |

---

## 7. Professional Service & Peer Review

**Reviewer for Peer-Reviewed International Journals:**
- *Remote Sensing of Environment* (Elsevier)
- *ISPRS Journal of Photogrammetry and Remote Sensing* (Elsevier)
- *Computers and Electronics in Agriculture* (Elsevier)
- *IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing (JSTARS)*
- *International Journal of Remote Sensing* (Taylor & Francis)
- *Agricultural and Forest Meteorology* (Elsevier)

**Professional Memberships:**
- Member, IEEE Geoscience and Remote Sensing Society (IEEE GRSS)
- Member, International Society for Photogrammetry and Remote Sensing (ISPRS)
- Life Member, Indian Society of Remote Sensing (ISRS)
- Member, American Geophysical Union (AGU)
