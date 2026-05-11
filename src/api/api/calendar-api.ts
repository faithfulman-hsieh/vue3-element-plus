import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

const calendarAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

calendarAxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CalendarEventDto {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  colorId?: string;
  attendees?: string[];
}

export const calendarApi = {
  /** 取得 Google OAuth2 授權 URL */
  getAuthUrl: () =>
    calendarAxios.get<{ authUrl: string }>('/api/calendar/auth'),
  /** 檢查是否已授權 */
  getAuthStatus: () =>
    calendarAxios.get<{ authorized: boolean; message: string }>('/api/calendar/status'),
  /** 查詢事件 */
  getEvents: (start: string, end: string) =>
    calendarAxios.get<CalendarEventDto[]>('/api/calendar/events', { params: { start, end } }),
  createEvent: (data: CalendarEventDto) =>
    calendarAxios.post<CalendarEventDto>('/api/calendar/events', data),
  updateEvent: (eventId: string, data: CalendarEventDto) =>
    calendarAxios.put<CalendarEventDto>(`/api/calendar/events/${eventId}`, data),
  deleteEvent: (eventId: string) =>
    calendarAxios.delete(`/api/calendar/events/${eventId}`),
};

export default calendarApi;
