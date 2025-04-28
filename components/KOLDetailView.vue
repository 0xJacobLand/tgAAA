<template>
  <div class="kol-detail-container">
    <div v-if="loading" class="loading">
      Загрузка данных...
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <div class="back-link">
        <a @click="goBack" class="back-button">← Вернуться к списку</a>
      </div>
    </div>
    
    <div v-else class="kol-content-wrapper">
      <!-- Основной контент KOL (левая колонка) -->
      <div class="kol-content">
        <div class="kol-header">
          <div class="kol-avatar">
            <img v-if="hasAvatar" :src="avatarPath" :alt="kolData.name">
            <span v-else>{{ avatarLetter }}</span>
          </div>
          <div class="kol-title">
            <h1 class="kol-name">{{ kolData.name }}</h1>
            <div class="kol-meta">
              <div class="social-icons">
                <a :href="`https://t.me/${kolData.username}`" target="_blank" class="social-icon telegram-icon" title="Telegram канал"></a>
                <a v-if="socialLinks[kolId.toLowerCase()]?.twitter" :href="socialLinks[kolId.toLowerCase()].twitter" target="_blank" class="social-icon twitter-icon" title="Twitter/X"></a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="kol-description">
          <h2>О канале</h2>
          <p>{{ kolData.description || 'Информация отсутствует' }}</p>
        </div>
        
        <div class="kol-stats-section">
          <div class="stats-and-chart">
            <div class="stats-container">
              <div class="stat-card">
                <div class="stat-value positive">{{ formatNumber(kolData.subscribers) }}</div>
                <div class="stat-label">Подписчиков</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-value positive">{{ kolData.mentionsCount || 0 }}</div>
                <div class="stat-label">Упоминаний за 30 дней</div>
              </div>
            </div>
            
            <div v-if="subscribersHistory.length > 0" class="chart-container">
              <h3 class="chart-title">Динамика подписчиков</h3>
              <SimpleSubscribersChart :data="subscribersHistory" />
              <div class="chart-info">
                <span class="chart-current">Текущее значение: <strong>{{ formatNumber(subscribersHistory[subscribersHistory.length - 1]?.value || 0) }}</strong></span>
                <span v-if="subscribersHistory.length > 1" class="chart-growth" :class="growthClass">
                  {{ growthValue }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Блок "Дополнительные ссылки" удален -->
        
        <div class="back-link">
          <a @click="goBack" class="back-button">← Вернуться к списку</a>
        </div>
      </div>
      
      <!-- Блок с последним постом (правая колонка) -->
      <div class="last-post-sidebar">
        <div v-if="lastPostLoading" class="loading">
          Загрузка последнего поста...
        </div>
        
        <div v-else-if="lastPostError" class="error-message post-error">
          <p>{{ lastPostError }}</p>
        </div>
        
        <div v-else-if="lastPost" class="post-container">
          <h2 class="post-header">Последний пост</h2>
          <div class="post-date">{{ formatPostDate(lastPost.date) }}</div>
          <div class="post-content">{{ lastPost.content }}</div>
          
          <div class="post-stats">
            <div class="post-stat">
              <div class="stat-icon comments-icon"></div>
              <span>{{ lastPost.stats ? lastPost.stats.split(',')[0] : '0' }}</span>
            </div>
            
            <div class="post-stat">
              <div class="stat-icon reactions-icon"></div>
              <span>{{ lastPost.stats ? lastPost.stats.split(',')[1] : '0' }}</span>
            </div>
            
            <div class="post-stat">
              <div class="stat-icon reposts-icon"></div>
              <span>{{ lastPost.stats ? lastPost.stats.split(',')[2] : '0' }}</span>
            </div>
            
            <div class="post-stat">
              <div class="stat-icon views-icon"></div>
              <span>{{ lastPost.stats ? lastPost.stats.split(',')[3] : '0' }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="no-post-message">
          Нет доступных постов
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SimpleSubscribersChart from '../components/SimpleSubscribersChart.vue'
import SimpleViewsChart from '../components/SimpleViewsChart.vue'

export default {
  name: 'KOLDetailView',
  components: {
    SimpleSubscribersChart,
    SimpleViewsChart
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const kolId = ref(route.params.name || '');
    const kolData = ref({});
    const loading = ref(true);
    const error = ref('');
    const hasAvatar = ref(false);
    const avatarPath = ref('');
    const availableAvatars = ['idoresearch', 'defigencapital']; 
    const subscribersHistory = ref([]);
    const viewsHistory = ref([]);
    
    // Ссылки на социальные сети для разных KOL
    const socialLinks = {
      idoresearch: {
        twitter: 'https://x.com/Leo_NFD'
      },
      defigencapital: {
        twitter: 'https://x.com/defigen'
      }
    };
    
    // Данные для последнего поста
    const lastPost = ref(null);
    const lastPostLoading = ref(true);
    const lastPostError = ref('');
    
    // Рассчет прироста подписчиков
    const growthValue = computed(() => {
      if (subscribersHistory.value.length < 2) return '';
      
      const currentValue = subscribersHistory.value[subscribersHistory.value.length - 1].value;
      const previousValue = subscribersHistory.value[subscribersHistory.value.length - 2].value;
      const diff = currentValue - previousValue;
      
      const percentChange = (diff / previousValue) * 100;
      
      if (diff > 0) {
        return `+${formatNumber(diff)} (${percentChange.toFixed(1)}%)`;
      } else if (diff < 0) {
        return `${formatNumber(diff)} (${percentChange.toFixed(1)}%)`;
      } else {
        return 'Без изменений';
      }
    });
    
    const growthClass = computed(() => {
      if (subscribersHistory.value.length < 2) return '';
      
      const currentValue = subscribersHistory.value[subscribersHistory.value.length - 1].value;
      const previousValue = subscribersHistory.value[subscribersHistory.value.length - 2].value;
      const diff = currentValue - previousValue;
      
      if (diff > 0) {
        return 'positive-growth';
      } else if (diff < 0) {
        return 'negative-growth';
      } else {
        return 'neutral-growth';
      }
    });
    
    // Рассчет прироста просмотров
    const viewsGrowthValue = computed(() => {
      if (viewsHistory.value.length < 2) return '';
      
      const currentValue = viewsHistory.value[viewsHistory.value.length - 1].value;
      const previousValue = viewsHistory.value[viewsHistory.value.length - 2].value;
      const diff = currentValue - previousValue;
      
      const percentChange = (diff / previousValue) * 100;
      
      if (diff > 0) {
        return `+${formatNumber(diff)} (${percentChange.toFixed(1)}%)`;
      } else if (diff < 0) {
        return `${formatNumber(diff)} (${percentChange.toFixed(1)}%)`;
      } else {
        return 'Без изменений';
      }
    });
    
    const viewsGrowthClass = computed(() => {
      if (viewsHistory.value.length < 2) return '';
      
      const currentValue = viewsHistory.value[viewsHistory.value.length - 1].value;
      const previousValue = viewsHistory.value[viewsHistory.value.length - 2].value;
      const diff = currentValue - previousValue;
      
      if (diff > 0) {
        return 'positive-growth';
      } else if (diff < 0) {
        return 'negative-growth';
      } else {
        return 'neutral-growth';
      }
    });
    
    const avatarLetter = computed(() => {
      return kolData.value.name ? kolData.value.name.charAt(0).toUpperCase() : '';
    });
    
    const checkAvatar = () => {
      hasAvatar.value = availableAvatars.includes(kolId.value);
      if (hasAvatar.value) {
        avatarPath.value = `/avatars/${kolId.value}.jpg`;
      }
    };
    
    const formatNumber = (num) => {
      return new Intl.NumberFormat('ru-RU').format(num);
    };
    
    const formatPostDate = (dateStr) => {
      if (!dateStr) return '';
      
      try {
        // Если дата в формате YYYY-MM-DD
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const date = new Date(parts[0], parts[1] - 1, parts[2]);
          return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).format(date);
        }
        return dateStr;
      } catch (e) {
        return dateStr;
      }
    };
    
    const extractTelegramUrls = (description) => {
      // Ищем URL Telegram канала/чата
      const telegramRegex = /https:\/\/t\.me\/([^\s,]+)/g;
      const matches = [...description.matchAll(telegramRegex)];
      
      const urls = {
        telegramUrl: null,
        chatUrl: null
      };
      
      if (matches.length > 0) {
        // Если в описании есть слово "чат" рядом с URL, то это чат, иначе канал
        matches.forEach(match => {
          const fullUrl = match[0];
          const surroundingText = description.substring(
            Math.max(0, description.indexOf(fullUrl) - 10),
            Math.min(description.length, description.indexOf(fullUrl) + fullUrl.length + 10)
          );
          
          if (surroundingText.toLowerCase().includes('чат')) {
            urls.chatUrl = fullUrl;
          } else {
            urls.telegramUrl = fullUrl;
          }
        });
      }
      
      return urls;
    };
    
    const loadSubscribersHistory = () => {
      let historyData = '';
      let viewsData = [];
      
      // Проверяем, какой KOL и загружаем соответствующие данные
      if (kolId.value.toLowerCase() === 'idoresearch') {
        // Данные для IDO Research (без апреля 2025, его возьмем из API)
        historyData = `April 2021, 377
January 2022, 23578
February 2022, 25315
Mart 2022, 26188
April 2022, 27017
May 2022, 42500
June 2022, 43750
July 2022, 44351
August 2022, 43775
September 2022, 43129
October 2022, 44193
November 2022, 52706
December 2022, 52559
January 2023, 55793
February 2023, 54176
March 2023, 54954
April 2023, 56340
May 2023, 56221
June 2023, 56250
July 2023, 56049
August 2023, 56069
September 2023, 55629
October 2023, 54980
November 2023, 54525
December 2023, 54785
January 2024, 60405
February 2024, 60939
march 2024, 65518
April 2024, 66140
May 2024, 66590
June 2024, 66772
July 2024, 67735
August 2024, 67000
September 2024, 66683
October 2024, 66253
November 2024, 65455
December 2024, 65965
January 2025, 73000
February 2025, 74301
March 2025, 73578`;
      } else if (kolId.value.toLowerCase() === 'defigencapital') {
        // Данные для DefiGen Capital с охватами
        historyData = `November 2022, 437, 300
December 2022, 7500, 5900
January 2023, 7681, 5300
February 2023, 8025, 6900
March 2023, 9140, 7300
April 2023, 12495, 8500
May 2023, 13369, 11500
June 2023, 14265, 11800
July 2023, 15029, 10000
August 2023, 16557, 18400
September 2023, 17742, 13300
October 2023, 17668, 12000
November 2023, 17717, 15182
December 2023, 17749, 15000
January 2024, 18001, 13600
February 2024, 18105, 12300
March 2024, 20422, 13100
April 2024, 22190, 13500
May 2024, 23665, 13700
June 2024, 24362, 15000
July 2024, 25521, 15600
August 2024, 25297, 14000
September 2024, 25370, 12000
October 2024, 25611, 11000
November 2024, 25480, 13000
December 2024, 26569, 12000
January 2025, 26790, 12300
February 2025, 27190, 12000
March 2025, 27317, 12000`;
      } else if (kolId.value.toLowerCase() === 'crypto_hacking') {
        // Данные для CRYPTO_HACKING с охватами
        historyData = `May 2024, 0, 0
June 2024, 38000, 6000
July 2024, 91000, 8500
August 2024, 151000, 10500
September 2024, 434000, 50000
October 2024, 275000, 19000
November 2024, 235000, 13000
December 2024, 180000, 11500
January 2025, 159000, 11500
February 2025, 142000, 10500
March 2025, 127500, 11500`;
      }
      
      // Если есть данные для текущего KOL, парсим их
      if (historyData) {
        const lines = historyData.trim().split('\n');
        const parsedData = [];
        const parsedViewsData = [];
        
        lines.forEach(line => {
          const parts = line.split(', ');
          const dateStr = parts[0];
          const subscribersValue = parseInt(parts[1].trim(), 10);
          
          parsedData.push({
            date: dateStr,
            value: subscribersValue
          });
          
          // Если есть данные по охватам (для defigencapital)
          if (parts.length > 2 && parts[2]) {
            parsedViewsData.push({
              date: dateStr,
              value: parseInt(parts[2].trim(), 10)
            });
          }
        });
        
        // Добавляем апрель 2025 из актуальных данных API для подписчиков
        if (kolData.value && kolData.value.subscribers) {
          parsedData.push({
            date: 'April 2025',
            value: kolData.value.subscribers
          });
          
          // Если это defigencapital, добавляем последний охват
          if (kolId.value.toLowerCase() === 'defigencapital') {
            parsedViewsData.push({
              date: 'April 2025',
              value: 10500 // Последнее значение из предоставленных данных
            });
          }
        }
        
        subscribersHistory.value = parsedData;
        viewsHistory.value = parsedViewsData;
      } else {
        // Если данных нет, очищаем историю
        subscribersHistory.value = [];
        viewsHistory.value = [];
      }
    };
    
        const loadKOLData = async () => {
      try {
        // Запрос к вашему API
        const response = await fetch('http://localhost:3000/api/channel-info');
        if (!response.ok) {
          throw new Error('Ошибка при получении данных');
        }
        
        const data = await response.json();
        
        // Находим KOL по ID (имени с нижним регистром и без пробелов)
        let found = false;
        
        for (const item of data) {
          const parts = item.split(', ');
          const username = parts[0]; // username (ник) канала
          const name = parts[1]; // полное имя канала
          
          // Нормализуем имя для сравнения
          const normalizedUsername = username.toLowerCase().replace(/\s+/g, '');
          
          if (normalizedUsername === kolId.value.toLowerCase()) {
            found = true;
            
            // Извлекаем описание (все части кроме первой, второй и последней)
            const description = parts.slice(2, parts.length - 1).join(', ');
            
            // Извлекаем количество подписчиков (последняя часть)
            const subscribers = parseInt(parts[parts.length - 1], 10) || 0;
            
            // Извлекаем URL Telegram канала/чата из описания, если есть
            const telegramUrls = extractTelegramUrls(description);
            
            // Получаем данные о количестве упоминаний из другого API
            let mentionsCount = 0;
            try {
              const mentionsResponse = await fetch('/api/kol30');
              if (mentionsResponse.ok) {
                const mentionsData = await mentionsResponse.json();
                
                // Ищем совпадение по имени
                for (const mention of mentionsData) {
                  const mentionParts = mention.name.split(', ');
                  const mentionName = mentionParts[0];
                  
                  if (mentionName.toLowerCase().includes(normalizedUsername) || 
                      normalizedUsername.includes(mentionName.toLowerCase())) {
                    mentionsCount = parseInt(mentionParts[1] || 0, 10);
                    break;
                  }
                }
              }
            } catch (mentionError) {
              console.error('Ошибка при загрузке данных о упоминаниях:', mentionError);
            }
            
            kolData.value = {
              username,
              name,
              description,
              subscribers,
              mentionsCount,
              ...telegramUrls
            };
            
            // Загружаем историю подписчиков
            loadSubscribersHistory();
            
            break;
          }
        }
        
        if (!found) {
          error.value = 'KOL не найден';
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных о KOL:', err);
        error.value = 'Ошибка при загрузке данных. Пожалуйста, попробуйте позже.';
      } finally {
        loading.value = false;
      }
    };
    
    // Функция для загрузки последнего поста
    const loadLastPost = async () => {
      lastPostLoading.value = true;
      lastPostError.value = '';
      
      try {
        const response = await fetch('http://localhost:3000/api/kolastpost');
        if (!response.ok) {
          throw new Error('Ошибка при получении данных о постах');
        }
        
        const allPosts = await response.json();
        
        // Находим пост, соответствующий текущему KOL
        const currentKolPost = allPosts.find(post => 
          post.kolName.toLowerCase() === kolId.value.toLowerCase()
        );
        
        if (currentKolPost) {
          lastPost.value = currentKolPost;
        } else {
          lastPostError.value = 'Посты не найдены';
        }
      } catch (err) {
        console.error('Ошибка при загрузке последнего поста:', err);
        lastPostError.value = 'Не удалось загрузить последний пост';
      } finally {
        lastPostLoading.value = false;
      }
    };
    
    const goBack = () => {
      router.push('/kols');
    };
    
    // Изменение порядка загрузки данных
    onMounted(() => {
      checkAvatar();
      // Сначала загружаем данные о KOL, чтобы получить актуальное количество подписчиков
      loadKOLData()
        .then(() => {
          // После получения данных о KOL загружаем остальное
          loadLastPost();
        });
    });
    
    return {
      kolId,
      kolData,
      loading,
      error,
      hasAvatar,
      avatarPath,
      avatarLetter,
      subscribersHistory,
      viewsHistory,
      lastPost,
      lastPostLoading,
      lastPostError,
      formatNumber,
      formatPostDate,
      growthValue,
      growthClass,
      viewsGrowthValue,
      viewsGrowthClass,
      socialLinks,
      goBack
    };
  }
}
</script>

<style scoped>
.kol-detail-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

.kol-content-wrapper {
  display: flex;
  gap: 30px;
}

.kol-content {
  flex: 2;
  background-color: #e4e7f0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  color: #2c3d64;
  padding: 20px;
}

.last-post-sidebar {
  flex: 1;
  background-color: #e4e7f0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  color: #2c3d64;
  padding: 20px;
  max-width: 380px;
  align-self: flex-start;
  position: sticky;
  top: 20px;
}

.kol-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #4285f4;
}

