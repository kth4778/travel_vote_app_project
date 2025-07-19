// API 인스턴스 import
import api from './api';

// 사용자 관련 API 서비스 객체
const userService = {
    // 모든 사용자 목록 조회
    getAllUsers: async () => {
        try {
            const response = await api.get('/users/');
            console.log('API response for getAllUsers:', response.data); // Add this log
            return response.data;
        } catch (error) {
            console.error('사용자 목록 조회 실패:', error);
            throw error;
        }
    },

    // 사용자 로그인 (이름으로)
    login: async (name) => {
        try {
            const response = await api.post('/users/login/', { name });
            return response.data;
        } catch (error) {
            console.error('로그인 실패:', error);
            throw error;
        }
    },

    // 특정 사용자 정보 조회
    getUserById: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/`);
            return response.data;
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
            throw error;
        }
    },

    // 관리자 권한 확인
    checkAdmin: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/check-admin/`);
            return response.data;
        } catch (error) {
            console.error('관리자 권한 확인 실패:', error);
            throw error;
        }
    },

    // 사용자 통계 정보 조회
    getUserStats: async () => {
        try {
            const response = await api.get('/users/stats/');
            return response.data;
        } catch (error) {
            console.error('사용자 통계 조회 실패:', error);
            throw error;
        }
    },

    // 사용자 활동 요약 조회
    getUserActivity: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/activity/`);
            return response.data;
        } catch (error) {
            console.error('사용자 활동 조회 실패:', error);
            throw error;
        }
    }
};

export default userService;