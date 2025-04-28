<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="main-title"><span class="dark-text">tgAist –</span> <span class="highlight">The Ultimate Telegram Analytics Platform</span></h1>
        <p class="tagline">Effortlessly collect, track, and analyze trends, topics, and influencers across millions of Telegram messages. Transform unstructured conversations into clear, actionable insights—enabling smarter, faster decisions and effective strategies.</p>
      </div>
      <div class="analytics-image-container">
        <img src="../assets/analytics-ducks.png" alt="Telegram Analytics Dashboard with Duck Characters" class="analytics-image" />
      </div>
    </div>

    <div class="content-section">
      <div class="why-section">
        <div class="why-container">
          <div class="why-image-container">
            <img src="../assets/telegram-data.png" alt="Telegram Data Visualization" class="why-image" />
          </div>
          <div class="why-content">
            <h2>Why tgAist?</h2>
            <p class="why-text">
              Telegram is a data powerhouse with over a billion active users generating millions of messages, reactions, and discussions every single day. Manual analysis is not just challenging—it's practically impossible. Today's fast-paced environment demands instant insights, precision, and clarity. <strong>tgAist</strong> automates this complexity, empowering you to quickly turn massive data flows into accurate, actionable decisions.
            </p>
          </div>
        </div>
      </div>

      <h2>What We Offer:</h2>
      <div class="features">
        <div class="feature-card">
          <div class="feature-icon">
            <img src="../assets/data-collection-duck.png" alt="Data Collection Duck" class="feature-image" />
          </div>
          <h3>Automated Data Collection</h3>
          <p>Immediate access to all crucial Telegram metrics at your fingertips.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <img src="../assets/ai-duck.png" alt="AI Analysis Duck" class="feature-image" />
          </div>
          <h3>Artificial Intelligence</h3>
          <p>Deep content analysis, identification of Key Opinion Leaders (KOLs), 
             engagement assessment, and influence measurement.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <img src="../assets/dashboard-duck.png" alt="Dashboard Duck" class="feature-image" />
          </div>
          <h3>Visual Dashboards</h3>
          <p>Interactive dashboards and influence maps for quick decision-making.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <img src="../assets/realtime-duck.png" alt="Real-time Analysis Duck" class="feature-image" />
          </div>
          <h3>Real-Time Analytics</h3>
          <p>Up-to-the-minute data on trends and information landscape changes for marketers,
             investors, developers, and researchers.</p>
        </div>
      </div>

      <h2>tgAist Benefits:</h2>
      <div class="benefits">
        <div class="benefit-card">
          <div class="benefit-icon">
            <img src="../assets/time-savings-duck.png" alt="Time Savings Duck" class="benefit-image" />
          </div>
          <h3>Time Savings</h3>
          <p>Focus on strategy and decision-making while tgAist handles the data collection and analysis.</p>
        </div>
        
        <div class="benefit-card">
          <div class="benefit-icon">
            <img src="../assets/accuracy-duck.png" alt="Accuracy Duck" class="benefit-image" />
          </div>
          <h3>Maximum Accuracy</h3>
          <p>Trust our AI-powered analytics for reliable insights that minimize errors and bias.</p>
        </div>
        
        <div class="benefit-card">
          <div class="benefit-icon">
            <img src="../assets/insights-duck.png" alt="Actionable Insights Duck" class="benefit-image" />
          </div>
          <h3>Actionable Insights</h3>
          <p>Receive clear, prioritized recommendations that can be immediately implemented.</p>
        </div>
      </div>

      <div class="cta-section">
        <p class="cta-text">Transform Telegram from a data source into a powerful growth tool.</p>
        <button class="cta-button">Join Now and Stay Ahead of Competitors!</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      // You can add reactive data here if needed
    }
  },
  methods: {
    // Add methods here if needed
  }
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  color: #333;
}

.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 40px;
  background: #f0f3f8;
  border-radius: 10px;
  margin-bottom: 40px;
  overflow: hidden;
}

.hero-content {
  max-width: 650px;
  text-align: left;
}

.main-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  line-height: 1.2;
}

.dark-text {
  color: #2c3e50;
  font-weight: 600;
}

.highlight {
  color: #3498db;
  font-weight: 600;
}

.tagline {
  font-size: 1.1rem;
  color: #7f8c8d;
  line-height: 1.6;
}

.analytics-image-container {
  max-width: 450px;
  margin-left: 20px;
}

.analytics-image {
  width: 100%;
  display: block;
}

.content-section {
  padding: 0 20px;
}

.why-section {
  margin: 50px 0;
  padding: 0;
}

.why-container {
  display: flex;
  align-items: center;
  background: #f0f3f8;
  border-radius: 10px;
  padding: 60px 40px;
  overflow: hidden;
}

.why-image-container {
  max-width: 450px;
  margin-right: 40px;
  flex-shrink: 0;
}

.why-image {
  width: 100%;
  display: block;
}

.why-content {
  flex-grow: 1;
}

.why-content h2 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.8rem;
  border-bottom: 2px solid rgba(238, 238, 238, 0.5);
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.why-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #5a6a7e;
}

h2 {
  color: #2c3e50;
  margin-top: 40px;
  margin-bottom: 20px;
  font-size: 1.8rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin: 30px 0;
}

.feature-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-image {
  max-width: 100%;
  max-height: 100%;
}

h3 {
  margin-top: 0;
  color: #3498db;
  font-size: 1.3rem;
}

.benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin: 30px 0;
}

.benefit-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.benefit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.benefit-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.benefit-image {
  max-width: 100%;
  max-height: 100%;
}

.cta-section {
  text-align: center;
  margin: 60px 0 30px;
  padding: 40px;
  background: #f5f7fa;
  border-radius: 10px;
}

.cta-text {
  font-size: 1.3rem;
  margin-bottom: 25px;
  color: #2c3e50;
}

.cta-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cta-button:hover {
  background: #2980b9;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .hero-section {
    padding: 40px 30px;
  }
  
  .main-title {
    font-size: 2.2rem;
  }
  
  .analytics-image-container {
    max-width: 350px;
  }
  
  .why-section {
    padding: 0 20px;
  }
  
  .why-container {
    padding: 40px 30px;
  }

  .why-image-container {
    max-width: 350px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 40px 20px;
  }
  
  .hero-content {
    max-width: 100%;
    margin-bottom: 30px;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .tagline {
    font-size: 1rem;
  }
  
  .analytics-image-container {
    margin-left: 0;
    max-width: 100%;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .why-section {
    flex-direction: column;
    text-align: center;
    margin: 30px 0;
  }
  
  .why-container {
    flex-direction: column;
    padding: 40px 20px;
  }
  
  .why-image-container {
    max-width: 300px;
    margin-right: 0;
    margin-bottom: 30px;
    order: -1; /* Keep image on top in mobile view */
  }
  
  .why-content {
    width: 100%;
  }
  
  .features {
    grid-template-columns: 1fr;
  }
  
  .benefits {
    grid-template-columns: 1fr;
  }
  
  .benefit-card {
    max-width: 300px;
    margin: 0 auto 20px;
  }
}
</style>