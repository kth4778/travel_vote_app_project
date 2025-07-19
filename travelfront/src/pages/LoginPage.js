// React 기본 import
import React, { useState, useEffect } from 'react';

// 토스트 알림 라이브러리
import toast from 'react-hot-toast';

// 아이콘 import
import { Settings } from 'lucide-react';

// Context Hook
import { useApp } from '../context/AppContext';

// 공통 컴포넌트
import LoadingSpinner from '../components/common/LoadingSpinner';

// 로그인 페이지 컴포넌트
const LoginPage = () => {
    // 전역 상태 및 액션들 가져오기
    const { state, actions } = useApp();
    const { users, isLoading } = state;

    // 로컬 상태
    const [selectedName, setSelectedName] = useState('');
    const [password, setPassword] = useState(''); // 비밀번호 상태 추가
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 친구들 이름 목록 (초기값 - API에서 로드되면 대체됨)
    const defaultFriends = [
        '운태', '원태', '희성', '현식', '준태', '동현', '래현',
        '민기', '병현', '상민', '상준', '제준', '진홍', '준엽'
    ];

    // 사용자 목록 (API에서 로드된 사용자가 있으면 사용, 없으면 기본값)
    const friendsList = users.length > 0 ? users : defaultFriends.map(name => ({ name }));

    // 이름 선택 처리
    const handleNameSelect = (name) => {
        setSelectedName(name);
    };

    // 로그인 처리
    const handleLogin = async () => {
        if (!selectedName) {
            toast.error('이름을 선택해주세요.');
            return;
        }

        // '운태'로 로그인 시 비밀번호 확인
        if (selectedName === '운태') {
            if (password !== '0316') {
                toast.error('비밀번호가 올바르지 않습니다.');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            // 로그인 API 호출
            const response = await actions.login(selectedName);

            // 성공 메시지 표시
            toast.success(response.message || `${selectedName}님 환영합니다!`);

            // 0.5초 후 메인 페이지로 이동
            setTimeout(() => {
                actions.setCurrentPage('main');
            }, 500);

        } catch (error) {
            console.error('로그인 실패:', error);
            toast.error('로그인에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 로딩 중일 때 스피너 표시
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <LoadingSpinner text="사용자 정보를 불러오는 중..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 hover:scale-105">

                {/* 헤더 섹션 */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🏨</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        여행 숙소 투표
                    </h1>
                    <p className="text-gray-600">
                        친구들과 함께 최고의 숙소를 선택해보세요!
                    </p>
                </div>

                {/* 이름 선택 섹션 */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-4">
                        이름을 선택하세요
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        {friendsList.map((friend, index) => (
                            <button
                                key={friend.name || index}
                                onClick={() => handleNameSelect(friend.name)}
                                disabled={isSubmitting}
                                className={`
                  p-3 rounded-2xl border-2 transition-all duration-300 font-medium relative
                  ${selectedName === friend.name
                                    ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                `}
                            >
                                {friend.name}

                                {/* 관리자 표시 (운태인 경우) */}
                                {friend.name === '운태' && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                        <Settings className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 선택된 이름 표시 */}
                {selectedName && (
                    <div className={`
            text-center mb-6 p-4 rounded-2xl transition-all duration-300
            ${selectedName === '운태' ? 'bg-orange-50' : 'bg-blue-50'}
          `}>
                        <p className={`
              font-medium
              ${selectedName === '운태' ? 'text-orange-800' : 'text-blue-800'}
            `}>
                            선택된 이름: <span className="font-bold">{selectedName}</span>
                            {selectedName === '운태' && (
                                <span className="ml-2 inline-flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  관리자
                </span>
                            )}
                        </p>
                    </div>
                )}

                {/* 비밀번호 입력 필드 (운태 선택 시에만 표시) */}
                {selectedName === '운태' && (
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="비밀번호를 입력하세요"
                            disabled={isSubmitting}
                        />
                    </div>
                )}

                {/* 로그인 버튼 */}
                <button
                    onClick={handleLogin}
                    disabled={!selectedName || (selectedName === '운태' && !password) || isSubmitting}
                    className={`
            w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300
            ${selectedName
                        ? selectedName === '운태'
                            ? 'bg-orange-500 text-white hover:bg-orange-600 transform hover:scale-105 shadow-lg'
                            : 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105 shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            로그인 중...
                        </div>
                    ) : (
                        selectedName === '운태' ? '관리자로 입장' : '입장하기'
                    )}
                </button>

                {/* 개발자 정보 (선택사항) */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        여름휴가 여행 • 2025.08.10 - 08.11
                    </p>
                    <div className="mt-2 flex justify-center gap-2">
                        <span className="text-xs text-gray-400">총 {friendsList.length}명</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">실시간 투표</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;