.kol-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #2c3d64;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  color: #e4e7f0;
  margin-right: 20px;
  overflow: hidden;
  flex-shrink: 0;
}

.kol-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kol-title {
  display: flex;
  flex-direction: column;
}

.kol-name {
  font-size: 24px;
  font-weight: 600;
  color: #4285f4;
  margin: 0 0 5px 0;
}

.kol-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.kol-username {
  font-size: 14px;
  color: #8b95b0;
  font-weight: 400;
}

.social-icons {
  display: flex;
  gap: 12px;
}

.social-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-block;
  transition: all 0.2s ease;
  background-color: #e4e7f0;
  position: relative;
}

.social-icon:hover {
  transform: scale(1.1);
  background-color: #d1d6e6;
}

.telegram-icon::before, .twitter-icon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background-color: #4285f4;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.telegram-icon::before {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='50' height='50' viewBox='0 0 50 50'%3E%3Cpath d='M46.137,6.552c-0.75-0.636-1.928-0.727-3.146-0.238l-0.002,0C41.708,6.828,6.728,21.832,5.304,22.445c-0.259,0.09-2.521,0.934-2.288,2.814c0.208,1.695,2.026,2.397,2.248,2.478l8.893,3.045c0.59,1.964,2.765,9.21,3.246,10.758c0.3,0.965,0.789,2.233,1.646,2.494c0.752,0.29,1.5,0.025,1.984-0.355l5.437-5.043l8.777,6.845l0.209,0.125c0.596,0.264,1.167,0.396,1.712,0.396c0.421,0,0.825-0.079,1.211-0.237c1.315-0.54,1.841-1.793,1.896-1.935l6.556-34.077C47.231,7.933,46.675,7.007,46.137,6.552z M22,32l-3,8l-3-10l23-17L22,32z'%3E%3C/path%3E%3C/svg%3E");
}

