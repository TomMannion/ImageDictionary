import axios from 'axios';
import { Entry, PaginatedResponse, SearchParams } from '../types';

// Use relative URLs - Vite proxy handles routing to backend in development
// In production, configure your reverse proxy (nginx, etc.) to route /api to the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const entryApi = {
  getAll: async (params?: SearchParams): Promise<PaginatedResponse<Entry>> => {
    const response = await api.get('/api/entries', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Entry> => {
    const response = await api.get(`/api/entries/${id}`);
    return response.data;
  },

  create: async (data: FormData): Promise<Entry> => {
    const response = await api.post('/api/entries', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: FormData): Promise<Entry> => {
    const response = await api.put(`/api/entries/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/entries/${id}`);
  },

  getTags: async (): Promise<string[]> => {
    const response = await api.get('/api/entries/tags');
    return response.data;
  },
};

export default api;
