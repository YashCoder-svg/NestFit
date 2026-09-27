import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/nestfit',
  OSRM_BASE_URL: process.env.OSRM_BASE_URL || 'https://router.project-osrm.org',
  OVERPASS_API_URL: process.env.OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
