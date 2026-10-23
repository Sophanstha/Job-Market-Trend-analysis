import axios from "axios";

const rawBaseURL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "https://job-market-trend-analysis.onrender.com/api";

const cleanBaseURL = rawBaseURL.trim().replace(/\/+$/, "");
const baseURL = cleanBaseURL.endsWith("/api")
  ? cleanBaseURL
  : `${cleanBaseURL}/api`;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

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
