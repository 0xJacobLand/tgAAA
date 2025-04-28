// api/alltrash-files.js
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Путь до папки alltrash относительно корневой директории
  const directoryPath = path.join(__dirname, '..', 'alltrash');
  
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      res.status(500).json({ error: err.toString() });
      return;
    }
    
    // Фильтруем только файлы KOL постов (имеющие подчеркивания)
    const kolFiles = files.filter(file => file.includes('_'));
    
    // Возвращаем список файлов
    res.status(200).json(kolFiles);
  });
};