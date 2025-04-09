import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_APP_BASE_URL}/todos`;
axios.defaults.withCredentials = true;

const getToken = () => {
  const token = localStorage.getItem('jwtToken');
  return token ? `Bearer ${token}` : '';
};

const todoService = {
  async getAllTodos() {
    try {
      const response = await axios.get(`${API_BASE_URL}`, {
        headers: { Authorization: getToken() },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all Todos:', error);
      throw error;
    }
  },

  async getTodoStatus(todoId: number) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${todoId}/status`, {
        headers: { Authorization: getToken() },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Todo status:', error);
      throw error;
    }
  },

  // 新增：獲取流程圖 XML 和當前任務
  async getProcessDiagram(todoId: number) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${todoId}/diagram`, {
        headers: { Authorization: getToken() },
      });
      return response.data; // 預期返回 { bpmnXml: string, currentTask: string }
    } catch (error) {
      console.error('Error fetching process diagram:', error);
      throw error;
    }
  },

  async createTodo(todo: { title: string; description: string; assignee: string }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/addTodo`, todo, {
        headers: {
          Authorization: getToken(),
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Todo:', error);
      throw error;
    }
  },

  async completeTask(todoId: number, action: string, priority: string) {
    try {
      await axios.post(
        `${API_BASE_URL}/${todoId}/complete`,
        null,
        {
          headers: { Authorization: getToken() },
          params: { action, priority },
        }
      );
    } catch (error) {
      console.error('Error completing Todo:', error);
      throw error;
    }
  },
};

export default todoService;