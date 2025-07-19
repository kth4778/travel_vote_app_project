// React 기본 import
import React from 'react';

// 로딩 스피너 컴포넌트
const LoadingSpinner = ({
                            size = 'medium',
                            color = 'blue',
                            text = '로딩 중...'
                        }) => {
    // 크기별 스타일 매핑
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
    };

    // 색상별 스타일 매핑
    const colorClasses = {
        blue: 'border-blue-500',
        orange: 'border-orange-500',
        green: 'border-green-500',
        gray: 'border-gray-500',
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            {/* 회전하는 원형 스피너 */}
            <div className="relative">
                <div
                    className={`${sizeClasses[size]} ${colorClasses[color]} border-4 border-solid border-t-transparent rounded-full animate-spin`}
                />
            </div>

            {/* 로딩 텍스트 */}
            {text && (
                <p className="text-sm text-gray-600 font-medium">
                    {text}
                </p>
            )}
        </div>
    );
};

// 인라인 로딩 스피너 (버튼 내부 등에 사용)
export const InlineSpinner = ({ size = 'small', color = 'white' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-6 h-6',
    };

    const colorClasses = {
        white: 'border-white',
        gray: 'border-gray-500',
        blue: 'border-blue-500',
    };

    return (
        <div
            className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-solid border-t-transparent rounded-full animate-spin`}
        />
    );
};

// 스켈레톤 로딩 컴포넌트
export const SkeletonLoader = ({ className = '' }) => {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    );
};

// 카드 스켈레톤 로딩
export const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
            {/* 이미지 영역 */}
            <div className="h-64 bg-gray-200" />

            {/* 콘텐츠 영역 */}
            <div className="p-6 space-y-4">
                {/* 제목 */}
                <div className="h-6 bg-gray-200 rounded w-3/4" />

                {/* 위치 */}
                <div className="h-4 bg-gray-200 rounded w-1/2" />

                {/* 설명 */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>

                {/* 버튼 */}
                <div className="h-12 bg-gray-200 rounded-2xl" />
            </div>
        </div>
    );
};

export default LoadingSpinner;