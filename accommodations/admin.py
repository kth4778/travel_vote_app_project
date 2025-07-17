# Django 관리자 페이지 기능을 가져옴
from django.contrib import admin

# 현재 앱의 Accommodation, AccommodationImage 모델을 가져옴
from .models import Accommodation, AccommodationImage


# 숙소 관리 페이지에서 이미지를 함께 관리하기 위한 인라인 클래스
class AccommodationImageInline(admin.TabularInline):
    # 연결할 모델 지정
    model = AccommodationImage

    # 기본으로 표시할 빈 폼의 개수 (새 이미지 추가용)
    extra = 1

    # 인라인에서 표시할 필드들
    fields = ['image', 'alt_text', 'order']


# Accommodation 모델을 관리자 페이지에 등록하고 설정하는 데코레이터
@admin.register(Accommodation)
class AccommodationAdmin(admin.ModelAdmin):
    # 관리자 페이지의 목록 화면에서 보여질 필드들
    list_display = ['name', 'location', 'price', 'get_average_rating', 'get_vote_count', 'created_at']

    # 관리자 페이지에서 필터링할 수 있는 필드들 (오른쪽 사이드바에 표시)
    list_filter = ['created_at', 'updated_at']

    # 관리자 페이지에서 검색 가능한 필드들 (상단 검색바에서 사용)
    search_fields = ['name', 'location']

    # 관리자 페이지에서 수정할 수 없는 필드들 (읽기 전용)
    readonly_fields = ['created_at', 'updated_at']

    # 숙소 관리 페이지에 이미지 인라인 추가 (숙소와 함께 이미지도 관리 가능)
    inlines = [AccommodationImageInline]

    # 평균 평점을 관리자 페이지에 표시하기 위한 메서드
    def get_average_rating(self, obj):
        # obj는 Accommodation 인스턴스, average_rating 프로퍼티 호출
        return obj.average_rating

    # 위 메서드가 관리자 페이지에서 표시될 때의 컬럼 제목
    get_average_rating.short_description = "평균 평점"

    # 투표 수를 관리자 페이지에 표시하기 위한 메서드
    def get_vote_count(self, obj):
        # obj는 Accommodation 인스턴스, vote_count 프로퍼티 호출
        return obj.vote_count

    # 위 메서드가 관리자 페이지에서 표시될 때의 컬럼 제목
    get_vote_count.short_description = "투표 수"


# AccommodationImage 모델을 관리자 페이지에 등록하고 설정하는 데코레이터
@admin.register(AccommodationImage)
class AccommodationImageAdmin(admin.ModelAdmin):
    # 관리자 페이지의 목록 화면에서 보여질 필드들
    list_display = ['accommodation', 'alt_text', 'order', 'created_at']

    # 관리자 페이지에서 필터링할 수 있는 필드들
    list_filter = ['created_at', 'accommodation']

    # 관리자 페이지에서 검색 가능한 필드들 (숙소 이름과 이미지 설명으로 검색)
    search_fields = ['accommodation__name', 'alt_text']