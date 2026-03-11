import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
};

// Resumes API
export const resumesApi = {
  upload: (files: File[]) => {
    const formData = new FormData();
    console.log('Creating FormData with files:', files);
    files.forEach((file) => {
      console.log('Appending file:', file.name, file.type, file.size);
      formData.append('files', file);
    });
    console.log('FormData entries:', Array.from(formData.entries()));
    // 不设置 Content-Type，让浏览器自动设置正确的 multipart/form-data boundary
    return api.post('/resumes/upload', formData);
  },
  getAll: (params?: { page?: number; pageSize?: number; status?: string; search?: string }) =>
    api.get('/resumes', { params }),
  getOne: (id: string) => api.get(`/resumes/${id}`),
};

// Candidates API
export const candidatesApi = {
  getAll: (params?: { page?: number; pageSize?: number; status?: string; search?: string; sortBy?: string; sortOrder?: string; skill?: string }) =>
    api.get('/candidates', { params }),
  getOne: (id: string) => api.get(`/candidates/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/candidates/${id}/status`, { status }),
  updateInfo: (id: string, data: any) => api.patch(`/candidates/${id}`, data),
  compare: (candidateIds: string[]) =>
    api.post('/candidates/compare', { candidateIds }),
  delete: (id: string) => api.delete(`/candidates/${id}`),
};

// Jobs API
export const jobsApi = {
  create: (data: {
    title: string;
    description: string;
    requiredSkills: string[];
    preferredSkills: string[];
  }) => api.post('/jobs', data),
  getAll: () => api.get('/jobs'),
  getOne: (id: string) => api.get(`/jobs/${id}`),
  update: (id: string, data: any) => api.patch(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
};

// Evaluations API
export const evaluationsApi = {
  create: (data: { candidateId: string; jobId: string }) =>
    api.post('/evaluations', data),
  getAll: () => api.get('/evaluations'),
  getOne: (id: string) => api.get(`/evaluations/${id}`),
  getByCandidate: (candidateId: string) =>
    api.get(`/evaluations/candidate/${candidateId}`),
  getByJob: (jobId: string) => api.get(`/evaluations/job/${jobId}`),
};

// SSE for AI extraction
export const createExtractionSSE = (candidateId: string) => {
  return new EventSource(`${API_BASE_URL}/candidates/${candidateId}/extract`);
};
