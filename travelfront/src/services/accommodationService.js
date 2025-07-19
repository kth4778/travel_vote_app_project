// API 인스턴스 import
import api from './api';

// 숙소 관련 API 서비스 객체
const accommodationService = {
    // 모든 숙소 목록 조회
    getAllAccommodations: async (params = {}) => {
        try {
            const response = await api.get('/accommodations/', { params });
            console.log('API response for getAllAccommodations:', response.data); // Add this log
            return response.data;
        } catch (error) {
            console.error('숙소 목록 조회 실패:', error);
            throw error;
        }
    },

    // 특정 숙소 상세 정보 조회
    getAccommodationById: async (accommodationId) => {
        try {
            const response = await api.get(`/accommodations/${accommodationId}/`);
            return response.data;
        } catch (error) {
            console.error('숙소 상세 조회 실패:', error);
            throw error;
        }
    },

    // 새로운 숙소 생성 (관리자 전용)
    createAccommodation: async (accommodationData) => {
        try {
            const response = await api.post('/accommodations/', accommodationData);
            return response.data;
        } catch (error) {
            console.error('숙소 생성 실패:', error);
            throw error;
        }
    },

    // 숙소 정보 수정 (관리자 전용)
    updateAccommodation: async (accommodationId, accommodationData) => {
        try {
            const response = await api.put(`/accommodations/${accommodationId}/`, accommodationData);
            return response.data;
        } catch (error) {
            console.error('숙소 수정 실패:', error);
            throw error;
        }
    },

    // 숙소 삭제 (관리자 전용)
    deleteAccommodation: async (accommodationId) => {
        try {
            const response = await api.delete(`/accommodations/${accommodationId}/`);
            return response.data;
        } catch (error) {
            console.error('숙소 삭제 실패:', error);
            throw error;
        }
    },

    // 숙소 이미지 업로드 (관리자 전용)
    uploadImage: async (accommodationId, imageFile, altText = '', order = 0) => {
        try {
            const formData = new FormData();
            formData.append('accommodation', accommodationId);
            formData.append('image', imageFile);
            formData.append('alt_text', altText);
            formData.append('order', order);

            const response = await api.post(
                `/accommodations/${accommodationId}/images/upload/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            throw error;
        }
    },

    // 숙소 이미지 목록 조회
    getAccommodationImages: async (accommodationId) => {
        try {
            const response = await api.get(`/accommodations/${accommodationId}/images/`);
            return response.data;
        } catch (error) {
            console.error('숙소 이미지 조회 실패:', error);
            throw error;
        }
    },

    // 특정 이미지 삭제 (관리자 전용)
    deleteImage: async (imageId) => {
        try {
            const response = await api.delete(`/accommodations/images/${imageId}/`);
            return response.data;
        } catch (error) {
            console.error('이미지 삭제 실패:', error);
            throw error;
        }
    },

    // 숙소 통계 정보 조회
    getAccommodationStats: async () => {
        try {
            const response = await api.get('/accommodations/stats/');
            return response.data;
        } catch (error) {
            console.error('숙소 통계 조회 실패:', error);
            throw error;
        }
    },

    // 인기 숙소 목록 조회
    getPopularAccommodations: async () => {
        try {
            const response = await api.get('/accommodations/popular/');
            return response.data;
        } catch (error) {
            console.error('인기 숙소 조회 실패:', error);
            throw error;
        }
    }
};

export default accommodationService;