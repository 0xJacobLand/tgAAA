// api/kol30.js
const fs = require('fs');
const path = require('path');
module.exports = (req, res) => {
  // Путь до папки valid_idoresearch относительно корневой директории
  const directoryPath = path.join(__dirname, '..', 'valid_idoresearch');
  
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      res.status(500).json({ error: err.toString() });
      return;
    }
    // Объект для подсчёта упоминаний проектов
    const projectCounts = {};
    
    files.forEach(file => {
      // Извлекаем имя проекта, учитывая черточки
      // Находим первое вхождение года-подобной последовательности
      const dateMatch = file.match(/_(20\d{6}|202\d)_/);
      
      if (dateMatch) {
        // Получаем индекс начала даты
        const dateIndex = file.indexOf(dateMatch[0]);
        // Находим начало имени проекта (после первого подчеркивания)
        const startIndex = file.indexOf('_') + 1;
        // Извлекаем имя проекта (от первого _ до даты)
        const projectName = file.substring(startIndex, dateIndex);
        
        if (projectCounts[projectName]) {
          projectCounts[projectName]++;
        } else {
          projectCounts[projectName] = 1;
        }
      } else {
        // Если не нашли дату, используем оригинальный подход
        const match = file.match(/_([^_]+)_/);
        if (match && match[1]) {
          const projectName = match[1];
          if (projectCounts[projectName]) {
            projectCounts[projectName]++;
          } else {
            projectCounts[projectName] = 1;
          }
        }
      }
    });
    
    // Преобразуем в массив объектов с именем и количеством через запятую
    const projects = Object.keys(projectCounts).map(projectName => ({
      name: `${projectName}, ${projectCounts[projectName]}`
    }));
    
    res.status(200).json(projects);
  });
};