// api/kolastpost.js
const fs = require('fs');
const path = require('path');
module.exports = (req, res) => {
  // Путь до папки valid_idoresearch относительно корневой директории
  const directoryPath = path.join(__dirname, '..', 'valid_idoresearch');
  
  // Чтение списка файлов из директории
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.toString() });
    }
    
    // Фильтрация только .txt файлов
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    
    if (txtFiles.length === 0) {
      return res.status(404).json({ error: 'Файлы не найдены' });
    }
    
    // Структура данных для хранения последнего поста каждого KOL
    const kolPosts = {};
    
    // Обрабатываем каждый файл
    const fileProcessingPromises = txtFiles.map(file => {
      return new Promise((resolve) => {
        const filePath = path.join(directoryPath, file);
        
        // Ищем дату в формате YYYYMMDD (8 цифр) в имени файла
        const dateMatch = file.match(/_(\d{8})_/);
        
        if (dateMatch) {
          const dateStr = dateMatch[1]; // YYYYMMDD
          const datePosition = file.indexOf(`_${dateStr}_`);
          
          // Если нашли дату, извлекаем имя канала (всё между первым _ и датой)
          if (datePosition > 0) {
            // Находим первое подчеркивание
            const firstUnderscorePos = file.indexOf('_');
            
            // Имя канала - это часть между первым _ и датой
            if (firstUnderscorePos >= 0 && firstUnderscorePos < datePosition) {
              const kolName = file.substring(firstUnderscorePos + 1, datePosition);
              
              // Извлекаем последние 4 числа из имени файла перед .txt
              // Нам нужны именно эти 4 числа: комментарии, реакции, репосты, просмотры
              const statsMatch = file.match(/(\d+),(\d+),(\d+),(\d+)\.txt$/);
              
              let stats = '';
              if (statsMatch && statsMatch.length >= 5) {
                // Используем числа в порядке: комментарии, реакции, репосты, просмотры
                stats = `${statsMatch[1]},${statsMatch[2]},${statsMatch[3]},${statsMatch[4]}`;
              } else {
                // Если формат не соответствует ожидаемому, пробуем другой вариант
                // Ищем последние 4 числа где-то в конце имени файла
                const alternativeMatch = file.match(/(\d+),(\d+),(\d+),(\d+)[,\d]*\.txt$/);
                if (alternativeMatch && alternativeMatch.length >= 5) {
                  // Берем последние 4 числа
                  stats = `${alternativeMatch[1]},${alternativeMatch[2]},${alternativeMatch[3]},${alternativeMatch[4]}`;
                }
              }
              
              // Читаем содержимое файла
              fs.readFile(filePath, 'utf8', (err, content) => {
                if (err) {
                  resolve(); // Пропускаем файл при ошибке чтения
                  return;
                }
                
                // Если это первый файл для данного KOL или более новый, чем предыдущий
                if (!kolPosts[kolName] || dateStr > kolPosts[kolName].date) {
                  kolPosts[kolName] = {
                    kolName,
                    date: dateStr,
                    fileName: file,
                    stats,
                    content
                  };
                }
                resolve();
              });
            } else {
              resolve(); // Пропускаем файл с неправильным форматом
            }
          } else {
            resolve(); // Пропускаем файл без даты в правильном формате
          }
        } else {
          resolve(); // Пропускаем файл без даты в правильном формате
        }
      });
    });
    
    // Ждем, пока все файлы будут обработаны
    Promise.all(fileProcessingPromises)
      .then(() => {
        // Превращаем объект в массив и сортируем по имени KOL
        const result = Object.values(kolPosts).sort((a, b) => 
          a.kolName.localeCompare(b.kolName)
        );
        
        // Форматируем результат для API ответа
        const formattedResult = result.map(post => ({
          kolName: post.kolName,
          stats: post.stats,
          date: `${post.date.slice(0, 4)}-${post.date.slice(4, 6)}-${post.date.slice(6, 8)}`,
          content: post.content,
          fileName: post.fileName
        }));
        
        // Отправляем ответ
        res.status(200).json(formattedResult);
      })
      .catch(error => {
        res.status(500).json({ error: error.toString() });
      });
  });
};