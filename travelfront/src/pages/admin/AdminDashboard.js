// React 기본 import
import React, { useEffect } from 'react';

// 토스트 알림 라이브러리
import toast from 'react-hot-toast';

// 아이콘 import
import {
    Settings,
    Plus,
    BarChart3,
    Upload,
    Eye,
    Edit,
    Trash2,
    Users,
    Home,
    Vote,
    MessageSquare,
    TrendingUp,
    Calendar,
    MapPin
} from 'lucide-react';

// Context Hook
import { useApp } from '../../context/AppContext';

// 유틸리티 함수
import { formatPrice, getTimeAgo } from '../../utils/helpers';
import ReactMarkdown from 'react-markdown';

// 통계 카드 컴포넌트
const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-600 text-sm font-medium">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
                    {trend && (
                        <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
                    )}
                </div>
                {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
            </div>
            <div className={`w-16 h-16 bg-${color}-100 rounded-full flex items-center justify-center`}>
                <Icon className={`w-8 h-8 text-${color}-600`} />
            </div>
        </div>
    </div>
);

// 빠른 액션 버튼 컴포넌트
const QuickActionButton = ({ icon: Icon, title, description, onClick, color = 'blue' }) => (
    <button
        onClick={onClick}
        className={`p-6 bg-${color}-50 rounded-2xl hover:bg-${color}-100 transition-all duration-300 text-center w-full transform hover:scale-105`}
    >
        <Icon className={`w-10 h-10 mx-auto mb-3 text-${color}-600`} />
        <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
    </button>
);

