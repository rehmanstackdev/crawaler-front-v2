import { api } from '@/lib/apiClient';

export const searchProducts = async (query: string) => {
  const response = await api.get('/products/search', { params: { q: query } });
  return response.data;
};

export const searchProductsByImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/products/search-by-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const fetchSuggestions = async (
  query: string,
  signal?: AbortSignal,
): Promise<string[]> => {
  if (!query.trim()) return [];
  const response = await api.get('/products/suggestions', {
    params: { q: query },
    signal,
  });
  return Array.isArray(response.data?.suggestions) ? response.data.suggestions : [];
};
