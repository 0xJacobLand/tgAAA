// Сервис для работы с проектами
const BASE_URL = '/api';

// Данные для тестирования, если API недоступен
const mockProjects = [
  { name: 'Kaito', mentions: 28 },
  { name: 'IQ', mentions: 22 },
  { name: 'Berachain', mentions: 18 },
  { name: 'Eclipse', mentions: 12 },
  { name: 'Initia', mentions: 10 },
  { name: 'Monad', mentions: 9 },
  { name: 'Multipli', mentions: 7 },
  { name: 'OG', mentions: 15 },
  { name: 'Sui', mentions: 14 },
  { name: 'ZKsync', mentions: 11 },
  { name: 'Linea', mentions: 8 },
  { name: 'Starknet', mentions: 13 },
  { name: 'Blast', mentions: 6 },
  { name: 'Polygon', mentions: 5 },
  { name: 'Scroll', mentions: 4 },
  { name: 'Base', mentions: 3 }
];

// Детальные данные о проектах для тестирования
const mockProjectDetails = {
  'carv': {
    name: 'carv',
    ticker: 'CRV',
    mentions: 15,
    description: 'OG - это инновационный проект в блокчейн-пространстве, фокусирующийся на создании масштабируемых и эффективных решений для децентрализованных приложений.',
    website: 'https://og.xyz',
    twitter: 'https://twitter.com/og_blockchain',
    tgPerformance: {
      score: 1050,
      status: 'Strong',
      rank: '#328',
      hashtag: '#OG'
    },
    xPerformance: {
      score: 980,
      status: 'Strong',
      rank: '#412',
      hashtag: '#OG'
    },
    investors: [
      {
        name: "YZi Labs",
        type: "Exchange",
        tier: 1,
        rating: 3
      },
      {
        name: "Crypto Ventures",
        type: "VC",
        tier: 2,
        rating: 2
      }
    ],
    mainCategories: ["Modular Blockchain"],
    subCategories: ["Infrastructure", "Layer 2"]
  },
  'kaito': {
    name: 'Kaito',
    ticker: 'KAITO',
    mentions: 28,
    description: 'Kaito - платформа для разработки и внедрения смарт-контрактов с улучшенной безопасностью и производительностью.',
    website: 'https://kaito.io',
    twitter: 'https://twitter.com/kaito_blockchain',
    tgPerformance: {
      score: 1250,
      status: 'Strong',
      rank: '#124',
      hashtag: '#Kaito'
    },
    xPerformance: {
      score: 1100,
      status: 'Strong',
      rank: '#215',
      hashtag: '#Kaito'
    },
    investors: [
      {
        name: "Blockchain Capital",
        type: "VC",
        tier: 1,
        rating: 3
      }
    ],
    mainCategories: ["DeFi Protocols"],
    subCategories: ["Smart Contracts", "Security"]
  },
  'iq': {
    name: 'IQ',
    ticker: 'IQ',
    mentions: 22,
    description: 'IQ - это проект, направленный на использование искусственного интеллекта в блокчейн-решениях для оптимизации и автоматизации процессов.',
    website: 'https://iq.network',
    twitter: 'https://twitter.com/iq_network',
    tgPerformance: {
      score: 1174,
      status: 'Strong',
      rank: '#824',
      hashtag: '#IQ'
    },
    xPerformance: {
      score: 1174,
      status: 'Strong',
      rank: '#824',
      hashtag: '#IQ'
    },
    investors: [
      {
        name: "Digital Currency Group",
        type: "Investment Firm",
        tier: 1,
        rating: 3
      },
      {
        name: "Pantera Capital",
        type: "VC",
        tier: 2,
        rating: 2
      }
    ],
    mainCategories: ["AI & Blockchain"],
    subCategories: ["Data Processing", "Smart Contracts"]
  }
};

/**
 * Получить все проекты
 * @returns {Promise<Array>} Массив проектов
 */
export async function getAllProjects() {
  try {
    const response = await fetch(`${BASE_URL}/projects`);
    
    if (!response.ok) {
      throw new Error('Не удалось загрузить список проектов');
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Используем мок-данные для списка проектов:', error);
    return Promise.resolve(mockProjects);
  }
}

/**
 * Получить данные конкретного проекта
 * @param {string} projectId - Идентификатор проекта
 * @returns {Promise<Object>} Данные проекта
 */
export async function getProjectById(projectId) {
  try {
    const response = await fetch(`${BASE_URL}/projects/${projectId.toLowerCase()}`);
    
    if (!response.ok) {
      throw new Error(`Проект ${projectId} не найден`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`Используем мок-данные для проекта ${projectId}:`, error);
    
    // Получаем данные из мок-базы или генерируем базовые данные
    const mockData = mockProjectDetails[projectId.toLowerCase()];
    
    if (mockData) {
      return Promise.resolve(mockData);
    }
    
    // Если нет данных в моках, генерируем базовые данные
    const baseProject = {
      name: projectId.charAt(0).toUpperCase() + projectId.slice(1),
      ticker: projectId.toUpperCase(),
      mentions: Math.floor(Math.random() * 20) + 1,
      description: `${projectId} - это инновационный блокчейн-проект, ориентированный на масштабируемость и безопасность.`,
      website: `https://${projectId.toLowerCase()}.xyz`,
      twitter: `https://twitter.com/${projectId.toLowerCase()}`,
      tgPerformance: {
        score: Math.floor(Math.random() * 1500),
        status: ['Strong', 'Medium', 'Weak'][Math.floor(Math.random() * 3)],
        rank: `#${Math.floor(Math.random() * 1000)}`,
        hashtag: `#${projectId}`
      },
      xPerformance: {
        score: Math.floor(Math.random() * 1500),
        status: ['Strong', 'Medium', 'Weak'][Math.floor(Math.random() * 3)],
        rank: `#${Math.floor(Math.random() * 1000)}`,
        hashtag: `#${projectId}`
      },
      investors: [
        {
          name: "Generic Investor",
          type: "VC",
          tier: Math.floor(Math.random() * 3) + 1,
          rating: Math.floor(Math.random() * 3) + 1
        }
      ],
      mainCategories: ["Blockchain"],
      subCategories: ["Infrastructure"]
    };
    
    return Promise.resolve(baseProject);
  }
}