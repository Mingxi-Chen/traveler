// API 配置
export const CONFIG = {
    apis: {
      weather: {
        key: process.env.WEATHER_API_KEY || 'you_key',
        baseUrl: 'https://api.openweathermap.org/data/2.5'
      },
      places: {
        key: process.env.GOOGLE_PLACES_KEY || 'you_key',
        baseUrl: 'https://maps.googleapis.com/maps/api/place'
      },
      translation: {
        key: process.env.DEEPL_API_KEY || 'your_deepl_api_key',
        baseUrl: 'https://api-free.deepl.com/v2'
      },
      flight: {
        key: process.env.AMADEUS_API_KEY || 'your_amadeus_api_key',
        baseUrl: 'https://api.amadeus.com/v2'
      }
    },
    cache: {
      ttl: 3600000, // 1小时缓存
      maxSize: 100
    }
  };
  