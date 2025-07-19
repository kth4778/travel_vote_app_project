// API 인스턴스 import
import api from './api';

// 댓글 관련 API 서비스 객체
const commentService = {
    // 모든 댓글 목록 조회
    getAllComments: async (params = {}) => {
        try {
            const response = await api.get('/comments/', { params });
            return response.data;
        } catch (error) {
            console.error('댓글 목록 조회 실패:', error);
            throw error;
        }
    },

    // 새로운 댓글 생성
    createComment: async (userId, accommodationId, text) => {
        try {
            const response = await api.post('/votes/comments/', {
                user_id: userId,
                accommodation_id: accommodationId,
                text: text
            });
            return response.data;
        } catch (error) {
            console.error('댓글 생성 실패:', error);
            throw error;
        }
    },

    // 특정 댓글 조회
    getCommentById: async (commentId) => {
        try {
            const response = await api.get(`/comments/${commentId}/`);
            return response.data;
        } catch (error) {
            console.error('댓글 조회 실패:', error);
            throw error;
        }
    },

    // 댓글 수정
    updateComment: async (commentId, text, userId) => {
        try {
            const response = await api.put(`/comments/${commentId}/`, {
                text: text,
                user_id: userId
            });
            return response.data;
        } catch (error) {
            console.error('댓글 수정 실패:', error);
            throw error;
        }
    },

    // 댓글 삭제
    deleteComment: async (commentId) => {
        try {
            const response = await api.delete(`/comments/${commentId}/`);
            return response.data;
        } catch (error) {
            console.error('댓글 삭제 실패:', error);
            throw error;
        }
    },

    // 특정 사용자의 댓글 목록 조회
    getUserComments: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/comments/`);
            return response.data;
        } catch (error) {
            console.error('사용자 댓글 조회 실패:', error);
            throw error;
        }
    },

    // 특정 숙소의 댓글 목록 조회
    getAccommodationComments: async (accommodationId) => {
        try {
            const response = await api.get(`/accommodations/${accommodationId}/comments/`);
            return response.data;
        } catch (error) {
            console.error('숙소 댓글 조회 실패:', error);
            throw error;
        }
    },

    // 댓글 통계 정보 조회
    getCommentStats: async () => {
        try {
            const response = await api.get('/comments/stats/');
            return response.data;
        } catch (error) {
            console.error('댓글 통계 조회 실패:', error);
            throw error;
        }
    }
};

export default commentService;