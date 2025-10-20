/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from "@google/genai";

// Add Chart.js to the global scope for the type
declare const Chart: any;


// --- DATA DEFINITIONS ---
type DistrictData = {
    lat: number;
    lon: number;
};

type ProvinceData = Record<string, DistrictData>;

const LOCATIONS: Record<string, ProvinceData> = {
    "İzmir": {
        "Aliağa": { lat: 38.80, lon: 26.97 },
        "Bergama": { lat: 39.12, lon: 27.18 },
        "Bornova": { lat: 38.46, lon: 27.22 },
        "Çeşme": { lat: 38.32, lon: 26.30 },
        "Kemalpaşa": { lat: 38.43, lon: 27.42 },
        "Ödemiş": { lat: 38.23, lon: 27.97 }
    },
    "Manisa": {
        "Ahmetli": { lat: 38.51, lon: 27.94 },
        "Alaşehir": { lat: 38.35, lon: 28.52 },
        "Salihli": { lat: 38.48, lon: 28.14 },
        "Sarıgöl": { lat: 38.24, lon: 28.70 },
        "Turgutlu": { lat: 38.49, lon: 27.70 }
    },
    "Aydın": {
        "Efeler": { lat: 37.85, lon: 27.84 },
        "Nazilli": { lat: 37.91, lon: 28.32 },
        "Sultanhisar": { lat: 37.89, lon: 28.15 }
    },
    "Denizli": {
        "Buldan": { lat: 38.04, lon: 28.83 },
        "Çivril": { lat: 38.30, lon: 29.76 },
        "Honaz": { lat: 37.76, lon: 29.26 }
    },
    "Muğla": {
        "Fethiye": { lat: 36.65, lon: 29.12 },
        "Köyceğiz": { lat: 36.96, lon: 28.69 },
        "Milas": { lat: 37.31, lon: 27.78 }
    },
    "Afyonkarahisar": {
        "Dinar": { lat: 38.06, lon: 30.16 },
        "Sandıklı": { lat: 38.46, lon: 30.27 },
        "Sultandağı": { lat: 38.53, lon: 31.23 }
    },
    "Kütahya": {
        "Merkez": { lat: 39.42, lon: 29.98 },
        "Simav": { lat: 39.09, lon: 28.98 },
        "Şaphane": { lat: 39.02, lon: 29.21 }
    },
    "Uşak": {
        "Banaz": { lat: 38.74, lon: 29.74 },
        "Eşme": { lat: 38.40, lon: 28.97 },
        "Sivaslı": { lat: 38.50, lon: 29.68 }
    }
};


type CherryVariety = {
  requiredHours: number;
  description: string;
};

