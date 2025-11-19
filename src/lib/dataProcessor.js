// --- Imports ---
import { FORECAST_DAYS, SECONDS_PER_HOUR } from "./config.js";

// Converteert een GeoJSON 'feature' naar een compact stadsobject
export const featureToCity = ({ properties, geometry }) => {
  const [lon, lat] = geometry.coordinates;

  return {
    name: `${properties.city}, ${properties.country}`,
    lat,
    lon,
    timezone: properties.timezone,
  };
};

// Bouwt de volledige API URL voor een stad
export const buildApiUrl = ({ lat, lon, timezone }, API_BASE_URL) =>
  `${API_BASE_URL}?latitude=${lat}&longitude=${lon}` +
  `&daily=sunshine_duration,uv_index_max` +
  `&timezone=${encodeURIComponent(timezone)}` +
  `&forecast_days=${FORECAST_DAYS}`;

// Berekent gemiddelde zonuren en maximale UV-index voor een stad
export const computeCityMetrics = (city, { sunshine_duration, uv_index_max }) => {
  // Totale zonneschijn in seconden
  const totalSunshineSeconds = sunshine_duration.reduce((sum, v) => sum + v, 0);

  // Gemiddelde zonuren per dag
  const averageHours = totalSunshineSeconds / FORECAST_DAYS / SECONDS_PER_HOUR;

  // Hoogste UV-waarde
  const maxUV = Math.max(...uv_index_max);

  return {
    name: city.name,
    averageHours: parseFloat(averageHours.toFixed(2)), // afgerond op 2 decimalen
    maxUV,
  };
};
