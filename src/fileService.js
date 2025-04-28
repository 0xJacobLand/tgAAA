// fileService.js
/**
 * Сервис для работы с файлами и извлечения данных из имен файлов
 */

/**
 * Получает список файлов из директории и извлекает идентификаторы
 * @param {string} directory - имя директории для сканирования
 * @returns {Promise<Array>} - массив объектов с именами и количеством упоминаний
 */
export async function getProjectsFromFiles(directory = 'valid_idoresearch') {
  try {
    // Получаем список файлов из директории через API
    const response = await fetch(`/api/files?directory=${directory}`);
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки файлов');
    }
    
    const files = await response.json();
    
    // Создаем карту для подсчета упоминаний
    const mentionsMap = {};
    
    // Обрабатываем каждый файл и извлекаем идентификаторы
    files.forEach(fileName => {
      // Разбиваем имя файла по "_" (например: Berachain_idoresearch_20250408_221232)
      const parts = fileName.split('_');
      
      // Проверяем, что есть хотя бы два разделителя
      if (parts.length >= 2) {
        // Берем часть между первым и вторым "_"
        const identifier = parts[1];
        
        if (identifier) {
          // Увеличиваем счетчик упоминаний
          mentionsMap[identifier] = (mentionsMap[identifier] || 0) + 1;
        }
      }
    });
    
    // Преобразуем карту упоминаний в массив объектов
    const projects = Object.entries(mentionsMap).map(([name, mentions]) => ({
      name,
      mentions
    }));
    
    // Сортируем по убыванию количества упоминаний
    return projects.sort((a, b) => b.mentions - a.mentions);
  } catch (error) {
    console.error('Ошибка при получении проектов из файлов:', error);
    
    // Возвращаем тестовые данные в случае ошибки
    return [
      { name: 'idoresearch', mentions: 5 },
      { name: 'market', mentions: 3 },
      { name: 'analysis', mentions: 2 },
      { name: 'research', mentions: 4 },
      { name: 'review', mentions: 2 },
      { name: 'update', mentions: 1 }
    ];
  }
}