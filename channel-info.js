const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Путь до папки kolsdata относительно корневой директории (если api находится в папке api, то поднимаемся на один уровень)
  const directoryPath = path.join(__dirname, '..', 'kolsdata');
  
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      res.status(500).json({ error: err.toString() });
      return;
    }
    
    // Массив, куда будем собирать сведения о каналах
    const channelInfos = [];

    files.forEach(file => {
      // Формируем полный путь до файла
      const filePath = path.join(directoryPath, file);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Предполагается, что каждая строка имеет вид "Ключ: Значение"
        // Разбиваем содержимое по строкам и получаем значение после разделителя ": "
        const lines = content.split('\n');
        const values = lines.map(line => {
          const parts = line.split(': ');
          return parts[1] ? parts[1].trim() : '';
        }).filter(value => value !== '');
        // Собираем итоговую строку с данными через запятую
        // (Например: "IDO research, Тот самый канал о крипте..., 72926")
        const infoString = values.join(', ');
        
        channelInfos.push(infoString);
      } catch (fileReadError) {
        console.error(`Ошибка чтения файла ${filePath}:`, fileReadError);
      }
    });
    
    // Возвращаем результат в JSON-формате
    res.status(200).json(channelInfos);
  });
};
