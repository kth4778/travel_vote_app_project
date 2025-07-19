// React 기본 import
import React, { useEffect } from 'react';

// 아이콘 import
import { AlertTriangle, X } from 'lucide-react';

// 삭제 확인 모달 컴포넌트
const DeleteModal = ({
                         isOpen,
                         onClose,
                         onConfirm,
                         title = '삭제 확인',
                         message = '정말로 삭제하시겠습니까?',
                         confirmText = '삭제',
                         cancelText = '취소',
                         isDangerous = true,
                     }) => {
    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'hidden'; // 스크롤 방지
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'unset'; // 스크롤 복원
        };
    }, [isOpen, onClose]);

    // 모달이 열려있지 않으면 렌더링하지 않음
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* 배경 오버레이 */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* 모달 콘텐츠 */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
                    {/* 닫기 버튼 */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* 모달 내용 */}
                    <div className="p-6">
                        {/* 경고 아이콘 */}
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        {/* 제목 */}
                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                            {title}
                        </h3>

                        {/* 메시지 */}
                        <p className="text-sm text-gray-600 text-center mb-6">
                            {message}
                            {isDangerous && (
                                <span className="block mt-2 text-red-600 font-medium">
                  이 작업은 되돌릴 수 없습니다.
                </span>
                            )}
                        </p>

                        {/* 버튼들 */}
                        <div className="flex gap-3">
                            {/* 취소 버튼 */}
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                {cancelText}
                            </button>

                            {/* 확인 버튼 */}
                            <button
                                onClick={onConfirm}
                                className={`
                  flex-1 px-4 py-3 text-sm font-medium text-white rounded-lg transition-colors
                  ${isDangerous
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                }
                `}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;