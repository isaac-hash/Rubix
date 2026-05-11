import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject the API Key from cookies
api.interceptors.request.use((config) => {
  const apiKey = Cookies.get("subpay_api_key");
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

export default api;

export const setApiKey = (key: string) => {
  Cookies.set("subpay_api_key", key, { expires: 30, secure: true, sameSite: "strict" });
};

export const clearApiKey = () => {
  Cookies.remove("subpay_api_key");
};
