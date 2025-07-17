# Django 관리자 페이지 기능을 가져옴
from django.contrib import admin

# 현재 앱의 User 모델을 가져옴
from .models import User


# User 모델을 관리자 페이지에 등록하고 설정하는 데코레이터
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    # 관리자 페이지의 목록 화면에서 보여질 필드들
    list_display = ['name', 'is_admin', 'created_at']

    # 관리자 페이지에서 필터링할 수 있는 필드들 (오른쪽 사이드바에 표시)
    list_filter = ['is_admin', 'created_at']

    # 관리자 페이지에서 검색 가능한 필드들 (상단 검색바에서 사용)
    search_fields = ['name']

    # 관리자 페이지에서 수정할 수 없는 필드들 (읽기 전용)
    readonly_fields = ['created_at']