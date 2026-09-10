import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Shared axios instance for the Yatra / Events module.
// Cookies are sent so admin/user sessions work the same way as AuthContext.
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Normalise error messages so pages can show `err.message` directly.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(Object.assign(error, { message }));
  }
);

export default api;
