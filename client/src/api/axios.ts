import { retry } from "@reduxjs/toolkit/query";
import axios from "axios";

const api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
      headers : {"Content-Type" : "application/json" }
})

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes("/auth/");
    const isHistoryRoute = error.config?.url?.includes("/history");

    // Only redirect to login for protected routes — not search
    if (
      error.response?.status === 401 &&
      (isAuthRoute || isHistoryRoute)
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
)

export default api
