
import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
  enableLogging?: boolean;
}

export function useAdvancedCache<T>(options: CacheOptions = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    maxSize = 100,
    enableLogging = false
  } = options;

  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  });

  const log = useCallback((message: string, data?: any) => {
    if (enableLogging) {
      console.log(`[Cache] ${message}`, data);
    }
  }, [enableLogging]);

  const isExpired = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  const evictExpired = useCallback(() => {
    const now = Date.now();
    const toDelete: string[] = [];
    
    cache.current.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => {
      cache.current.delete(key);
      log(`Evicted expired key: ${key}`);
    });
    
    return toDelete.length;
  }, [log]);

  const evictLRU = useCallback(() => {
    if (cache.current.size <= maxSize) return;
    
    // Sort by hits (ascending) and timestamp (ascending) for LRU
    const entries = Array.from(cache.current.entries()).sort((a, b) => {
      if (a[1].hits !== b[1].hits) {
        return a[1].hits - b[1].hits;
      }
      return a[1].timestamp - b[1].timestamp;
    });
    
    const toDelete = entries.slice(0, cache.current.size - maxSize);
    toDelete.forEach(([key]) => {
      cache.current.delete(key);
      log(`Evicted LRU key: ${key}`);
    });
  }, [maxSize, log]);

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    
    if (!entry) {
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      log(`Cache miss: ${key}`);
      return null;
    }
    
    if (isExpired(entry)) {
      cache.current.delete(key);
      setStats(prev => ({ ...prev, misses: prev.misses + 1, size: prev.size - 1 }));
      log(`Cache expired: ${key}`);
      return null;
    }
    
    // Update hit count
    entry.hits += 1;
    setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    log(`Cache hit: ${key}`, { hits: entry.hits });
    
    return entry.data;
  }, [isExpired, log]);

  const set = useCallback((key: string, data: T, customTTL?: number): void => {
    evictExpired();
    evictLRU();
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTTL || ttl,
      hits: 0
    };
    
    const wasNew = !cache.current.has(key);
    cache.current.set(key, entry);
    
    if (wasNew) {
      setStats(prev => ({ ...prev, size: prev.size + 1 }));
    }
    
    log(`Cache set: ${key}`, { size: cache.current.size });
  }, [ttl, evictExpired, evictLRU, log]);

  const remove = useCallback((key: string): boolean => {
    const deleted = cache.current.delete(key);
    if (deleted) {
      setStats(prev => ({ ...prev, size: prev.size - 1 }));
      log(`Cache remove: ${key}`);
    }
    return deleted;
  }, [log]);

  const clear = useCallback(() => {
    const size = cache.current.size;
    cache.current.clear();
    setStats({ hits: 0, misses: 0, size: 0 });
    log(`Cache cleared: ${size} entries removed`);
  }, [log]);

  const getStats = useCallback(() => {
    const hitRate = stats.hits + stats.misses > 0 
      ? (stats.hits / (stats.hits + stats.misses)) * 100 
      : 0;
    
    return {
      ...stats,
      hitRate: parseFloat(hitRate.toFixed(2)),
      memoryUsage: cache.current.size
    };
  }, [stats]);

  // Cleanup expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const evicted = evictExpired();
      if (evicted > 0) {
        setStats(prev => ({ ...prev, size: cache.current.size }));
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [evictExpired]);

  return {
    get,
    set,
    remove,
    clear,
    getStats,
    cache: cache.current
  };
}

// Hook for caching async operations with automatic loading states
export function useCachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
) {
  const { enabled = true, ...cacheOptions } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  const { get, set } = useAdvancedCache<T>(cacheOptions);

  const execute = useCallback(async () => {
    if (!enabled) return;
    
    // Check cache first
    const cachedData = get(key);
    if (cachedData !== null) {
      setData(cachedData);
      return cachedData;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      set(key, result);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, queryFn, enabled, get, set]);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch: execute
  };
}
