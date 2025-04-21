<template>
  <div class="project-detail-page">
    <!-- Шапка проекта -->
    <div class="project-header">
      <div class="project-header-left">
        <div class="project-logo">
          <img :src="projectLogo" @error="handleLogoError" alt="Project Logo" class="project-icon" />
        </div>
        <div class="project-title">
          <h1>{{ projectInfo.name || 'Загрузка...' }} <span class="project-ticker" v-if="projectInfo.ticker">{{ projectInfo.ticker }}</span></h1>
          <div class="project-links">
            <a v-if="projectInfo.website" :href="projectInfo.website" target="_blank" class="link-btn">
              <span class="icon">🌐</span>
            </a>
            <a v-if="projectInfo.twitter" :href="projectInfo.twitter" target="_blank" class="link-btn">
              <span class="icon">𝕏</span>
            </a>
            <a v-if="projectInfo.telegram" :href="projectInfo.telegram" target="_blank" class="link-btn">
              <span class="icon">📱</span>
            </a>
          </div>
        </div>
      </div>
      <div class="project-header-right">
        <a 
          v-if="projectInfo.researchReportUrl" 
          :href="projectInfo.researchReportUrl" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="report-btn"
        >
          Research Report
        </a>
      </div>
    </div>

    <!-- Секции с данными -->
    <div class="content-grid">
      <!-- Левая колонка -->
      <div class="column investors-column">
        <div class="column-header">
          <h2>Investors</h2>
        </div>
        <div class="column-content">
          <div v-if="projectInfo.investors && projectInfo.investors.length" class="investors-stack">
            <div class="investor-icons-container">
              <div 
                v-for="(investor, index) in projectInfo.investors" 
                :key="'main-'+index" 
                class="investor-icon-wrapper"
                :style="{ zIndex: projectInfo.investors.length - index, marginLeft: index === 0 ? '0' : '-15px' }"
              >
                <div class="investor-logo" :title="investor.name">
                  <img 
                    :src="investor.logoUrl || '/images/placeholder.png'"
                    :alt="investor.name"
                    class="investor-icon"
                    @load="investor.logoUrl = $event.target.src"
                    @error="loadInvestorLogo(investor)"
                  />
                </div>
              </div>
            </div>
            <div class="funds-raised" v-if="projectInfo.fundsRaised">
              Total funds raised {{ projectInfo.fundsRaised }}
            </div>
          </div>
          <div v-else class="empty-state">
            No investor data available
          </div>
        </div>
      </div>

      <!-- Средняя колонка -->
      <div class="column performance-column">
        <div class="column-header">
          <h2>TG Performance <span class="info-icon">ℹ️</span></h2>
        </div>
        <div class="column-content">
          <div class="performance-data" v-if="projectInfo.tgPerformance">
            <div class="performance-score">
              {{ projectInfo.tgPerformance.score || '—' }}
              <span class="performance-status" :class="getPerformanceClass(projectInfo.tgPerformance.status)">
                {{ projectInfo.tgPerformance.status || '—' }}
              </span>
            </div>
            <div class="rank-info">Rank by X {{ projectInfo.tgPerformance.rank || '—' }}</div>
            <div class="hashtag-info" v-if="projectInfo.tgPerformance.hashtag">{{ projectInfo.tgPerformance.hashtag }}</div>
            <div class="performance-chart">
              <div class="chart-track">
                <div class="track-segment segment-red"></div>
                <div class="track-segment segment-orange"></div>
                <div class="track-segment segment-yellow"></div>
                <div class="track-segment segment-green"></div>
                <div class="track-marker" :style="{ left: getPerformancePosition(projectInfo.tgPerformance.score) + '%' }"></div>
              </div>
              <div class="track-labels">
                <span>0</span>
                <span>500</span>
                <span>1000</span>
                <span>1500</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            Нет данных о производительности
          </div>
        </div>
      </div>

      <!-- Правая колонка -->
      <div class="column x-performance-column">
        <div class="column-header">
          <h2>X Performance</h2>
        </div>
        <div class="column-content">
          <div v-if="isLoadingTwitterData" class="loading-state">
            <div class="spinner"></div>
          </div>
          
          <div v-else-if="twitterError" class="error-state">
            <p>{{ twitterError }}</p>
            <button @click="fetchTwitterData" class="retry-button">
              Retry
            </button>
          </div>
          
          <div class="performance-data" v-else-if="projectInfo.xPerformance">
            <div class="performance-score">
              {{ Math.round(projectInfo.xPerformance.score * 10) / 10 }}
              <span class="performance-status" :class="getPerformanceClass(projectInfo.xPerformance.status)">
                {{ projectInfo.xPerformance.status }}
              </span>
            </div>
            
            <div class="performance-chart">
              <div class="chart-track">
                <div class="track-gradient"></div>
                <div class="track-marker" :style="{ left: getPerformancePosition(projectInfo.xPerformance.score) + '%' }"></div>
              </div>
              <div class="track-labels">
                <span>0</span>
                <span>500</span>
                <span>1000</span>
                <span>1500</span>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            No X performance data available
          </div>
        </div>
      </div>
    </div>

    <!-- О проекте -->
    <div class="about-project">
      <div class="about-header">
        <h2>About {{ projectInfo.name || 'Project' }} <span class="ticker-small">({{ projectInfo.ticker || '—' }})</span> <span class="info-icon">ℹ️</span></h2>
      </div>
      <div class="about-content">
        <p v-if="projectInfo.description">{{ projectInfo.description }}</p>
        <p v-else>Нет описания для этого проекта.</p>
      </div>

      <!-- Ссылки -->
      <div class="official-links" v-if="hasLinks">
        <h3>Official Links</h3>
        <div class="links-list">
          <a v-if="projectInfo.website" :href="projectInfo.website" target="_blank" class="official-link">
            <span class="link-icon">🌐</span> {{ getDomainFromUrl(projectInfo.website) }}
          </a>
          <a v-if="projectInfo.twitter" :href="projectInfo.twitter" target="_blank" class="official-link">
            <span class="link-icon">𝕏</span> X (Twitter)
          </a>
        </div>
      </div>

      <!-- Категории -->
      <div class="project-categories" v-if="projectInfo.mainCategories && projectInfo.mainCategories.length">
        <h3>Main Category</h3>
        <div class="category-tags main-categories">
          <span v-for="(category, index) in projectInfo.mainCategories" :key="'main-'+index" class="category-tag">
            {{ category }}
          </span>
        </div>
        
        <h3>Sub-categories (Tags)</h3>
        <div class="category-tags sub-categories">
          <span v-for="(tag, index) in projectInfo.subCategories" :key="'sub-'+index" class="category-tag">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- Блок поиска упоминаний проекта -->
    <div class="project-mentions">
      <div class="mentions-header">
        <h2>Mentions in Telegram Channels</h2>
      </div>
      
      <!-- Индикатор загрузки -->
      <div v-if="isSearchLoading" class="loading-indicator">
        <div class="spinner"></div>
        <div>Loading mentions...</div>
      </div>

      <!-- Результаты поиска -->
      <div v-if="searchResults.length > 0" class="mentions-results">
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
      
      <!-- Если нет результатов, но поиск завершен -->
      <div v-else-if="!isSearchLoading && searchPerformed" class="no-results">
        <p>No mentions found for {{ projectInfo.name }}</p>
        <p>Try checking back later as more content is indexed</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Masonry from 'masonry-layout'
