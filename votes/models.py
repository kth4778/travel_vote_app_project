# Django의 데이터베이스 모델 기능을 가져옴
from django.db import models

# 입력값 유효성 검사를 위한 밸리데이터 가져옴
from django.core.validators import MinValueValidator, MaxValueValidator

# 다른 앱의 모델들을 가져옴
from users.models import User  # 사용자 모델
from accommodations.models import Accommodation  # 숙소 모델


# 투표 정보를 저장하는 모델 클래스 정의
class Vote(models.Model):
    # 투표한 사용자를 나타내는 외래키 필드
    user = models.ForeignKey(
        User,  # 연결할 모델
        on_delete=models.CASCADE,  # 사용자가 삭제되면 투표도 함께 삭제
        related_name='votes',  # User에서 투표들을 참조할 때 사용할 이름 (user.votes.all())
        verbose_name="사용자"
    )

    # 투표 대상 숙소를 나타내는 외래키 필드
    accommodation = models.ForeignKey(
        Accommodation,  # 연결할 모델
        on_delete=models.CASCADE,  # 숙소가 삭제되면 투표도 함께 삭제
        related_name='votes',  # Accommodation에서 투표들을 참조할 때 사용할 이름 (accommodation.votes.all())
        verbose_name="숙소"
    )

    # 평점 필드 (1~10점 사이의 정수만 허용)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],  # 1점 이상, 10점 이하만 허용
        verbose_name="평점"
    )

    # 투표 생성 날짜와 시간 (자동으로 현재 시간 저장)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")

    # 투표 수정 날짜와 시간 (수정될 때마다 자동으로 현재 시간 업데이트)
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    # 데이터베이스 테이블 설정을 위한 메타 클래스
    class Meta:
        # 실제 데이터베이스 테이블명
        db_table = 'votes'

        # 관리자 페이지에서 단수형으로 표시될 이름
        verbose_name = "투표"

        # 관리자 페이지에서 복수형으로 표시될 이름
        verbose_name_plural = "투표들"

        # 중복 투표 방지 (한 사용자가 같은 숙소에 대해 하나의 투표만 가능)
        unique_together = ['user', 'accommodation']

        # 기본 정렬 순서 (생성일 기준 내림차순 - 최신 것부터)
        ordering = ['-created_at']

    # 객체를 문자열로 표현할 때 사용되는 메서드
    def __str__(self):
        return f"{self.user.name} - {self.accommodation.name} ({self.rating}점)"


# 댓글 정보를 저장하는 모델 클래스 정의
class Comment(models.Model):
    # 댓글 작성자를 나타내는 외래키 필드
    user = models.ForeignKey(
        User,  # 연결할 모델
        on_delete=models.CASCADE,  # 사용자가 삭제되면 댓글도 함께 삭제
        related_name='comments',  # User에서 댓글들을 참조할 때 사용할 이름 (user.comments.all())
        verbose_name="사용자"
    )

    # 댓글이 달린 숙소를 나타내는 외래키 필드
    accommodation = models.ForeignKey(
        Accommodation,  # 연결할 모델
        on_delete=models.CASCADE,  # 숙소가 삭제되면 댓글도 함께 삭제
        related_name='comments',  # Accommodation에서 댓글들을 참조할 때 사용할 이름 (accommodation.comments.all())
        verbose_name="숙소"
    )

    # 댓글 내용 필드 (긴 텍스트 허용)
    text = models.TextField(verbose_name="댓글 내용")

    # 댓글 생성 날짜와 시간 (자동으로 현재 시간 저장)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")

    # 댓글 수정 날짜와 시간 (수정될 때마다 자동으로 현재 시간 업데이트)
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    # 데이터베이스 테이블 설정을 위한 메타 클래스
    class Meta:
        # 실제 데이터베이스 테이블명
        db_table = 'comments'

        # 관리자 페이지에서 단수형으로 표시될 이름
        verbose_name = "댓글"

        # 관리자 페이지에서 복수형으로 표시될 이름
        verbose_name_plural = "댓글들"

        # 기본 정렬 순서 (생성일 기준 내림차순 - 최신 것부터)
        ordering = ['-created_at']

    # 객체를 문자열로 표현할 때 사용되는 메서드
    def __str__(self):
        # 댓글 내용이 50자 넘으면 50자까지만 표시하고 "..." 추가
        preview = self.text[:50] + "..." if len(self.text) > 50 else self.text
        return f"{self.user.name} - {self.accommodation.name}: {preview}"