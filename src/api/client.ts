import { Configuration } from './configuration';
import { AuthenticationAPI } from './api/authentication-api';
import { UserAPI } from './api/user-api';
import { TodoAPI } from './api/todo-api';
import { ProcessAPI } from './api/process-api';
import { TaskAPI } from './api/task-api';
// 我們不使用原本生成的 ChatAPI，因為它缺少新功能，改用下方手動定義的 chatApi
// import { ChatAPI } from './api/chat-api'; 
import axios from 'axios';

// 取得 API Base URL
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

// 定義取得 Token 的方法 (供自動生成的 API 使用)
const getToken = () => {
  const token = sessionStorage.getItem('jwtToken');
  return token ? `Bearer ${token}` : '';
};

// 設定共用的 Configuration
export const apiConfig = new Configuration({
  basePath: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  accessToken: getToken,
});

// ★★★ 保留原本的 API 匯出 (修復 LoginView 報錯的問題) ★★★
export const authApi = new AuthenticationAPI(apiConfig);
export const userApi = new UserAPI(apiConfig);
export const todosApi = new TodoAPI(apiConfig);
export const processApi = new ProcessAPI(apiConfig);
export const taskApi = new TaskAPI(apiConfig);

// --- 手動擴充 ChatAPI ---
// 建立一個專用的 axios 實例來處理聊天相關請求
const chatAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// 加入 Token 攔截器
chatAxios.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 定義並匯出擴充後的 chatApi
export const chatApi = {
  getPublicHistory: () => chatAxios.get('/api/chat/public-history'),
  // 新增功能：私訊歷史
  getPrivateHistory: (contact: string) => chatAxios.get(`/api/chat/history/${contact}`),
  // 新增功能：未讀數量
  getUnreadCount: (contact: string) => chatAxios.get(`/api/chat/unread/${contact}`),
  // 新增功能：標記已讀
  markAsRead: (contact: string) => chatAxios.post(`/api/chat/read/${contact}`),
};

export default chatAxios;