.twitter-icon::before {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E");
}

.kol-stats-section {
  margin-bottom: 30px;
}

.stats-and-chart {
  display: flex;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.stats-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
  padding-right: 20px;
  border-right: 1px solid #e4e7f0;
}

.charts-container {
  flex: 2;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-container {
  width: 100%;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 10px 0;
  color: #4285f4;
}

.chart-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e4e7f0;
  font-size: 14px;
}

.chart-current {
  color: #2c3d64;
}

.chart-growth {
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
}

.positive-growth {
  color: #34a853;
  background-color: rgba(52, 168, 83, 0.1);
}

.negative-growth {
  color: #ea4335;
  background-color: rgba(234, 67, 53, 0.1);
}

.neutral-growth {
  color: #8b95b0;
  background-color: rgba(139, 149, 176, 0.1);
}

.stat-card {
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f7fa;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #8b95b0;
}

.positive {
  color: #4285f4;
}

.kol-description, .kol-social {
  margin-bottom: 30px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.kol-description h2, .kol-social h2 {
  color: #4285f4;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 20px;
}

.social-links {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.social-link {
  display: inline-flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
  color: #4285f4;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.social-link:hover {
  background-color: #e6e9f0;
}

.telegram::before, .telegram-chat::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  background-color: #4285f4;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20.572 3.022c.92-.151 1.828.267 2.28 1.05.455.787.421 1.756-.089 2.509l-5.514 8.123c-.417.613-1.122.98-1.872.98h-3.252l-2.682 4.27c-.159.251-.45.374-.738.305l.276-4.08.063-.402.245-.394 1.598-2.582 2.216-3.402c.302-.465.82-.721 1.373-.721h3.989l1.267-2.18c.764-1.357 2.304-1.991 3.707-1.737l-1.867 3.217h-3.654c-.09 0-.174.047-.22.121l-2.216 3.402h3.09c.09 0 .174-.047.22-.121l4.582-7.671.074-.127c.151-.263.145-.586-.016-.842-.163-.257-.452-.406-.754-.376l.184-.322z'/%3E%3C/svg%3E");
}

.back-link {
  margin-top: 30px;
}

.back-button {
  display: inline-block;
  color: #4285f4;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}

.back-button:hover {
  text-decoration: underline;
}

.loading, .error-message {
  padding: 30px;
  text-align: center;
  font-size: 16px;
}

.loading {
  color: #8b95b0;
}

.error-message {
  color: #de5246;
}

/* Стили для блока с последним постом */
.post-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.post-header {
  font-size: 20px;
  font-weight: 600;
  color: #4285f4;
  margin-top: 0;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7f0;
}

.post-date {
  font-size: 14px;
  color: #8b95b0;
  margin-bottom: 15px;
}

.post-content {
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 20px;
  word-wrap: break-word;
  white-space: pre-wrap;
  max-height: 450px;
  overflow-y: auto;
}

.post-stats {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #e4e7f0;
  padding-top: 15px;
}

.post-stat {
  display: flex;
  align-items: center;
  color: #8b95b0;
  font-size: 14px;
  font-weight: 500;
}

.stat-icon {
  width: 20px;
  height: 20px;
  margin-right: 6px;
  background-color: #8b95b0;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.comments-icon {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M17,7H13V9H17V13H19V9A2,2 0 0,0 17,7M7,7A2,2 0 0,0 5,9V13H7V9H11V7H7Z'/%3E%3C/svg%3E");
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

.post-error {
  padding: 15px;
  font-size: 14px;
}

.no-post-message {
  text-align: center;
  padding: 30px 20px;
  color: #8b95b0;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Адаптивная верстка */
@media (max-width: 1024px) {
  .kol-content-wrapper {
    flex-direction: column;
  }
  
  .last-post-sidebar {
    max-width: none;
    position: static;
  }
}

@media (max-width: 768px) {
  .stats-and-chart {
    flex-direction: column;
  }
  
  .stats-container {
    flex-direction: row;
    padding-right: 0;
    padding-bottom: 20px;
    border-right: none;
    border-bottom: 1px solid #e4e7f0;
  }
  
  .chart-container {
    padding-left: 0;
    padding-top: 20px;
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