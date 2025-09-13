import axios from 'axios';
import { CONFIG } from '../config/api-config.js';
import { CacheManager } from './cache-manager.js';




export class TravelAPIService {
    constructor() {
      this.cache = new CacheManager();
    }
  
    // 获取天气信息
    async getWeather(city) {
      const cacheKey = `weather_${city}`;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
  
      try {
        const response = await axios.get(`${CONFIG.apis.weather.baseUrl}/weather`, {
          params: {
            q: city,
            appid: CONFIG.apis.weather.key,
            units: 'metric',
            lang: 'zh_cn'
          }
        });
  
        const weatherData = {
          temperature: response.data.main.temp,
          feels_like: response.data.main.feels_like,
          humidity: response.data.main.humidity,
          description: response.data.weather[0].description,
          wind_speed: response.data.wind.speed,
          city: response.data.name,
          country: response.data.sys.country
        };
  
        this.cache.set(cacheKey, weatherData);
        return weatherData;
      } catch (error) {
        console.error('Weather API error:', error);
        return { error: '无法获取天气信息', details: error.message };
      }
    }
  
    // 搜索景点和餐厅
    async searchPlaces(location, type = 'tourist_attraction') {
      const cacheKey = `places_${location}_${type}`;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
  
      try {
        // 模拟API调用（实际使用时替换为真实的Google Places API）
        const mockPlaces = {
          tourist_attraction: [
            { name: '故宫博物院', rating: 4.8, type: '历史景点', price_level: 2 },
            { name: '长城', rating: 4.9, type: '世界遗产', price_level: 2 },
            { name: '颐和园', rating: 4.7, type: '皇家园林', price_level: 2 }
          ],
          restaurant: [
            { name: '全聚德烤鸭店', rating: 4.5, cuisine: '北京菜', price_level: 3 },
            { name: '东来顺', rating: 4.6, cuisine: '火锅', price_level: 3 },
            { name: '便宜坊', rating: 4.4, cuisine: '烤鸭', price_level: 2 }
          ],
          hotel: [
            { name: '北京饭店', rating: 4.7, stars: 5, price_range: '￥800-1500' },
            { name: '和平饭店', rating: 4.6, stars: 4, price_range: '￥500-800' },
            { name: '如家酒店', rating: 4.2, stars: 3, price_range: '￥200-400' }
          ]
        };
  
        const places = mockPlaces[type] || [];
        this.cache.set(cacheKey, places);
        return places;
      } catch (error) {
        console.error('Places API error:', error);
        return { error: '无法获取地点信息', details: error.message };
      }
    }
  
    // 翻译服务
    async translate(text, targetLang = 'EN') {
      const cacheKey = `translate_${text}_${targetLang}`;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
  
      try {
        // 模拟翻译API
        const translations = {
          '你好': 'Hello',
          '谢谢': 'Thank you',
          '再见': 'Goodbye',
          '多少钱': 'How much',
          '洗手间在哪里': 'Where is the restroom'
        };
  
        const result = translations[text] || `[Translation of: ${text}]`;
        this.cache.set(cacheKey, result);
        return result;
      } catch (error) {
        console.error('Translation API error:', error);
        return { error: '翻译失败', details: error.message };
      }
    }
  
    // 搜索航班信息
    async searchFlights(origin, destination, date) {
      const cacheKey = `flights_${origin}_${destination}_${date}`;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
  
      try {
        // 模拟航班搜索
        const mockFlights = [
          {
            airline: '中国国航',
            flight_number: 'CA1234',
            departure: '08:00',
            arrival: '10:30',
            price: 1250,
            duration: '2h 30m'
          },
          {
            airline: '东方航空',
            flight_number: 'MU5678',
            departure: '14:00',
            arrival: '16:45',
            price: 980,
            duration: '2h 45m'
          },
          {
            airline: '南方航空',
            flight_number: 'CZ9012',
            departure: '19:00',
            arrival: '21:20',
            price: 1100,
            duration: '2h 20m'
          }
        ];
  
        this.cache.set(cacheKey, mockFlights);
        return mockFlights;
      } catch (error) {
        console.error('Flight API error:', error);
        return { error: '无法获取航班信息', details: error.message };
      }
    }
  }
  