const CHERRY_VARIETIES: Record<string, CherryVariety> = {
  "0900 Ziraat": {
    requiredHours: 1200,
    description: "Türkiye'nin en popüler ve yaygın ihracat çeşitlerinden biridir. Yüksek soğuklama ihtiyacı vardır, bu nedenle kışları sert geçen bölgeler için idealdir. Meyveleri kalp şeklinde, iri ve lezzetlidir. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Bing": {
    requiredHours: 750,
    description: "Dünyaca ünlü, tatlı ve gevrek bir Amerikan çeşididir. Orta düzeyde soğuklama ihtiyacı ile bilinir. Çatlamaya karşı hassas olabilir. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Brooks": {
    requiredHours: 300,
    description: "Düşük soğuklama ihtiyacı olan erkenci bir çeşittir. Sıcak iklimlere daha iyi uyum sağlar. Meyveleri büyük, tatlı ve koyu kırmızıdır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Early Burlat": {
    requiredHours: 550,
    description: "Çok erkenci bir çeşittir. Düşük-orta soğuklama ihtiyacı ile bilinir. Meyveleri orta irilikte, parlak kırmızı renkli ve yumuşaktır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Early Lory": {
    requiredHours: 550,
    description: "Erkenci bir çeşit olup, Early Burlat'tan birkaç gün önce olgunlaşır. Düşük-orta soğuklama ihtiyacına sahiptir ve verimli bir türdür. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Kordia": {
    requiredHours: 900,
    description: "Geç sezon çeşitlerinden biridir. Yüksek soğuklama ihtiyacı vardır. Uzun saplı, kalp şeklinde, çok iri ve çatlamaya dayanıklı meyveleriyle bilinir. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Lambert": {
    requiredHours: 800,
    description: "Geç olgunlaşan, verimli bir çeşittir. Orta-yüksek soğuklama ihtiyacı vardır. Meyveleri kalp şeklinde, koyu kırmızı ve tatlıdır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Napolyon": {
    requiredHours: 1100,
    description: "Beyaz kiraz olarak da bilinir. Yüksek soğuklama ihtiyacı vardır ve genellikle sanayilik (reçel, konserve) olarak kullanılır. Tozlayıcı olarak önemlidir. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Regina": {
    requiredHours: 1000,
    description: "Geç olgunlaşan, yüksek kaliteli bir Alman çeşididir. Yüksek soğuklama ihtiyacı bulunur. Meyveleri çok iri, sert, lezzetli ve çatlamaya oldukça dayanıklıdır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Stella": {
    requiredHours: 750,
    description: "Kendine verimli ilk kiraz çeşitlerinden biridir. Orta düzeyde soğuklama ihtiyacı ile birçok bölgeye uyum sağlar. Meyveleri büyük, kalp şeklinde ve siyahtır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Sweetheart": {
    requiredHours: 800,
    description: "Geç sezon ve kendine verimli bir çeşittir. Orta-yüksek soğuklama ihtiyacı vardır. Çok verimlidir ve meyveleri parlak kırmızı, tatlıdır. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
  "Vista": {
    requiredHours: 750,
    description: "Orta mevsimde olgunlaşan, tatlı ve sulu bir çeşittir. Orta düzeyde soğuklama ihtiyacı ile geniş bir adaptasyon yeteneğine sahiptir. Belirtilen soğuklama ihtiyacı ortalama bir değer olup, iklim ve anaca göre değişiklik gösterebilir."
  },
};

const AUTO_REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// --- STATE MANAGEMENT ---

type DailyTemp = {
  date: string;
  min: number;
  max: number;
};

type Notification = {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
};

type AiModel = 'gemini-2.5-flash' | 'gemini-2.5-pro';

type RawHourlyData = {
    timestamp: string;
    temperature: number;
};

type Note = {
  id: number;
  timestamp: number;
  province: string;
  district: string;
  startDate: string;
  endDate: string;
  content: string;
  isEditing?: boolean;
};

type AppState = {
  isLoading: boolean;
  selectedProvince: string;
  selectedDistrict: string;
  selectedVariety: string;
  dataSource: 'gemini' | 'open-meteo';
  selectedAiModel: AiModel;
  chillingThreshold: number;
  totalChillingHours: number | null;
  monthlyChillingHours: Record<string, number> | null;
  dailyTemperatures: DailyTemp[] | null;
  rawHourlyData: RawHourlyData[] | null;
  error: string | null;
  customPrompt: string;
  isRecommendationLoading: boolean;
  aiRecommendation: string | null;
  isAutoRefreshEnabled: boolean;
  isAutoRefreshing: boolean;
  lastUpdateTime: Date | null;
  lastUpdateType: 'manual' | 'auto' | null;
  activeControlTab: 'analysis' | 'visualization' | 'tools' | 'advanced';
  isComparisonLoading: boolean;
  yearlyComparisonData: Record<string, number | null> | null;
  notifications: Notification[];
  isThresholdMetAlertFired: boolean;
  alertedEvents: Record<string, boolean>;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  chartStartDate: string; // YYYY-MM-DD format for chart filtering
  chartEndDate: string;   // YYYY-MM-DD format for chart filtering
  monthlyChartType: 'bar' | 'pie';
  dailyChartType: 'line' | 'bar';
  yearlyChartType: 'bar' | 'line';
  isHourlyAnalysisModalVisible: boolean;
  isMapLoading: boolean;
  districtAverageTemperatures: Record<string, number | null> | null;
  isFrostForecastLoading: boolean;
  frostForecastData: { time: string[]; temperature: number[] } | null;
  frostForecastError: string | null;
  isFrostWarningModalVisible: boolean;
  frostWarningThreshold: number;
  soilAnalysisFile: File | null;
  isSoilAnalysisLoading: boolean;
  soilAnalysisResult: string | null;
  soilAnalysisError: string | null;
  notes: Note[];
  newNoteContent: string;
  isNotebookFiltered: boolean;
};

function toSafeISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


const today = new Date();
// If the current month is before October (0-8), the season started last year.
// Otherwise (Oct, Nov, Dec), it started this year.
const startYear = today.getMonth() < 9 ? today.getFullYear() - 1 : today.getFullYear();
const defaultStartDate = new Date(startYear, 9, 1); // October 1st

const state: AppState = {
  isLoading: false,
  selectedProvince: "İzmir",
  selectedDistrict: "Kemalpaşa",
  selectedVariety: "0900 Ziraat",
  dataSource: 'open-meteo',
  selectedAiModel: 'gemini-2.5-flash',
  chillingThreshold: 7.2,
  totalChillingHours: null,
  monthlyChillingHours: null,
  dailyTemperatures: null,
  rawHourlyData: null,
  error: null,
  customPrompt: '',
  isRecommendationLoading: false,
  aiRecommendation: null,
  isAutoRefreshEnabled: true,
  isAutoRefreshing: false,
  lastUpdateTime: null,
  lastUpdateType: null,
  activeControlTab: 'analysis',
  isComparisonLoading: false,
  yearlyComparisonData: null,
  notifications: [],
  isThresholdMetAlertFired: false,
  alertedEvents: {},
  startDate: toSafeISOString(defaultStartDate),
  endDate: toSafeISOString(today),
  chartStartDate: toSafeISOString(defaultStartDate),
  chartEndDate: toSafeISOString(today),
  monthlyChartType: 'bar',
  dailyChartType: 'line',
  yearlyChartType: 'bar',
  isHourlyAnalysisModalVisible: false,
  isMapLoading: false,
  districtAverageTemperatures: null,
  isFrostForecastLoading: false,
  frostForecastData: null,
  frostForecastError: null,
  isFrostWarningModalVisible: false,
  frostWarningThreshold: 0,
  soilAnalysisFile: null,
  isSoilAnalysisLoading: false,
  soilAnalysisResult: null,
  soilAnalysisError: null,
  notes: [],
  newNoteContent: '',
  isNotebookFiltered: false,
};

let charts: { [key: string]: any } = {};
let autoRefreshTimer: number | null = null;

// --- API & DATA HANDLING ---

/**
 * Fetches temperature data from the Open-Meteo API.
 */
async function fetchWithOpenMeteo(lat: number, lon: number, startDate: string, endDate: string): Promise<RawHourlyData[]> {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Open-Meteo API Error: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.hourly || !data.hourly.time || !data.hourly.temperature_2m) {
        throw new Error("Open-Meteo'dan geçersiz veri formatı alındı.");
    }

    return data.hourly.time.map((t: string, i: number) => ({
        timestamp: t,
        temperature: data.hourly.temperature_2m[i]
    }));
}

/**
 * Fetches frost forecast data from the Open-Meteo API for the next 3 days.
 */
async function fetchFrostForecast(lat: number, lon: number): Promise<{ time: string[], temperature: number[] }> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&forecast_days=3&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Open-Meteo Forecast API Error: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.hourly || !data.hourly.time || !data.hourly.temperature_2m) {
        throw new Error("Open-Meteo (Forecast) API'sinden geçersiz veri formatı alındı.");
    }
    return {
        time: data.hourly.time,
        temperature: data.hourly.temperature_2m
    };
}


/**
 * Fetches temperature data using the Gemini API.
 */
async function fetchWithGemini(province: string, district: string, startDate: string, endDate:string): Promise<RawHourlyData[]> {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const model = state.selectedAiModel;

        const prompt = `${province} ilinin ${district} ilçesi için ${startDate} ve ${endDate} tarihleri arasındaki saatlik sıcaklık verilerini JSON formatında ver. JSON objesi 'hourly_temperatures' adında bir anahtara sahip olmalı ve bu anahtarın değeri, her biri 'timestamp' (YYYY-MM-DDTHH:mm formatında) ve 'temperature' (Celsius cinsinden sayısal değer) alanlarına sahip objelerden oluşan bir dizi olmalıdır. Sadece JSON çıktısı ver, başka bir metin ekleme.`;

        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });

        let text = response.text.trim();
        // Clean the response to be valid JSON
        text = text.replace(/```json/g, '').replace(/```/g, '');

        const parsedData = JSON.parse(text);

        if (!parsedData.hourly_temperatures || !Array.isArray(parsedData.hourly_temperatures)) {
            throw new Error("Gemini'den geçersiz veya beklenmedik JSON formatı alındı.");
        }

        return parsedData.hourly_temperatures;
    } catch (error) {
        console.error("Gemini API Hatası:", error);
        throw new Error(`Gemini API ile veri alınamadı. Lütfen daha sonra tekrar deneyin veya farklı bir veri kaynağı seçin. Detay: ${error instanceof Error ? error.message : String(error)}`);
    }
}


/**
 * Processes raw hourly data to calculate chilling hours and daily temperatures.
 */
function processTemperatureData(hourlyData: RawHourlyData[]): {
    totalChillingHours: number,
    monthlyChillingHours: Record<string, number>,
    dailyTemperatures: DailyTemp[]
} {
    let totalChillingHours = 0;
    const monthlyChillingHours: Record<string, number> = {};
    const dailyData: Record<string, { min: number, max: number }> = {};

    hourlyData.forEach(item => {
        const temp = item.temperature;
        const date = new Date(item.timestamp);
        const yyyymmdd = toSafeISOString(date);
        const monthKey = date.toLocaleString('tr-TR', { year: 'numeric', month: 'long' });

        // Calculate chilling hours
        if (temp < state.chillingThreshold) {
            totalChillingHours++;
            monthlyChillingHours[monthKey] = (monthlyChillingHours[monthKey] || 0) + 1;
        }

        // Aggregate daily min/max temperatures
        if (!dailyData[yyyymmdd]) {
            dailyData[yyyymmdd] = { min: temp, max: temp };
        } else {
            dailyData[yyyymmdd].min = Math.min(dailyData[yyyymmdd].min, temp);
            dailyData[yyyymmdd].max = Math.max(dailyData[yyyymmdd].max, temp);
        }
    });

    const dailyTemperatures = Object.entries(dailyData)
        .map(([date, temps]) => ({
            date: date,
            min: parseFloat(temps.min.toFixed(1)),
            max: parseFloat(temps.max.toFixed(1))
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return { totalChillingHours, monthlyChillingHours, dailyTemperatures };
}


/**
 * Main function to trigger data fetching and processing.
 */
async function analyzeData(isAutoRefresh = false) {
    if (state.isLoading) return;

    state.isLoading = true;
    state.isAutoRefreshing = isAutoRefresh;
    state.error = null;
    state.lastUpdateType = isAutoRefresh ? 'auto' : 'manual';
    // Clear previous results for a better loading experience
    state.totalChillingHours = null;
    state.aiRecommendation = null;
    state.yearlyComparisonData = null;
    state.districtAverageTemperatures = null;
    updateUI();

    try {
        const { lat, lon } = LOCATIONS[state.selectedProvince][state.selectedDistrict];
        let hourlyData;

        if (state.dataSource === 'gemini') {
            hourlyData = await fetchWithGemini(state.selectedProvince, state.selectedDistrict, state.startDate, state.endDate);
        } else {
            hourlyData = await fetchWithOpenMeteo(lat, lon, state.startDate, state.endDate);
        }

        if (hourlyData.length === 0) {
            throw new Error("Seçilen tarih aralığı için veri bulunamadı.");
        }

        const { totalChillingHours, monthlyChillingHours, dailyTemperatures } = processTemperatureData(hourlyData);
        state.totalChillingHours = totalChillingHours;
        state.monthlyChillingHours = monthlyChillingHours;
        state.dailyTemperatures = dailyTemperatures;
        state.rawHourlyData = hourlyData;
        state.lastUpdateTime = new Date();

        // Reset threshold alert state for new analysis
        state.isThresholdMetAlertFired = false;
        checkThresholdAlert();

        // Automatically get AI recommendation after successful analysis.
        getAiRecommendation();

    } catch (error) {
        state.error = error instanceof Error ? error.message : String(error);
        state.totalChillingHours = null;
        state.monthlyChillingHours = null;
        state.dailyTemperatures = null;
        state.rawHourlyData = null;
    } finally {
        state.isLoading = false;
        state.isAutoRefreshing = false;
        updateUI();
    }
}


// --- UI RENDERING ---

/**
 * Main render function to update the entire UI based on the current state.
 */
function render() {
    const root = document.getElementById('root');
    if (!root) return;

    root.innerHTML = `
      <div class="app-container">
        <header>
            <h1>Bitki Soğuklama Takip</h1>
            <p>Meyve ağaçlarınızın soğuklama ihtiyacını takip ederek tarımsal verimliliğinizi artırın.</p>
        </header>
        <main class="main-container">
            <div class="dashboard-left">
                ${renderControlPanel()}
                ${renderVarietyInfo()}
            </div>
            <div class="dashboard-right" id="dashboard-right">
                
            </div>
        </main>
      </div>
    `;
    updateUI();
    addEventListeners();
}

/**
 * Updates dynamic parts of the UI without re-rendering the whole DOM.
 */
function updateUI() {
    renderControlPanelContent();
    (document.getElementById('variety-info-container') as HTMLDivElement).innerHTML = renderVarietyInfo();
    (document.getElementById('dashboard-right') as HTMLDivElement).innerHTML = renderRightDashboard();
    renderCharts();
    (document.getElementById('frost-warning-modal-container') as HTMLDivElement).innerHTML = renderFrostWarningModal();
}

function renderRightDashboard() {
    if (state.isLoading && !state.isAutoRefreshing) {
        return renderSkeletonLoader();
    }
    if (state.error) {
        return `<div class="card error-card">
            <p>Hata: ${state.error}</p>
        </div>`;
    }
    if (state.totalChillingHours === null) {
        return renderPlaceholder();
    }

    return `
        ${renderSummary()}
        ${renderAiRecommendation()}
        ${renderSoilAnalysisResult()}
        ${renderDetailedChartsSection()}
    `;
}

function renderSkeletonLoader() {
    return `
        <div class="card">
            <div class="results-summary">
                <div class="summary-card skeleton" style="height: 120px;"></div>
                <div class="summary-card skeleton" style="height: 120px;"></div>
            </div>
            <div class="progress-bar-container skeleton" style="margin-top: 1.5rem;"></div>
        </div>
        <div class="card skeleton" style="height: 250px;"></div>
    `;
}

function renderPlaceholder() {
    return `
        <div class="card placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            <h3>Analiz Bekleniyor</h3>
            <p>Başlamak için sol taraftaki panelden seçeneklerinizi belirleyip "Analiz Et" butonuna tıklayın.</p>
        </div>
    `;
}


/**
 * Renders the main control panel card shell.
 */
function renderControlPanel() {
    return `
    <div class="card control-panel">
      <div id="control-panel-content"></div>
    </div>
  `;
}

function renderControlPanelContent() {
    const container = document.getElementById('control-panel-content');
    if (!container) return;

    const provinces = Object.keys(LOCATIONS);
    const districts = Object.keys(LOCATIONS[state.selectedProvince]);
    const varieties = Object.keys(CHERRY_VARIETIES);

    let isDateRangeValid = true;
    if (state.startDate && state.endDate) {
        isDateRangeValid = new Date(state.startDate) <= new Date(state.endDate);
    }

    container.innerHTML = `
        <div class="card-header">
            <h2>Kontrol Paneli</h2>
        </div>
        <nav class="tab-nav">
             <button class="tab-button ${state.activeControlTab === 'analysis' ? 'active' : ''}" data-tab="analysis">Ayarlar & Analiz</button>
             <button class="tab-button ${state.activeControlTab === 'visualization' ? 'active' : ''}" data-tab="visualization">Veri & Görselleştirme</button>
             <button class="tab-button ${state.activeControlTab === 'tools' ? 'active' : ''}" data-tab="tools">Araçlar</button>
             <button class="tab-button ${state.activeControlTab === 'advanced' ? 'active' : ''}" data-tab="advanced">Gelişmiş</button>
        </nav>
        <div class="tab-content">
            <div id="analysis-tab" class="tab-pane ${state.activeControlTab === 'analysis' ? 'active' : ''}">
                 <div class="form-group">
                    <label for="province-select">İl</label>
                    <select id="province-select" class="form-control">
                        ${provinces.map(p => `<option value="${p}" ${p === state.selectedProvince ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="district-select">İlçe</label>
                    <select id="district-select" class="form-control">
                         ${districts.map(d => `<option value="${d}" ${d === state.selectedDistrict ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="variety-select">Kiraz Çeşidi</label>
                    <select id="variety-select" class="form-control">
                        ${varieties.map(v => `<option value="${v}" ${v === state.selectedVariety ? 'selected' : ''}>${v}</option>`).join('')}
                    </select>
                </div>
                 <div class="form-group">
                    <label for="chilling-threshold">Soğuklama Eşiği (°C)</label>
                    <input type="number" id="chilling-threshold" class="form-control" step="0.1" value="${state.chillingThreshold}">
                     <p class="disclaimer">Genellikle 7.2°C kullanılır.</p>
                </div>
                <div class="form-group">
                    <label>Analiz Tarih Aralığı</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="date" id="start-date" class="form-control ${!isDateRangeValid ? 'invalid' : ''}" value="${state.startDate}">
                        <input type="date" id="end-date" class="form-control ${!isDateRangeValid ? 'invalid' : ''}" value="${state.endDate}">
                    </div>
                </div>
            </div>
            <div id="visualization-tab" class="tab-pane ${state.activeControlTab === 'visualization' ? 'active' : ''}">
                <p class="prompt-description">Geçmiş yılların verilerini analiz edin veya bölgedeki diğer ilçelerle sıcaklık karşılaştırması yapın.</p>
                <button class="btn btn-secondary" id="compare-yearly-btn" style="width: 100%;">
                    ${state.isComparisonLoading ? '<div class="button-loader-small"></div>' : ''} Yıllık Karşılaştırma Yap
                </button>
                 <button class="btn btn-secondary" id="compare-districts-btn" style="width: 100%;">
                    ${state.isMapLoading ? '<div class="button-loader-small"></div>' : ''} İlçeleri Karşılaştır (Harita)
                </button>
            </div>
            <div id="tools-tab" class="tab-pane ${state.activeControlTab === 'tools' ? 'active' : ''}">
                <div class="form-group" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
                    <h4>Don Riski Kontrolü (3 Günlük Tahmin)</h4>
                    <p class="prompt-description">Belirlediğiniz eşik sıcaklığın altına düşme riski olup olmadığını kontrol edin.</p>
                    <div class="form-group">
                        <label for="frost-warning-threshold">Uyarı Eşiği (°C)</label>
                        <input type="number" id="frost-warning-threshold" class="form-control" step="0.1" value="${state.frostWarningThreshold}">
                    </div>
                    <button class="btn btn-secondary" id="check-frost-forecast-btn" style="width: 100%;">
                        ${state.isFrostForecastLoading ? '<div class="button-loader-small"></div>' : ''} Riski Kontrol Et
                    </button>
                </div>
                ${renderSoilAnalysisUploader()}
                ${renderNotebook()}
            </div>
            <div id="advanced-tab" class="tab-pane ${state.activeControlTab === 'advanced' ? 'active' : ''}">
                <div class="form-group">
                     <h4>Veri Kaynağı</h4>
                     <p class="prompt-description">Doğru sonuçlar için Open-Meteo önerilir. Gemini, deneysel ve daha yavaş olabilir.</p>
                     <div class="radio-group">
                        <div class="radio-option">
                            <input type="radio" id="source-open-meteo" name="data-source" value="open-meteo" ${state.dataSource === 'open-meteo' ? 'checked' : ''}>
                            <label for="source-open-meteo">Open-Meteo (Önerilen)</label>
                        </div>
                        <div class="radio-option">
                             <input type="radio" id="source-gemini" name="data-source" value="gemini" ${state.dataSource === 'gemini' ? 'checked' : ''}>
                             <label for="source-gemini">Google Gemini (Deneysel)</label>
                        </div>
                     </div>
                </div>
                ${state.dataSource === 'gemini' ? `
                 <div class="form-group">
                    <h4>Gemini Modeli</h4>
                     <div class="radio-group">
                         <div class="radio-option">
                            <input type="radio" id="model-flash" name="ai-model" value="gemini-2.5-flash" ${state.selectedAiModel === 'gemini-2.5-flash' ? 'checked' : ''}>
                            <label for="model-flash">Gemini 2.5 Flash (Hızlı)</label>
                        </div>
                        <div class="radio-option">
                             <input type="radio" id="model-pro" name="ai-model" value="gemini-2.5-pro" ${state.selectedAiModel === 'gemini-2.5-pro' ? 'checked' : ''}>
                             <label for="model-pro">Gemini 2.5 Pro (Gelişmiş)</label>
                        </div>
                     </div>
                 </div>
                ` : ''}
                 <div class="form-group">
                     <h4>Öneri için Özel Talimat</h4>
                      <textarea id="custom-prompt" class="form-control" placeholder="Örn: Gübreleme önerilerini organik tarıma uygun olarak yap.">${state.customPrompt}</textarea>
                      <p class="prompt-description">Yapay zeka önerilerini şekillendirmek için buraya özel talimatlar ekleyebilirsiniz.</p>
                      <button class="btn btn-secondary" id="get-recommendation-btn" style="align-self: flex-end;">
                        ${state.isRecommendationLoading ? '<div class="button-loader-small"></div> Yükleniyor' : 'Öneri Al'}
                      </button>
                 </div>
            </div>
        </div>
        <div class="panel-footer">
             <div class="extra-controls">
                <span>Otomatik Yenileme (30 dk)</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="auto-refresh-toggle" ${state.isAutoRefreshEnabled ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
            <div class="button-container">
                ${!isDateRangeValid ? '<p class="date-error-message">Başlangıç tarihi, bitiş tarihinden sonra olamaz.</p>' : ''}
                <button id="main-analyze-button" class="btn btn-primary" ${state.isLoading || !isDateRangeValid ? 'disabled' : ''}>
                    ${state.isLoading ? '<div class="button-loader"></div>' : ''}
                    <span>${state.isLoading ? (state.isAutoRefreshing ? 'Yenileniyor...' : 'Hesaplanıyor...') : 'Analiz Et'}</span>
                </button>
            </div>
        </div>
    `;
}

function renderVarietyInfo() {
  const variety = CHERRY_VARIETIES[state.selectedVariety];
  if (!variety) return '';

  return `
    <div class="card variety-info-card" id="variety-info-container">
        <div class="card-header">
            <h3>${state.selectedVariety} Bilgileri</h3>
        </div>
        <div class="required-hours-info">
            <span>Gerekli Soğuklama Süresi</span>
            <span class="required-hours-value">${variety.requiredHours}<span class="metric-unit">saat</span></span>
        </div>
        <p class="variety-description">${variety.description}</p>
    </div>
  `;
}

/**
 * Renders the summary cards with total hours and progress.
 */
function renderSummary() {

  const required = CHERRY_VARIETIES[state.selectedVariety].requiredHours;
  const current = state.totalChillingHours!;
  const percentage = required > 0 ? Math.min((current / required) * 100, 100) : 0;
  const isComplete = current >= required;

  const renderConfetti = () => {
      if (!isComplete) return '';
      let confettiHTML = '<div class="confetti-container">';
      for (let i = 0; i < 75; i++) {
          const style = `left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 3}s; transform: rotate(${Math.random() * 360}deg);`;
          confettiHTML += `<div class="confetti" style="${style}"></div>`;
      }
      confettiHTML += '</div>';
      return confettiHTML;
  };


  return `
    <div class="card summary-card-container">
      ${renderConfetti()}
      <div class="results-summary">
        <div class="summary-card">
          <h3>Toplam Soğuklama</h3>
          <p class="metric-value">${current.toLocaleString('tr-TR')}<span class="metric-unit">saat</span></p>
        </div>
        <div class="summary-card">
          <h3>Hedef Tamamlanma</h3>
          <p class="metric-value">${percentage.toFixed(1)}<span class="metric-unit">%</span></p>
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar ${isComplete ? 'complete' : ''}" style="width: ${percentage}%;"></div>
      </div>
      ${isComplete ? `
        <div class="completion-feedback">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
           <span>Soğuklama ihtiyacı karşılandı!</span>
        </div>
      ` : ''}
    </div>
  `;
}


/**
 * Renders the AI recommendation card.
 */
function renderAiRecommendation() {
  if (state.isRecommendationLoading) {
    return `
      <div class="card ai-recommendation-card skeleton" style="height: 250px;"></div>
    `;
  }

  if (!state.aiRecommendation) {
    return ''; // Render nothing if there's no recommendation
  }

  return `
     <div class="card ai-recommendation-card">
        <div class="card-header">
            <h3>
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                Yapay Zeka Önerisi
            </h3>
        </div>
        <p class="ai-recommendation-text">${state.aiRecommendation}</p>
     </div>
  `;
}

function renderSoilAnalysisUploader() {
    if (state.isSoilAnalysisLoading) {
        return `<div class="card skeleton" style="height: 200px"></div>`;
    }

    const filePreview = state.soilAnalysisFile ? `
        <div class="file-preview">
            <span class="file-name">${state.soilAnalysisFile.name}</span>
            <button class="file-remove-btn" id="file-remove-btn">&times;</button>
        </div>
    ` : `
        <label for="soil-file-input" class="file-drop-label">
             <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <p>Dosyayı buraya sürükleyin veya seçin</p>
        </label>
    `;

    return `
        <div class="form-group">
            <h4>Toprak Analizi Yorumlama</h4>
            <p class="prompt-description">Raporunuzu (PDF, TXT, resim) yükleyerek gübreleme ve toprak iyileştirme önerileri alın.</p>
            <div id="file-drop-zone" class="file-drop-zone ${state.soilAnalysisFile ? 'has-file' : ''}">
                <input type="file" id="soil-file-input" hidden accept=".pdf,.txt,.jpg,.jpeg,.png">
                ${filePreview}
            </div>
            <button class="btn btn-secondary" id="soil-analyze-btn" style="width: 100%;" ${!state.soilAnalysisFile ? 'disabled' : ''}>
                Raporu Yorumla
            </button>
        </div>
    `;
}

function renderSoilAnalysisResult() {
    if(!state.soilAnalysisResult) return '';
    return `
        <div class="card soil-analysis-card">
            <div class="card-header">
                <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    Toprak Analiz Sonucu
                </h3>
            </div>
             <p class="soil-analysis-result-text">${state.soilAnalysisResult}</p>
        </div>
    `;
}

/**
 * Renders the detailed results section including charts and tables.
 */
function renderDetailedChartsSection() {
  const lastUpdateString = state.lastUpdateTime
    ? `${state.lastUpdateTime.toLocaleDateString('tr-TR')} ${state.lastUpdateTime.toLocaleTimeString('tr-TR')}`
    : 'N/A';
  const updateTypeString = state.lastUpdateType === 'auto' ? '(Otomatik)' : state.lastUpdateType === 'manual' ? '(Manuel)' : '';

  return `
    <div class="card">
        <div class="card-header">
            <h3>Detaylı Sonuçlar</h3>
            <div class="update-status-container">
                 ${state.isAutoRefreshing ? '<div class="button-loader-small"></div>' : ''}
                 <span>Son Güncelleme: ${lastUpdateString} ${updateTypeString}</span>
            </div>
        </div>
        <div class="results-actions">
             <div class="form-group">
                <label>Grafik Tarih Aralığı:</label>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="date" class="form-control" id="chart-start-date" value="${state.chartStartDate}">
                    <input type="date" class="form-control" id="chart-end-date" value="${state.chartEndDate}">
                 </div>
             </div>
        </div>
        <div class="results-grid" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="chart-card" id="monthly-chart-container"></div>
            <div class="chart-card" id="yearly-chart-container"></div>
            <div class="chart-card" id="daily-chart-container"></div>
            <div class="chart-card" id="map-container"></div>
            <div class="temp-table-container">
                <table class="temp-table">
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>Min Sıcaklık (°C)</th>
                            <th>Max Sıcaklık (°C)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(state.dailyTemperatures || [])
                            .filter(d => d.date >= state.chartStartDate && d.date <= state.chartEndDate)
                            .map(d => `
                                <tr>
                                    <td data-label="Tarih">${new Date(d.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                                    <td data-label="Min Sıcaklık (°C)">${d.min}</td>
                                    <td data-label="Max Sıcaklık (°C)">${d.max}</td>
                                </tr>
                            `).reverse().join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  `;
}

function renderCharts() {
    renderMonthlyDistributionChart();
    renderDailyTemperatureChart();
    renderYearlyComparisonChart();
    renderMap();
}

function renderMonthlyDistributionChart() {
    const container = document.getElementById('monthly-chart-container');
    if (!container || !state.monthlyChillingHours) {
        if(container) container.innerHTML = '';
        return;
    };

    if (charts.monthly) charts.monthly.destroy();

    container.innerHTML = `
        <div class="chart-header">
             <h4>Aylık Soğuklama Dağılımı</h4>
             <div class="chart-view-toggle">
                <button class="monthly-chart-toggle ${state.monthlyChartType === 'bar' ? 'active' : ''}" data-type="bar" aria-label="Çubuk Grafik">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                </button>
                <button class="monthly-chart-toggle ${state.monthlyChartType === 'pie' ? 'active' : ''}" data-type="pie" aria-label="Pasta Grafik">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                </button>
            </div>
        </div>
        <div class="bar-chart-card">
            <canvas id="monthlyChart"></canvas>
        </div>
    `;

    const ctx = (document.getElementById('monthlyChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    const labels = Object.keys(state.monthlyChillingHours);
    const data = Object.values(state.monthlyChillingHours);

    charts.monthly = new Chart(ctx, {
        type: state.monthlyChartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Soğuklama Saati',
                data: data,
                backgroundColor: state.monthlyChartType === 'bar'
                    ? 'rgba(0, 201, 255, 0.6)'
                    : ['#00c9ff', '#00f2a9', '#ffc107', '#ff5252', '#2196f3', '#4caf50', '#9c27b0'],
                borderColor: state.monthlyChartType === 'bar' ? '#00c9ff' : '#1e1e1e',
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: state.monthlyChartType === 'pie', labels: { color: '#e0e0e0' } } }, scales: state.monthlyChartType === 'bar' ? { y: { beginAtZero: true, ticks: { color: '#aaa' }, grid: { color: '#333' } }, x: { ticks: { color: '#aaa' }, grid: { display: false } } } : {} }
    });
}

function renderDailyTemperatureChart() {
    const container = document.getElementById('daily-chart-container');
    if (!container || !state.dailyTemperatures) {
        if(container) container.innerHTML = '';
        return;
    };

    if (charts.daily) charts.daily.destroy();

    container.innerHTML = `
        <div class="chart-header">
             <h4>Günlük Sıcaklık Değişimi</h4>
             <div class="chart-view-toggle">
                <button class="daily-chart-toggle ${state.dailyChartType === 'line' ? 'active' : ''}" data-type="line" aria-label="Çizgi Grafik">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </button>
                <button class="daily-chart-toggle ${state.dailyChartType === 'bar' ? 'active' : ''}" data-type="bar" aria-label="Çubuk Grafik">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                </button>
            </div>
        </div>
        <div class="line-chart-card">
            <canvas id="dailyTempChart"></canvas>
        </div>
    `;

    const ctx = (document.getElementById('dailyTempChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    const filteredData = state.dailyTemperatures.filter(d => d.date >= state.chartStartDate && d.date <= state.chartEndDate);
    const labels = filteredData.map(d => new Date(d.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }));

    charts.daily = new Chart(ctx, {
        type: state.dailyChartType,
        data: {
            labels: labels,
            datasets: [
                { label: 'Maksimum Sıcaklık', data: filteredData.map(d => d.max), borderColor: '#ff5252', backgroundColor: 'rgba(255, 82, 82, 0.6)', tension: 0.3 },
                { label: 'Minimum Sıcaklık', data: filteredData.map(d => d.min), borderColor: '#2196f3', backgroundColor: 'rgba(33, 150, 243, 0.6)', tension: 0.3 }
            ],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: '#e0e0e0' } } }, scales: { y: { beginAtZero: false, ticks: { color: '#aaa', callback: (value: any) => `${value}°C` }, grid: { color: '#333' } }, x: { ticks: { color: '#aaa' }, grid: { display: false } } } }
    });
}

function renderYearlyComparisonChart() {
    const container = document.getElementById('yearly-chart-container');
    if (!container || !state.yearlyComparisonData) {
        if(container) container.innerHTML = '';
        return;
    };
    
    if (charts.yearly) charts.yearly.destroy();

    container.innerHTML = `
       <div class="chart-header">
             <h4>Yıllık Soğuklama Karşılaştırması</h4>
             <div class="chart-view-toggle">
                <button class="yearly-chart-toggle ${state.yearlyChartType === 'bar' ? 'active' : ''}" data-type="bar" aria-label="Çubuk Grafik">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                </button>
                <button class="yearly-chart-toggle ${state.yearlyChartType === 'line' ? 'active' : ''}" data-type="line" aria-label="Çizgi Grafik">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </button>
            </div>
        </div>
        <p class="chart-description">Seçili tarih aralığı için son 4 yılın toplam soğuklama saatleri.</p>
        <div class="bar-chart-card">
            <canvas id="yearlyChart"></canvas>
        </div>
    `;

    const ctx = (document.getElementById('yearlyChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    charts.yearly = new Chart(ctx, {
        type: state.yearlyChartType,
        data: {
            labels: Object.keys(state.yearlyComparisonData),
            datasets: [{
                label: 'Toplam Soğuklama (saat)',
                data: Object.values(state.yearlyComparisonData),
                backgroundColor: 'rgba(0, 242, 169, 0.6)',
                borderColor: '#00f2a9',
                tension: 0.3,
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#aaa' }, grid: { color: '#333' } }, x: { ticks: { color: '#aaa' }, grid: { display: false } } } }
    });
}

function renderMap() {
    const container = document.getElementById('map-container');
    if (!container || !state.districtAverageTemperatures) {
         if(container) container.innerHTML = '';
        return;
    };

    if (state.isMapLoading) {
        container.innerHTML = `<div class="skeleton" style="height: 200px"></div>`;
        return;
    }

    const temps = Object.values(state.districtAverageTemperatures).filter(t => t !== null) as number[];
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const getColor = (temp: number | null) => {
        if (temp === null) return '#333';
        const ratio = (temp - minTemp) / (maxTemp - minTemp || 1);
        return `hsl(${240 * (1 - ratio)}, 90%, 60%)`;
    };

    container.innerHTML = `
        <h4>İlçe Sıcaklık Karşılaştırması</h4>
        <p class="chart-description">Seçili ildeki ilçelerin ortalama sıcaklıkları.</p>
        <div class="map-grid">
            ${Object.entries(state.districtAverageTemperatures)
                .map(([district, temp]) => `
                    <div class="map-district-item" style="background-color: ${getColor(temp)}">
                        <div>${district}</div>
                        <div>${temp !== null ? `${temp.toFixed(1)}°C` : 'N/A'}</div>
                    </div>
                `).join('')}
        </div>
        <div class="map-legend">
            <span>Soğuk</span>
            <div class="map-legend-gradient"></div>
            <span>Sıcak</span>
        </div>
    `;
}

function renderNotebook() {
    const filteredNotes = state.isNotebookFiltered
        ? state.notes.filter(note => note.province === state.selectedProvince && note.district === state.selectedDistrict)
        : state.notes;

    const notesListHtml = filteredNotes.length > 0 ?
        filteredNotes.sort((a, b) => b.timestamp - a.timestamp).map(note => `
            <div class="note-item">
                ${note.isEditing ? `
                    <textarea class="form-control note-edit-textarea" data-note-id="${note.id}">${note.content}</textarea>
                    <button class="btn btn-secondary note-action-btn save-btn" data-note-id="${note.id}">Kaydet</button>
                ` : `
                    <div class="note-header">
                        <div class="note-metadata">
                            <span><strong>${note.province} / ${note.district}</strong></span>
                            <span>${new Date(note.timestamp).toLocaleString('tr-TR')}</span>
                        </div>
                        <div class="note-actions">
                            <button class="btn btn-icon edit-btn" data-note-id="${note.id}">✏️</button>
                            <button class="btn btn-icon delete-btn" data-note-id="${note.id}">🗑️</button>
                        </div>
                    </div>
                    <p class="note-content">${note.content}</p>
                `}
            </div>
        `).join('') :
        `<div class="placeholder" style="min-height: 100px;"><p>Henüz not eklenmemiş.</p></div>`;

    return `
        <div class="form-group" style="border-top: 1px solid var(--border-color); padding-top: 1.5rem; margin-top: 1.5rem;">
            <h4>Not Defteri</h4>
            <textarea id="new-note-content" class="form-control" placeholder="Analiz sonuçlarıyla ilgili notunuzu buraya yazın...">${state.newNoteContent}</textarea>
            <button id="add-note-btn" class="btn btn-secondary" style="align-self: flex-end;">Not Ekle</button>
            <div class="note-list-header" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <h5>Kaydedilen Notlar</h5>
                <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                    <span>Filtrele:</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="filter-notes-toggle" ${state.isNotebookFiltered ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            <div class="note-list">
                ${notesListHtml}
            </div>
        </div>
    `;
}

function renderFrostWarningModal() {
    if (!state.isFrostWarningModalVisible || !state.frostForecastData) return '';

    const warnings = state.frostForecastData.time
        .map((t, i) => ({ time: new Date(t), temp: state.frostForecastData!.temperature[i] }))
        .filter(item => item.temp <= state.frostWarningThreshold);

    return `
        <div class="modal-backdrop active" id="frost-warning-modal-backdrop">
            <div class="modal-container">
                <div class="modal-header">
                    <h2>Don Riski Uyarısı!</h2>
                    <button class="modal-close-btn" id="modal-close-btn">&times;</button>
                </div>
                <div class="modal-content">
                    <p><strong>${state.selectedProvince} / ${state.selectedDistrict}</strong> için sıcaklığın <strong>${state.frostWarningThreshold}°C</strong> eşiğinin altına düşmesi bekleniyor.</p>
                    <ul>
                        ${warnings.map(w => `
                            <li>
                                <span>${w.time.toLocaleString('tr-TR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                <strong>${w.temp.toFixed(1)}°C</strong>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}


// --- EVENT HANDLERS & LOGIC ---
function addEventListeners() {
    // This function is now mostly for elements that persist across renders
    // Most event listeners are added during render to avoid issues with element recreation.
}

// Delegated event listener for the whole document
document.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    if (target.id === 'province-select') {
        state.selectedProvince = (target as HTMLSelectElement).value;
        state.selectedDistrict = Object.keys(LOCATIONS[state.selectedProvince])[0];
        updateUI();
    } else if (target.id === 'district-select') {
        state.selectedDistrict = (target as HTMLSelectElement).value;
    } else if (target.id === 'variety-select') {
        state.selectedVariety = (target as HTMLSelectElement).value;
        updateUI();
        checkThresholdAlert();
    } else if (target.id === 'chilling-threshold') {
        state.chillingThreshold = parseFloat((target as HTMLInputElement).value);
    } else if (target.id === 'frost-warning-threshold') {
        state.frostWarningThreshold = parseFloat((target as HTMLInputElement).value);
    } else if (target.id === 'start-date') {
        state.startDate = (target as HTMLInputElement).value;
        state.chartStartDate = state.startDate; // Sync chart date
        renderControlPanelContent(); // Re-render to show validation
    } else if (target.id === 'end-date') {
        state.endDate = (target as HTMLInputElement).value;
        state.chartEndDate = state.endDate; // Sync chart date
        renderControlPanelContent(); // Re-render to show validation
    } else if (target.id === 'chart-start-date') {
        state.chartStartDate = (target as HTMLInputElement).value;
        updateUI();
    } else if (target.id === 'chart-end-date') {
        state.chartEndDate = (target as HTMLInputElement).value;
        updateUI();
    } else if (target.id === 'custom-prompt') {
        state.customPrompt = (target as HTMLTextAreaElement).value;
    } else if (target.id === 'new-note-content') {
        state.newNoteContent = (target as HTMLTextAreaElement).value;
    }
});

document.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    if (target.name === 'data-source') {
        state.dataSource = target.value as 'gemini' | 'open-meteo';
        updateUI();
    } else if (target.name === 'ai-model') {
        state.selectedAiModel = target.value as AiModel;
        updateUI();
    } else if (target.id === 'auto-refresh-toggle') {
        state.isAutoRefreshEnabled = target.checked;
        toggleAutoRefresh();
    } else if (target.id === 'soil-file-input') {
        const file = target.files?.[0];
        if (file) {
            state.soilAnalysisFile = file;
            updateUI();
        }
    } else if (target.id === 'filter-notes-toggle') {
        state.isNotebookFiltered = target.checked;
        renderControlPanelContent(); // Just re-render the notebook part
    }
});


document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (target.closest('#main-analyze-button')) analyzeData();
    if (target.closest('#check-frost-forecast-btn')) checkFrostForecast();
    if (target.closest('#modal-close-btn') || target.id === 'frost-warning-modal-backdrop') {
        state.isFrostWarningModalVisible = false;
        updateUI();
    }
    if (target.matches('.tab-button')) handleTabClick(target.dataset.tab);
    if (target.closest('.monthly-chart-toggle')) handleMonthlyChartTypeChange((target.closest('.monthly-chart-toggle') as HTMLElement).dataset.type as 'bar' | 'pie');
    if (target.closest('.daily-chart-toggle')) handleDailyChartTypeChange((target.closest('.daily-chart-toggle') as HTMLElement).dataset.type as 'line' | 'bar');
    if (target.closest('.yearly-chart-toggle')) handleYearlyChartTypeChange((target.closest('.yearly-chart-toggle') as HTMLElement).dataset.type as 'bar' | 'line');
    if (target.closest('#get-recommendation-btn')) getAiRecommendation();
    if(target.closest('#compare-yearly-btn')) fetchYearlyComparison();
    if(target.closest('#compare-districts-btn')) fetchDistrictTemperaturesForMap();
    if (target.closest('#file-remove-btn')) { state.soilAnalysisFile = null; updateUI(); }
    if (target.closest('#soil-analyze-btn')) handleSoilAnalysis();
    if (target.closest('#add-note-btn')) addNote();
    if (target.matches('.edit-btn')) toggleNoteEdit(parseInt(target.dataset.noteId || '0'), true);
    if (target.matches('.save-btn')) saveNoteEdit(parseInt(target.dataset.noteId || '0'));
    if (target.matches('.delete-btn')) deleteNote(parseInt(target.dataset.noteId || '0'));
});

// File Drop Zone Logic
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    const dropZone = document.getElementById('file-drop-zone');
    if (dropZone) dropZone.classList.add('dragover');
});
document.addEventListener('dragleave', (e) => {
     e.preventDefault();
     const dropZone = document.getElementById('file-drop-zone');
     if (dropZone) dropZone.classList.remove('dragover');
});
document.addEventListener('drop', (e) => {
     e.preventDefault();
     const dropZone = document.getElementById('file-drop-zone');
     if (dropZone) {
        dropZone.classList.remove('dragover');
        if (e.dataTransfer?.files[0]) {
            state.soilAnalysisFile = e.dataTransfer.files[0];
            updateUI();
        }
    }
});


function handleTabClick(tabId: string | undefined) {
    if (!tabId) return;
    state.activeControlTab = tabId as AppState['activeControlTab'];
    renderControlPanelContent();
}

function handleMonthlyChartTypeChange(type: 'bar' | 'pie') { state.monthlyChartType = type; renderMonthlyDistributionChart(); }
function handleDailyChartTypeChange(type: 'line' | 'bar') { state.dailyChartType = type; renderDailyTemperatureChart(); }
function handleYearlyChartTypeChange(type: 'bar' | 'line') { state.yearlyChartType = type; renderYearlyComparisonChart(); }


function toggleAutoRefresh() {
    if (state.isAutoRefreshEnabled && !autoRefreshTimer) {
        autoRefreshTimer = window.setInterval(() => analyzeData(true), AUTO_REFRESH_INTERVAL_MS);
        addNotification('info', 'Otomatik Yenileme Aktif', 'Veriler her 30 dakikada bir güncellenecektir.');
    } else if (!state.isAutoRefreshEnabled && autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
        addNotification('info', 'Otomatik Yenileme Devre Dışı', 'Veriler artık otomatik güncellenmeyecektir.');
    }
}

async function getAiRecommendation() {
    if (state.isRecommendationLoading || state.totalChillingHours === null) return;
    state.isRecommendationLoading = true;
    updateUI();

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const variety = CHERRY_VARIETIES[state.selectedVariety];
        const prompt = `
            Bir tarım uzmanı olarak, aşağıdaki verilere dayanarak bir kiraz yetiştiricisine tavsiyelerde bulunun. Cevabınız kısa, net ve eyleme geçirilebilir olmalı, markdown formatında başlıklar ve listeler kullanarak kolay okunabilir bir şekilde sunulmalıdır.

            **Mevcut Durum:**
            - Konum: ${state.selectedProvince}, ${state.selectedDistrict}
            - Kiraz Çeşidi: ${state.selectedVariety}
            - Gerekli Soğuklama Süresi: ${variety.requiredHours} saat
            - Mevcut Toplam Soğuklama Süresi: ${state.totalChillingHours.toFixed(0)} saat
            - Analiz Tarih Aralığı: ${state.startDate} - ${state.endDate}

            **Kullanıcı Özel Talimatı:**
            ${state.customPrompt || "Yok"}

            **İstenenler:**
            1.  **Durum Değerlendirmesi:** Soğuklama ihtiyacının ne kadarının karşılandığını kısaca özetleyin.
            2.  **Önümüzdeki Dönem İçin Tavsiyeler:** Bu aşamada yapılması gereken tarımsal faaliyetler (örn: budama, gübreleme, sulama, don riski yönetimi vb.) hakkında tavsiyelerde bulunun.
            3.  **Risk Analizi:** Mevcut duruma göre potansiyel riskleri (yetersiz soğuklama, don riski vb.) ve bu risklere karşı alınabilecek önlemleri belirtin.
            `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        
        state.aiRecommendation = response.text;

    } catch (error) {
        console.error("Gemini Öneri Hatası:", error);
        addNotification('warning', 'Öneri Alınamadı', `Yapay zeka önerisi alınırken bir hata oluştu: ${error instanceof Error ? error.message : ''}`);
        state.aiRecommendation = null;
    } finally {
        state.isRecommendationLoading = false;
        updateUI();
    }
}

async function fetchYearlyComparison() {
    if (state.isComparisonLoading) return;
    state.isComparisonLoading = true;
    state.yearlyComparisonData = null;
    updateUI();

    const currentEndDate = new Date(state.endDate);
    const endMonth = String(currentEndDate.getMonth() + 1).padStart(2, '0');
    const endDay = String(currentEndDate.getDate()).padStart(2, '0');
    const years = Array.from({length: 4}, (_, i) => currentEndDate.getFullYear() - i);

    try {
        const { lat, lon } = LOCATIONS[state.selectedProvince][state.selectedDistrict];
        const results: Record<string, number | null> = {};

        for (const year of years) {
            const key = `${year - 1}-${year} Sezonu`;
            try {
                const hourlyData = await fetchWithOpenMeteo(lat, lon, `${year - 1}-10-01`, `${year}-${endMonth}-${endDay}`);
                results[key] = processTemperatureData(hourlyData).totalChillingHours;
            } catch (e) { results[key] = null; }
        }
        state.yearlyComparisonData = results;

    } catch (error) {
        addNotification('warning', 'Yıllık Karşılaştırma Başarısız', error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
    } finally {
        state.isComparisonLoading = false;
        updateUI();
    }
}

async function fetchDistrictTemperaturesForMap() {
    if (state.isMapLoading) return;
    state.isMapLoading = true;
    state.districtAverageTemperatures = null;
    updateUI();

    try {
        const promises = Object.entries(LOCATIONS[state.selectedProvince]).map(async ([name, coords]) => {
            try {
                const data = await fetchWithOpenMeteo(coords.lat, coords.lon, state.startDate, state.endDate);
                if (data.length === 0) return [name, null];
                const avg = data.reduce((sum, item) => sum + item.temperature, 0) / data.length;
                return [name, avg];
            } catch { return [name, null]; }
        });
        state.districtAverageTemperatures = Object.fromEntries(await Promise.all(promises));
    } catch (error) {
        addNotification('warning', 'İlçe Karşılaştırma Başarısız', error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
    } finally {
        state.isMapLoading = false;
        updateUI();
    }
}

async function checkFrostForecast() {
    if (state.isFrostForecastLoading) return;
    state.isFrostForecastLoading = true;
    updateUI();

    try {
        const { lat, lon } = LOCATIONS[state.selectedProvince][state.selectedDistrict];
        const forecast = await fetchFrostForecast(lat, lon);
        if (forecast.temperature.some(t => t <= state.frostWarningThreshold)) {
            state.frostForecastData = forecast;
            state.isFrostWarningModalVisible = true;
        } else {
             addNotification('success', 'Don Riski Yok', `Önümüzdeki 3 gün için ${state.frostWarningThreshold}°C altında sıcaklık beklenmiyor.`);
        }
    } catch (error) {
         addNotification('warning', 'Tahmin Başarısız', error instanceof Error ? error.message : String(error));
    } finally {
        state.isFrostForecastLoading = false;
        updateUI();
    }
}


function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

async function handleSoilAnalysis() {
    if (!state.soilAnalysisFile || state.isSoilAnalysisLoading) return;
    state.isSoilAnalysisLoading = true;
    updateUI();

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const base64Data = await fileToBase64(state.soilAnalysisFile);
        const imagePart = { inlineData: { data: base64Data, mimeType: state.soilAnalysisFile.type } };
        const textPart = { text: `Bir tarım uzmanı olarak, ekteki toprak analiz raporunu yorumla. ${state.selectedVariety} kirazı için gübreleme ve toprak iyileştirme önerileri sun. Önerilerini markdown formatında, anlaşılır başlıklar ve listeler halinde düzenle.` };
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, textPart] },
        });

        state.soilAnalysisResult = response.text;
        addNotification('success', 'Analiz Tamamlandı', 'Toprak raporunuz başarıyla yorumlandı.');
        
    } catch (error) {
        addNotification('warning', 'Analiz Başarısız', `Rapor yorumlanırken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        state.isSoilAnalysisLoading = false;
        updateUI();
    }
}

function loadNotes() {
    const savedNotes = localStorage.getItem('chillingAppNotes');
    if (savedNotes) state.notes = JSON.parse(savedNotes);
}

function saveNotes() {
    localStorage.setItem('chillingAppNotes', JSON.stringify(state.notes));
}

function addNote() {
    if (!state.newNoteContent.trim()) return;
    const newNote: Note = {
        id: Date.now(),
        timestamp: Date.now(),
        province: state.selectedProvince,
        district: state.selectedDistrict,
        startDate: state.startDate,
        endDate: state.endDate,
        content: state.newNoteContent
    };
    state.notes.push(newNote);
    state.newNoteContent = '';
    saveNotes();
    renderControlPanelContent();
}

function toggleNoteEdit(noteId: number, isEditing: boolean) {
    const note = state.notes.find(n => n.id === noteId);
    if (note) {
        note.isEditing = isEditing;
        renderControlPanelContent();
    }
}

function saveNoteEdit(noteId: number) {
    const note = state.notes.find(n => n.id === noteId);
    const textarea = document.querySelector(`.note-edit-textarea[data-note-id='${noteId}']`) as HTMLTextAreaElement;
    if (note && textarea) {
        note.content = textarea.value;
        note.isEditing = false;
        saveNotes();
        renderControlPanelContent();
    }
}

function deleteNote(noteId: number) {
    if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
        state.notes = state.notes.filter(n => n.id !== noteId);
        saveNotes();
        renderControlPanelContent();
    }
}

// --- NOTIFICATIONS ---
function addNotification(type: 'success' | 'warning' | 'info', title: string, message: string) {
  const id = Date.now();
  state.notifications.push({ id, type, title, message });
  renderNotifications();
  setTimeout(() => removeNotification(id), 5000);
}

function removeNotification(id: number) {
  const el = document.getElementById(`notification-${id}`);
  if (el) {
    el.classList.add('fade-out');
    el.addEventListener('animationend', () => {
      state.notifications = state.notifications.filter(n => n.id !== id);
      renderNotifications();
    });
  } else {
     state.notifications = state.notifications.filter(n => n.id !== id);
     renderNotifications();
  }
}

function renderNotifications() {
  const container = document.getElementById('notification-container');
  if (!container) return;
  container.innerHTML = state.notifications.map(n => `
      <div class="notification ${n.type}" id="notification-${n.id}">
        <div class="notification-content">
          <h4>${n.title}</h4><p>${n.message}</p>
        </div>
        <button class="notification-close-btn" data-id="${n.id}">&times;</button>
      </div>
    `).join('');
  container.querySelectorAll('.notification-close-btn').forEach(btn => 
    btn.addEventListener('click', (e) => removeNotification(parseInt((e.currentTarget as HTMLElement).dataset.id!)))
  );
}

function checkThresholdAlert() {
    const required = CHERRY_VARIETIES[state.selectedVariety]?.requiredHours;
    const current = state.totalChillingHours;
    if (required && current !== null && current >= required && !state.isThresholdMetAlertFired) {
        addNotification('success', 'Hedef Tamamlandı!', `${state.selectedVariety} için ${required} saatlik soğuklama süresine ulaşıldı.`);
        state.isThresholdMetAlertFired = true;
    }
}


// --- INITIALIZATION ---
function init() {
    loadNotes();
    render();
    toggleAutoRefresh();
}

init();