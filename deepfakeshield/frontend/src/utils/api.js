import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

export const analyzeText = async (text) => {
  const { data } = await api.post('/analyze-text', { text });
  return data;
};

export const getExamples = async () => {
  const { data } = await api.get('/analyze-text/example');
  return data.examples;
};

export default api;
