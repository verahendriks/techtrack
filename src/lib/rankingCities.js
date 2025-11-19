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

  // 1. Controleer cache
  try {
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const { timestamp, data } = JSON.parse(cachedItem);
      if (now - timestamp < CACHE_EXPIRY_MS) return data;
      localStorage.removeItem(CACHE_KEY);
    }
  } catch (e) {
    console.error("Fout bij lezen/parsen van cache:", e);
  }

  // 2. Haal nieuwe data op
  try {
    const cities = await prepareCities();
    if (cities.length === 0) return [];

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
            rawData: data // volledige API response toevoegen
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

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: now, data: top10 })
    );

    return top10;
  } catch (e) {
    console.error("Fout in getSunshineRanking:", e);
    return [];
  }
}
