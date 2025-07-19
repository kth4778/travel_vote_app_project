// React 기본 import
import React, { useEffect } from 'react';

// 토스트 알림 라이브러리
import toast from 'react-hot-toast';

// Context Hook
import { useApp } from '../context/AppContext';

// 페이지 컴포넌트들
import LoginPage from '../pages/LoginPage';
import MainPage from '../pages/MainPage';
import ResultPage from '../pages/ResultPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AccommodationForm from '../pages/admin/AccommodationForm';

// 공통 컴포넌트들
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import DeleteModal from './common/DeleteModal';

// 메인 애플리케이션 컴포넌트
const TravelVoteApp = () => {
    // 전역 상태 및 액션들 가져오기
    const { state, actions } = useApp();

    // 구조 분해 할당으로 필요한 상태값들 추출
    const {
        currentPage,
        currentUser,
        accommodations,
        isLoading,
        error,
        showDeleteModal,
        deleteTarget,
    } = state;

    // 컴포넌트 마운트 시 초기 데이터 로드
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 사용자 목록 로드
                await actions.loadUsers();

                // 숙소 목록 로드
                await actions.loadAccommodations();

                console.log('초기 데이터 로드 완료');
            } catch (error) {
                console.error('초기 데이터 로드 실패:', error);
                toast.error('데이터 로드에 실패했습니다.');
            }
        };

        loadInitialData();
    }, []);

    // 에러 발생 시 토스트 알림 표시
    useEffect(() => {
        if (error) {
            toast.error(error);
            // 에러 표시 후 3초 뒤에 에러 상태 초기화
            setTimeout(() => {
                actions.setError(null);
            }, 3000);
        }
    }, [error]);

    // 삭제 확인 모달 처리
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        try {
            // 삭제 대상 타입에 따라 다른 삭제 액션 실행
            if (deleteTarget.type === 'accommodation') {
                await actions.deleteAccommodation(deleteTarget.id);
                toast.success('숙소가 삭제되었습니다.');
            }
            // 추후 다른 타입의 삭제 기능 추가 가능

            // 모달 닫기
            actions.hideDeleteModal();

        } catch (error) {
            console.error('삭제 실패:', error);
            toast.error('삭제에 실패했습니다.');
        }
    };

    // 로딩 중일 때 로딩 스피너 표시
    if (isLoading && (!accommodations || accommodations.length === 0)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // 현재 페이지에 따라 다른 컴포넌트 렌더링
    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'login':
                return <LoginPage />;

            case 'main':
                return <MainPage />;

            case 'result':
                return <ResultPage />;

            case 'admin-dashboard':
                return <AdminDashboard />;

            case 'admin-edit':
                return <AccommodationForm />;

            default:
                return <LoginPage />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 현재 페이지 렌더링 */}
            {renderCurrentPage()}

            {/* 삭제 확인 모달 */}
            {showDeleteModal && (
                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={actions.hideDeleteModal}
                    onConfirm={handleDeleteConfirm}
                    title="삭제 확인"
                    message={`"${deleteTarget?.name || '항목'}"을(를) 삭제하시겠습니까?`}
                    confirmText="삭제"
                    cancelText="취소"
                />
            )}

            {/* 전역 에러 메시지 (페이지 하단에 표시) */}
            {error && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
                    <ErrorMessage message={error} />
                </div>
            )}
        </div>
    );
};

export default TravelVoteApp;