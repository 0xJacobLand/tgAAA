<template>
  <div class="search-page">
    <h1 class="search-title">Search by KOL posts</h1>
    
    <div v-if="isInitializing" class="initializing-container">
      <div class="loading-indicator">
        <div class="spinner"></div>
        <div>Preparing search engine...</div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: `${initProgress}%` }"></div>
        </div>
        <div class="progress-text">{{ initProgress }}%</div>
      </div>
    </div>
    
    <div v-else class="search-container">
      <div class="search-controls">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Enter your keyword" 
          class="search-input"
          @keyup.enter="performSearch"
        />
        
        <button @click="performSearch" class="search-button" type="button" :disabled="isLoading">
          {{ isLoading ? 'Seaarching...' : 'Seaarch' }}
        </button>
      </div>
      
      <div class="loading-indicator" v-if="isLoading">
        <div class="spinner"></div>
        <div>Seaarching...</div>
      </div>
      
      <div class="results-container" v-if="searchResults.length > 0">
        <div class="search-results">
          <div class="results-header">
            <h2>Results found: {{ searchResults.length }}</h2>
            <button @click="exportToExcel" class="export-button">
              Export in Excel
            </button>
          </div>
          
          <!-- Контейнер для Masonry -->
          <div ref="masonryContainer" class="masonry-container">
            <div 
              v-for="(result, index) in searchResults" 
              :key="index" 
              class="post-container"
            >
              <div class="post-header">
                <!-- Делаем имя канала кликабельным -->
                <router-link 
                  :to="{ path: `/kols/${result.channelName}` }" 
                  class="channel-name">
                  {{ result.channelName }}
                </router-link>
                <div class="post-date">{{ result.dateTime }}</div>
              </div>
              <div class="post-content">{{ result.content }}</div>
              
              <div class="post-footer">
                <div class="post-stats">
                  <div class="post-stat">
                    <div class="stat-icon comments-icon"></div>
                    <span>{{ formatNumber(result.comments) }}</span>
                  </div>
                  
                  <div class="post-stat">
                    <div class="stat-icon reactions-icon"></div>
                    <span>{{ formatNumber(result.reactions) }}</span>
                  </div>
                  
                  <div class="post-stat">
                    <div class="stat-icon reposts-icon"></div>
                    <span>{{ formatNumber(result.reposts) }}</span>
                  </div>
                  
                  <div class="post-stat">
                    <div class="stat-icon views-icon"></div>
                    <span>{{ formatNumber(result.views) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="searchQuery && !isLoading && searchAttempted" class="no-results">
        <p>По вашему запросу ничего не найдено</p>
        <p>Попробуйте изменить поисковый запрос или проверить правильность написания</p>
      </div>
    </div>
  </div>
</template>

<script>
import { searchPosts, preloadAllFiles } from '../services/searchService';
import * as XLSX from 'xlsx';

// Импортируем библиотеки
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

export default {
  name: 'SearchPage',
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      isLoading: false,
      searchAttempted: false,
      isInitializing: true,
      initProgress: 0,
      masonryInstance: null,
      channelSubscribers: {
        'idoresearch': 73578,
        'defigencapital': 27317,
        'tradeparty1337': 83000,
        'cryptohustle': 22928,
        'paguinfo': 4581,
        'panews': 18177,
        'c4': 19128,
        'shoalresearch': 9954,
        'crypto': 12844,
        'фофан': 808,
        'cryptobender': 25323,
        'tesnet': 2668,
        'pabloresearch': 22,
        'aggregator': 13993,
        'andysjournal': 6311,
        'web3pack': 220
      }
    };
  },
  methods: {
    // Функция для имитации прогресса предварительной загрузки
    simulateInitProgress() {
      const timer = setInterval(() => {
        this.initProgress += 5;
        if (this.initProgress >= 100) {
          clearInterval(timer);
          this.isInitializing = false;
        }
      }, 150);
    },
    
    // Инициализация Masonry
    initMasonry() {
      this.$nextTick(() => {
        const container = this.$refs.masonryContainer;
        if (container && this.searchResults.length > 0) {
          // Уничтожаем старый экземпляр, если существует
          if (this.masonryInstance) {
            this.masonryInstance.destroy();
          }
          
          // Создаем новый экземпляр Masonry
          this.masonryInstance = new Masonry(container, {
            itemSelector: '.post-container',
            percentPosition: true,
            columnWidth: '.post-container',
            gutter: 20
          });
          
          // Перестраиваем сетку после полной загрузки изображений
          imagesLoaded(container).on('progress', () => {
            if (this.masonryInstance) {
              this.masonryInstance.layout();
            }
          });
          
          // Принудительно перестраиваем сетку через небольшую задержку
          setTimeout(() => {
            if (this.masonryInstance) {
              this.masonryInstance.layout();
            }
          }, 500);
        }
      });
    },
    
    // Обработчик изменения размера окна
    handleResize() {
      if (this.masonryInstance) {
        this.masonryInstance.layout();
      }
    },
    
    // Форматирование чисел
    formatNumber(value) {
      // Проверяем, что значение не пустое и является числом
      if (value === undefined || value === null || value === '') {
        return '0';
      }
      
      // Преобразуем в число и форматируем
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        return '0';
      }
      
      // Форматируем число с разделителями разрядов
      return new Intl.NumberFormat('ru-RU').format(num);
    },
    
    // Получение количества подписчиков для канала
    getSubscribersCount(channelName) {
      const normalizedName = channelName.toLowerCase();
      return this.channelSubscribers[normalizedName] || 0;
    },
    
    // Метод для экспорта данных в Excel
    exportToExcel() {
      try {
        // Создаем дату для имени файла
        const date = new Date();
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        // Создаем заголовок отчета
        const reportTitle = [
          ['Список публикаций с упоминанием ключевого слова'],
          [`[данный файл сформирован в ${formattedDate} c помощью сервиса поиска по публикациям в Telegram-каналах и чатах - tgaist.pro/search]`],
          [''],
          ['Текст для поиска', this.searchQuery],
          ['Период', 'Все доступные']
        ];
        
        // Создаем заголовки таблицы
        const tableHeaders = [
          ['Дата публикации', 'Название источника', 'Кол-во подписчиков', 'Просмотров', 'Пересылок', 'Комментарии', 'Реакций', 'Текст публикации']
        ];
        
        // Подготавливаем данные для таблицы
        const tableData = this.searchResults.map(result => [
          result.dateTime,
          result.channelName,
          this.getSubscribersCount(result.channelName),
          parseInt(result.views) || 0,
          parseInt(result.reposts) || 0,
          parseInt(result.comments) || 0,
          parseInt(result.reactions) || 0,
          result.content
        ]);
        
        // Объединяем все данные
        const allData = [...reportTitle, [''], ...tableHeaders, ...tableData];
        
        // Создаем книгу Excel и лист
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(allData);
        
        // Добавляем лист в книгу
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Результаты поиска');
        
        // Сохраняем файл
        XLSX.writeFile(workbook, `Поиск_${this.searchQuery}_${formattedDate.replace(/:/g, '-').replace(/\./g, '-')}.xlsx`);
        
        console.log('Файл Excel успешно экспортирован');
      } catch (error) {
        console.error('Ошибка при экспорте в Excel:', error);
        alert('Произошла ошибка при экспорте в Excel. Попробуйте еще раз.');
      }
    },
    
    // Выполнение поиска с исправленной обработкой статистики
    // Выполнение поиска с исправленной обработкой статистики и имен каналов
async performSearch() {
  if (this.searchQuery.trim() === '') {
    return;
  }
  
  this.isLoading = true;
  this.searchResults = [];
  this.searchAttempted = true;
  
  try {
    console.log('Выполняем поиск по запросу:', this.searchQuery);
    const results = await searchPosts(this.searchQuery);
    console.log('Получены результаты:', results);
    
    // Обрабатываем результаты, исправляя имена каналов и даты
    this.searchResults = results.map(result => {
      // Проверяем на некорректные имена и даты (когда часть имени попала в дату)
      let { channelName, dateTime } = result;
      
      // Проверяем, является ли часть dateTime продолжением имени канала
      // Например, если channelName = "crypton", а dateTime = "off_20250323"
      if (dateTime && dateTime.startsWith('off_') && channelName === 'crypton') {
        // Восстанавливаем правильное имя канала
        channelName = 'crypton_off';
        
        // Извлекаем правильную дату из строки "off_20250323"
        const dateMatch = dateTime.match(/_(\d{8})/);
        if (dateMatch && dateMatch[1]) {
          const dateStr = dateMatch[1];
          // Форматируем дату в нормальный вид YYYY-MM-DD
          dateTime = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        }
      }
      
      return {
        ...result,
        channelName,
        dateTime,
        // Используем оригинальные значения из результата или 0 по умолчанию
        comments: result.comments || '0',
        reactions: result.reactions || '0',
        reposts: result.reposts || '0',
        views: result.views || '0'
      };
    });
    
    console.log('Обработанные результаты:', this.searchResults);
    
    // Инициализируем Masonry после получения результатов
    this.$nextTick(() => {
      this.initMasonry();
    });
  } catch (error) {
    console.error('Ошибка при поиске:', error);
  } finally {
    this.isLoading = false;
  }
}
  },
  async mounted() {
    try {
      this.simulateInitProgress();
      await preloadAllFiles();
      this.initProgress = 100;
      setTimeout(() => {
        this.isInitializing = false;
      }, 500);
      
      // Добавляем обработчик изменения размера окна
      window.addEventListener('resize', this.handleResize);
    } catch (error) {
      console.error('Ошибка при инициализации поиска:', error);
      this.isInitializing = false;
    }
  },
  watch: {
    searchResults() {
      this.$nextTick(() => {
        this.initMasonry();
      });
    }
  },
  beforeDestroy() {
    // Очищаем экземпляр Masonry при уничтожении компонента
    if (this.masonryInstance) {
      this.masonryInstance.destroy();
      this.masonryInstance = null;
    }
    
    // Удаляем обработчик изменения размера окна
    window.removeEventListener('resize', this.handleResize);
  }
}
</script>

