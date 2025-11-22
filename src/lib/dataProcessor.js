// --- Imports ---
import { FORECAST_DAYS, SECONDS_PER_HOUR } from "./config.js";

// Converteert een GeoJSON 'feature' naar een compact stadsobject
export const featureToCity = ({ properties, geometry }) => {
  const [lon, lat] = geometry.coordinates;

  return {
    name: `${properties.city}, ${properties.country}`,
    shortName: properties.city,
    lat,
    lon,
    timezone: properties.timezone
  };
};

// Bouwt de volledige API URL voor een stad
export const buildApiUrl = ({ lat, lon, timezone }, API_BASE_URL) =>
  `${API_BASE_URL}?latitude=${lat}&longitude=${lon}` +
  `&daily=sunshine_duration,temperature_2m_max` +
  `&timezone=${encodeURIComponent(timezone)}` +
  `&forecast_days=${FORECAST_DAYS}`;

// Berekent statistieken voor een stad
export const computeCityMetrics = (city, dailyData) => {
  const {
    sunshine_duration,
    temperature_2m_max,
    uv_index_max
  } = dailyData;

  // 1. Zonuren
  const totalSunshineSeconds = sunshine_duration.reduce((sum, v) => sum + v, 0);
  const averageHours = totalSunshineSeconds / FORECAST_DAYS / SECONDS_PER_HOUR;

  // 2. Max Temperatuur
  const maxTemp = Math.max(...temperature_2m_max);

  // 3. Max UV
  const maxUV = Math.max(...uv_index_max);

  return {
    name: city.name,
    shortName: city.shortName,
    averageHours: parseFloat(averageHours.toFixed(2)),
    maxTemp,
    maxUV
  };
};
