// React의 Context API 및 Hook들을 import
import React, { createContext, useContext, useReducer, useCallback } from 'react';

// API 서비스들을 import
import userService from '../services/userService';
import accommodationService from '../services/accommodationService';
import voteService from '../services/voteService';

// 초기 상태 정의 (동일)
const initialState = {
    // 사용자 관련 상태
    currentUser: null,
    users: [],
    isAdmin: false,

    // 숙소 관련 상태
    accommodations: [],
    currentAccommodation: 0,
    currentImageIndex: 0,

    // 투표 관련 상태
    votes: [],
    userVotes: {},
    rating: 5,
    isVoted: false,

    // UI 상태
    isLoading: false,
    error: null,
    currentPage: 'login',

    // 기타 상태
    isLiked: false,
    showDeleteModal: false,
    deleteTarget: null,
    accommodationToEdit: null, // 수정할 숙소 정보

    // 통계 관련 상태
    accommodationStats: null,
    userStats: null,
    voteStats: null,
};

// 액션 타입 정의
const actionTypes = {
    SET_CURRENT_USER: 'SET_CURRENT_USER',
    SET_USERS: 'SET_USERS',
    SET_IS_ADMIN: 'SET_IS_ADMIN',
    SET_ACCOMMODATIONS: 'SET_ACCOMMODATIONS',
    SET_CURRENT_ACCOMMODATION: 'SET_CURRENT_ACCOMMODATION',
    SET_CURRENT_IMAGE_INDEX: 'SET_CURRENT_IMAGE_INDEX',
    ADD_ACCOMMODATION: 'ADD_ACCOMMODATION',
    UPDATE_ACCOMMODATION: 'UPDATE_ACCOMMODATION',
    REMOVE_ACCOMMODATION: 'REMOVE_ACCOMMODATION',
    SET_VOTES: 'SET_VOTES',
    SET_USER_VOTES: 'SET_USER_VOTES',
    SET_RATING: 'SET_RATING',
    SET_IS_VOTED: 'SET_IS_VOTED',
    ADD_VOTE: 'ADD_VOTE',
    UPDATE_VOTE: 'UPDATE_VOTE',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
    SET_IS_LIKED: 'SET_IS_LIKED',
    SET_SHOW_DELETE_MODAL: 'SET_SHOW_DELETE_MODAL',
    SET_DELETE_TARGET: 'SET_DELETE_TARGET',
    SET_ACCOMMODATION_TO_EDIT: 'SET_ACCOMMODATION_TO_EDIT',

    // 통계 관련 액션 타입 추가
    SET_ACCOMMODATION_STATS: 'SET_ACCOMMODATION_STATS',
    SET_USER_STATS: 'SET_USER_STATS',
    SET_VOTE_STATS: 'SET_VOTE_STATS',
};

// 리듀서 함수 정의
const appReducer = (state, action) => {
    switch (action.type) {
        case actionTypes.SET_CURRENT_USER:
            return { ...state, currentUser: action.payload };
        case actionTypes.SET_USERS:
            return { ...state, users: action.payload };
        case actionTypes.SET_IS_ADMIN:
            return { ...state, isAdmin: action.payload };
        case actionTypes.SET_ACCOMMODATIONS:
            console.log('SET_ACCOMMODATIONS payload:', action.payload); // Add this log
            return { ...state, accommodations: action.payload };
        case actionTypes.SET_CURRENT_ACCOMMODATION:
            return { ...state, currentAccommodation: action.payload, currentImageIndex: 0 };
        case actionTypes.SET_CURRENT_IMAGE_INDEX:
            return { ...state, currentImageIndex: action.payload };
        case actionTypes.ADD_ACCOMMODATION:
            return { ...state, accommodations: [...state.accommodations, action.payload] };
        case actionTypes.UPDATE_ACCOMMODATION:
            return {
                ...state,
                accommodations: state.accommodations.map(acc =>
                    acc.id === action.payload.id ? action.payload : acc
                )
            };
        case actionTypes.REMOVE_ACCOMMODATION:
            return {
                ...state,
                accommodations: state.accommodations.filter(acc => acc.id !== action.payload)
            };
        case actionTypes.SET_VOTES:
            return { ...state, votes: action.payload };
        case actionTypes.SET_USER_VOTES:
            return { ...state, userVotes: action.payload };
        case actionTypes.SET_RATING:
            return { ...state, rating: action.payload };
        case actionTypes.SET_IS_VOTED:
            return { ...state, isVoted: action.payload };
        case actionTypes.ADD_VOTE:
            return { ...state, votes: [...state.votes, action.payload] };
        case actionTypes.UPDATE_VOTE:
            return {
                ...state,
                votes: state.votes.map(vote =>
                    vote.id === action.payload.id ? action.payload : vote
                )
            };
        case actionTypes.SET_LOADING:
            return { ...state, isLoading: action.payload };
        case actionTypes.SET_ERROR:
            return { ...state, error: action.payload };
        case actionTypes.SET_CURRENT_PAGE:
            return { ...state, currentPage: action.payload };
        case actionTypes.SET_IS_LIKED:
            return { ...state, isLiked: action.payload };
        case actionTypes.SET_SHOW_DELETE_MODAL:
            return { ...state, showDeleteModal: action.payload };
        case actionTypes.SET_DELETE_TARGET:
            return { ...state, deleteTarget: action.payload };
        case actionTypes.SET_ACCOMMODATION_TO_EDIT:
            return { ...state, accommodationToEdit: action.payload };

        // 통계 관련 액션 처리 추가
        case actionTypes.SET_ACCOMMODATION_STATS:
            return { ...state, accommodationStats: action.payload };
        case actionTypes.SET_USER_STATS:
            return { ...state, userStats: action.payload };
        case actionTypes.SET_VOTE_STATS:
            return { ...state, voteStats: action.payload };
        default:
            return state;
    }
};

