import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from '../components/HelloWorld.vue'; // 預設首頁
import AboutView from '../pages/nav/AboutView.vue'; // About 頁面
import NavigatorFourView from '../pages/nav/4.vue'; // NavigatorFourView 頁面


export const routes = [
  {
    path: '/',
    name: 'home',
    component: HelloWorld,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
  {
    path: '/nav/4',
    name: 'Navigator Four',
    component: NavigatorFourView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;