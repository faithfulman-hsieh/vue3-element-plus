//src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../pages/nav/HomeView.vue'; // Home 頁面
import UserView from '../pages/nav/UserView.vue'; // User 頁面
import TodoView from '../pages/nav/TodoView.vue'; // Todo 頁面
import AboutView from '../pages/nav/AboutView.vue'; // About 頁面
import HelloWorldView from '../pages/nav/HelloWorld.vue'; // Show Components 頁


export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/user',
    name: 'user',
    component: UserView,
  },
  {
    path: '/todo',
    name: 'todo',
    component: TodoView,
  },
  {
    path: '/helloWorld',
    name: 'helloWorld',
    component: HelloWorldView,
  },
  {
      path: '/about',
      name: 'about',
      component: AboutView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;