import axios from "axios";
import appStore from "./appStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const { accessToken } = appStore.getState().user;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  config.withCredentials = true;
  return config;
});

export default api;
