// Code adopted from 
// Title: Django & React Web App Tutorial - Authentication, Databases, Deployments & More...
// Author: Tech With Tim
// Youtube link: https://www.youtube.com/watch?v=c-QsfbznSXI&t=7203s
// Lines 7 - 27

import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
