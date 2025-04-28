// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ProjectsPage from '../pages/ProjectsPage.vue'
import KolsPage from '../pages/KolsPage.vue'
import KOLDetailView from '../pages/KOLDetailView.vue'
import SearchPage from '../pages/SearchPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/projects',
    name: 'Projects',
    component: ProjectsPage
  },
  {
    path: '/kols',
    name: 'Kols',
    component: KolsPage
  },
  {
    path: '/kols/:name',
    name: 'KOLDetail',
    component: KOLDetailView
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router