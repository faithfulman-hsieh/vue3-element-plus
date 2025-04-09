import axios from 'axios';

// 定義 API 基礎路徑拆分 PROD/DEV
const API_BASE_URL = import.meta.env.VITE_APP_BASE_URL;

axios.defaults.withCredentials = true;

// 獲取 JWT Token 的函數
const getToken = () => {
  const token = localStorage.getItem('jwtToken'); // 假設您將 Token 存儲在 localStorage
  return token ? `Bearer ${token}` : '';
};

// 登入用戶
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
    console.info('Login response:', response);
    return response; // 假設後端返回 JWT token
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// 獲取用戶列表
export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: getToken(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// 新增使用者
export const addUser = async (name: string, email: string, password: string, roles: { id: number; name: string }[]) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/addUser`, { name, email, password, roles }, {
      headers: {
        Authorization: getToken(),
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};