// src/services/searchService.js

// Кэши для ускорения поиска
const fileListCache = {
  data: null,
  timestamp: null,
  maxAge: 60000 // 1 минута
};

const fileContentsCache = new Map();
const searchResultsCache = new Map();

// Получение списка файлов с кэшированием
async function getPostFiles() {
  // Проверяем кэш
  const now = Date.now();
  if (fileListCache.data && fileListCache.timestamp && 
      (now - fileListCache.timestamp < fileListCache.maxAge)) {
    console.log('Возвращаем список файлов из кэша');
    return fileListCache.data;
  }
  
  try {
    console.log('Запрашиваем список файлов с сервера');
    const response = await fetch('/api/alltrash-files');
    if (!response.ok) {
      throw new Error('Не удалось получить список файлов');
    }
    
    const data = await response.json();
    console.log(`Получено ${data.length} файлов`);
    
    // Сохраняем в кэш
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
  // Проверяем кэш
  if (fileContentsCache.has(fileName)) {
    return fileContentsCache.get(fileName);
  }
  
  try {
    const response = await fetch(`/api/read-post?fileName=${encodeURIComponent(fileName)}`);
    if (!response.ok) {
      throw new Error(`Не удалось прочитать файл ${fileName}`);
    }
    
    const content = await response.text();
    
    // Сохраняем в кэш
    fileContentsCache.set(fileName, content);
    
    return content;
  } catch (error) {
    console.error(`Ошибка при чтении файла ${fileName}:`, error);
    return null;
  }
}

// Оптимизированная функция поиска с кэшированием результатов
export async function searchPosts(query) {
  console.log('Начинаем поиск по запросу:', query);
  
  if (!query || query.trim() === '') {
    console.log('Пустой запрос, возвращаем пустой массив результатов');
    return [];
  }
  
  query = query.toLowerCase().trim();
  
  // Проверяем кэш результатов поиска
  const cacheKey = query;
  if (searchResultsCache.has(cacheKey)) {
    console.log('Возвращаем результаты из кэша');
    return searchResultsCache.get(cacheKey);
  }
  
  const results = [];
  
  try {
    // Получаем список файлов
    const files = await getPostFiles();
    
    if (files.length === 0) {
      console.log('Список файлов пуст, возвращаем пустой результат');
      return [];
    }
    
    console.log(`Выполняем поиск по ${files.length} файлам`);
    
    // Чтобы ускорить поиск, запускаем чтение файлов параллельно
    const fileReadPromises = files.map(async (fileName) => {
      const content = await readPostFile(fileName);
      
      if (content && content.toLowerCase().includes(query)) {
        return { fileName, content };
      }
      
      return null;
    });
    
    // Ждем завершения всех запросов
    const fileResults = await Promise.all(fileReadPromises);
    
    // Обрабатываем результаты
    let count = 0;
    for (const result of fileResults) {
      if (result) {
        count++;
        // Парсим данные файла
        const { fileName, content } = result;
        
        // Извлекаем статистику из имени файла (формат: kol_date_time_id,comments,reactions,reposts,views.txt)
        const fileNameParts = fileName.split('_');
        const channelName = fileNameParts[0]; // название канала
        
        // Получаем статистику из имени файла
        const statsPart = fileName.split('.')[0]; // Отсекаем расширение .txt
        const statsData = statsPart.split(',');
        
        // Получаем идентификатор сообщения и статистику
        let messageId, comments, reactions, reposts, views;
        
        if (statsData.length > 1) {
          // Если имя файла содержит статистику через запятую
          // Ожидаемый формат: kol_date_time_id,comments,reactions,reposts,views.txt
          const lastPart = fileNameParts[fileNameParts.length - 1];
          const idParts = lastPart.split(',');
          messageId = idParts[0];
          comments = statsData[1] || '0';
          reactions = statsData[2] || '0';
          reposts = statsData[3] || '0';
          views = statsData[4] || '0';
        } else {
          // Если статистики нет в имени файла
          messageId = fileNameParts[fileNameParts.length - 1] || '';
          comments = '0';
          reactions = '0';
          reposts = '0';
          views = '0';
        }
        
        // Парсим дату и время
        const dateTime = fileNameParts.length > 2 ? `${fileNameParts[1]}_${fileNameParts[2]}` : '';
        
        // Сообщение - это содержимое файла
        const messageText = content;
        
        console.log('Статистика для файла:', fileName);
        console.log('messageId:', messageId, 'comments:', comments, 'reactions:', reactions, 'reposts:', reposts, 'views:', views);
        
        // Добавляем результат
        results.push({
          id: fileName,
          channelName,
          dateTime: formatDateTime(dateTime),
          content: messageText,
          messageId,
          comments,
          reactions,
          reposts,
          views
        });
      }
    }
    
    console.log(`Найдено ${count} совпадений`);
    
    // Сохраняем результаты в кэш
    searchResultsCache.set(cacheKey, results);
    
    return results;
  } catch (error) {
    console.error('Ошибка при поиске:', error);
    return [];
  }
}

// Вспомогательная функция для форматирования даты/времени
function formatDateTime(dateTimeStr) {
  // Формат: YYYYMMDD_HHMMSS
  if (dateTimeStr.length >= 15) {
    const year = dateTimeStr.substring(0, 4);
    const month = dateTimeStr.substring(4, 6);
    const day = dateTimeStr.substring(6, 8);
    const hours = dateTimeStr.substring(9, 11);
    const minutes = dateTimeStr.substring(11, 13);
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }
  return dateTimeStr;
}

// Функция для предварительной загрузки всех файлов
export async function preloadAllFiles() {
  console.log('Начинаем предварительную загрузку файлов...');
  
  try {
    const files = await getPostFiles();
    const totalFiles = files.length;
    let loadedFiles = 0;
    
    console.log(`Всего файлов для загрузки: ${totalFiles}`);
    
    if (totalFiles === 0) {
      console.log('Нет файлов для загрузки');
      return;
    }
    
    // Загрузка содержимого файлов небольшими группами чтобы не перегружать сервер
    const batchSize = 5;
    for (let i = 0; i < totalFiles; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (fileName) => {
        await readPostFile(fileName);
        loadedFiles++;
        if (loadedFiles % 10 === 0 || loadedFiles === totalFiles) {
          console.log(`Загружено ${loadedFiles} из ${totalFiles} файлов`);
        }
      }));
    }
    
    console.log('Предварительная загрузка файлов завершена');
  } catch (error) {
    console.error('Ошибка при предварительной загрузке файлов:', error);
  }
}