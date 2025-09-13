import { CONFIG } from '../config/api-config.js';

export class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  set(key, value) {
    if (this.cache.size >= CONFIG.cache.maxSize) {
      const oldestKey = [...this.timestamps.entries()]
        .sort((a, b) => a[1] - b[1])[0][0];
      this.cache.delete(oldestKey);
      this.timestamps.delete(oldestKey);
    }
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
  }

  get(key) {
    const timestamp = this.timestamps.get(key);
    if (timestamp && Date.now() - timestamp < CONFIG.cache.ttl) {
      return this.cache.get(key);
    }
    this.cache.delete(key);
    this.timestamps.delete(key);
    return null;
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }
}
