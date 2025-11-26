// ------------------------------------------------------------------
// API Instellingen
// ------------------------------------------------------------------
// De basis-URL van de Open-Meteo API
export const API_BASE_URL = "https://api.open-meteo.com/v1/forecast";

// Aantal dagen waarvoor de weersvoorspelling wordt opgehaald
export const FORECAST_DAYS = 7;

// ------------------------------------------------------------------
// GEOJSON bestanden
// ------------------------------------------------------------------
// Locatie van het GeoJSON-file voor de top 10 steden
export const GEOJSON_FILE = "/data/europeanCities.geojson";

// Locatie van het GeoJSON-file voor alle steden in de zoekbalk
export const SEARCH_FILE = "/data/searchCities.geojson";

// ------------------------------------------------------------------
// Caching instellingen
// ------------------------------------------------------------------
// De naam waaronder de data wordt opgeslagen in de browser (LocalStorage)
export const CACHE_KEY = "ranking_cache";

// Hoe lang mag de data oud zijn voordat er nieuwe wordt opgehaald (6 uur)
export const CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000;

// ------------------------------------------------------------------
// Rate Limiting (API bescherming)
// ------------------------------------------------------------------
// Vertraging in milliseconden tussen API-verzoeken om blokkades te voorkomen
export const API_CALL_DELAY_MS = 110;

// Geeft een Promise terug die pas resolveert na 'ms' milliseconden.
// Wordt gebruikt om het script even te pauzeren (async/await).
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------------------------------------------
// Tijd Constante
// ------------------------------------------------------------------
// Conversieconstante: aantal seconden in één uur
export const SECONDS_PER_HOUR = 3600;