<template>
  <div class="kol-detail-container">
    <div v-if="loading" class="loading">
      Загрузка данных...
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <div class="back-link">
        <a @click="goBack" class="back-button">← Back to the list</a>
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
              <!-- Левый блок: счётчик + иконки -->
              <div class="meta-left">
                <div class="subscribers-count">
                  {{ formatNumber(kolData.subscribers) }} followers
                </div>
                <div class="social-icons">
                  <a :href="`https://t.me/${kolData.username}`" target="_blank" class="social-icon telegram-icon" title="Telegram канал"></a>
                  <a v-if="socialLinks[kolId.toLowerCase()]?.twitter"
                    :href="socialLinks[kolId.toLowerCase()].twitter"
                    target="_blank"
                    class="social-icon twitter-icon"
                    title="Twitter/X"></a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="kol-description">
          <h2>About the channel</h2>
          <p>{{ kolData.description || 'Информация отсутствует' }}</p>
        </div>
        
        <div class="kol-stats-section">
          <div class="stats-and-chart">
            <div class="chart-header">
              <h3 class="chart-title">Followers and reach dynamics</h3>
              <!-- Перемещенный спидометр -->
              <Speedometer
                :value="meterValue"
                :kol-id="kolId"
                :size="120"
              />
            </div>
            <div class="chart-container">
              <CombinedChart 
                :subscribersData="subscribersHistory" 
                :viewsData="viewsHistory" 
                :width="800" 
                :height="300" 
              />
            </div>
          </div>
        </div>
        
        <!-- Блок "Дополнительные ссылки" удален -->
        
        <div class="back-link">
          <a @click="goBack" class="back-button">← Back to the list</a>
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
          <h2 class="post-header">Last post</h2>
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
import CombinedChart from '../components/CombinedChart.vue'
import Speedometer from '../components/Speedometer.vue'

