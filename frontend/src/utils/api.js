// frontend/src/utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://ai-knowledge-hub-k1oq.onrender.com',
});

export default api;