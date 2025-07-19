// React 기본 import
import React from 'react';

// 아이콘 import
import { AlertCircle, X } from 'lucide-react';

// 에러 메시지 컴포넌트
const ErrorMessage = ({
                          message,
                          type = 'error',
                          onClose,
                          className = ''
                      }) => {
    // 타입별 스타일 매핑
    const typeStyles = {
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
    };

    // 타입별 아이콘 색상
    const iconColors = {
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500',
        success: 'text-green-500',
    };

    return (
        <div className={`
      flex items-center gap-3 p-4 rounded-lg border
      ${typeStyles[type]} ${className}
    `}>
            {/* 아이콘 */}
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${iconColors[type]}`} />

            {/* 메시지 */}
            <p className="flex-1 text-sm font-medium">
                {message}
            </p>

            {/* 닫기 버튼 */}
            {onClose && (
                <button
                    onClick={onClose}
                    className={`
            flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 
            transition-colors ${iconColors[type]}
          `}
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

// 인라인 에러 메시지 (폼 필드 등에 사용)
export const InlineError = ({ message, className = '' }) => {
    if (!message) return null;

    return (
        <div className={`flex items-center gap-2 mt-1 ${className}`}>
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-600">{message}</span>
        </div>
    );
};

// 빈 상태 메시지 컴포넌트
export const EmptyState = ({
                               icon,
                               title,
                               description,
                               action,
                               className = ''
                           }) => {
    return (
        <div className={`text-center py-12 ${className}`}>
            {/* 아이콘 */}
            {icon && (
                <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
                    {icon}
                </div>
            )}

            {/* 제목 */}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                {title}
            </h3>

            {/* 설명 */}
            {description && (
                <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                    {description}
                </p>
            )}

            {/* 액션 버튼 */}
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
};

export default ErrorMessage;