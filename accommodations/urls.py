# Django의 URL 패턴 관련 기능을 가져옴
from django.urls import path

# 현재 앱의 뷰들을 가져옴
from . import views

# votes 앱에서 필요한 클래스들 import (투표와 댓글은 votes 앱에서 관리)
from votes.views import AccommodationVoteListView, AccommodationCommentListView

# 앱 이름 설정 (URL 네임스페이스 구분용)
app_name = 'accommodations'

# URL 패턴 정의 리스트
urlpatterns = [
    # 숙소 목록 조회 및 새 숙소 생성
    # GET /api/accommodations/ - 모든 숙소 목록 조회 (검색, 필터링 지원)
    # POST /api/accommodations/ - 새로운 숙소 생성 (관리자 전용)
    path('', views.AccommodationListCreateView.as_view(), name='accommodation-list-create'),

    # 숙소 통계 정보
    # GET /api/accommodations/stats/ - 숙소 통계 조회
    path('stats/', views.accommodation_stats, name='accommodation-stats'),

    # 인기 숙소 목록
    # GET /api/accommodations/popular/ - 인기 숙소 상위 5개 조회
    path('popular/', views.popular_accommodations, name='popular-accommodations'),

    # 특정 숙소 상세 정보
    # GET /api/accommodations/{id}/ - 특정 숙소 정보 조회
    # PUT /api/accommodations/{id}/ - 특정 숙소 정보 수정 (관리자 전용)
    # PATCH /api/accommodations/{id}/ - 특정 숙소 정보 부분 수정 (관리자 전용)
    # DELETE /api/accommodations/{id}/ - 특정 숙소 삭제 (관리자 전용)
    path('<int:pk>/', views.AccommodationDetailView.as_view(), name='accommodation-detail'),

    # 특정 숙소의 이미지 목록 조회
    # GET /api/accommodations/{accommodation_id}/images/ - 특정 숙소의 모든 이미지 조회
    path('<int:accommodation_id>/images/', views.AccommodationImageListView.as_view(), name='accommodation-images'),

    # 특정 숙소에 이미지 업로드
    # POST /api/accommodations/{accommodation_id}/images/upload/ - 이미지 업로드 (관리자 전용)
    path('<int:accommodation_id>/images/upload/', views.AccommodationImageUploadView.as_view(),
         name='accommodation-image-upload'),

    # 특정 숙소의 투표 목록 (votes 앱에서 가져온 클래스 사용)
    # GET /api/accommodations/{accommodation_id}/votes/ - 특정 숙소의 모든 투표 조회
    path('<int:accommodation_id>/votes/', AccommodationVoteListView.as_view(), name='accommodation-votes'),

    # 특정 숙소의 댓글 목록 (votes 앱에서 가져온 클래스 사용)
    # GET /api/accommodations/{accommodation_id}/comments/ - 특정 숙소의 모든 댓글 조회
    path('<int:accommodation_id>/comments/', AccommodationCommentListView.as_view(), name='accommodation-comments'),

    # 개별 이미지 삭제
    # DELETE /api/accommodations/images/{image_id}/ - 특정 이미지 삭제 (관리자 전용)
    path('images/<int:pk>/', views.AccommodationImageDetailView.as_view(), name='accommodation-image-detail'),
]