const HOST_API = `${import.meta.env.VITE_HOST_API}`;

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: "http://your-api-url.com", // API 기본 URL
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
  // (config: AxiosRequestConfig) => {
  (config: any) => {
    // 여기서 로컬 스토리지 등에서 토큰을 가져옵니다.
    const token = localStorage.getItem("access_token");

    if (token) {
      // 토큰이 있으면 요청 헤더에 추가합니다.
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error: AxiosError) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 응답 데이터를 그대로 반환합니다.
    return response;
  },
  (error: AxiosError) => {
    // 응답 에러 처리, 예를 들어 HTTP 상태 코드가 401이면 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      // 로그인 상태가 만료되었거나 유효하지 않을 때의 처리
      console.error("Unauthorized! Redirecting to login.");
      // 여기서 로그인 페이지로 리다이렉트하는 로직을 추가할 수 있습니다.
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };
