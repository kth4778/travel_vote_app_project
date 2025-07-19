// API 인스턴스 import
import api from './api';

// 투표 관련 API 서비스 객체
const voteService = {
    // 모든 투표 목록 조회
    getAllVotes: async (params = {}) => {
        try {
            const response = await api.get('/votes/', { params });
            return response.data;
        } catch (error) {
            console.error('투표 목록 조회 실패:', error);
            throw error;
        }
    },

    // 새로운 투표 생성 또는 기존 투표 수정
    createOrUpdateVote: async (userId, accommodationId, rating) => {
        try {
            const response = await api.post('/votes/', {
                user_id: userId,
                accommodation_id: accommodationId,
                rating: rating
            });
            return response.data;
        } catch (error) {
            console.error('투표 생성/수정 실패:', error);
            throw error;
        }
    },

    // 특정 투표 조회
    getVoteById: async (voteId) => {
        try {
            const response = await api.get(`/votes/${voteId}/`);
            return response.data;
        } catch (error) {
            console.error('투표 조회 실패:', error);
            throw error;
        }
    },

    // 투표 삭제
    deleteVote: async (voteId) => {
        try {
            const response = await api.delete(`/votes/${voteId}/`);
            return response.data;
        } catch (error) {
            console.error('투표 삭제 실패:', error);
            throw error;
        }
    },

    // 특정 사용자의 투표 목록 조회
    getUserVotes: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/votes/`);
            return response.data;
        } catch (error) {
            console.error('사용자 투표 조회 실패:', error);
            throw error;
        }
    },

    // 특정 숙소의 투표 목록 조회
    getAccommodationVotes: async (accommodationId) => {
        try {
            const response = await api.get(`/accommodations/${accommodationId}/votes/`);
            return response.data;
        } catch (error) {
            console.error('숙소 투표 조회 실패:', error);
            throw error;
        }
    },

    // 투표 통계 정보 조회
    getVoteStats: async () => {
        try {
            const response = await api.get('/votes/stats/');
            return response.data;
        } catch (error) {
            console.error('투표 통계 조회 실패:', error);
            throw error;
        }
    }
};

export default voteService;