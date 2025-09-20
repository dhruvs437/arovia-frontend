import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export function setAuthToken(token?: string | null) {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
}

// Auth
export async function login(username: string, password: string) {
  const res = await API.post('/api/auth/login', { username, password });
  return res.data;
}

// Health record (store ABHA/app payload)
export async function createHealthRecord(userId: string, source: string, payload: any) {
  const res = await API.post('/api/health', { userId, source, payload });
  return res.data;
}

// Analyze (calls Groq/OpenAI via backend)
export async function analyze(userId: string, lifestyle: any, healthDatabases?: string[]) {
  const res = await API.post('/api/analyze', { userId, lifestyle, healthDatabases });
  return res.data;
}

// Get latest prevention / analysis output
export async function getPrevention(userId: string) {
  const res = await API.get(`/api/prevention/${userId}`);
  return res.data;
}

export default API;