import imagesLoaded from 'imagesloaded'
import { getTwitterAccountScore, getTwitterFollowersStats } from '../services/tweetScoutService'
import axios from 'axios'
import { projectsData } from '../data/projects'

// Импортируем сервис поиска
// Примечание: вам нужно создать этот файл или использовать уже существующий
import { searchPosts, preloadAllFiles } from '../services/searchService'

const route = useRoute()
const router = useRouter()
const projectInfo = ref({})
const loading = ref(true)
const error = ref(null)
const logoFailed = ref(false)

// Переменные для поиска
const searchResults = ref([])
const isSearchLoading = ref(false)
const searchPerformed = ref(false)
const masonryInstance = ref(null)
const masonryContainer = ref(null)

// Twitter performance data
const twitterStats = ref(null)
const twitterEngagement = ref(null)
const twitterGrowth = ref(null)
const isLoadingTwitterData = ref(false)
const twitterError = ref(null)

// Словарь подписчиков каналов
const channelSubscribers = {
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
  'web3pack': 220,
  'crypton_off': 15000
}

// Получаем идентификатор проекта из URL
const projectId = computed(() => route.params.id)

// Вычисляемое свойство для логотипа, которое меняется при ошибке загрузки
const projectLogo = computed(() => {
  // Если в данных проекта уже указан путь к логотипу
  if (projectInfo.value.logo) return projectInfo.value.logo;
  
  // Если предыдущая попытка загрузки логотипа не удалась, возвращаем плейсхолдер
  if (logoFailed.value) {
    const name = projectInfo.value.name || projectId.value || 'P';
    const firstLetter = name.charAt(0).toUpperCase();
    return `https://via.placeholder.com/60/${getColorFromName(name)}/FFFFFF?text=${firstLetter}`;
  }
  
  // Иначе пытаемся загрузить логотип из нашей папки
  const normalizedId = projectId.value.toLowerCase();
  return `/images/projects/${normalizedId}.png`;
});

