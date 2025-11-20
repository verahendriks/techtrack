// --- Imports ---
import { 
  GEOJSON_FILE, 
  API_BASE_URL,
  CACHE_EXPIRY_MS, 
  API_CALL_DELAY_MS, 
  CACHE_KEY, 
  delay 
} from "./config.js";
import { featureToCity, buildApiUrl, computeCityMetrics } from "./dataProcessor.js";

// Haalt de stedenlijst op uit het GeoJSON-bestand
async function prepareCities() {
  try {
    const response = await fetch(GEOJSON_FILE);
    if (!response.ok) throw new Error(`GeoJSON laadfout: ${response.status}`);

    const geojsonData = await response.json();
    return geojsonData.features.map(featureToCity);
  } catch (error) {
    console.error("Fout bij het voorbereiden van steden:", error);
    return [];
  }
}

// Haalt weerdata op en creëert de Top 10 ranking
export async function getSunshineRanking() {
  const now = Date.now();
  let expiredData = null;

  // 1. Controleer cache
  try {
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const { timestamp, data } = JSON.parse(cachedItem);
      
      if (now - timestamp < CACHE_EXPIRY_MS) return data;

      expiredData = data;
    }
  } catch (e) {
    console.error("Fout bij lezen/parsen van cache:", e);
  }

  // 2. Haal nieuwe data op
  try {
    const cities = await prepareCities();
    
    // Als steden laden mislukt, toon oude cache indien beschikbaar
    if (cities.length === 0) {
        if (expiredData) {
            console.log("Kon steden niet laden, toon oude cache.");
            return expiredData;
        }
        return [];
    }

    const fetchCityData = async (city, index) => {
      await delay(index * API_CALL_DELAY_MS); // Rate limiting

      try {
        const apiUrl = buildApiUrl(city, API_BASE_URL);
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API fout ${response.status}`);

        const data = await response.json();

        if (data.daily?.sunshine_duration != null) {
          const { name, averageHours, maxUV } = computeCityMetrics(city, data.daily);
          return {
            name,
            averageHours,
            maxUV,
            rawData: data 
          };        
        }
      } catch (error) {
        console.error(`Fout bij het ophalen voor ${city.name}:`, error);
      }
      return null;
    };

    // Parallelle uitvoering
    const results = await Promise.all(cities.map(fetchCityData));

    // 3. Sorteer en cache resultaat
    const top10 = results
      .filter(Boolean)
      .sort((a, b) => b.averageHours - a.averageHours)
      .slice(0, 10);

    // Alleen opslaan als we daadwerkelijk data hebben
    if (top10.length > 0) {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: now, data: top10 })
      );
      return top10;
    } else {
       throw new Error("Geen resultaten uit API gekomen");
    }

  } catch (e) {
    console.log("Fout in getSunshineRanking:", e);
    
    // Fallback: toon verlopen cache als API faalt
    if (expiredData) {
        console.log("API faalde, maar we tonen verlopen cache data.");
        return expiredData;
    }
    
    // Als er echt geen data is
    return []; 
  }
}