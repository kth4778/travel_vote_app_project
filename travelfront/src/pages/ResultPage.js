// React 기본 import
import React, { useState, useEffect } from 'react';

// 토스트 알림 라이브러리
import toast from 'react-hot-toast';

// 아이콘 import
import { Settings, Edit, Crown, Medal, Award } from 'lucide-react';

// Context Hook
import { useApp } from '../context/AppContext';

// 유틸리티 함수
import { formatPrice } from '../utils/helpers';

// 결과 페이지 컴포넌트
const ResultPage = () => {
    // 전역 상태 및 액션들 가져오기
    const { state, actions } = useApp();

    // 구조 분해 할당으로 필요한 상태값들 추출
    const {
        currentUser,
        isAdmin,
        accommodations,
        isLoading,
    } = state;

    // 로컬 상태
    const [sortedAccommodations, setSortedAccommodations] = useState([]);
    const [overallStats, setOverallStats] = useState({
        totalVotes: 0,
        averageRating: 0,
        participationRate: 0,
        totalAccommodations: 0,
    });

    // 컴포넌트 마운트 시 데이터 로드 및 결과 계산
    useEffect(() => {
        // 최신 숙소 데이터를 다시 로드 (컴포넌트 마운트 시 한 번만)
        actions.loadAccommodations();
    }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행

    useEffect(() => {
        // accommodations가 업데이트될 때마다 결과 계산
        if (accommodations.length > 0) {
            calculateResults();
        }
    }, [accommodations]); // accommodations가 변경될 때만 calculateResults 호출

    // 결과 계산 및 정렬
    const calculateResults = () => {
        // 평균 평점 기준으로 내림차순 정렬
        const sorted = [...accommodations].sort((a, b) => {
            // 평점이 같으면 투표 수로 비교
            if (b.average_rating === a.average_rating) {
                return (b.vote_count || 0) - (a.vote_count || 0);
            }
            return (b.average_rating || 0) - (a.average_rating || 0);
        });

        setSortedAccommodations(sorted);

        // 전체 통계 계산
        const totalVotes = accommodations.reduce((sum, acc) => sum + (acc.vote_count || 0), 0);
        const totalRating = accommodations.reduce((sum, acc) => sum + (acc.average_rating || 0), 0);
        const averageRating = accommodations.length > 0 ? totalRating / accommodations.length : 0;
        const participationRate = (totalVotes / (14 * accommodations.length)) * 100; // 14명 기준

        setOverallStats({
            totalVotes,
            averageRating: averageRating.toFixed(1),
            participationRate: Math.round(participationRate),
            totalAccommodations: accommodations.length,
        });
    };

    // 순위 아이콘 가져오기
    const getRankIcon = (index) => {
        switch (index) {
            case 0:
                return <Crown className="w-6 h-6 text-yellow-500" />;
            case 1:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 2:
                return <Award className="w-6 h-6 text-orange-400" />;
            default:
                return <span className="text-lg font-bold">{index + 1}</span>;
        }
    };

    // 순위별 배경색 가져오기
    const getRankBackground = (index) => {
        switch (index) {
            case 0:
                return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400';
            case 1:
                return 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300';
            case 2:
                return 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-300';
            default:
                return 'bg-white border border-gray-200';
        }
    };

    // 평점 바 색상 가져오기
    const getRatingBarColor = (rating) => {
        if (rating >= 8) return 'from-green-400 to-green-600';
        if (rating >= 6) return 'from-yellow-400 to-yellow-600';
        if (rating >= 4) return 'from-orange-400 to-orange-600';
        return 'from-red-400 to-red-600';
    };

    // 숙소 수정 처리
    const handleEditAccommodation = (accommodation) => {
        if (!isAdmin) {
            toast.error('관리자 권한이 필요합니다.');
            return;
        }
        actions.setAccommodationToEdit(accommodation);
        actions.setCurrentPage('admin-edit');
    };

    // 로딩 중일 때
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">결과를 집계하는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto">

                {/* 헤더 */}
                <div className="bg-white shadow-sm sticky top-0 z-50">
                    <div className="px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">🏆 투표 결과</h2>
                                <p className="text-sm text-gray-600">실시간 투표 결과</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* 관리자 대시보드 버튼 */}
                                {isAdmin && (
                                    <button
                                        onClick={() => actions.setCurrentPage('admin-dashboard')}
                                        className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-1"
                                    >
                                        <Settings className="w-3 h-3" />
                                        관리자
                                    </button>
                                )}

                                {/* 돌아가기 버튼 */}
                                <button
                                    onClick={() => actions.setCurrentPage('main')}
                                    className="text-blue-600 font-semibold"
                                >
                                    돌아가기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 전체 통계 요약 */}
                <div className="px-4 py-4">
                    <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            📊 전체 통계
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-2xl">
                                <div className="text-2xl font-bold text-blue-600">
                                    {overallStats.participationRate}%
                                </div>
                                <div className="text-sm text-gray-600">전체 참여율</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-2xl">
                                <div className="text-2xl font-bold text-green-600">
                                    {overallStats.averageRating}
                                </div>
                                <div className="text-sm text-gray-600">평균 점수</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-2xl">
                                <div className="text-2xl font-bold text-purple-600">
                                    {overallStats.totalVotes}
                                </div>
                                <div className="text-sm text-gray-600">총 투표 수</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-2xl">
                                <div className="text-2xl font-bold text-orange-600">
                                    {overallStats.totalAccommodations}
                                </div>
                                <div className="text-sm text-gray-600">총 숙소 수</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 결과 카드들 */}
                <div className="px-4 py-2 space-y-4">
                    {sortedAccommodations.map((accommodation, index) => (
                        <div
                            key={accommodation.id}
                            className={`rounded-3xl shadow-lg p-6 transform transition-all duration-300 hover:scale-102 ${getRankBackground(index)}`}
                        >

                            {/* 순위 및 기본 정보 */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {/* 순위 아이콘 */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                        index === 0 ? 'bg-yellow-400 text-white' :
                                            index === 1 ? 'bg-gray-400 text-white' :
                                                index === 2 ? 'bg-orange-400 text-white' :
                                                    'bg-gray-200 text-gray-600'
                                    }`}>
                                        {index < 3 ? getRankIcon(index) : index + 1}
                                    </div>

                                    {/* 숙소 정보 */}
                                    <div>
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            {accommodation.name}
                                            {index === 0 && <span className="text-2xl">👑</span>}
                                        </h3>
                                        <p className="text-sm text-gray-600">{accommodation.location}</p>
                                    </div>
                                </div>

                                {/* 관리자 수정 버튼 */}
                                {isAdmin && (
                                    <button
                                        onClick={() => handleEditAccommodation(accommodation)}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* 평점 바 */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">평균 점수</span>
                                    <span className="font-bold text-lg">
                    {accommodation.average_rating || 0}/10
                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                    <div
                                        className={`h-4 rounded-full bg-gradient-to-r ${getRatingBarColor(accommodation.average_rating || 0)} transition-all duration-1000 ease-out`}
                                        style={{
                                            width: `${((accommodation.average_rating || 0) / 10) * 100}%`,
                                            animationDelay: `${index * 0.2}s`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* 통계 정보 */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {accommodation.vote_count || 0}명
                                    </div>
                                    <div className="text-xs text-gray-600">투표</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-green-600">
                                        {formatPrice(accommodation.price)}
                                    </div>
                                    <div className="text-xs text-gray-600">1박</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-purple-600">
                                        {Math.round(((accommodation.vote_count || 0) / 14) * 100)}%
                                    </div>
                                    <div className="text-xs text-gray-600">참여율</div>
                                </div>
                            </div>

                            {/* 1위 특별 표시 */}
                            {index === 0 && (
                                <div className="mt-4 p-3 bg-yellow-100 rounded-2xl text-center">
                                    <p className="text-yellow-800 font-medium text-sm">
                                        🎉 최고 인기 숙소로 선정되었습니다! 🎉
                                    </p>
                                </div>
                            )}

                            {/* 편의시설 미리보기 (1-3위만) */}
                            {index < 3 && accommodation.amenities && accommodation.amenities.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex flex-wrap gap-2">
                                        {accommodation.amenities.slice(0, 3).map((amenity, amenityIndex) => (
                                            <span
                                                key={amenityIndex}
                                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                            >
                        {amenity}
                      </span>
                                        ))}
                                        {accommodation.amenities.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{accommodation.amenities.length - 3}개 더
                      </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 결과 없을 때 */}
                {sortedAccommodations.length === 0 && (
                    <div className="px-4 py-12">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🏨</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                아직 투표 결과가 없습니다
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                친구들이 투표를 완료하면 결과가 여기에 표시됩니다.
                            </p>
                            <button
                                onClick={() => actions.setCurrentPage('main')}
                                className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors"
                            >
                                투표하러 가기
                            </button>
                        </div>
                    </div>
                )}

                {/* 하단 여백 */}
                <div className="h-20"></div>
            </div>

            {/* 플로팅 액션 버튼 */}
            <div className="fixed bottom-6 right-6">
                <button
                    onClick={() => {
                        // 새로고침으로 최신 데이터 로드
                        actions.loadAccommodations();
                        toast.success('결과를 새로고침했습니다!');
                    }}
                    className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-110 flex items-center justify-center"
                >
                    <span className="text-xl">🔄</span>
                </button>
            </div>
        </div>
    );
};

export default ResultPage;