# Django의 URL 패턴 관련 기능을 가져옴
from django.urls import path

# 현재 앱의 뷰들을 가져옴
from . import views

# votes 앱에서 필요한 뷰들 가져오기 (accommodations가 아닌 votes에서!)
from votes.views import user_activity_summary, UserVoteListView

# 앱 이름 설정
app_name = 'users'

# URL 패턴 정의 리스트
urlpatterns = [
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('users/login/', views.user_login, name='user-login'),
    path('users/stats/', views.user_stats, name='user-stats'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<int:user_id>/check-admin/', views.check_admin, name='check-admin'),

    # votes 앱에서 가져온 함수와 클래스들 사용
    path('users/<int:user_id>/activity/', user_activity_summary, name='user-activity'),
    path('users/<int:user_id>/votes/', UserVoteListView.as_view(), name='user-votes'),
]