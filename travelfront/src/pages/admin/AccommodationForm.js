// React 기본 import
import React, { useState, useEffect } from 'react';

// 토스트 알림 라이브러리
import toast from 'react-hot-toast';

// 아이콘 import
import { ArrowLeft, Save, Upload, X, Plus, Trash2 } from 'lucide-react';

// Context Hook
import { useApp } from '../../context/AppContext';

// 숙소 등록/수정 폼 컴포넌트
const AccommodationForm = () => {
    // 전역 상태 및 액션들 가져오기
    const { state, actions } = useApp();
    const { currentUser, isLoading, accommodationToEdit } = state;

    // 로컬 상태
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        price: '',
        description: '',
        check_in: '15:00',
        check_out: '11:00',
        amenities: [],
        images: [] // 실제 이미지 파일과 미리보기 URL을 저장할 배열
    });

    useEffect(() => {
        if (accommodationToEdit) {
            // 기존 숙소 데이터를 폼에 채움
            setFormData({
                name: accommodationToEdit.name,
                location: accommodationToEdit.location,
                price: accommodationToEdit.price,
                description: accommodationToEdit.description,
                check_in: accommodationToEdit.check_in.substring(0, 5), // 시간 형식 맞추기
                check_out: accommodationToEdit.check_out.substring(0, 5), // 시간 형식 맞추기
                amenities: accommodationToEdit.amenities || [],
                // 기존 이미지는 그대로 사용하고, preview URL을 생성
                images: accommodationToEdit.images.map(img => ({
                    ...img,
                    preview: img.image // 이미 URL이 있는 경우 그대로 사용
                })) || []
            });
        } else {
            // 새 숙소 등록 시 폼 초기화
            setFormData({
                name: '',
                location: '',
                price: '',
                description: '',
                check_in: '15:00',
                check_out: '11:00',
                amenities: [],
                images: []
            });
        }
    }, [accommodationToEdit]);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 편의시설 옵션
    const amenityOptions = [
        { key: 'wifi', label: 'WiFi', icon: '📶' },
        { key: 'parking', label: '주차장', icon: '🚗' },
        { key: 'pool', label: '수영장', icon: '🏊' },
        { key: 'restaurant', label: '레스토랑', icon: '🍽️' },
        { key: 'kitchen', label: '주방', icon: '🍳' },
        { key: 'valley', label: '계곡', icon: '🏞️' },
        { key: 'sea', label: '바다', icon: '🌊' },
        { key: 'ocean_view', label: '오션뷰', icon: '🌅' },
        { key: 'bbq', label: '바베큐', icon: '🍖' },
        { key: 'karaoke', label: '노래방', icon: '🎤' },
        { key: 'billiards', label: '당구장', icon: '🎱' },
        { key: 'foot_volleyball', label: '족구장', icon: '🏐' }
    ];

    // 폼 데이터 변경 처리
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // 에러 초기화
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // 편의시설 토글
    const handleAmenityToggle = (amenityKey) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenityKey)
                ? prev.amenities.filter(a => a !== amenityKey)
                : [...prev.amenities, amenityKey]
        }));
    };

    // 이미지 추가 (파일 입력 변경 핸들러)
    const handleImageAdd = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImages = files.map(file => ({
                file: file,
                preview: URL.createObjectURL(file),
                alt_text: file.name, // 파일 이름을 기본 alt_text로 사용
                id: null // 새로 추가된 이미지는 id가 없음
            }));
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
            }));
        }
    };

    // 이미지 제거
    const handleImageRemove = (index) => {
        setFormData(prev => {
            const imageToRemove = prev.images[index];
            if (imageToRemove.preview) {
                URL.revokeObjectURL(imageToRemove.preview); // 미리보기 URL 해제
            }
            return {
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            };
        });
    };

    // 폼 유효성 검사
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = '숙소명을 입력해주세요.';
        }

        if (!formData.location.trim()) {
            newErrors.location = '위치를 입력해주세요.';
        }

        if (!formData.price || formData.price <= 0) {
            newErrors.price = '올바른 가격을 입력해주세요.';
        }

        if (!formData.description.trim()) {
            newErrors.description = '설명을 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('입력 정보를 확인해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            const accommodationData = {
                ...formData,
                price: parseInt(formData.price)
            };

            let targetAccommodation;
            if (accommodationToEdit) {
                // 숙소 수정
                targetAccommodation = await actions.updateAccommodation(accommodationToEdit.id, accommodationData);
                toast.success('숙소가 성공적으로 수정되었습니다!');
            } else {
                // 새 숙소 생성
                targetAccommodation = await actions.createAccommodation(accommodationData);
                toast.success('숙소가 성공적으로 등록되었습니다!');
            }

            // 이미지 파일 업로드 (새로 추가된 파일만 업로드)
            for (const image of formData.images) {
                if (image.file) { // 'file' 속성이 있는 경우에만 새로 추가된 이미지로 간주
                    await actions.uploadAccommodationImage(targetAccommodation.id, image.file, image.alt_text);
                }
            }

            // 대시보드로 이동
            setTimeout(() => {
                actions.setCurrentPage('admin-dashboard');
                actions.setAccommodationToEdit(null); // 수정 완료 후 상태 초기화
            }, 1500);

        } catch (error) {
            console.error('숙소 처리 실패:', error);
            toast.error('숙소 처리 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 취소 처리
    const handleCancel = () => {
        actions.setCurrentPage('admin-dashboard');
    };

    // 권한 확인
    if (!currentUser?.is_admin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">접근 권한이 없습니다</h2>
                    <button
                        onClick={() => actions.setCurrentPage('main')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors"
                    >
                        메인 페이지로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* 헤더 */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">{accommodationToEdit ? '숙소 수정' : '새 숙소 등록'}</h1>
                            <p className="text-orange-100">{accommodationToEdit ? '숙소 정보를 수정해주세요' : '숙소 정보를 입력해주세요'}</p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            취소
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8">

                    {/* 기본 정보 */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">기본 정보</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* 숙소명 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    숙소명 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="예: 제주 오션 리조트"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* 위치 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    위치 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                                        errors.location ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="예: 제주시 애월읍"
                                />
                                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                            </div>

                            {/* 가격 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    1박 가격 (원) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                                        errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="120000"
                                    min="0"
                                />
                                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                            </div>

                            {/* 설명 */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    설명 <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                                        errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="숙소에 대한 자세한 설명을 입력해주세요..."
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* 체크인/아웃 시간 */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">체크인/아웃 시간</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    체크인 시간
                                </label>
                                <input
                                    type="time"
                                    name="check_in"
                                    value={formData.check_in}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    체크아웃 시간
                                </label>
                                <input
                                    type="time"
                                    name="check_out"
                                    value={formData.check_out}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 편의시설 */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">편의시설</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {amenityOptions.map((amenity) => (
                                <label
                                    key={amenity.key}
                                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                        formData.amenities.includes(amenity.key)
                                            ? 'border-orange-500 bg-orange-50 shadow-md'
                                            : 'border-gray-300 hover:border-orange-300 hover:bg-orange-25'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.amenities.includes(amenity.key)}
                                        onChange={() => handleAmenityToggle(amenity.key)}
                                        className="hidden"
                                    />
                                    <span className="text-2xl">{amenity.icon}</span>
                                    <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
                                    {formData.amenities.includes(amenity.key) && (
                                        <div className="ml-auto w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 이미지 관리 */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">이미지 관리</h2>
                        <div className="space-y-3">
                            {formData.images.map((image, index) => (
                                <div
                                    key={image.id || index} // 기존 이미지는 id, 새 이미지는 index 사용
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        {image.preview ? (
                                            <img src={image.preview} alt={image.alt_text} className="w-12 h-12 object-cover rounded-md" />
                                        ) : (
                                            <span className="text-2xl">🖼️</span> // 대체 아이콘
                                        )}
                                        <span className="text-sm text-gray-600">{image.alt_text || `이미지 ${index + 1}`}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleImageRemove(index)}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                        title="이미지 삭제"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* 이미지 추가 버튼 (실제 파일 입력) */}
                            <label
                                htmlFor="image-upload"
                                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-orange-600 cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-medium">이미지 추가</span>
                                <input
                                    id="image-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageAdd}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            💡 여러 이미지를 선택하여 업로드할 수 있습니다.
                        </p>
                    </div>

                    {/* 미리보기 */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">미리보기</h2>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {formData.name || '숙소명을 입력하세요'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        📍 {formData.location || '위치를 입력하세요'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-blue-600">
                                        {formData.price ? `${parseInt(formData.price).toLocaleString()}원` : '0원'}
                                    </p>
                                    <p className="text-sm text-gray-500">/ 박</p>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-4">
                                {formData.description || '설명을 입력하세요...'}
                            </p>

                            {/* 편의시설 미리보기 */}
                            {formData.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {formData.amenities.map((amenityKey) => {
                                        const amenity = amenityOptions.find(a => a.key === amenityKey);
                                        return (
                                            <span
                                                key={amenityKey}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                            >
                        {amenity?.icon} {amenity?.label}
                      </span>
                                        );
                                    })}
                                </div>
                            )}

                            {/* 체크인/아웃 미리보기 */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">체크인: </span>
                                    <span className="font-medium">{formData.check_in}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">체크아웃: </span>
                                    <span className="font-medium">{formData.check_out}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 제출 버튼 */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 transition-colors font-semibold"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                                isSubmitting
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                    : 'bg-orange-500 text-white hover:bg-orange-600 transform hover:scale-105 shadow-lg'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    등록 중...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Save className="w-5 h-5" />
                                    숙소 등록하기
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccommodationForm;