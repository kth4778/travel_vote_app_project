// 유틸리티 함수들

// 기존 내용 유지하고 다음 함수만 수정

// 숫자를 한국어 형태로 포맷팅 (예: 120000 -> "120,000원")
export const formatPrice = (price) => {
    if (!price) return '0원';
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

// 시간 차이를 "몇 분 전", "몇 시간 전" 형태로 변환
export const getTimeAgo = (dateString) => {
    if (!dateString) return '';

    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return '방금 전';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`;
    } else {
        return `${diffInDays}일 전`;
    }
};

// 편의시설 아이콘 매핑
export const getAmenityIcon = (amenity) => {
    const iconMap = {
        wifi: '📶',
        parking: '🚗',
        pool: '🏊',
        restaurant: '🍽️',
        kitchen: '🍳',
    };
    return iconMap[amenity] || '📋';
};

// 편의시설 이름 매핑
export const getAmenityName = (amenity) => {
    const nameMap = {
        wifi: 'WiFi',
        parking: '주차장',
        pool: '수영장',
        restaurant: '레스토랑',
        kitchen: '주방',
    };
    return nameMap[amenity] || amenity;
};

// 평점을 색상으로 매핑
export const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    if (rating >= 4) return 'text-orange-600';
    return 'text-red-600';
};

// 참여율을 색상으로 매핑
export const getParticipationColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
};

// 사용자 이름의 첫 글자를 반환 (아바타용)
export const getInitial = (name) => {
    return name ? name[0] : '?';
};

// 배열을 무작위로 섞기
export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// 디바운스 함수 (검색 등에 사용)
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// 로컬 스토리지 관련 함수들
export const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('로컬 스토리지 읽기 실패:', error);
            return null;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('로컬 스토리지 저장 실패:', error);
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('로컬 스토리지 삭제 실패:', error);
        }
    },

    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('로컬 스토리지 전체 삭제 실패:', error);
        }
    }
};

// 에러 메시지 한글화
export const getErrorMessage = (error) => {
    if (error.response) {
        // 서버 응답 에러
        const { status, data } = error.response;

        if (status === 404) {
            return '요청한 데이터를 찾을 수 없습니다.';
        } else if (status === 400) {
            return '잘못된 요청입니다.';
        } else if (status === 500) {
            return '서버 오류가 발생했습니다.';
        } else if (data && data.error) {
            return data.error;
        }
    } else if (error.request) {
        // 네트워크 에러
        return '네트워크 연결을 확인해주세요.';
    }

    return error.message || '알 수 없는 오류가 발생했습니다.';
};