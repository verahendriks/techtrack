// Aantal dagen waarvoor de weersvoorspelling wordt opgehaald
export const FORECAST_DAYS = 7;

// Conversieconstante: aantal seconden in één uur
export const SECONDS_PER_HOUR = 3600;

// Pad naar het GeoJSON-bestand met Europese steden
export const GEOJSON_FILE = "/data/europeanCities.geojson";

// Basis-URL van de externe Open-Meteo API
export const API_BASE_URL = "https://api.open-meteo.com/v1/forecast";

// Geldigheidsduur van cache (1 uur in milliseconden)
export const CACHE_EXPIRY_MS = 60 * 60 * 1000;

// Sleutelnaam voor opslag van cache
export const CACHE_KEY = "sunshine_ranking_cache";

// Vertraging tussen opeenvolgende API-aanroepen (in milliseconden)
export const API_CALL_DELAY_MS = 110;

// Asynchrone vertraging
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
