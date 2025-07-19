# Django의 관리자 사이트와 URL 관련 기능을 가져옴
from django.contrib import admin
from django.urls import path, include, re_path # re_path 추가
from django.views.static import serve # serve 뷰 임포트

# 미디어 파일 서빙을 위한 기능을 가져옴
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accommodations.urls')), # accommodations 앱의 URL 포함
    path('api/', include('users.urls')), # users 앱의 URL 포함
    path('api/', include('votes.urls')), # votes 앱의 URL 포함
    path('api-auth/', include('rest_framework.urls')), # DRF 로그인/로그아웃 URL
]

# 미디어 파일을 서빙하기 위한 설정 (프로덕션에서도 강제)
# DEBUG=False일 때 static 헬퍼는 작동하지 않으므로, serve 뷰를 직접 사용
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)', serve, {'document_root': settings.MEDIA_ROOT}),
    ]

# 개발 환경에서만 정적 파일 서빙 설정
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# API 엔드포인트 요약 (주석으로 문서화)
"""
API 엔드포인트 전체 목록:

=== 사용자 관련 API ===
GET    /api/users/                     - 모든 사용자 목록 조회
POST   /api/users/                     - 새로운 사용자 생성
POST   /api/users/login/               - 사용자 로그인
GET    /api/users/stats/               - 사용자 통계 정보
GET    /api/users/{id}/                - 특정 사용자 정보 조회
PUT    /api/users/{id}/                - 특정 사용자 정보 수정
DELETE /api/users/{id}/                - 특정 사용자 삭제
GET    /api/users/{id}/check-admin/    - 관리자 권한 확인
GET    /api/users/{id}/activity/       - 사용자 활동 요약
GET    /api/users/{id}/votes/          - 특정 사용자의 투표 목록
GET    /api/users/{id}/comments/       - 특정 사용자의 댓글 목록

=== 숙소 관련 API ===
GET    /api/accommodations/                        - 모든 숙소 목록 조회
POST   /api/accommodations/                        - 새로운 숙소 생성
GET    /api/accommodations/stats/                  - 숙소 통계 정보
GET    /api/accommodations/popular/                - 인기 숙소 목록
GET    /api/accommodations/{id}/                   - 특정 숙소 정보 조회
PUT    /api/accommodations/{id}/                   - 특정 숙소 정보 수정
DELETE /api/accommodations/{id}/                   - 특정 숙소 삭제
GET    /api/accommodations/{id}/images/            - 특정 숙소의 이미지 목록
POST   /api/accommodations/{id}/images/upload/     - 숙소 이미지 업로드
GET    /api/accommodations/{id}/votes/             - 특정 숙소의 투표 목록
GET    /api/accommodations/{id}/comments/          - 특정 숙소의 댓글 목록
DELETE /api/accommodations/images/{id}/            - 특정 이미지 삭제

=== 투표 관련 API ===
GET    /api/votes/                     - 모든 투표 목록 조회
POST   /api/votes/                     - 새로운 투표 생성
GET    /api/votes/stats/               - 투표 통계 정보
GET    /api/votes/{id}/                - 특정 투표 정보 조회
PUT    /api/votes/{id}/                - 특정 투표 수정
DELETE /api/votes/{id}/                - 특정 투표 삭제

=== 댓글 관련 API ===
GET    /api/comments/                  - 모든 댓글 목록 조회
POST   /api/comments/                  - 새로운 댓글 생성
GET    /api/comments/stats/            - 댓글 통계 정보
GET    /api/comments/{id}/             - 특정 댓글 정보 조회
PUT    /api/comments/{id}/             - 특정 댓글 수정
DELETE /api/comments/{id}/             - 특정 댓글 삭제

=== 관리 페이지 ===
GET    /admin/                         - Django 관리자 페이지
GET    /docs/                          - API 문서 페이지

=== 미디어 파일 ===
GET    /media/accommodations/{id}/{파일명}  - 업로드된 숙소 이미지 파일
"""