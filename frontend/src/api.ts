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
  preferences?: UserPreferences | null
}

export interface UserPreferences {
  language?: 'fr' | 'en'
  notifications_email_reminders?: boolean
  notifications_new_rsvp?: boolean
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
  guest_status_counts?: { pending: number; confirmed: number; declined: number }
  total_attendees?: number
  invitation_subject?: string | null
  invitation_body?: string | null
  reminder_days?: number | null
  rsvp_deadline?: string | null
  created_at: string
  updated_at: string
}

export interface Guest {
  id: number
  event_id: number
  name: string
  email: string
  status?: 'pending' | 'confirmed' | 'declined'
  attendees_count?: number | null
  rsvp_message?: string | null
  rsvp_token?: string
}

export interface RsvpInvitation {
  guest: { name: string; status: string; attendees_count?: number | null; rsvp_message?: string | null }
  event: { title: string; description: string | null; location: string | null; date: string; time: string; rsvp_deadline?: string | null }
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
  register: (data: { name: string; email: string; password: string; password_confirmation: string; accept_terms?: boolean }) =>
    api.post<{ user: User; token: string }>('/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/login', data),
  logout: () => api.post('/logout'),
  forgotPassword: (email: string) => api.post<{ message: string }>('/forgot-password', { email }),
  resetPassword: (data: { email: string; token: string; password: string; password_confirmation: string }) =>
    api.post<{ message: string }>('/reset-password', data),
  getProfile: () => api.get<{ data: User }>('/user'),
  updateProfile: (data: { name?: string; email?: string; password?: string; password_confirmation?: string; preferences?: UserPreferences }) =>
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
  duplicate: (id: number, params?: { date_offset_days?: number; copy_guests?: boolean }) =>
    api.post<{ data: Event }>(`/events/${id}/duplicate`, params ?? {}),
  getEmailLogs: (eventId: number) =>
    api.get<{ data: EmailLogEntry[] }>(`/events/${eventId}/email-logs`),
}

export interface EmailLogEntry {
  id: number
  type: string
  email: string
  guest_name?: string
  sent_at: string
  status: string
  error_message?: string | null
}

export const guestsApi = {
  add: (eventId: number, data: { name: string; email: string; send_invitation?: boolean }) =>
    api.post<{ data: Guest }>(`/events/${eventId}/guests`, data),
  update: (eventId: number, guestId: number, data: { name?: string; email?: string }) =>
    api.put<{ data: Guest }>(`/events/${eventId}/guests/${guestId}`, data),
  delete: (eventId: number, guestId: number) =>
    api.delete(`/events/${eventId}/guests/${guestId}`),
  import: (eventId: number, file: File) => {
    const form = new FormData()
    form.append('guests_file', file)
    return api.post<{ data: { count: number }; message?: string }>(`/events/${eventId}/guests/import`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  export: (eventId: number) =>
    api.get<Blob>(`/events/${eventId}/guests/export`, { responseType: 'blob' }),
  resend: (eventId: number, guestIds?: number[]) =>
    api.post<{ data: { count: number }; message?: string }>(`/events/${eventId}/guests/resend`, { guest_ids: guestIds ?? [] }),
}

export const rsvpApi = {
  get: (token: string) => api.get<{ data: RsvpInvitation }>(`/rsvp/${token}`),
  respond: (token: string, data: { status: 'confirmed' | 'declined'; attendees_count?: number; rsvp_message?: string }) =>
    api.post<{ data: Guest }>(`/rsvp/${token}`, data),
}

export interface DashboardStats {
  total_events: number
  total_guests: number
  total_attendees: number
  upcoming_events: number
  events_per_month: Record<string, number>
  top_events_by_guests: { title: string; guests_count: number }[]
}

export const dashboardApi = {
  getStats: () => api.get<{ data: DashboardStats }>('/dashboard/stats'),
}

export interface EmailLogEntryGlobal {
  id: number
  type: string
  email: string
  guest_name?: string
  event_title?: string
  sent_at: string
  status: string
  error_message?: string | null
}

export const emailLogsApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<{ data: EmailLogEntryGlobal[]; meta: EventsPaginationMeta }>('/email-logs', { params }),
}
