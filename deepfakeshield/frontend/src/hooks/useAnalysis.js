import { useState, useCallback } from 'react';
import { analyzeText } from '../utils/api';

export const useAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (text) => {
    if (!text || text.trim().length < 10) {
      setError('Please enter at least 10 characters of text.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await analyzeText(text.trim());
      setResult(data);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The server may be loading models. Please try again.');
      } else if (!err.response) {
        setError('Cannot connect to the DeepFakeShield API. Make sure the backend is running on port 8000.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, result, error, analyze, reset };
};
