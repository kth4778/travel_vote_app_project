// React 기본 import
import React, { useState, useEffect } from 'react';

// 토스트 알림 라이브러리
import toast from 'react-hot-toast';

// 아이콘 import
import { Heart, MapPin, Settings, ChevronLeft, ChevronRight, Send, X } from 'lucide-react';

// Context Hook
import { useApp } from '../context/AppContext';

// 유틸리티 함수
import { formatPrice, getAmenityIcon, getAmenityName, getTimeAgo } from '../utils/helpers';
import ReactMarkdown from 'react-markdown';

// 메인 페이지 컴포넌트
const MainPage = () => {
  // 전역 상태 및 액션들 가져오기
  const { state, actions } = useApp();

  // 구조 분해 할당으로 필요한 상태값들 추출
  const {
    currentUser,
    isAdmin,
    accommodations,
    currentAccommodation,
    currentImageIndex,
    rating,
    isVoted,
    isLiked,
    isLoading,
    users, // users 추가
  } = state;

  // 로컬 상태 - 기본값을 빈 배열로 설정
  const [votedAccommodations, setVotedAccommodations] = useState(new Set());
  const [showImageModal, setShowImageModal] = useState(false); // 이미지 모달 표시 여부
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // 모달에서 선택된 이미지 인덱스
  const [currentAccommodationVotes, setCurrentAccommodationVotes] = useState([]); // 현재 숙소의 투표 목록

  // 현재 숙소 정보
  const currentAccom = accommodations[currentAccommodation];

  // 컴포넌트 마운트 시 또는 currentAccom.id 변경 시 투표 데이터 로드
  useEffect(() => {
    const fetchVotes = async () => {
      if (currentAccom?.id) {
        try {
          const votes = await actions.loadAccommodationVotes(currentAccom.id);
          setCurrentAccommodationVotes(votes);
        } catch (err) {
          toast.error('숙소 투표 정보를 불러오는데 실패했습니다.');
          console.error('Failed to load accommodation votes:', err);
        }
      }
    };
    fetchVotes();
  }, [currentAccom?.id, actions.loadAccommodationVotes]); // Direct dependencies

  // 숙소 변경 시 투표 상태 초기화
  useEffect(() => {
    if (isVoted) { // isVoted가 true일 때만 초기화
      actions.setIsVoted(false);
    }
  }, [currentAccom?.id, actions, isVoted]);

  // 투표 처리
  const handleVote = async () => {
    if (!currentUser || !currentAccom) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      await actions.vote(currentUser.id, currentAccom.id, rating);

      // 투표 완료 상태 업데이트
      setVotedAccommodations(prev => new Set(prev).add(currentAccom.id));

      // 투표 완료 애니메이션
      actions.setIsVoted(true);

      toast.success(`${currentAccom.name}에 ${rating}점을 투표했습니다!`);

      // 투표 완료 후 자동으로 결과 페이지로 이동하지 않음. 사용자가 직접 '결과보기' 버튼을 눌러야 함.

    } catch (error) {
      console.error('투표 실패:', error);
      toast.error('투표에 실패했습니다.');
    }
  };

  // 이미지 슬라이더 처리
  const handleImageSlide = (direction) => {
    if (!currentAccom || !currentAccom.images || currentAccom.images.length === 0) return;

    if (direction === 'next') {
      const nextIndex = (currentImageIndex + 1) % currentAccom.images.length;
      actions.setCurrentImageIndex(nextIndex);
    } else {
      const prevIndex = (currentImageIndex - 1 + currentAccom.images.length) % currentAccom.images.length;
      actions.setCurrentImageIndex(prevIndex);
    }
  };

  // 이미지 클릭 시 모달 열기
  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  // 이미지 모달 닫기
  const handleCloseImageModal = () => {
    setShowImageModal(false);
  };

  // 모달 내 이미지 슬라이드
  const handleModalImageSlide = (direction) => {
    if (!currentAccom || !currentAccom.images || currentAccom.images.length === 0) return;

    if (direction === 'next') {
      setSelectedImageIndex(prevIndex => (prevIndex + 1) % currentAccom.images.length);
    } else {
      setSelectedImageIndex(prevIndex => (prevIndex - 1 + currentAccom.images.length) % currentAccom.images.length);
    }
  };

  // 숙소 변경 처리
  const handleAccommodationChange = (direction) => {
    if (direction === 'next') {
      actions.nextAccommodation();
    } else {
      actions.prevAccommodation();
    }
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">숙소 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 데이터가 없는데 로딩이 끝났을 때 (빈 상태)
  if (!accommodations.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-6xl mb-4">🏨</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">등록된 숙소가 없습니다</h2>
          <p className="text-gray-600 mb-6">관리자 대시보드에서 새로운 숙소를 추가해주세요.</p>
          {isAdmin && (
            <button
              onClick={() => actions.setCurrentPage('admin-dashboard')}
              className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors"
            >
              관리자 대시보드로 이동
            </button>
          )}
        </div>
      </div>
    );
  }

  // currentAccom이 정의되지 않았을 경우 (accommodations는 있지만 currentAccommodation 인덱스가 유효하지 않을 때)
  if (!currentAccom) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">숙소 정보를 찾을 수 없습니다</h2>
                  <p className="text-gray-600 mb-6">문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                  <button
                      onClick={() => actions.loadAccommodations()}
                      className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors"
                  >
                      다시 로드하기
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">여름휴가 여행</h2>
              <p className="text-sm text-gray-600">2025.08.10 - 08.11</p>
            </div>
            <div className="flex items-center space-x-2">
              {/* 관리자 버튼 */}
              {isAdmin && (
                <button
                  onClick={() => actions.setCurrentPage('admin-dashboard')}
                  className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              {/* 사용자 아바타 */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                isAdmin ? 'bg-orange-500' : 'bg-blue-500'
              }`}>
                {currentUser?.name?.[0] || '?'}
              </div>
              <span className="text-sm text-gray-600">{currentUser?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 관리자 알림 */}
      {isAdmin && (
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">관리자 모드 활성화</span>
            </div>
          </div>
        </div>
      )}

      {/* 진행률 표시 */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">진행률</span>
          <span className="text-sm font-medium text-blue-600">
            {currentAccommodation + 1} / {accommodations.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentAccommodation + 1) / accommodations.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 숙소 카드 */}
      <div className="max-w-md mx-auto px-4 pb-24">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

          {/* 관리자 액션 버튼 */}
          {isAdmin && (
            <div className="bg-orange-50 px-6 py-3 flex justify-between items-center">
              <span className="text-sm font-medium text-orange-800">관리자 액션</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    actions.setAccommodationToEdit(currentAccom);
                    actions.setCurrentPage('admin-edit');
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => {
                    // 삭제 확인 모달 표시
                    actions.showDeleteModal({
                      type: 'accommodation',
                      id: currentAccom.id,
                      name: currentAccom.name
                    });
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          )}

          {/* 이미지 슬라이더 */}
          <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200" onClick={() => handleImageClick(currentImageIndex)}>
            {/* 이미지 또는 플레이스홀더 */}
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
              <div className="text-center">
                {currentAccom.images && currentAccom.images.length > 0 ? (
                  currentAccom.images[currentImageIndex]?.image ? (
                    <img
                      src={currentAccom.images[currentImageIndex].image}
                      alt={currentAccom.images[currentImageIndex].alt_text || currentAccom.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <>
                      <div className="text-4xl mb-2">🏨</div>
                      <p className="text-gray-600 text-sm">{currentAccom.images[currentImageIndex]?.alt_text || currentAccom.name}</p>
                    </>
                  )
                ) : (
                  <>
                    <div className="text-4xl mb-2">🏨</div>
                    <p className="text-gray-600 text-sm">이미지 {currentImageIndex + 1} / 1</p>
                  </>
                )}
              </div>
            </div>

            {/* 이미지 네비게이션 */}
            {currentAccom.images && currentAccom.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleImageSlide('prev'); }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleImageSlide('next'); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </>
            )}

            </div>

          {/* 숙소 정보 */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{currentAccom.name}</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {currentAccom.location}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(currentAccom.price)}
                </p>
                <p className="text-sm text-gray-500">/ 박</p>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
                <ReactMarkdown>{currentAccom.description}</ReactMarkdown>
            </div>

            {/* 편의시설 */}
            {currentAccom.amenities && currentAccom.amenities.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {currentAccom.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-600">
                    <span className="text-lg">{getAmenityIcon(amenity)}</span>
                    <span className="text-sm">{getAmenityName(amenity)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 체크인/아웃 정보 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-2xl">
                <p className="text-sm text-gray-600">체크인</p>
                <p className="font-semibold">{currentAccom.check_in.substring(0, 5)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl">
                <p className="text-sm text-gray-600">체크아웃</p>
                <p className="font-semibold">{currentAccom.check_out.substring(0, 5)}</p>
              </div>
            </div>

            {/* 평점 시스템 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">⭐ 이 숙소에 점수를 주세요</h4>
                <div className="text-2xl font-bold text-blue-600">{rating}점</div>
              </div>

              <div className="relative">
                <div className="h-12 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full"></div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => actions.setRating(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-12 opacity-0 cursor-pointer"
                />
                <div
                  className="absolute top-1 w-10 h-10 bg-white border-4 border-blue-500 rounded-full shadow-lg transition-all duration-200"
                  style={{ left: `${(rating - 1) * 10}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1점</span>
                <span>10점</span>
              </div>
            </div>

            {/* 투표 버튼 */}
            <button
              onClick={handleVote}
              className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                votedAccommodations.has(currentAccom.id)
                  ? 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105 shadow-lg'
                  : 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105 shadow-lg'
              }`}
            >
              {votedAccommodations.has(currentAccom.id) ? '✓ 투표 수정' : '투표하기'}
            </button>

            {/* 투표 현황 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">📊 투표 현황</h4>
                <span className="text-sm text-gray-600">
                  총 투표 수: {currentAccom.vote_count || 0}명
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {console.log('Users:', users, 'Current Accommodation Votes:', currentAccommodationVotes)}
                {users.map((user) => {
                  const hasVoted = currentAccommodationVotes.some(vote => vote.user.id === user.id);
                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-md text-sm font-medium text-center min-w-fit ${
                        hasVoted ? 'bg-green-500 text-white' : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                      title={user.name}
                    >
                      {user.name}
                    </div>
                  );
                })}
              </div>
            </div>

            
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
        <div className="flex">
          <button
            onClick={() => handleAccommodationChange('prev')}
            className="flex-1 py-4 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
            disabled={currentAccommodation === 0}
          >
            ← 이전 숙소
          </button>
          <button
            onClick={() => actions.setCurrentPage('result')}
            className="flex-1 py-4 text-green-600 font-semibold hover:bg-green-50 transition-colors"
          >
            📊 결과보기
          </button>
          <button
            onClick={() => handleAccommodationChange('next')}
            className="flex-1 py-4 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
            disabled={currentAccommodation === accommodations.length - 1}
          >
            다음 숙소 →
          </button>
        </div>
      </div>

      {/* 이미지 모달 */}
      {showImageModal && currentAccom && currentAccom.images && currentAccom.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full max-w-xl h-96">
            {/* 이미지 */}
            <img
              src={currentAccom.images[selectedImageIndex]?.image || currentAccom.images[selectedImageIndex]?.preview}
              alt={currentAccom.images[selectedImageIndex]?.alt_text || currentAccom.name}
              className="w-full h-full object-contain"
            />

            {/* 닫기 버튼 */}
            <button
              onClick={handleCloseImageModal}
              className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 이미지 네비게이션 */}
            {currentAccom.images.length > 1 && (
              <>
                <button
                  onClick={() => handleModalImageSlide('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleModalImageSlide('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* 이미지 인디케이터 */}
            {currentAccom.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {currentAccom.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-3 h-3 rounded-full ${index === selectedImageIndex ? 'bg-white' : 'bg-gray-400'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;