// api/read-post.js
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const { fileName } = req.query;
  
  // Проверяем, что имя файла предоставлено
  if (!fileName) {
    res.status(400).json({ error: 'Не указано имя файла' });
    return;
  }
  
  // Проверяем, что имя файла не содержит потенциально опасных символов
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    res.status(400).json({ error: 'Некорректное имя файла' });
    return;
  }
  
  // Формируем путь к файлу
  const filePath = path.join(__dirname, '..', 'alltrash', fileName);
  
  // Читаем содержимое файла
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(404).json({ error: `Файл не найден: ${err.toString()}` });
      return;
    }
    
    // Возвращаем содержимое файла
    res.status(200).send(data);
  });
};