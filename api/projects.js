// api/projects.js
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
      // Фильтруем только .txt файлы
      if (file.endsWith('.txt')) {
        const projectName = file.split('_')[0];
        if (projectCounts[projectName]) {
          projectCounts[projectName]++;
        } else {
          projectCounts[projectName] = 1;
        }
      }
    });

    // Преобразуем в массив объектов
    const projects = Object.keys(projectCounts).map(projectName => ({
      name: projectName,
      mentions: projectCounts[projectName]
    }));

    res.status(200).json(projects);
  });
};
