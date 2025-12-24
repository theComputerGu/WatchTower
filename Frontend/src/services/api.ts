import axios from "axios";

//axois class:
const api = axios.create({
  baseURL: "http://localhost:5185/api",
});

//sending the token to the beckend in order to Authorization
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
