// ------------------------------------------------------------------
// Imports
// ------------------------------------------------------------------
import { 
  GEOJSON_FILE, 
  SEARCH_FILE,
  API_BASE_URL,
  CACHE_EXPIRY_MS, 
  API_CALL_DELAY_MS, 
  CACHE_KEY, 
  delay 
} from "./config.js";
import { featureToCity, buildApiUrl, computeCityMetrics, processDailyForecast } from "./dataProcessor.js";

// ------------------------------------------------------------------
// Functie: Steden voorbereiden
// ------------------------------------------------------------------
export async function prepareCities() {
  try {
    const response = await fetch(GEOJSON_FILE);
    if (!response.ok) throw new Error(`Fout bij laden GeoJSON: ${response.status}`);
    const geojsonData = await response.json();
    return geojsonData.features.map(featureToCity);
  } catch (error) {
    console.error("Fout bij het voorbereiden van steden:", error);
    return [];
  }
}

// ------------------------------------------------------------------
// Functie: Zoeklijst laden
// ------------------------------------------------------------------
export async function loadSearchCities() {
  try {
    const response = await fetch(SEARCH_FILE);
    if (!response.ok) throw new Error(`Fout bij laden zoeklijst: ${response.status}`);
    const data = await response.json();
    return data.features.map(featureToCity);
  } catch (error) {
    console.error("Fout bij ophalen zoeklijst:", error);
    return [];
  }
}

// ------------------------------------------------------------------
// Functie: Ranking ophalen
// ------------------------------------------------------------------
export async function getRanking() {
  console.log("Start met ophalen van verse data van de API...");
  const currentTime = Date.now();
  let expiredCacheData = null;

  // 1. Cache check
  try {
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const { timestamp, data } = JSON.parse(cachedItem);
      if (currentTime - timestamp < CACHE_EXPIRY_MS) return data;
      expiredCacheData = data;
    }
  } catch (error) {
    console.error("Fout bij cache:", error);
  }

  // 2. Nieuwe data ophalen
  try {
    const cities = await prepareCities();
    
    if (cities.length === 0) {
        if (expiredCacheData) return expiredCacheData;
        return [];
    }

    const fetchCityData = async (city, index) => {
      await delay(index * API_CALL_DELAY_MS);

      try {
        const apiUrl = buildApiUrl(city, API_BASE_URL);
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API fout ${response.status}`);

        const data = await response.json();

        if (data.daily?.sunshine_duration != null) {
          const metrics = computeCityMetrics(city, data.daily);
          
          const cleanForecast = processDailyForecast(data.daily);
          
          return {
            ...metrics,
            forecast: cleanForecast
          };        
        }
      } catch (error) {
        console.error(`Fout bij ${city.name}:`, error);
      }
      return null;
    };

    const results = await Promise.all(cities.map(fetchCityData));
    const validResults = results.filter((item) => item !== null);
    
    validResults.sort((cityA, cityB) => cityB.averageHours - cityA.averageHours);

    if (validResults.length > 0) {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: currentTime, data: validResults })
      );
      return validResults;
    } else {
       throw new Error("Geen resultaten");
    }

  } catch (error) {
    console.error("Fout in getRanking:", error);
    if (expiredCacheData) return expiredCacheData;
    return []; 
  }
}

// ------------------------------------------------------------------
// Functie: Specifiek stadsweer ophalen
// ------------------------------------------------------------------
export async function fetchSingleCityWeather(city) {
  try {
    const apiUrl = buildApiUrl(city, API_BASE_URL);
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.daily) {
      const metrics = computeCityMetrics(city, data.daily);
      const cleanForecast = processDailyForecast(data.daily);

      return {
        ...metrics,
        forecast: cleanForecast
      };
    }
  } catch (error) {
    console.error("Fout bij ophalen specifiek weer:", error);
  }
  return null;
}