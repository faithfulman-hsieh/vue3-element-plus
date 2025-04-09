//src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/nav/HomeView.vue' // 首頁頁面
// import LoginView from '../pages/nav/LoginView.vue' // Login 頁面
import UserView from '../pages/nav/UserView.vue' // 使用者頁面
import TodoView from '../pages/nav/TodoView.vue' // 待辦事項頁面
import AboutView from '../pages/nav/AboutView.vue' // 關於頁面
import HelloWorldView from '../pages/nav/HelloWorld.vue' // 展示元件頁面

// 定義路由表
export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
,
//   {
//     path: '/login',
//     name: 'login',
//     component: LoginView,
//   },
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
]

// 創建路由器實例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 使用 HTML5 History 模式
  routes,
})

// 添加路由守衛
router.beforeEach((to, from, next) => {
  //const userStore = useUserStore();
  console.log('login');
//   if (to.meta.requiresAuth && !userStore.isLoggedIn) {
//     next({ name: 'login' });
//   } else {
     next();
//   }
});

export default router