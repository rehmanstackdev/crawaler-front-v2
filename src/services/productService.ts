import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const searchProducts = async (query: string) => {
  console.log('Service: API URL:', API_URL);
  console.log('Service: Calling:', `${API_URL}/products/search?q=${query}`);
  const response = await axios.get(`${API_URL}/products/search`, {
    params: { q: query }
  });
  console.log('Service: Response:', response.data);
  return response.data;
};
