<template>
  <header class="site-header">
    <!-- Кликабельное изображение для главной страницы -->
    <router-link to="/" class="image-link logo-link">
      <img :src="headerImage" alt="tgAist PRO header" class="header-image" />
    </router-link>
    <!-- Кнопка (картинка) для Projects -->
    <router-link to="/projects" class="image-link">
      <img :src="secondImage" alt="Вторая картинка" class="header-image" />
    </router-link>
    <!-- Кнопка (картинка) для KOLs -->
    <router-link to="/kols" class="image-link">
      <img :src="thirdImage" alt="Третья картинка" class="header-image" />
    </router-link>
    <!-- Кнопка (картинка) для Search -->
    <router-link to="/search" class="image-link">
      <img :src="searchImage" alt="Поиск" class="header-image" />
    </router-link>
  </header>
</template>
<script setup>
import headerImage from '../assets/TgAist_header.png'
import secondImage from '../assets/projectsai.png'
import thirdImage from '../assets/KOLsai.png'
import searchImage from '../assets/Search.png'
</script>
<style scoped>
.site-header {
  width: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 20px;
}
.image-link {
  display: inline-block;
  width: 13%;
  margin: 0;
  padding: 0;
  text-decoration: none;
}
/* Можно добавить отдельные стили для логотипа, если нужно */
.logo-link {
  /* Например, если хотите сделать логотип чуть больше */
  /* width: 15%; */
}
.header-image {
  width: 100%;
  height: auto;
  display: block;
}
</style>