export default {
  name: 'KOLDetailView',
  components: {
    CombinedChart,
    Speedometer
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // Define normalizeKolId function first to avoid reference error
    const normalizeKolId = (id) => {
      console.log(`Normalizing KOL ID: ${id}`);
      
      // Приводим к нижнему регистру и убираем пробелы
      let normalized = id.toLowerCase().replace(/\s+/g, '');
      
      // Специальные замены для известных проблемных случаев
      if (normalized === 'crypto_hacking' || normalized === 'cryptohacking') {
        normalized = 'crypto_hacklng';
        console.log(`Special case detected: ${id} -> ${normalized}`);
      }
      
      // Дополнительная проверка для обработки регистра
      if (id.toUpperCase() === 'CRYPTO_HACKING' || id.toUpperCase() === 'CRYPTO_HACKLNG') {
        normalized = 'crypto_hacklng';
        console.log(`Case-sensitive match: ${id} -> ${normalized}`);
      }
      
      console.log(`Final normalized ID: ${normalized}`);
      return normalized;
    };
    
    // Получаем значение параметра из URL и применяем нормализацию сразу
    const rawKolId = route.params.name || '';
    console.log(`Raw KOL ID from route: ${rawKolId}`);
    
    // Установка kolId
    const kolId = ref(rawKolId);
    
    // Нормализуем для API вызовов
    const apiKolId = ref(normalizeKolId(rawKolId));
    
    const kolData = ref({});
    const loading = ref(true);
    const error = ref('');
    const hasAvatar = ref(false);
    const avatarPath = ref('');
    const availableAvatars = ['idoresearch', 'defigencapital', 'tradeparty1337', 'XardMoney', 'crypton_off', 'crypto_hacklng']; 
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

    // спидометр
    const meterValue = computed(() => {
      const kolIdLower = kolId.value.toLowerCase();
      
      // Особые значения для конкретных KOL
      if (kolIdLower === 'idoresearch') {
        return 162; // Высокое значение (в красной/оранжевой зоне)
      } else if (kolIdLower === 'defigencapital') {
        return 0; // Низкое значение (в зеленой зоне)
      } else if (kolIdLower === 'tradeparty1337') {
        return 162; // Высокое значение (в красной/оранжевой зоне)
      } else if (kolIdLower === 'crypto_hacklng' || kolIdLower === 'crypto_hacking') {
        return 135; // Высокое значение (в оранжевой зоне)
      } else if (kolIdLower === 'crypton_off') {
        return 80; // Среднее значение (в желтой зоне)
      }
      
      // Для других KOL используем расчет по умолчанию
      if (subscribersHistory.value.length < 2) return 50;
      const prev = subscribersHistory.value[subscribersHistory.value.length - 2].value;
      const curr = subscribersHistory.value[subscribersHistory.value.length - 1].value;
      const pct = ((curr - prev) / prev) * 100;
      return Math.min(100, Math.max(0, pct));
    });

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
      try {
        console.log(`Checking avatar for: ${kolId.value}`);
        
        // Нормализуем ID для проверки наличия аватара
        const normalizedId = kolId.value.toLowerCase();
        
        // Специальная обработка для crypto_hacking/crypto_hacklng
        if (normalizedId === 'crypto_hacking' || normalizedId === 'crypto_hacklng') {
          hasAvatar.value = true;
          avatarPath.value = `/avatars/CRYPTO_HACKlNG.jpg`;
          console.log(`Special avatar path set for CRYPTO_HACKING: ${avatarPath.value}`);
          return;
        }
        
        // Проверяем по нормализованным значениям
        hasAvatar.value = availableAvatars.some(avatar => 
          avatar.toLowerCase() === normalizedId
        );
        
        if (hasAvatar.value) {
          avatarPath.value = `/avatars/${kolId.value}.jpg`;
          console.log(`Avatar path set to: ${avatarPath.value}`);
        } else {
          console.log(`No avatar found for: ${kolId.value}`);
        }
      } catch (error) {
        console.error('Error while checking avatar:', error);
        hasAvatar.value = false; // По умолчанию не показываем аватар в случае ошибки
      }
    };
    
    const formatNumber = (num) => {
      return new Intl.NumberFormat('ru-RU').format(num);
    };
    
    const formatPostDate = (dateStr) => {
      if (!dateStr) return '';
      
      try {
        // Проверяем формат даты YYYY-MM-DD
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (isoDateRegex.test(dateStr)) {
          const parts = dateStr.split('-');
          // Месяц в Date начинается с 0, поэтому вычитаем 1
          const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          
          if (!isNaN(date.getTime())) {
            return new Intl.DateTimeFormat('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).format(date);
          }
        }
        
        // Если это не стандартный формат, пробуем создать объект Date напрямую
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).format(date);
        }
        
        // Если дата некорректна, возвращаем текущую дату
        return new Intl.DateTimeFormat('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(new Date());
        
      } catch (e) {
        console.error('Ошибка форматирования даты:', e);
        // В случае ошибки возвращаем текущую дату
        return new Intl.DateTimeFormat('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(new Date());
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
    
    const loadSubscribersHistory = async () => {
      console.log(`----- LOADING SUBSCRIBER HISTORY -----`);
      console.log(`Loading subscriber history for KOL: ${kolId.value} (API KOL ID: ${apiKolId.value})`);
      
      // Пытаемся загрузить историю для конкретного KOL
      try {
        console.log(`Requesting data from: /api/kol/${apiKolId.value}`);
        const response = await fetch(`/api/kol/${apiKolId.value}`);
        console.log(`API Response status: ${response.status} for kol/${apiKolId.value}`);
        
        if (!response.ok) {
          console.error(`Error loading history data: ${response.statusText}`);
          subscribersHistory.value = [];
          viewsHistory.value = [];
          return;
        }
        
        const data = await response.json();
        console.log('Received history data (length):', data?.length);
        console.log('First few items:', data?.slice(0, 2));
        
        // Если данные есть
        if (data && data.length > 0) {
          // Данные уже в правильном формате {date, value, views}
          subscribersHistory.value = data.map(item => ({
            date: item.date,
            value: item.value
          }));
          
          // Обрабатываем просмотры из того же API ответа
          viewsHistory.value = data
            .filter(item => item.views !== null && item.views !== undefined)
            .map(item => ({
              date: item.date,
              value: item.views
            }));
          
          console.log(`Processed ${subscribersHistory.value.length} subscriber data points`);
          console.log(`Processed ${viewsHistory.value.length} views data points`);
          
          // Проверяем первый и последний элементы для отладки
          if (subscribersHistory.value.length > 0) {
            console.log('First subscriber entry:', subscribersHistory.value[0]);
            console.log('Last subscriber entry:', subscribersHistory.value[subscribersHistory.value.length - 1]);
          }
          
          if (viewsHistory.value.length > 0) {
            console.log('First views entry:', viewsHistory.value[0]);
            console.log('Last views entry:', viewsHistory.value[viewsHistory.value.length - 1]);
          }
        } else {
          console.warn('API returned no data');
          subscribersHistory.value = [];
          viewsHistory.value = [];
        }
        
      } catch (error) {
        console.error('Error in loadSubscribersHistory:', error);
        subscribersHistory.value = [];
        viewsHistory.value = [];
      }
      console.log(`----- END SUBSCRIBER HISTORY LOADING -----`);
    };
    
    const loadKOLData = async () => {
      try {
        // Запрос к вашему API
        const response = await fetch('/api/channel-info');
        if (!response.ok) {
          throw new Error('Ошибка при получении данных');
        }
        
        const data = await response.json();
        
        // Находим KOL по ID (имени с нижним регистром и без пробелов)
        let found = false;
        
        for (const item of data) {
          // Для отладки выводим строку, которую обрабатываем
          console.log(`Processing item: ${item}`);
          
          // Новый алгоритм разбора строки
          // Предполагаем, что последняя часть - это число подписчиков
          // Первые две части - username и name
          const lastCommaIndex = item.lastIndexOf(',');
          if (lastCommaIndex === -1) continue; // Пропускаем некорректные строки
          
          // Извлекаем количество подписчиков (последняя часть)
          const subscribersStr = item.substring(lastCommaIndex + 1).trim();
          const subscribers = parseInt(subscribersStr, 10) || 0;
          
          // Используем регулярное выражение для извлечения первых двух частей
          const firstPartsMatch = item.substring(0, lastCommaIndex).match(/^([^,]+),\s*([^,]+)/);
          if (!firstPartsMatch) continue;
          
          const username = firstPartsMatch[1].trim();
          const name = firstPartsMatch[2].trim();
          
          // Извлекаем описание (все, что между name и subscribers)
          const nameEndIndex = item.indexOf(name) + name.length;
          const description = item.substring(nameEndIndex + 1, lastCommaIndex).trim();
          
          // Нормализуем имя для сравнения
          const normalizedUsername = username.toLowerCase().replace(/\s+/g, '');
          
          // Расширяем условие совпадения для особых случаев
          const matchCrypto = (normalizedUsername === 'crypto_hacklng' && apiKolId.value === 'crypto_hacklng') || 
                             (normalizedUsername === 'crypto_hacking' && apiKolId.value === 'crypto_hacklng');
                              
          if (normalizedUsername === apiKolId.value || matchCrypto || 
              normalizedUsername.includes(apiKolId.value) || apiKolId.value.includes(normalizedUsername)) {
            found = true;
            console.log(`KOL found: ${username} (matched with ${kolId.value}, apiKolId: ${apiKolId.value})`);
            console.log(`Parsed data: username=${username}, name=${name}, subscribers=${subscribers}`);
            console.log(`Description: ${description}`);
            
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
        const response = await fetch('/api/kolastpost');
        if (!response.ok) {
          throw new Error('Ошибка при получении данных о постах');
        }
        
        const allPosts = await response.json();
        
        // Получаем текущий ID канала в нижнем регистре
        const kolIdLower = apiKolId.value;
        
        // Ищем точное совпадение по имени
        let currentKolPost = allPosts.find(post => 
          post.kolName.toLowerCase() === kolIdLower
        );
        
        // Если точное совпадение не найдено, ищем частичное совпадение
        if (!currentKolPost) {
          currentKolPost = allPosts.find(post => 
            post.kolName.toLowerCase().includes(kolIdLower) || 
            kolIdLower.includes(post.kolName.toLowerCase())
          );
        }
        
        if (currentKolPost) {
          // Форматируем дату, если она некорректна
          if (!currentKolPost.date || !currentKolPost.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            currentKolPost.date = new Date().toISOString().split('T')[0];
          }
          
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
    onMounted(async () => {
      try {
        console.log(`Component mounted, kolId: ${kolId.value}, apiKolId: ${apiKolId.value}`);
        
        // Проверяем наличие аватара
        checkAvatar();
        
        // Сначала загружаем данные о KOL, чтобы получить актуальное количество подписчиков
        await loadKOLData();
        
        // После получения данных о KOL загружаем остальное
        await loadLastPost();
      } catch (error) {
        console.error('Error during component initialization:', error);
        // Устанавливаем состояние ошибки
        loading.value = false;
        error.value = 'Произошла ошибка при загрузке данных. Попробуйте обновить страницу.';
      }
    });

    return {
      meterValue,
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

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Изменено с center на flex-start */
  margin-top: 10px;
  gap: 10px; /* Добавлено - расстояние между заголовком и спидометром */
}

.chart-title {
  margin: 0;
  font-size: 18px;
  color: #4285f4;
}


.views-chart-container {
  margin-top: 20px;
}

.views-chart-container .chart-title {
  color: #EA4335; /* Красный цвет для отличия от графика подписчиков */
}

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
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 16px;   /* расстояние между подписчиками и иконками */
}

.subscribers-count {
  font-size: 14px;
  color: #4285f4;
  font-weight: 500;
  margin-right: 15px;
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
 flex-direction: column;
 background-color: #ffffff;
 border-radius: 8px;
 padding: 20px;
 box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.stats-container {
 display: flex;
 justify-content: space-between;
 gap: 15px;
 padding-right: 0;
 padding-bottom: 20px;
 border-bottom: 1px solid #e4e7f0;
}

.stat-card {
 flex: 1;
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