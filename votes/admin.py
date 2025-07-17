# Django 관리자 페이지 기능을 가져옴
from django.contrib import admin

# 현재 앱의 Vote, Comment 모델을 가져옴
from .models import Vote, Comment


# Vote 모델을 관리자 페이지에 등록하고 설정하는 데코레이터
@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    # 관리자 페이지의 목록 화면에서 보여질 필드들
    list_display = ['user', 'accommodation', 'rating', 'created_at']

    # 관리자 페이지에서 필터링할 수 있는 필드들 (오른쪽 사이드바에 표시)
    list_filter = ['rating', 'created_at', 'accommodation']

    # 관리자 페이지에서 검색 가능한 필드들 (사용자 이름과 숙소 이름으로 검색)
    search_fields = ['user__name', 'accommodation__name']

    # 관리자 페이지에서 수정할 수 없는 필드들 (읽기 전용)
    readonly_fields = ['created_at', 'updated_at']


# Comment 모델을 관리자 페이지에 등록하고 설정하는 데코레이터
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    # 관리자 페이지의 목록 화면에서 보여질 필드들
    list_display = ['user', 'accommodation', 'text_preview', 'created_at']

    # 관리자 페이지에서 필터링할 수 있는 필드들
    list_filter = ['created_at', 'accommodation']

    # 관리자 페이지에서 검색 가능한 필드들 (사용자 이름, 숙소 이름, 댓글 내용으로 검색)
    search_fields = ['user__name', 'accommodation__name', 'text']

    # 관리자 페이지에서 수정할 수 없는 필드들 (읽기 전용)
    readonly_fields = ['created_at', 'updated_at']

    # 댓글 내용 미리보기를 관리자 페이지에 표시하기 위한 메서드
    def text_preview(self, obj):
        # obj는 Comment 인스턴스, 댓글 내용이 50자 넘으면 50자까지만 표시하고 "..." 추가
        return obj.text[:50] + "..." if len(obj.text) > 50 else obj.text

    # 위 메서드가 관리자 페이지에서 표시될 때의 컬럼 제목
    text_preview.short_description = "댓글 내용"