import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: number
  name: string
  email: string
}

export interface Event {
  id: number
  user_id: number
  title: string
  description: string | null
  location: string | null
  date: string
  time: string
  guests_count?: number
  guests?: Guest[]
  created_at: string
  updated_at: string
}

export interface Guest {
  id: number
  event_id: number
  name: string
  email: string
}

export interface EventsPaginationMeta {
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ListEventsParams {
  page?: number
  per_page?: number
  search?: string
  date_from?: string
  date_to?: string
  sort?: 'date_asc' | 'date_desc' | 'title_asc' | 'title_desc'
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post<{ user: User; token: string }>('/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/login', data),
  logout: () => api.post('/logout'),
  getProfile: () => api.get<{ data: User }>('/user'),
  updateProfile: (data: { name?: string; email?: string; password?: string; password_confirmation?: string }) =>
    api.put<{ data: User }>('/user', data),
  deleteAccount: () => api.delete('/user'),
}

export const eventsApi = {
  list: () => api.get<{ data: Event[] }>('/events'),
  listPaginated: (params?: ListEventsParams) =>
    api.get<{ data: Event[]; meta: EventsPaginationMeta }>('/events', { params }),
  get: (id: number) => api.get<{ data: Event }>(`/events/${id}`),
  create: (formData: FormData) =>
    api.post<{ data: Event }>('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: Partial<Event>) => api.put<{ data: Event }>(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
}

export interface DashboardStats {
  total_events: number
  total_guests: number
  upcoming_events: number
  events_per_month: Record<string, number>
  top_events_by_guests: { title: string; guests_count: number }[]
}

export const dashboardApi = {
  getStats: () => api.get<{ data: DashboardStats }>('/dashboard/stats'),
}
