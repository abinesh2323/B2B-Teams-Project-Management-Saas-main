import { CustomError } from "@/types/custom-error.type";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "https://advanced-mern-b2b-teams-project-roqm.onrender.com/api";

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
};

const API = axios.create(options);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const response = error.response;
    const data = response?.data;
    const status = response?.status;

    if (data === "Unauthorized" && status === 401) {
      const path = window.location.pathname;
      if (path !== "/" && path !== "/sign-in" && path !== "/sign-up" && path !== "/google/oauth/callback") {
        window.location.href = "/";
      }
    }

    const customError: CustomError = {
      ...error,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

export default API;
