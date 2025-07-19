// axios 라이브러리를 import
import axios from 'axios';

// Django 백엔드 서버 주소 설정
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// axios 인스턴스 생성 (기본 설정 포함)
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터 (모든 API 요청 전에 실행)
api.interceptors.request.use(
    (config) => {
        console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('API 요청 에러:', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (모든 API 응답 후에 실행)
api.interceptors.response.use(
    (response) => {
        console.log(`API 응답: ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        console.error('API 응답 에러:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;