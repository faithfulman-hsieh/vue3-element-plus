//src/main.ts
import { createApp } from 'vue' // 改用標準的 createApp
import { createPinia } from 'pinia'
import type { UserModule } from './types'
import App from './App.vue'
import router from './router' // 引入 Vue Router
import '~/styles/index.scss'
import 'uno.css'
import 'element-plus/theme-chalk/src/message.scss'
import 'element-plus/theme-chalk/src/message-box.scss'

// 創建並初始化 Vue 應用程式
const app = createApp(App)
app.use(createPinia())
// 使用路由
app.use(router)

// 安裝所有模組
Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))
  .forEach(i => i.install?.({ app, router }))

// 掛載應用到 DOM
app.mount('#app')