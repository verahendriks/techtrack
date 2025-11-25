// ------------------------------------------------------------------
// Imports
// ------------------------------------------------------------------
import { FORECAST_DAYS, SECONDS_PER_HOUR } from "./config.js";

// ------------------------------------------------------------------
// Functie: GeoJSON Feature omzetten naar stad object
// ------------------------------------------------------------------
// Haalt de belangrijke data uit de GeoJSON structuur en 
// zet dit om naar een object dat makkelijker te gebruiken is
export const featureToCity = ({ properties, geometry }) => {
  const [longitude, latitude] = geometry.coordinates;

  return {
    name: `${properties.city}, ${properties.country}`,
    shortName: properties.city,
    latitude: latitude,
    longitude: longitude,
    timezone: properties.timezone || "UTC" // Gebruik 'UTC' als fallback als de tijdzone ontbreekt in de data
  };
};

// ------------------------------------------------------------------
// Functie: API URL samenstellen
// ------------------------------------------------------------------
// Maakt de specifieke URL voor Open-Meteo, inclusief de benodigde 
// weer-parameters en juiste codering van de tijdzone
export const buildApiUrl = ({ latitude, longitude, timezone }, apiBaseUrl) => {
  const encodedTimezone = encodeURIComponent(timezone);
  
  return `${apiBaseUrl}?latitude=${latitude}&longitude=${longitude}` +
         `&daily=sunshine_duration,temperature_2m_min,temperature_2m_max,uv_index_max,wind_speed_10m_min,wind_speed_10m_max` +
         `&timezone=${encodedTimezone}` +
         `&forecast_days=${FORECAST_DAYS}`;
};

// ------------------------------------------------------------------
// Functie: Weerstatistieken berekenen
// ------------------------------------------------------------------
// Voegt de de data van 7 dagen samen tot één set cijfers
// om de steden onderling te kunnen vergelijken in de ranglijst
export const computeCityMetrics = (city, dailyData) => {
  const {
    sunshine_duration,
    temperature_2m_max,
    uv_index_max
  } = dailyData;

  // Tel alle seconden zon bij elkaar op
  const totalSunshineSeconds = sunshine_duration.reduce(
    (runningTotal, seconds) => runningTotal + seconds, 
    0
  );

  // Bereken het gemiddeld aantal uren zon per dag
  const averageHours = totalSunshineSeconds / FORECAST_DAYS / SECONDS_PER_HOUR;
  
  // Zoek de hoogste waardes voor temperatuur en UV in de reeks
  const maxTemp = Math.max(...temperature_2m_max);
  const maxUV = Math.max(...uv_index_max);

  return {
    name: city.name,
    shortName: city.shortName,
    averageHours: parseFloat(averageHours),
    maxTemp: maxTemp,
    maxUV: maxUV
  };
};

// ------------------------------------------------------------------
// Functie: Voorspelling formatteren
// ------------------------------------------------------------------
// Zet de losse data-arrays van de API om naar een lijst van dag objecten 
// en vangt eventueel ontbrekende data (null) veilig af
export const processDailyForecast = (dailyData) => {
  return dailyData.time.map((dateString, index) => ({
    date: dateString,
    sunSeconds: dailyData.sunshine_duration[index],
    
    // Ternary checks: als data ontbreekt (null), geef null terug, anders de waarde
    minTemp: dailyData.temperature_2m_min ? dailyData.temperature_2m_min[index] : null,
    maxTemp: dailyData.temperature_2m_max ? dailyData.temperature_2m_max[index] : null,
    uvIndex: dailyData.uv_index_max ?  dailyData.uv_index_max[index] : null,
    windSpeed: dailyData.wind_speed_10m_max ? dailyData.wind_speed_10m_max[index] : null
  }));
};