export interface WeatherData {
  city: string
  country: string
  temperature: number
  minTemp: number
  maxTemp: number
  description: string
  humidity: number
  windSpeed: number
  weatherCode: number
}

export interface ForecastDay {
  date: string
  day: string
  maxTemp: number
  minTemp: number
  weatherCode: number
}

// Extended city coordinates for Open-Meteo API
const cityCoordinates: { [key: string]: { lat: number; lon: number; country: string } } = {
  Mexicali: { lat: 32.6519, lon: -115.4683, country: "MX" },
  Tijuana: { lat: 32.5027, lon: -117.0039, country: "MX" },
  Madrid: { lat: 40.4168, lon: -3.7038, country: "ES" },
  Beijing: { lat: 39.9042, lon: 116.4074, country: "CN" },
  "Buenos Aires": { lat: -34.6118, lon: -58.396, country: "AR" },
  Tokyo: { lat: 35.6762, lon: 139.6503, country: "JP" },
  "New York": { lat: 40.7128, lon: -74.006, country: "US" },
  London: { lat: 51.5074, lon: -0.1278, country: "GB" },
  Paris: { lat: 48.8566, lon: 2.3522, country: "FR" },
  Sydney: { lat: -33.8688, lon: 151.2093, country: "AU" },
  "Los Angeles": { lat: 34.0522, lon: -118.2437, country: "US" },
  Mumbai: { lat: 19.076, lon: 72.8777, country: "IN" },
  "São Paulo": { lat: -23.5505, lon: -46.6333, country: "BR" },
  Cairo: { lat: 30.0444, lon: 31.2357, country: "EG" },
  Moscow: { lat: 55.7558, lon: 37.6176, country: "RU" },
  Dubai: { lat: 25.2048, lon: 55.2708, country: "AE" },
  Singapore: { lat: 1.3521, lon: 103.8198, country: "SG" },
  "Mexico City": { lat: 19.4326, lon: -99.1332, country: "MX" },
  Barcelona: { lat: 41.3851, lon: 2.1734, country: "ES" },
  Rome: { lat: 41.9028, lon: 12.4964, country: "IT" },
}

// Weather code descriptions
const weatherDescriptions: { [key: number]: string } = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  const coords = cityCoordinates[city]
  if (!coords) {
    throw new Error(`City ${city} not found`)
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`,
  )

  if (!response.ok) {
    throw new Error("Failed to fetch weather data")
  }

  const data = await response.json()

  return {
    city,
    country: coords.country,
    temperature: Math.round(data.current.temperature_2m),
    minTemp: Math.round(data.daily.temperature_2m_min[0]),
    maxTemp: Math.round(data.daily.temperature_2m_max[0]),
    description: weatherDescriptions[data.current.weather_code] || "Unknown",
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
  }
}

export async function getWeatherForecast(city: string): Promise<ForecastDay[]> {
  const coords = cityCoordinates[city]
  if (!coords) {
    throw new Error(`City ${city} not found`)
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`,
  )

  if (!response.ok) {
    throw new Error("Failed to fetch forecast data")
  }

  const data = await response.json()

  const dayNames = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"]

  return data.daily.time.map((dateString: string, index: number) => {
    const date = new Date(dateString)

    return {
      date: dateString,
      day: index === 0 ? "HOY" : dayNames[date.getDay()],
      maxTemp: Math.round(data.daily.temperature_2m_max[index]),
      minTemp: Math.round(data.daily.temperature_2m_min[index]),
      weatherCode: data.daily.weather_code[index],
    }
  })
}

export async function getMultipleCitiesWeather(cities: string[]): Promise<WeatherData[]> {
  const promises = cities.map((city) => getCurrentWeather(city))
  return Promise.all(promises)
}

export function getWeatherCondition(weatherCode: number): string {
  if (weatherCode === 0 || weatherCode === 1) return "clear"
  if (weatherCode === 2 || weatherCode === 3) return "cloudy"
  if (weatherCode >= 51 && weatherCode <= 67) return "rain"
  if (weatherCode >= 71 && weatherCode <= 86) return "snow"
  if (weatherCode >= 95) return "thunderstorm"
  return "clear"
}

export function getAvailableCities(): string[] {
  return Object.keys(cityCoordinates)
}
