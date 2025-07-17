# Django의 데이터베이스 모델 기능을 가져옴
from django.db import models
import os

# 운영체제 관련 기능을 가져옴 (파일 경로 처리용)



# 숙소 이미지 파일이 저장될 경로를 생성하는 함수
def accommodation_image_path(instance, filename):
    """
    이미지 업로드 경로를 동적으로 생성하는 함수
    instance: AccommodationImage 모델의 인스턴스
    filename: 업로드되는 파일의 원본 이름
    반환값: 'accommodations/숙소ID/파일명' 형태의 경로
    """
    return f'accommodations/{instance.accommodation.id}/{filename}'


# 숙소 정보를 저장하는 모델 클래스 정의
class Accommodation(models.Model):
    # 숙소 이름 필드 (최대 200자, 관리자 페이지에서 "숙소명"으로 표시)
    name = models.CharField(max_length=200, verbose_name="숙소명")

    # 숙소 위치 필드 (최대 200자, 관리자 페이지에서 "위치"로 표시)
    location = models.CharField(max_length=200, verbose_name="위치")

    # 1박 가격 필드 (양수만 허용, 관리자 페이지에서 "1박 가격"으로 표시)
    price = models.PositiveIntegerField(verbose_name="1박 가격")

    # 숙소 설명 필드 (긴 텍스트 허용, 관리자 페이지에서 "설명"으로 표시)
    description = models.TextField(verbose_name="설명")

    # 체크인 시간 필드 (시간 형식, 관리자 페이지에서 "체크인 시간"으로 표시)
    check_in = models.TimeField(verbose_name="체크인 시간")

    # 체크아웃 시간 필드 (시간 형식, 관리자 페이지에서 "체크아웃 시간"으로 표시)
    check_out = models.TimeField(verbose_name="체크아웃 시간")

    # 편의시설 정보 필드 (JSON 형태로 저장, 기본값은 빈 리스트)
    amenities = models.JSONField(default=list, verbose_name="편의시설")

    # 숙소 등록 날짜와 시간 (자동으로 현재 시간 저장)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")

    # 숙소 정보 수정 날짜와 시간 (수정될 때마다 자동으로 현재 시간 업데이트)
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    # 데이터베이스 테이블 설정을 위한 메타 클래스
    class Meta:
        # 실제 데이터베이스 테이블명
        db_table = 'accommodations'

        # 관리자 페이지에서 단수형으로 표시될 이름
        verbose_name = "숙소"

        # 관리자 페이지에서 복수형으로 표시될 이름
        verbose_name_plural = "숙소들"

        # 기본 정렬 순서 (생성일 기준 내림차순 - 최신 것부터)
        ordering = ['-created_at']

    # 객체를 문자열로 표현할 때 사용되는 메서드
    def __str__(self):
        return self.name  # 숙소 이름을 반환

    # 숙소의 평균 평점을 계산하는 프로퍼티 (computed property)
    @property
    def average_rating(self):
        """
        이 숙소에 대한 모든 투표의 평균 평점을 계산
        votes는 Vote 모델에서 정의된 related_name으로 연결됨
        """
        # 이 숙소에 대한 모든 투표를 가져옴
        votes = self.votes.all()

        # 투표가 없으면 0 반환
        if not votes:
            return 0

        # 모든 투표의 평점을 합산하고 투표 수로 나누어 평균 계산 후 소수점 첫째 자리까지 반올림
        return round(sum(vote.rating for vote in votes) / len(votes), 1)

    # 숙소의 총 투표 수를 계산하는 프로퍼티
    @property
    def vote_count(self):
        """
        이 숙소에 대한 총 투표 수를 계산
        """
        return self.votes.count()  # 관련된 투표 수를 반환


# 숙소 이미지 정보를 저장하는 모델 클래스 정의
class AccommodationImage(models.Model):
    # 어떤 숙소의 이미지인지를 나타내는 외래키 필드
    accommodation = models.ForeignKey(
        Accommodation,  # 연결할 모델
        on_delete=models.CASCADE,  # 숙소가 삭제되면 이미지도 함께 삭제
        related_name='images',  # Accommodation에서 이미지들을 참조할 때 사용할 이름
        verbose_name="숙소"
    )

    # 이미지 파일을 저장하는 필드
    image = models.ImageField(
        upload_to=accommodation_image_path,  # 위에서 정의한 함수로 저장 경로 결정
        verbose_name="이미지"
    )

    # 이미지 설명 텍스트 (선택사항, 빈 값 허용)
    alt_text = models.CharField(
        max_length=200,
        blank=True,  # 빈 값 허용
        verbose_name="이미지 설명"
    )

    # 이미지 표시 순서 (숫자가 작을수록 먼저 표시)
    order = models.PositiveIntegerField(default=0, verbose_name="순서")

    # 이미지 업로드 날짜와 시간
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")

    # 데이터베이스 테이블 설정을 위한 메타 클래스
    class Meta:
        # 실제 데이터베이스 테이블명
        db_table = 'accommodation_images'

        # 관리자 페이지에서 단수형으로 표시될 이름
        verbose_name = "숙소 이미지"

        # 관리자 페이지에서 복수형으로 표시될 이름
        verbose_name_plural = "숙소 이미지들"

        # 기본 정렬 순서 (순서 번호 오름차순, 그 다음 생성일 오름차순)
        ordering = ['order', 'created_at']

    # 객체를 문자열로 표현할 때 사용되는 메서드
    def __str__(self):
        return f"{self.accommodation.name} - 이미지 {self.order}"