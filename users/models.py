# Django의 데이터베이스 모델 기능을 가져옴
from django.db import models


# 사용자 정보를 저장하는 모델 클래스 정의
class User(models.Model):
    # 사용자 이름 필드 (최대 50자, 중복 불가, 관리자 페이지에서 "이름"으로 표시)
    name = models.CharField(max_length=2, unique=True, verbose_name="이름")

    # 관리자 권한 여부 (True/False, 기본값은 False, 관리자 페이지에서 "관리자 여부"로 표시)
    is_admin = models.BooleanField(default=False, verbose_name="관리자 여부")

    # 계정 생성 날짜와 시간 (자동으로 현재 시간 저장, 관리자 페이지에서 "생성일"로 표시)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")

    # 데이터베이스 테이블 설정을 위한 메타 클래스
    class Meta:
        # 실제 데이터베이스 테이블명 (기본값은 앱명_모델명이지만 여기서는 간단히 'users'로 설정)
        db_table = 'users'

        # 관리자 페이지에서 단수형으로 표시될 이름
        verbose_name = "사용자"

        # 관리자 페이지에서 복수형으로 표시될 이름
        verbose_name_plural = "사용자들"

    # 객체를 문자열로 표현할 때 사용되는 메서드 (관리자 페이지나 쉘에서 보여질 내용)
    def __str__(self):
        return self.name  # 사용자 이름을 반환