// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import HomeView from '../pages/nav/HomeView.vue';
import LoginView from '../pages/nav/LoginView.vue';
import UserView from '../pages/nav/UserView.vue';
import TodoView from '../pages/nav/TodoView.vue';
import AboutView from '../pages/nav/AboutView.vue';
import HelloWorldView from '../pages/nav/HelloWorld.vue';
import ProcessManageView from '../pages/nav/ProcessManageView.vue';
import TaskView from '../pages/nav/TaskView.vue';
import ProcessStartView from '../pages/nav/ProcessStartView.vue';
import ProcessStatusView from '../pages/nav/ProcessStatusView.vue';
import ProcessAdjustView from '../pages/nav/ProcessAdjustView.vue';
import RoleManageView from '../pages/nav/RoleManageView.vue';

export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/user',
    name: 'user',
    component: UserView,
    meta: { requiresAuth: true },
  },
  {
    path: '/todo',
    name: 'todo',
    component: TodoView,
    meta: { requiresAuth: true },
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
  {
    path: '/process-manage',
    name: 'processManage',
    component: ProcessManageView,
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: TaskView,
    meta: { requiresAuth: true },
  },
  {
    path: '/process-start',
    name: 'processStart',
    component: ProcessStartView,
    meta: { requiresAuth: true },
  },
  {
    path: '/process-status',
    name: 'processStatus',
    component: ProcessStatusView,
    meta: { requiresAuth: true },
  },
  {
    path: '/process-adjust',
    name: 'processAdjust',
    component: ProcessAdjustView,
    meta: { requiresAuth: true },
  },
  {
    path: '/role-manage',
    name: 'roleManage',
    component: RoleManageView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;