# Django의 URL 패턴 관련 기능을 가져옴
from django.urls import path

# 현재 앱의 뷰들을 가져옴
from . import views

# 앱 이름 설정 (URL 네임스페이스 구분용)
app_name = 'votes'

# URL 패턴 정의 리스트
urlpatterns = [
    # =========================================================================
    # 투표 관련 URL 패턴
    # =========================================================================

    # 투표 목록 조회 및 새 투표 생성
    # GET /api/votes/ - 모든 투표 목록 조회 (필터링 지원)
    # POST /api/votes/ - 새로운 투표 생성 (기존 투표 있으면 업데이트)
    path('', views.VoteListCreateView.as_view(), name='vote-list-create'),

    # 투표 통계 정보
    # GET /api/votes/stats/ - 투표 통계 조회 (전체 투표 수, 평균 평점, 평점 분포 등)
    path('stats/', views.vote_stats, name='vote-stats'),

    # 특정 투표 상세 정보
    # GET /api/votes/{id}/ - 특정 투표 정보 조회
    # PUT /api/votes/{id}/ - 특정 투표 수정
    # PATCH /api/votes/{id}/ - 특정 투표 부분 수정
    # DELETE /api/votes/{id}/ - 특정 투표 삭제
    path('<int:pk>/', views.VoteDetailView.as_view(), name='vote-detail'),

    # =========================================================================
    # 댓글 관련 URL 패턴
    # =========================================================================

    # 댓글 목록 조회 및 새 댓글 생성
    # GET /api/comments/ - 모든 댓글 목록 조회 (필터링, 검색 지원)
    # POST /api/comments/ - 새로운 댓글 생성
    path('comments/', views.CommentListCreateView.as_view(), name='comment-list-create'),

    # 댓글 통계 정보
    # GET /api/comments/stats/ - 댓글 통계 조회 (전체 댓글 수, 활발한 사용자 등)
    path('comments/stats/', views.comment_stats, name='comment-stats'),

    # 특정 댓글 상세 정보
    # GET /api/comments/{id}/ - 특정 댓글 정보 조회
    # PUT /api/comments/{id}/ - 특정 댓글 수정 (작성자만 가능)
    # PATCH /api/comments/{id}/ - 특정 댓글 부분 수정 (작성자만 가능)
    # DELETE /api/comments/{id}/ - 특정 댓글 삭제 (작성자만 가능)
    path('comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
]