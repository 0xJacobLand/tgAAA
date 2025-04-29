<template>
  <div class="top-list-container">
    <div class="top-list-header">
      <h2>Top KOLs</h2>
    </div>
    
    <div class="top-list-table">
      <div class="list-header">
        <div class="column name-col blue-text">Name</div>
        <div class="column current-col blue-text">Current</div>
        <div class="column delta-col blue-text">Δ1D</div>
        <div class="column delta-col blue-text">Δ7D</div>
        <div class="column delta-col blue-text">Δ30D</div>
        <div class="column delta-col blue-text">Δ3M</div>
      </div>
      
      <div v-if="loading" class="loading">
        Загрузка данных...
      </div>
      
      <div v-else class="list-body">
        <div v-for="(project, index) in projects" :key="index" class="list-row">
          <div class="column name-col blue-text">
            <div class="project-avatar">
              <!-- Используем аватарку если она существует, иначе показываем первую букву -->
              <img v-if="hasAvatar(project.projectName)" :src="getAvatarPath(project.projectName)" :alt="project.projectName">
              <span v-else>{{ project.projectName.charAt(0).toUpperCase() }}</span>
            </div>
            <a :href="getProjectUrl(project.projectName)" class="project-link">
              {{ project.projectName }}
            </a>
          </div>
          <div class="column current-col">—</div>
          <div class="column delta-col">—</div>
          <div class="column delta-col">—</div>
          <div class="column delta-col positive">
            {{ project.count }}
          </div>
          <div class="column delta-col">—</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KOLsList',
  data() {
    return {
      projects: [],
      loading: true,
      // Список проектов, для которых у нас есть аватарки
      availableAvatars: ['idoresearch', 'defigencapital', 'tradeparty1337', 'XardMoney', 'crypton_off']
    }
  },
  mounted() {
    this.loadProjects();
  },
  methods: {
    async loadProjects() {
      try {
        // Получаем данные с вашего API
        const response = await fetch('/api/kol30');
        
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        
        const data = await response.json();
        
        // Парсим полученные данные
        const parsedProjects = data.map(item => {
          // Разбиваем строку "projectName, count" на части
          const parts = item.name.split(', ');
          return {
            projectName: parts[0],
            count: parseInt(parts[1] || 0)
          };
        });
        
        // Сортируем по количеству упоминаний (убывание)
        this.projects = parsedProjects.sort((a, b) => b.count - a.count);
      } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
        // Тестовые данные на случай ошибки
        this.projects = [
          { projectName: 'idoresearch', count: 8 },
          { projectName: 'defigencapital', count: 1 }
        ];
      } finally {
        this.loading = false;
      }
    },
    
    // Проверяем, есть ли аватарка для данного проекта
    hasAvatar(projectName) {
      return this.availableAvatars.includes(projectName);
    },
    
    // Получаем путь к аватарке
    getAvatarPath(projectName) {
      // Путь к папке с аватарками, используем JPG формат
      return `/avatars/${projectName}.jpg`;
    },
    
    // Новый метод для получения URL проекта
    getProjectUrl(projectName) {
      // Исправляем регистр для точного соответствия пути роутера
      console.log('Original projectName:', projectName);
      
      // Особые случаи для CRYPTO_HACKlNG
      if (projectName.toUpperCase() === 'CRYPTO_HACKING' || 
          projectName.toLowerCase() === 'crypto_hacking') {
        console.log('Converting to: CRYPTO_HACKlNG');
        return `/kols/CRYPTO_HACKlNG`;
      }
      
      // Стандартный случай - просто приводим к нижнему регистру
      return `/kols/${projectName}`;
    }
  }
}
</script>

<style scoped>
.top-list-container {
  color: #4285f4;
  background-color: #e4e7f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 650px;
  height: fit-content;
  flex-shrink: 0;
  margin-left: 20px; /* Добавляем отступ слева */
}

.top-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.top-list-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #000000; /* Черный цвет для Top Gainer */
}

.top-list-table {
  width: 100%;
}

.list-header {
  display: flex;
  border-bottom: 1px solid #4285f4; /* Синий цвет для разделительной линии */
  padding-bottom: 8px;
  font-size: 14px;
  color: #8b95b0;
  font-weight: 500;
}

.list-row {
  display: flex;
  border-bottom: 1px solid #4285f4; /* Синий цвет для разделительной линии */
  padding: 12px 0;
  font-size: 14px;
}

.column {
  padding: 0 8px;
}

.name-col {
  flex: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.blue-text {
  color: #4285f4; /* Синий цвет для имен проектов и заголовков */
}

.current-col {
  flex: 1;
  text-align: right;
}

.delta-col {
  flex: 1;
  text-align: right;
}

.project-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #2c3d64;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #e4e7f0;
  overflow: hidden; /* Для обрезки изображений по кругу */
}

.project-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Обеспечивает правильное масштабирование изображения */
}

.positive {
  color: #4285f4;
}

.negative {
  color: #de5246;
}

.loading {
  padding: 20px 0;
  text-align: center;
  color: #8b95b0;
}

/* Новые стили для ссылок */
.project-link {
  color: #4285f4;
  text-decoration: none;
  transition: color 0.2s ease;
}

.project-link:hover {
  color: #1a73e8;
  text-decoration: underline;
}
</style>