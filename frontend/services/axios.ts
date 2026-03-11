import { getAccessToken, setAccessToken, setUserRole } from "@/utils/auth";
import axios from "axios";

export const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`,
    withCredentials: true,
});

export const refreshApi = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`,
    withCredentials: true,
});

const authRoutes = ["/auth/login", "/auth/signup", "/auth/refresh-token"];

api.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthRoute = authRoutes.some((route) =>
            originalRequest.url.includes(route),
        );

        if (
            error.response.status === 401 &&
            !originalRequest._retry &&
            !isAuthRoute
        ) {
            originalRequest._retry = true;

            try {
                const res = await refreshApi.post("/auth/refresh-token");

                setAccessToken(res.data.data.accessToken);
                setUserRole(res.data.data.userRole);

                originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;

                return api(originalRequest);
            } catch (error) {
                setAccessToken(null);
                setUserRole(null);

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    },
);