<style scoped>
.search-page {
  padding: 2rem;
  width: 100%; /* Занимает всю ширину экрана */
  margin: 0;
  background-color: #e4e7f0;
  min-height: calc(100vh - 150px);
  box-sizing: border-box; /* Учитываем padding в общей ширине */
}

.search-title {
  color: #4285f4;
  margin-bottom: 1.5rem;
  text-align: center; /* Центрируем заголовок */
  font-size: 28px; /* Увеличиваем размер заголовка */
}

h2 {
  text-align: center; /* Центрируем подзаголовок с количеством найденных результатов */
  margin-bottom: 0;
  margin-top: 0;
}

.search-container {
  width: 100%;
}

.search-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  max-width: 800px; /* Ограничиваем ширину поискового поля */
  margin-left: auto;
  margin-right: auto; /* Центрируем поисковое поле */
}

.search-input {
  flex-grow: 1;
  padding: 12px 16px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
}

.search-button {
  width: 120px;
  padding: 12px 16px;
  font-size: 18px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:hover:not(:disabled) {
  background-color: #2b6bc3;
}

.search-button:disabled {
  background-color: #a0c0f0;
  cursor: not-allowed;
}

.results-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 15px;
}

.export-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.export-button:hover {
  background-color: #45a049;
}

.initializing-container {
  padding: 50px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  color: #4285f4;
  font-weight: 500;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 133, 244, 0.3);
  border-radius: 50%;
  border-top-color: #4285f4;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin: 15px 0 5px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #4285f4;
  transition: width 0.3s;
}