// Обработчик ошибки загрузки логотипа
const handleLogoError = () => {
  console.log('Ошибка загрузки логотипа, используем плейсхолдер');
  logoFailed.value = true;
};

// Функция для получения домена из URL
const getDomainFromUrl = (url) => {
  if (!url) return '';
  try {
    const domain = new URL(url);
    return domain.hostname;
  } catch (e) {
    return url;
  }
}

// Проверка наличия ссылок
const hasLinks = computed(() => {
  return projectInfo.value.website || projectInfo.value.twitter || projectInfo.value.telegram;
});

// Получить класс для статуса производительности
const getPerformanceClass = (status) => {
  if (!status) return '';
  const statusLower = status.toLowerCase();
  if (statusLower === 'strong') return 'status-strong';
  if (statusLower === 'medium') return 'status-medium';
  if (statusLower === 'weak') return 'status-weak';
  return '';
}

// Получить позицию маркера на шкале производительности (0-100%)
const getPerformancePosition = (score) => {
  if (!score) return 0;
  return Math.min(Math.max((score / 1500) * 100, 0), 100);
}

// Получить логотип инвестора
const getInvestorLogo = (investor) => {
  if (investor.logo) return investor.logo;
  
  // Пробуем загрузить логотип из нашей папки с изображениями
  const normalizedName = investor.name.toLowerCase().replace(/\s+/g, '-');
  const localImagePath = `/images/investors/${normalizedName}.png`;
  
  // Проверяем существование изображения
  const img = new Image();
  img.src = localImagePath;
  
  return new Promise((resolve) => {
    img.onload = () => resolve(localImagePath);
    img.onerror = () => {
      // Если изображение не найдено, генерируем цветной круг с первой буквой
      const name = investor.name || 'I';
      const firstLetter = name.charAt(0).toUpperCase();
      resolve(`https://placehold.co/40x40/${getColorFromName(name)}/FFFFFF/png?text=${firstLetter}`);
    };
  });
};

// Генерация цвета на основе имени
const getColorFromName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}

// Форматирование чисел для статистики
const formatNumber = (value) => {
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
}

// Инициализация Masonry
const initMasonry = () => {
  nextTick(() => {
    const container = masonryContainer.value;
    if (container && searchResults.value.length > 0) {
      // Уничтожаем старый экземпляр, если существует
      if (masonryInstance.value) {
        masonryInstance.value.destroy();
      }
      
      // Создаем новый экземпляр Masonry
      masonryInstance.value = new Masonry(container, {
        itemSelector: '.post-container',
        percentPosition: true,
        columnWidth: '.post-container',
        gutter: 20
      });
      
      // Перестраиваем сетку после полной загрузки изображений
      imagesLoaded(container).on('progress', () => {
        if (masonryInstance.value) {
          masonryInstance.value.layout();
        }
      });
      
      // Принудительно перестраиваем сетку через небольшую задержку
      setTimeout(() => {
        if (masonryInstance.value) {
          masonryInstance.value.layout();
        }
      }, 500);
    }
  });
}