// Context 생성
const AppContext = createContext();

// Context Provider 컴포넌트
export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // useCallback을 사용하여 액션 함수들을 메모이제이션
    const actions = {
        // 사용자 관련 액션들
        setCurrentUser: useCallback((user) => {
            dispatch({ type: actionTypes.SET_CURRENT_USER, payload: user });
        }, []),

        setUsers: useCallback((users) => {
            dispatch({ type: actionTypes.SET_USERS, payload: users });
        }, []),

        setIsAdmin: useCallback((isAdmin) => {
            dispatch({ type: actionTypes.SET_IS_ADMIN, payload: isAdmin });
        }, []),

        // 로그인 처리
        login: useCallback(async (userName) => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                dispatch({ type: actionTypes.SET_ERROR, payload: null });

                const response = await userService.login(userName);
                const user = response.user;

                dispatch({ type: actionTypes.SET_CURRENT_USER, payload: user });
                dispatch({ type: actionTypes.SET_IS_ADMIN, payload: user.is_admin });

                return response;
            } catch (error) {
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        // 사용자 목록 로드
        loadUsers: useCallback(async () => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                const usersResponse = await userService.getAllUsers();
                // Extract the actual array from the 'results' key
                const users = usersResponse.results || [];
                const safeUsers = Array.isArray(users) ? users : [];
                dispatch({ type: actionTypes.SET_USERS, payload: safeUsers });
                return safeUsers;
            } catch (error) {
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        // 숙소 관련 액션들
        setAccommodations: useCallback((accommodations) => {
            dispatch({ type: actionTypes.SET_ACCOMMODATIONS, payload: accommodations });
        }, []),

        setCurrentAccommodation: useCallback((index) => {
            dispatch({ type: actionTypes.SET_CURRENT_ACCOMMODATION, payload: index });
        }, []),

        setCurrentImageIndex: useCallback((index) => {
            dispatch({ type: actionTypes.SET_CURRENT_IMAGE_INDEX, payload: index });
        }, []),

        // 숙소 목록 로드
        loadAccommodations: useCallback(async () => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                const accommodationsResponse = await accommodationService.getAllAccommodations();
                console.log('Fetched accommodations from API:', accommodationsResponse); // Keep this log for debugging
                // Extract the actual array from the 'results' key
                const accommodations = accommodationsResponse.results || [];
                const safeAccommodations = Array.isArray(accommodations) ? accommodations : [];
                dispatch({ type: actionTypes.SET_ACCOMMODATIONS, payload: safeAccommodations });
                return safeAccommodations;
            } catch (error) {
                console.error('숙소 목록 로드 실패:', error);
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        // 숙소 생성
        createAccommodation: useCallback(async (accommodationData) => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                const newAccommodation = await accommodationService.createAccommodation(accommodationData);
                dispatch({ type: actionTypes.ADD_ACCOMMODATION, payload: newAccommodation });
                return newAccommodation;
            } catch (error) {
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        // 숙소 수정
        updateAccommodation: useCallback(async (accommodationId, accommodationData) => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                const updatedAccommodation = await accommodationService.updateAccommodation(accommodationId, accommodationData);
                dispatch({ type: actionTypes.UPDATE_ACCOMMODATION, payload: updatedAccommodation });
                // 숙소 업데이트 후 전체 숙소 목록을 다시 로드하여 최신 상태 반영
                await actions.loadAccommodations();
                return updatedAccommodation;
            } catch (error) {
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        // 숙소 삭제
        deleteAccommodation: useCallback(async (accommodationId) => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                await accommodationService.deleteAccommodation(accommodationId);
                dispatch({ type: actionTypes.REMOVE_ACCOMMODATION, payload: accommodationId });
            } catch (error) {
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        // 숙소 이미지 업로드
        uploadAccommodationImage: useCallback(async (accommodationId, imageFile, altText) => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                const uploadedImage = await accommodationService.uploadImage(accommodationId, imageFile, altText);
                // 이미지 업로드 후 숙소 데이터 다시 로드 (선택 사항, 필요에 따라)
                // actions.loadAccommodations(); 
                return uploadedImage;
            } catch (error) {
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        // 투표 관련 액션들
        setRating: useCallback((rating) => {
            dispatch({ type: actionTypes.SET_RATING, payload: rating });
        }, []),

        setIsVoted: useCallback((isVoted) => {
            dispatch({ type: actionTypes.SET_IS_VOTED, payload: isVoted });
        }, []),

        // 투표 생성/수정
        vote: useCallback(async (userId, accommodationId, rating) => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                const vote = await voteService.createOrUpdateVote(userId, accommodationId, rating);
                dispatch({ type: actionTypes.ADD_VOTE, payload: vote });
                dispatch({ type: actionTypes.SET_IS_VOTED, payload: true });
                return vote;
            } catch (error) {
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        // 특정 숙소의 투표 목록 로드
        loadAccommodationVotes: useCallback(async (accommodationId) => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                const votesResponse = await voteService.getAccommodationVotes(accommodationId);
                const votes = votesResponse.results || []; // results 키에서 투표 목록 추출
                return votes; // 투표 목록 반환
            } catch (error) {
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        // UI 상태 액션들
        setCurrentPage: useCallback((page) => {
            dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: page });
        }, []),

        setIsLiked: useCallback((isLiked) => {
            dispatch({ type: actionTypes.SET_IS_LIKED, payload: isLiked });
        }, []),

        setError: useCallback((error) => {
            dispatch({ type: actionTypes.SET_ERROR, payload: error });
        }, []),

        setLoading: useCallback((isLoading) => {
            dispatch({ type: actionTypes.SET_LOADING, payload: isLoading });
        }, []),

        // 모달 관련 액션들
        showDeleteModal: useCallback((target) => {
            dispatch({ type: actionTypes.SET_DELETE_TARGET, payload: target });
            dispatch({ type: actionTypes.SET_SHOW_DELETE_MODAL, payload: true });
        }, []),

        hideDeleteModal: useCallback(() => {
            dispatch({ type: actionTypes.SET_SHOW_DELETE_MODAL, payload: false });
            dispatch({ type: actionTypes.SET_DELETE_TARGET, payload: null });
        }, []),

        setAccommodationToEdit: useCallback((accommodation) => {
            dispatch({ type: actionTypes.SET_ACCOMMODATION_TO_EDIT, payload: accommodation });
        }, []),

        // 통계 관련 액션들 추가
        loadAccommodationStats: useCallback(async () => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                const stats = await accommodationService.getAccommodationStats();
                dispatch({ type: actionTypes.SET_ACCOMMODATION_STATS, payload: stats });
                return stats;
            } catch (error) {
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        loadUserStats: useCallback(async () => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                const stats = await userService.getUserStats();
                dispatch({ type: actionTypes.SET_USER_STATS, payload: stats });
                return stats;
            } catch (error) {
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        loadVoteStats: useCallback(async () => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });
                const stats = await voteService.getVoteStats();
                dispatch({ type: actionTypes.SET_VOTE_STATS, payload: stats });
                return stats;
            } catch (error) {
                dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
                throw error;
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        }, []),

        // 이미지 슬라이더 관련
        nextImage: useCallback(() => {
            const { accommodations, currentAccommodation, currentImageIndex } = state; // Access state directly
            const currentAccom = accommodations[currentAccommodation];
            if (currentAccom && currentAccom.images && currentAccom.images.length > 0) {
                const nextIndex = (currentImageIndex + 1) % currentAccom.images.length;
                dispatch({ type: actionTypes.SET_CURRENT_IMAGE_INDEX, payload: nextIndex });
            }
        }, [state.accommodations, state.currentAccommodation, state.currentImageIndex]),

        prevImage: useCallback(() => {
            const { accommodations, currentAccommodation, currentImageIndex } = state; // Access state directly
            const currentAccom = accommodations[currentAccommodation];
            if (currentAccom && currentAccom.images && currentAccom.images.length > 0) {
                const prevIndex = (currentImageIndex - 1 + currentAccom.images.length) % currentAccom.images.length;
                dispatch({ type: actionTypes.SET_CURRENT_IMAGE_INDEX, payload: prevIndex });
            }
        }, [state.accommodations, state.currentAccommodation, state.currentImageIndex]),

        // 숙소 네비게이션
        nextAccommodation: useCallback(() => {
            const { accommodations, currentAccommodation } = state; // Access state directly
            if (accommodations.length === 0) return; // Prevent errors with empty array
            const nextIndex = (currentAccommodation + 1) % accommodations.length;
            dispatch({ type: actionTypes.SET_CURRENT_ACCOMMODATION, payload: nextIndex });
        }, [state.accommodations, state.currentAccommodation]),

        prevAccommodation: useCallback(() => {
            const { accommodations, currentAccommodation } = state; // Access state directly
            if (accommodations.length === 0) return; // Prevent errors with empty array
            const prevIndex = (currentAccommodation - 1 + accommodations.length) % accommodations.length;
            dispatch({ type: actionTypes.SET_CURRENT_ACCOMMODATION, payload: prevIndex });
        }, [state.accommodations, state.currentAccommodation]),
    };

    // Context 값으로 제공할 객체 (메모이제이션)
    const value = React.useMemo(() => ({
        state,
        actions,
        dispatch,
    }), [state, actions]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Context를 사용하기 위한 커스텀 훅
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

// 액션 타입들을 외부에서 사용할 수 있도록 export
export { actionTypes };