.progress-text {
  font-size: 14px;
  color: #666;
}

.results-container {
  margin-top: 20px;
}

/* Настройки для Masonry */
.masonry-container {
  width: 100%;
  max-width: 1400px; /* Ограничиваем максимальную ширину контейнера */
  margin: 0 auto; /* Центрируем контейнер */
  box-sizing: border-box;
}

.post-container {
  width: calc(25% - 15px); /* Точно 4 блока в ряду */
  margin-bottom: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.post-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.post-header {
  border-bottom: 1px solid #e4e7f0;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.channel-name {
  font-size: 18px;
  font-weight: 600;
  color: #4285f4;
  margin-bottom: 5px;
  text-decoration: none;
  transition: color 0.2s;
  display: inline-block;
}

.channel-name:hover {
  color: #2b6bc3;
  text-decoration: underline;
}

.post-date {
  font-size: 14px;
  color: #8b95b0;
}

.post-content {
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 20px;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.post-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-stats {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #e4e7f0;
  padding-top: 15px;
  flex-wrap: wrap;
}

.post-stat {
  display: flex;
  align-items: center;
  color: #8b95b0;
  font-size: 14px;
  font-weight: 500;
  margin-right: 5px;
  margin-bottom: 5px;
}

.stat-icon {
  width: 18px;
  height: 18px;
  margin-right: 6px;
  background-color: #8b95b0;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.comments-icon {
  mask-image: url("data:image/svg+xml,%3Csvg width='800px' height='800px' viewBox='0 0 32 32' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns'%3E%3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'%3E%3Cg id='Icon-Set' sketch:type='MSLayerGroup' transform='translate(-152.000000, -255.000000)' fill='%23000000'%3E%3Cpath d='M168,281 C166.832,281 165.704,280.864 164.62,280.633 L159.912,283.463 L159.975,278.824 C156.366,276.654 154,273.066 154,269 C154,262.373 160.268,257 168,257 C175.732,257 182,262.373 182,269 C182,275.628 175.732,281 168,281 L168,281 Z M168,255 C159.164,255 152,261.269 152,269 C152,273.419 154.345,277.354 158,279.919 L158,287 L165.009,282.747 C165.979,282.907 166.977,283 168,283 C176.836,283 184,276.732 184,269 C184,261.269 176.836,255 168,255 L168,255 Z M175,266 L161,266 C160.448,266 160,266.448 160,267 C160,267.553 160.448,268 161,268 L175,268 C175.552,268 176,267.553 176,267 C176,266.448 175.552,266 175,266 L175,266 Z M173,272 L163,272 C162.448,272 162,272.447 162,273 C162,273.553 162.448,274 163,274 L173,274 C173.552,274 174,273.553 174,273 C174,272.447 173.552,272 173,272 L173,272 Z' id='comment-2' sketch:type='MSShapeGroup'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.reactions-icon {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z'/%3E%3C/svg%3E");
}

.reposts-icon {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z'/%3E%3C/svg%3E");
}

.views-icon {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z'/%3E%3C/svg%3E");
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.no-results p:first-child {
  font-size: 18px;
  font-weight: 500;
  color: #2c3d64;
  margin-bottom: 10px;
}

.no-results p:last-child {
  color: #8b95b0;
}

/* Настраиваем адаптивность для разных размеров экрана */
@media (max-width: 1200px) {
  .post-container {
    width: calc(33.33% - 14px); /* 3 блока в ряду */
  }
}

@media (max-width: 900px) {
  .post-container {
    width: calc(50% - 10px); /* 2 блока в ряду */
  }
}

@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-input, .search-button {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .post-container {
    width: 100%; /* 1 блок в ряду для мобильных */
  }
  
  .post-stats {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .post-stat {
    flex: 1 0 40%;
  }
}
</style>