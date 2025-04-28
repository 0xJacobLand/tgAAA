import axios from 'axios';

const TWEETSCOUT_API_KEY = 'c1960c7f-8629-405f-b285-3945825c550e';
const TWEETSCOUT_BASE_URL = 'https://api.tweetscout.io/v2';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Cache keys
const CACHE_KEYS = {
  SCORE: 'tweetscout_score_',
  FOLLOWERS: 'tweetscout_followers_'
};

// Create axios instance with the correct headers
const tweetScoutApi = axios.create({
  baseURL: TWEETSCOUT_BASE_URL,
  headers: {
    'ApiKey': TWEETSCOUT_API_KEY.trim(),
    'Accept': 'application/json'
  }
});

// Cache management functions
function getCachedData(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const { value, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    
    return value;
  } catch (error) {
    console.warn('Error reading from cache:', error);
    return null;
  }
}

function setCachedData(key, value) {
  try {
    const item = {
      value,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.warn('Error writing to cache:', error);
  }
}

// Add request interceptor to log headers
tweetScoutApi.interceptors.request.use(request => {
  console.log('Request URL:', request.url);
  console.log('Request headers:', JSON.stringify(request.headers, null, 2));
  return request;
});

// Helper function to normalize username (no @, no trailing slash)
function normalizeUsername(username) {
  if (!username) return '';
  
  // If it's a URL, extract the last part
  if (username.includes('twitter.com') || username.includes('x.com')) {
    const parts = username.split('/').filter(Boolean);
    let handle = parts[parts.length - 1];
    // Remove any query parameters or hashes
    handle = handle.split('?')[0].split('#')[0];
    return handle;
  }
  
  // Remove @ and any trailing slash, and ensure lowercase
  return username.replace('@', '').replace(/\/$/, '').toLowerCase();
}

// Get Twitter account score with caching
export async function getTwitterAccountScore(username) {
  try {
    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) {
      throw new Error('Invalid username');
    }
    
    // Check cache first
    const cacheKey = CACHE_KEYS.SCORE + normalizedUsername;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('Returning cached Twitter score for:', normalizedUsername);
      return cachedData;
    }
    
    console.log('Fetching score for Twitter username:', normalizedUsername);
    const { data } = await tweetScoutApi.get(`/score/${normalizedUsername}`);
    
    // Cache the response
    setCachedData(cacheKey, data);
    
    console.log('Twitter score response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching Twitter score:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      requestHeaders: error.config?.headers,
      url: error.config?.url
    });
    throw new Error(error.response?.data?.message || error.response?.statusText || 'Failed to fetch Twitter score');
  }
}

// Get Twitter followers stats with caching
export async function getTwitterFollowersStats(username) {
  try {
    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) {
      throw new Error('Invalid username');
    }
    
    // Check cache first
    const cacheKey = CACHE_KEYS.FOLLOWERS + normalizedUsername;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('Returning cached Twitter followers stats for:', normalizedUsername);
      return cachedData;
    }
    
    console.log('Fetching followers stats for Twitter username:', normalizedUsername);
    const { data } = await tweetScoutApi.get('/followers-stats', {
      params: {
        user_handle: normalizedUsername
      }
    });
    
    // Cache the response
    setCachedData(cacheKey, data);
    
    console.log('Twitter followers stats response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching Twitter followers stats:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      requestHeaders: error.config?.headers,
      url: error.config?.url
    });
    throw new Error(error.response?.data?.message || error.response?.statusText || 'Failed to fetch Twitter followers stats');
  }
}

// Cache cleanup function - can be called periodically if needed
export function cleanupExpiredCache() {
  try {
    Object.values(CACHE_KEYS).forEach(prefix => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          getCachedData(key); // This will remove the item if expired
        }
      }
    });
  } catch (error) {
    console.warn('Error cleaning up cache:', error);
  }
} 