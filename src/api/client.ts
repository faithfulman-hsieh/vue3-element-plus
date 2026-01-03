// src/api/client.ts
import { Configuration } from './configuration';
import { AuthenticationAPI } from './api/authentication-api';
import { UserAPI } from './api/user-api';
import { TodoAPI } from './api/todo-api';

import { ProcessAPI } from './api/process-api';
import { TaskAPI } from './api/task-api';
import { ChatAPI } from './api/chat-api';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

const getToken = () => {
  const token = localStorage.getItem('jwtToken');
  console.log('Getting token:', token); // 添加日誌
  return token ? `Bearer ${token}` : ''; // 添加 Bearer 前綴
};

export const apiConfig = new Configuration({
  basePath: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  accessToken: getToken,
});

export const authApi = new AuthenticationAPI(apiConfig);
export const userApi = new UserAPI(apiConfig);
export const todosApi = new TodoAPI(apiConfig);

export const processApi = new ProcessAPI(apiConfig);
export const taskApi = new TaskAPI(apiConfig);
export const chatApi = new ChatAPI(apiConfig);