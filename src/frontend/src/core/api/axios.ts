import axios from "axios";

const api = axios.create({
  baseURL: window.location.origin.replace(":5173", ":8001"),
});

/* ===========================
   REQUEST INTERCEPTOR
=========================== */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ===========================
   RESPONSE INTERCEPTOR
=========================== */

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization =
              "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          window.location.origin.replace(":5173", ":8001") +
            "/api/auth/token/refresh/",
          {
            refresh: refreshToken,
          }
        );

        localStorage.setItem("access_token", data.access);

        api.defaults.headers.common["Authorization"] =
          "Bearer " + data.access;

        processQueue(null, data.access);

        originalRequest.headers.Authorization =
          "Bearer " + data.access;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;