// 관리자 대시보드 컴포넌트
const AdminDashboard = () => {
    // 전역 상태 및 액션들 가져오기
    const { state, actions } = useApp();

    // 구조 분해 할당으로 필요한 상태값들 추출
    const {
        currentUser,
        accommodations,
        isLoading,
        accommodationStats,
        userStats,
        voteStats,
    } = state;

    // 컴포넌트 마운트 시 통계 데이터 로드
    useEffect(() => {
        const loadStats = async () => {
            await actions.loadAccommodationStats();
            await actions.loadUserStats();
            await actions.loadVoteStats();
        };
        loadStats();
    }, []); // 빈 배열: 컴포넌트가 처음 마운트될 때 한 번만 실행

    // 새 숙소 추가 처리
    const handleAddAccommodation = () => {
        actions.setCurrentPage('admin-edit');
        toast('새 숙소 등록 페이지로 이동합니다.');
    };

    // 숙소 수정 처리
    const handleEditAccommodation = (accommodation) => {
        actions.setAccommodationToEdit(accommodation);
        actions.setCurrentPage('admin-edit');
    };

    // 숙소 삭제 처리
    const handleDeleteAccommodation = (accommodation) => {
        actions.showDeleteModal({
            type: 'accommodation',
            id: accommodation.id,
            name: accommodation.name
        });
    };

    // 투표 현황 보기
    const handleViewResults = () => {
        actions.setCurrentPage('result');
    };

    // 권한 확인
    if (!currentUser?.is_admin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">접근 권한이 없습니다</h2>
                    <p className="text-gray-600 mb-6">관리자만 접근할 수 있는 페이지입니다.</p>
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
        <React.Fragment>
            <div className="min-h-screen bg-gray-50">

            {/* 헤더 */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Settings className="w-8 h-8" />
                                관리자 대시보드
                            </h1>
                            <p className="text-orange-100 mt-1">숙소 관리 및 투표 모니터링</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => actions.setCurrentPage('main')}
                                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                            >
                                <Eye className="w-4 h-4" />
                                사용자 화면
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="font-bold text-lg">{currentUser.name[0]}</span>
                                </div>
                                <span className="font-medium">{currentUser.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        icon={Home}
                        title="총 숙소 수"
                        value={accommodationStats?.total_accommodations || 0}
                        subtitle="등록된 숙소"
                        color="blue"
                    />
                    <StatsCard
                        icon={Vote}
                        title="총 투표 수"
                        value={voteStats?.total_votes || 0}
                        subtitle="누적 투표"
                        color="green"
                    />
                    <StatsCard
                        icon={TrendingUp}
                        title="평균 평점"
                        value={voteStats?.average_rating || 0}
                        subtitle="10점 만점"
                        color="purple"
                    />
                    <StatsCard
                        icon={Users}
                        title="참여율"
                        value={`${voteStats?.participation_rate || 0}%`}
                        subtitle="전체 참여도"
                        color="orange"
                    />
                </div>

                {/* 빠른 액션 */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">빠른 액션</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton
                            icon={Plus}
                            title="숙소 추가"
                            description="새로운 숙소 등록"
                            onClick={handleAddAccommodation}
                            color="blue"
                        />
                        <QuickActionButton
                            icon={BarChart3}
                            title="투표 현황"
                            description="실시간 투표 결과"
                            onClick={handleViewResults}
                            color="green"
                        />
                        <QuickActionButton
                            icon={Upload}
                            title="이미지 업로드"
                            description="숙소 이미지 관리"
                            onClick={() => toast('이미지 업로드 기능은 곧 구현됩니다.')}
                            color="purple"
                        />
                        <QuickActionButton
                            icon={Eye}
                            title="모니터링"
                            description="실시간 활동 추적"
                            onClick={async () => {
                                toast.loading('모니터링 데이터를 새로고침 중...');
                                try {
                                    await actions.loadAccommodationStats();
                                    await actions.loadUserStats();
                                    await actions.loadVoteStats();
                                    toast.success('모니터링 데이터 새로고침 완료!');
                                } catch (error) {
                                    toast.error('모니터링 데이터 새로고침 실패.');
                                    console.error('Failed to refresh monitoring data:', error);
                                }
                            }}
                            color="orange"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* 숙소 관리 */}
                    <div className="bg-white rounded-3xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">숙소 관리</h2>
                        <div className="space-y-4">
                            {console.log('Accommodations in AdminDashboard:', accommodations)} {/* Add this log */}
                            {Array.isArray(accommodations) && accommodations.length > 0 ? (
                                accommodations.map((accommodation) => (
                                    <div key={accommodation.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-lg text-gray-800">{accommodation.name}</h3>
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {accommodation.vote_count || 0}표
                          </span>
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {accommodation.average_rating || 0}점
                          </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{accommodation.location}</span>
                                                </div>
                                                <div className="prose prose-sm max-w-none text-gray-700 text-sm mb-3 line-clamp-2">
                                                    <ReactMarkdown>{accommodation.description}</ReactMarkdown>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="font-medium">{formatPrice(accommodation.price)}/박</span>
                                                    <span>{accommodation.images?.length || 0}개 이미지</span>
                                                    <span>체크인 {accommodation.check_in}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEditAccommodation(accommodation)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                    title="수정"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAccommodation(accommodation)}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    {/* 숙소가 없을 때 */}
                                    <div className="text-4xl mb-4">🏨</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 숙소가 없습니다</h3>
                                    <p className="text-gray-600 mb-4">첫 번째 숙소를 등록해보세요!</p>
                                    <button
                                        onClick={handleAddAccommodation}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors"
                                    >
                                        숙소 추가하기
                                    </button>
                                </div>
                            )}
                        </div>
                        </div>
                    </div>

                    {/* 최근 활동 */}
                    <div className="bg-white rounded-3xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">최근 활동</h2>
                        <div className="space-y-4">
                            {/* 임시 데이터 대신 실제 활동 데이터를 표시하도록 업데이트 필요 */}
                            {voteStats?.recent_votes && voteStats.recent_votes.length > 0 ? (
                                voteStats.recent_votes.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-blue-500`}>
                                            <Vote className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-gray-800">{activity.user_name}</span>
                                                <span className="text-xs text-gray-500">{getTimeAgo(activity.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {activity.accommodation_name}에 {activity.rating}점 투표
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-3xl mb-3">📊</div>
                                    <p className="text-gray-600">아직 활동이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 추가 통계 정보 */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div className="text-3xl mb-3">👥</div>
                        <h3 className="font-bold text-gray-800 mb-2">전체 사용자</h3>
                        <p className="text-2xl font-bold text-blue-600">{userStats?.total_users || 0}명</p>
                        <p className="text-sm text-gray-600">관리자 {userStats?.admin_users || 0}명 포함</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div className="text-3xl mb-3">💬</div>
                        <h3 className="font-bold text-gray-800 mb-2">투표 참여 사용자</h3>
                        <p className="text-2xl font-bold text-green-600">{voteStats?.voted_users || 0}명</p>
                        <p className="text-sm text-gray-600">총 {userStats?.total_users || 0}명 중</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div className="text-3xl mb-3">💰</div>
                        <h3 className="font-bold text-gray-800 mb-2">평균 숙소 가격</h3>
                        <p className="text-2xl font-bold text-purple-600">{formatPrice(accommodationStats?.average_price || 0)}</p>
                        <p className="text-sm text-gray-600">최저 {formatPrice(accommodationStats?.min_price || 0)} / 최고 {formatPrice(accommodationStats?.max_price || 0)}</p>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default AdminDashboard;