// Обработчик изменения размера окна
const handleResize = () => {
  if (masonryInstance.value) {
    masonryInstance.value.layout();
  }
}

// Вспомогательная функция для форматирования даты/времени
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr || typeof dateTimeStr !== 'string') {
    return '';
  }
  
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

// Автоматический поиск по названию проекта
const performProjectSearch = async () => {
  if (!projectInfo.value?.name) {
    searchResults.value = [];
    searchPerformed.value = true;
    return;
  }
  
  const searchQuery = projectInfo.value.name;
  isSearchLoading.value = true;
  searchResults.value = [];
  searchPerformed.value = false;
  
  try {
    const results = await searchPosts(searchQuery);
    
    if (!Array.isArray(results)) {
      console.error('Unexpected search results format:', results);
      searchResults.value = [];
      return;
    }
    
    // Обрабатываем результаты, исправляя имена каналов и даты
    searchResults.value = results.map(result => {
      if (!result || typeof result !== 'object') {
        return null;
      }
      
      // Проверяем на некорректные имена и даты
      let { channelName, dateTime } = result;
      
      // Проверяем, является ли часть dateTime продолжением имени канала
      if (dateTime && dateTime.startsWith('off_') && channelName === 'crypton') {
        channelName = 'crypton_off';
        
        const dateMatch = dateTime.match(/_(\d{8})/);
        if (dateMatch && dateMatch[1]) {
          const dateStr = dateMatch[1];
          dateTime = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        }
      }
      
      return {
        ...result,
        channelName: channelName || 'Unknown Channel',
        dateTime: formatDateTime(dateTime),
        content: result.content || '',
        comments: result.comments || '0',
        reactions: result.reactions || '0',
        reposts: result.reposts || '0',
        views: result.views || '0'
      };
    }).filter(Boolean); // Remove any null results
    
    searchPerformed.value = true;
    
    // Инициализируем Masonry после получения результатов
    nextTick(() => {
      initMasonry();
    });
  } catch (error) {
    console.error('Ошибка при поиске:', error);
    searchResults.value = [];
  } finally {
    isSearchLoading.value = false;
  }
}

// Function to extract Twitter handle from URL
function extractTwitterHandle(url) {
  console.log('Extracting handle from URL:', url);
  if (!url) return '';
  
  try {
    // Handle both x.com and twitter.com URLs
    if (url.includes('twitter.com') || url.includes('x.com')) {
      const parts = url.split('/').filter(Boolean);
      console.log('URL parts:', parts);
      let handle = parts[parts.length - 1];
      // Remove any query parameters or hashes
      handle = handle.split('?')[0].split('#')[0];
      console.log('Extracted handle:', handle);
      return handle;
    }
    // If it's already just a handle, remove @ if present
    const handle = url.replace('@', '');
    console.log('Using direct handle:', handle);
    return handle;
  } catch (error) {
    console.error('Error extracting Twitter handle:', error);
    return '';
  }
}

// Update the fetchTwitterData function
const fetchTwitterData = async () => {
  if (!projectInfo.value?.twitter) {
    console.log('No Twitter URL found in project info');
    return;
  }

  try {
    console.log('Starting Twitter data fetch');
    console.log('Twitter URL from project info:', projectInfo.value.twitter);
    
    const handle = extractTwitterHandle(projectInfo.value.twitter);
    console.log('Extracted Twitter handle:', handle);
    
    if (!handle) {
      console.warn('Could not extract Twitter handle from URL');
      return;
    }

    console.log('Making API request to TweetScout with handle:', handle);
    const response = await fetch(`https://api.tweetscout.io/v2/score/${handle}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ApiKey': 'c1960c7f-8629-405f-b285-3945825c550e'
      }
    });

    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('TweetScout API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('TweetScout API response data:', data);

    if (data && typeof data === 'object') {
      projectInfo.value.xPerformance = {
        score: data.score || 0,
        status: getTwitterStatus(data.score)
      };
      console.log('Updated project info with Twitter data:', projectInfo.value.xPerformance);
    } else {
      console.warn('Unexpected API response format:', data);
    }
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    projectInfo.value.xPerformance = {
      score: 0,
      status: 'Error'
    };
  }
};

// Helper function to determine Twitter status based on score
const getTwitterStatus = (score) => {
  if (!score) return 'N/A';
  if (score >= 1000) return 'HIGH';
  if (score >= 500) return 'MID';
  return 'LOW';
};

// Загрузка данных проекта
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    logoFailed.value = false;
    
    // Попытка получить данные с сервера
    try {
      const response = await fetch(`/api/projects/${projectId.value.toLowerCase()}`);
      
      if (response.ok) {
        projectInfo.value = await response.json();
        console.log('Данные загружены с сервера:', projectInfo.value);
      } else {
        throw new Error('Данные не найдены на сервере');
      }
    } catch (fetchError) {
      console.warn('Не удалось загрузить данные с сервера:', fetchError);
      
      // Используем локальные данные из projects.js
      const localData = projectsData[projectId.value.toLowerCase()];
      
      if (localData) {
        console.log('Используем локальные данные для проекта:', projectId.value);
        projectInfo.value = { ...localData };
      } else {
        console.warn('Нет данных для проекта:', projectId.value);
        // Создаем базовую структуру с минимальными данными
        projectInfo.value = {
          name: projectId.value.charAt(0).toUpperCase() + projectId.value.slice(1),
          ticker: projectId.value.toUpperCase(),
          description: "No description available.",
          mainCategories: [],
          subCategories: [],
          investors: []
        };
      }
    }
    
    // Устанавливаем заголовок страницы
    document.title = `${projectInfo.value.name || projectId.value} | Project Details`;
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', handleResize);
    
    // Fetch Twitter data after project info is loaded
    console.log('Initiating Twitter data fetch after project info load');
    await fetchTwitterData();
    
  } catch (err) {
    console.error('Error loading project data:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
    
    // После отображения основной информации о проекте 
    // Запускаем поиск асинхронно с небольшой задержкой
    setTimeout(() => {
      // Предзагрузка данных для поиска и запуск поиска асинхронно
      preloadAllFiles().then(() => {
        performProjectSearch();
      }).catch(error => {
        console.error('Ошибка при подготовке поиска:', error);
      });
    }, 100);
  }
});

// Очистка при размонтировании компонента
onUnmounted(() => {
  // Удаляем обработчик изменения размера окна
  window.removeEventListener('resize', handleResize);
  
  // Очищаем экземпляр Masonry
  if (masonryInstance.value) {
    masonryInstance.value.destroy();
    masonryInstance.value = null;
  }
});

const loadInvestorLogo = async (investor) => {
  try {
    investor.logoUrl = await getInvestorLogo(investor);
  } catch (error) {
    console.error(`Error loading logo for ${investor.name}:`, error);
  }
};
</script>

<style scoped>
.project-detail-page {
  background-color: #e4e7f0; /* Серый фон как в KOLs */
  color: #333; /* Более темный текст для читаемости */
  padding: 24px;
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

/* Шапка проекта */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #4285f4; /* Синяя линия как в KOLs */
}

.project-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.project-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #2c3d64; /* Более темный фон для логотипа */
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #4285f4; /* Синий цвет текста как в KOLs */
}

.project-ticker {
  color: #777;
  font-size: 0.7em;
  margin-left: 8px;
}

.project-links {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.link-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #4285f4; /* Синий фон для кнопок */
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: white;
  transition: background-color 0.2s;
}

.link-btn:hover {
  background-color: #1a73e8; /* Темно-синий при наведении */
}

.icon {
  font-size: 16px;
}

.project-header-right {
  display: flex;
}

.report-btn {
  background-color: #4285f4;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  text-decoration: none;
  display: inline-block;
}

.report-btn:hover {
  background-color: #1a73e8;
  text-decoration: none;
}

/* Колонки с данными */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.column {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-height: 120px; /* Reduced from 200px */
}

.column-header {
  background-color: #4285f4;
  padding: 8px 16px; /* Reduced padding */
}

.column-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: white;
}

.info-icon {
  font-size: 14px;
  opacity: 0.7;
}

.column-content {
  padding: 12px; /* Reduced padding */
}

.empty-state {
  padding: 12px;
  text-align: center;
  color: #777;
  font-size: 14px;
}

/* Инвесторы */
.investors-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
}

.investor-icons-container {
  display: flex;
  align-items: center;
  margin-bottom: 1px;
}

.investor-icon-wrapper {
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.investor-icon-wrapper:hover {
  transform: translateY(-2px);
  z-index: 10 !important;
}

.investor-logo {
  width: 40px;  /* Increased from 32px */
  height: 40px; /* Increased from 32px */
  border-radius: 50%;
  overflow: hidden;
  background-color: #fff;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.investor-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.investor-count {
  background-color: #f0f2f5;
  color: #4285f4;
  font-size: 14px;  /* Increased from 12px for better readability */
  font-weight: 500;
  width: 40px;  /* Increased from 32px */
  height: 40px; /* Increased from 32px */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -15px; /* Increased from -12px for better overlap */
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Performance */
.performance-data {
  padding: 12px; /* Reduced padding */
}

.performance-score {
  font-size: 24px; /* Reduced from 28px */
  font-weight: bold;
  color: #4285f4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.performance-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.status-strong {
  background-color: #4285f4; /* Синий для Strong */
  color: white;
}

.status-medium {
  background-color: #f57c00; /* Оранжевый для Medium */
  color: white;
}

.status-weak {
  background-color: #d32f2f; /* Красный для Weak */
  color: white;
}

.status-high {
  background-color: #4285f4;
  color: white;
}

.status-mid {
  background-color: #f57c00;
  color: white;
}

.status-low {
  background-color: #d32f2f;
  color: white;
}

.rank-info, .hashtag-info {
 font-size: 14px;
 color: #666;
 margin-bottom: 8px;
}

.performance-chart {
 margin: 12px 0;
}

.chart-track {
 height: 4px; /* Reduced from 6px */
 background-color: #f5f5f5;
 border-radius: 2px;
 position: relative;
 overflow: hidden;
 margin-bottom: 6px;
}

.track-gradient {
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background: linear-gradient(to right, 
   #d32f2f 0%,
   #f57c00 33%,
   #4285f4 66%,
   #4285f4 100%
 );
}

.track-marker {
 position: absolute;
 width: 10px; /* Reduced from 12px */
 height: 10px;
 border-radius: 50%;
 background-color: white;
 top: 50%;
 transform: translate(-50%, -50%);
 border: 2px solid #4285f4;
 box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.track-labels {
 display: flex;
 justify-content: space-between;
 font-size: 11px;
 color: #777;
 padding: 0 4px;
}

/* О проекте */
.about-project {
 background-color: white;
 border-radius: 8px;
 overflow: hidden;
 margin-bottom: 24px;
 box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.about-header {
 background-color: #4285f4; /* Синий заголовок */
 padding: 12px 16px;
}

.about-header h2 {
 margin: 0;
 font-size: 18px;
 font-weight: 500;
 display: flex;
 align-items: center;
 gap: 6px;
 color: white;
}

.ticker-small {
 color: rgba(255, 255, 255, 0.7);
 font-size: 0.9em;
}

.about-content {
 padding: 16px;
}

.about-content p {
 margin: 0 0 16px 0;
 line-height: 1.6;
 color: #333;
}

/* Ссылки */
.official-links {
 padding: 0 16px 16px;
}

.official-links h3 {
 font-size: 16px;
 font-weight: 500;
 margin: 0 0 12px 0;
 color: #4285f4;
}

.links-list {
 display: flex;
 flex-wrap: wrap;
 gap: 12px;
}

.official-link {
 display: flex;
 align-items: center;
 gap: 6px;
 padding: 6px 12px;
 background-color: #f5f7fa;
 border-radius: 4px;
 color: #4285f4;
 text-decoration: none;
 font-size: 14px;
 transition: background-color 0.2s;
}

.official-link:hover {
 background-color: #e4e7f0;
 text-decoration: underline;
}

.link-icon {
 font-size: 16px;
}

/* Категории */
.project-categories {
 padding: 0 16px 16px;
}

.project-categories h3 {
 font-size: 16px;
 font-weight: 500;
 margin: 16px 0 12px 0;
 color: #4285f4;
}

.category-tags {
 display: flex;
 flex-wrap: wrap;
 gap: 8px;
}

.category-tag {
 background-color: #f5f7fa;
 padding: 6px 12px;
 border-radius: 4px;
 font-size: 14px;
 color: #4285f4;
 border: 1px solid #4285f4;
}

/* Упоминания проекта - новый раздел */
.project-mentions {
 background-color: white;
 border-radius: 8px;
 overflow: hidden;
 margin-bottom: 24px;
 box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.mentions-header {
 background-color: #4285f4;
 padding: 12px 16px;
}

.mentions-header h2 {
 margin: 0;
 font-size: 18px;
 font-weight: 500;
 color: white;
}

.mentions-results {
 padding: 20px;
}

/* Настройки для Masonry */
.masonry-container {
 width: 100%;
 margin: 0 auto;
}

.post-container {
 width: calc(33.33% - 14px);
 margin-bottom: 20px;
 background-color: #f9f9f9;
 border-radius: 8px;
 padding: 16px;
 box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
 display: flex;
 flex-direction: column;
 box-sizing: border-box;
 transition: transform 0.2s, box-shadow 0.2s;
}

.post-container:hover {
 transform: translateY(-3px);
 box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.post-header {
 border-bottom: 1px solid #e4e7f0;
 padding-bottom: 10px;
 margin-bottom: 10px;
}

.channel-name {
 font-size: 16px;
 font-weight: 600;
 color: #4285f4;
 margin-bottom: 5px;
 text-decoration: none;
 display: inline-block;
}

.channel-name:hover {
 text-decoration: underline;
}

.post-date {
 font-size: 13px;
 color: #8b95b0;
}

.post-content {
 font-size: 14px;
 line-height: 1.5;
 margin-bottom: 20px;
 word-wrap: break-word;
 white-space: pre-wrap;
 flex-grow: 1;
}

.post-footer {
 margin-top: auto;
}

.post-stats {
 display: flex;
 justify-content: space-between;
 border-top: 1px solid #e4e7f0;
 padding-top: 10px;
 flex-wrap: wrap;
}

.post-stat {
 display: flex;
 align-items: center;
 color: #8b95b0;
 font-size: 13px;
}

.stat-icon {
 width: 16px;
 height: 16px;
 margin-right: 4px;
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
 padding: 30px 20px;
}

.no-results p:first-child {
 font-size: 16px;
 font-weight: 500;
 color: #333;
 margin-bottom: 10px;
}

.no-results p:last-child {
 color: #777;
 font-size: 14px;
}

.loading-indicator {
 display: flex;
 flex-direction: column;
 align-items: center;
 padding: 30px 0;
 color: #4285f4;
}

.spinner {
 width: 30px;
 height: 30px;
 border: 3px solid rgba(66, 133, 244, 0.3);
 border-radius: 50%;
 border-top-color: #4285f4;
 animation: spin 1s linear infinite;
 margin-bottom: 10px;
}

@keyframes spin {
 to { transform: rotate(360deg); }
}

/* Адаптивный дизайн */
@media (max-width: 1200px) {
 .post-container {
   width: calc(50% - 10px);
 }
}

@media (max-width: 768px) {
 .content-grid {
   grid-template-columns: 1fr;
 }
 
 .project-header {
   flex-direction: column;
   align-items: flex-start;
   gap: 16px;
 }
 
 .project-header-right {
   width: 100%;
 }
 
 .report-btn {
   width: 100%;
 }
 
 .post-container {
   width: 100%;
 }
}

/* New styles for Twitter metrics */
.twitter-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 16px 0;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #4285f4;
}

.loading-state {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state .spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(66, 133, 244, 0.3);
  border-radius: 50%;
  border-top-color: #4285f4;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.error-state {
  padding: 12px;
  text-align: center;
}

.retry-button {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-button:hover {
  background-color: #1a73e8;
}

.funds-raised {
  background-color: #f0f2f5;
  color: #4285f4;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  white-space: nowrap;
  margin-top: 10px;
}
</style>