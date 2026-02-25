import axios from "axios";

const api = axios.create({
  baseURL: window.location.origin.replace(":5173", ":8001"),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;