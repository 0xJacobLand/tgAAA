// src/services/searchService.js

// Cache configurations
const fileListCache = {
  data: null,
  timestamp: null,
  maxAge: 300000 // 5 minutes
};

const fileContentsCache = new Map();
const searchResultsCache = new Map();
const SEARCH_CACHE_MAX_SIZE = 100;
const FILE_CACHE_MAX_SIZE = 500;

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Cache cleanup function
function cleanupCache(cache, maxSize) {
  if (cache.size > maxSize) {
    const entriesToDelete = Array.from(cache.keys())
      .slice(0, cache.size - maxSize);
    entriesToDelete.forEach(key => cache.delete(key));
  }
}

// Получение списка файлов с кэшированием
async function getPostFiles() {
  const now = Date.now();
  if (fileListCache.data && fileListCache.timestamp && 
      (now - fileListCache.timestamp < fileListCache.maxAge)) {
    return fileListCache.data;
  }
  
  try {
    const response = await fetch('/api/alltrash-files');
    if (!response.ok) {
      throw new Error('Не удалось получить список файлов');
    }
    
    const data = await response.json();
    fileListCache.data = data;
    fileListCache.timestamp = now;
    
    return data;
  } catch (error) {
    console.error('Ошибка при получении файлов:', error);
    return [];
  }
}

// Чтение файла с кэшированием
async function readPostFile(fileName) {
  if (fileContentsCache.has(fileName)) {
    return fileContentsCache.get(fileName);
  }
  
  try {
    const response = await fetch(`/api/read-post?fileName=${encodeURIComponent(fileName)}`);
    if (!response.ok) {
      throw new Error(`Не удалось прочитать файл ${fileName}`);
    }
    
    const content = await response.text();
    
    if (fileContentsCache.size >= FILE_CACHE_MAX_SIZE) {
      const oldestKey = fileContentsCache.keys().next().value;
      fileContentsCache.delete(oldestKey);
    }
    
    fileContentsCache.set(fileName, content);
    return content;
  } catch (error) {
    console.error(`Ошибка при чтении файла ${fileName}:`, error);
    return null;
  }
}

// Оптимизированная функция поиска
export async function searchPosts(query) {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return [];
  }
  
  query = query.toLowerCase().trim();
  
  // Проверяем кэш результатов поиска
  if (searchResultsCache.has(query)) {
    return searchResultsCache.get(query);
  }
  
  try {
    const files = await getPostFiles();
    if (!Array.isArray(files) || files.length === 0) {
      return [];
    }
    
    const results = [];
    const processedFiles = new Set();
    
    // Обрабатываем файлы небольшими группами
    const BATCH_SIZE = 20;
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, Math.min(i + BATCH_SIZE, files.length));
      
      const batchPromises = batch.map(async (fileName) => {
        if (processedFiles.has(fileName)) {
          return null;
        }
        
        processedFiles.add(fileName);
        const content = await readPostFile(fileName);
        
        if (!content || typeof content !== 'string') {
          return null;
        }
        
        if (content.toLowerCase().includes(query)) {
          const fileNameParts = fileName.split('_');
          const channelName = fileNameParts[0];
          const statsPart = fileName.split('.')[0];
          const statsData = statsPart.split(',');
          
          let messageId, comments = '0', reactions = '0', reposts = '0', views = '0';
          
          if (statsData.length > 1) {
            const lastPart = fileNameParts[fileNameParts.length - 1];
            const idParts = lastPart.split(',');
            messageId = idParts[0];
            [, comments = '0', reactions = '0', reposts = '0', views = '0'] = statsData;
          } else {
            messageId = fileNameParts[fileNameParts.length - 1] || '';
          }
          
          const dateTime = fileNameParts.length > 2 ? `${fileNameParts[1]}_${fileNameParts[2]}` : '';
          
          return {
            id: fileName,
            channelName,
            dateTime,
            content,
            messageId,
            comments,
            reactions,
            reposts,
            views
          };
        }
        
        return null;
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(Boolean);
      results.push(...validResults);
      
      if (results.length >= 100) {
        break;
      }
    }
    
    // Очищаем старые результаты если кэш переполнен
    if (searchResultsCache.size >= SEARCH_CACHE_MAX_SIZE) {
      const oldestKey = searchResultsCache.keys().next().value;
      searchResultsCache.delete(oldestKey);
    }
    
    searchResultsCache.set(query, results);
    return results;
    
  } catch (error) {
    console.error('Ошибка при поиске:', error);
    return [];
  }
}

// Функция для предварительной загрузки файлов
export async function preloadAllFiles() {
  try {
    const files = await getPostFiles();
    if (!Array.isArray(files) || files.length === 0) {
      return;
    }
    
    const totalFiles = files.length;
    let loadedFiles = 0;
    
    const batchSize = 20;
    for (let i = 0; i < totalFiles; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (fileName) => {
        await readPostFile(fileName);
        loadedFiles++;
        if (loadedFiles % 50 === 0 || loadedFiles === totalFiles) {
          console.log(`Загружено ${loadedFiles} из ${totalFiles} файлов`);
        }
      }));
    }
  } catch (error) {
    console.error('Ошибка при предварительной загрузке файлов:', error);
  }
}