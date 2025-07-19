# Django REST Framework의 기본 클래스들을 가져옴
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

# Django의 단축 함수들을 가져옴
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg

# 현재 앱의 모델과 serializers를 가져옴
from .models import Accommodation, AccommodationImage
from .serializers import (
    AccommodationSerializer,
    AccommodationCreateSerializer,
    AccommodationUpdateSerializer,
    AccommodationImageSerializer,
    AccommodationImageUploadSerializer
)

from django.db.models import Min, Max 


# 모든 숙소 조회 및 새 숙소 생성을 위한 API View
class AccommodationListCreateView(generics.ListCreateAPIView):
    """
    GET: 모든 숙소 목록 조회 (페이지네이션 지원)
    POST: 새로운 숙소 생성 (관리자 전용)
    URL: /api/accommodations/
    """

    # 조회할 데이터 쿼리셋 지정 (관련 데이터 미리 로드로 성능 최적화)
    queryset = Accommodation.objects.prefetch_related(
        'images',  # 숙소 이미지들
        'votes'  # 투표 정보들
    ).order_by('-created_at')  # 최신 순으로 정렬

    # GET 요청 시 사용할 serializer
    serializer_class = AccommodationSerializer

    # HTTP 메서드별로 다른 serializer 사용하도록 설정
    def get_serializer_class(self):
        """
        HTTP 메서드에 따라 적절한 serializer 반환
        GET: 조회용 serializer (모든 정보 포함)
        POST: 생성용 serializer (입력 필드만)
        """
        if self.request.method == 'POST':
            return AccommodationCreateSerializer  # 숙소 생성 시
        return AccommodationSerializer  # 숙소 조회 시

    # GET 요청 처리 (숙소 목록 조회)
    def get_queryset(self):
        return Accommodation.objects.all().order_by('-created_at')

    # POST 요청 처리 (숙소 생성)
    def perform_create(self, serializer):
        """
        숙소 생성 시 추가 로직 처리
        serializer: 유효성 검사를 통과한 serializer
        """
        # 숙소 생성
        accommodation = serializer.save()

        # 로그에 숙소 생성 기록
        print(f"새로운 숙소 생성: {accommodation.name} (가격: {accommodation.price:,}원)")


# 특정 숙소 조회, 수정, 삭제를 위한 API View
class AccommodationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: 특정 숙소 상세 정보 조회
    PUT/PATCH: 특정 숙소 정보 수정 (관리자 전용)
    DELETE: 특정 숙소 삭제 (관리자 전용)
    URL: /api/accommodations/{id}/
    """

    # 조회할 데이터 쿼리셋 지정 (관련 데이터 미리 로드)
    queryset = Accommodation.objects.prefetch_related(
        'images',
        'votes__user',  # 투표한 사용자 정보도 함께 로드
    )

    # 기본 serializer 지정
    serializer_class = AccommodationSerializer

    # HTTP 메서드별로 다른 serializer 사용하도록 설정
    def get_serializer_class(self):
        """
        HTTP 메서드에 따라 적절한 serializer 반환
        GET: 조회용 serializer (모든 정보 포함)
        PUT/PATCH: 수정용 serializer (입력 필드만)
        """
        if self.request.method in ['PUT', 'PATCH']:
            return AccommodationUpdateSerializer  # 숙소 수정 시
        return AccommodationSerializer  # 숙소 조회 시

    # DELETE 요청 처리 (숙소 삭제)
    def perform_destroy(self, instance):
        """
        숙소 삭제 시 추가 로직 처리
        instance: 삭제할 Accommodation 인스턴스
        """
        # 로그에 숙소 삭제 기록
        print(f"숙소 삭제: {instance.name}")

        # 실제 삭제 수행 (관련 투표, 댓글, 이미지 파일도 자동 삭제됨)
        instance.delete()


# 숙소 이미지 업로드를 위한 API View
class AccommodationImageUploadView(generics.CreateAPIView):
    """
    POST: 숙소 이미지 업로드 (관리자 전용)
    URL: /api/accommodations/{accommodation_id}/images/
    """

    # 사용할 serializer 지정
    serializer_class = AccommodationImageUploadSerializer

    # 파일 업로드를 위한 파서 지정
    parser_classes = [MultiPartParser, FormParser]

    # POST 요청 처리 (이미지 업로드)
    def perform_create(self, serializer):
        """
        이미지 업로드 시 추가 로직 처리
        serializer: 유효성 검사를 통과한 serializer
        """
        # URL 파라미터에서 숙소 ID 추출
        accommodation_id = self.kwargs.get('accommodation_id')

        # 해당 숙소가 존재하는지 확인
        accommodation = get_object_or_404(Accommodation, id=accommodation_id)

        # 이미지에 숙소 정보 연결하여 저장
        serializer.save(accommodation=accommodation)

        # 로그에 이미지 업로드 기록
        print(f"이미지 업로드: {accommodation.name}")


# 숙소 이미지 목록 조회 및 개별 이미지 삭제를 위한 API View
class AccommodationImageListView(generics.ListAPIView):
    """
    GET: 특정 숙소의 이미지 목록 조회
    URL: /api/accommodations/{accommodation_id}/images/
    """

    # 사용할 serializer 지정
    serializer_class = AccommodationImageSerializer

    # 쿼리셋 동적 생성 (URL 파라미터 기반)
    def get_queryset(self):
        """
        URL 파라미터의 숙소 ID에 해당하는 이미지들만 반환
        """
        accommodation_id = self.kwargs.get('accommodation_id')
        return AccommodationImage.objects.filter(
            accommodation_id=accommodation_id
        ).order_by('order', 'created_at')  # 순서, 생성일 기준 정렬


# 개별 이미지 삭제를 위한 API View
class AccommodationImageDetailView(generics.DestroyAPIView):
    """
    DELETE: 특정 이미지 삭제 (관리자 전용)
    URL: /api/accommodations/images/{image_id}/
    """

    # 조회할 데이터 쿼리셋 지정
    queryset = AccommodationImage.objects.all()

    # DELETE 요청 처리 (이미지 삭제)
    def perform_destroy(self, instance):
        """
        이미지 삭제 시 추가 로직 처리
        instance: 삭제할 AccommodationImage 인스턴스
        """
        # 로그에 이미지 삭제 기록
        print(f"이미지 삭제: {instance.accommodation.name} - {instance.alt_text}")

        # 실제 삭제 수행 (물리적 이미지 파일도 삭제됨)
        instance.delete()


# 숙소 통계 정보를 위한 함수형 API View
@api_view(['GET'])
def accommodation_stats(request):
    """
    숙소 통계 정보 조회
    GET: 전체 숙소 수, 평균 가격, 최고/최저 가격 등
    URL: /api/accommodations/stats/

    Response:
    {
        "total_accommodations": 전체_숙소_수,
        "average_price": 평균_가격,
        "min_price": 최저_가격,
        "max_price": 최고_가격,
        "total_votes": 전체_투표_수,
        "average_rating": 전체_평균_평점
    }
    """

    # 전체 숙소 수 계산
    total_accommodations = Accommodation.objects.count()

    # 가격 통계 계산
    price_stats = Accommodation.objects.aggregate(
        average_price=Avg('price'),
        min_price=Min('price'),  # models.Min -> Min
        max_price=Max('price')  # models.Max -> Max
    )
    # 투표 통계 계산
    from votes.models import Vote
    total_votes = Vote.objects.count()

    # 전체 평균 평점 계산
    average_rating = Vote.objects.aggregate(
        avg_rating=Avg('rating')
    )['avg_rating'] or 0

    # 통계 정보 응답
    return Response({
        'total_accommodations': total_accommodations,
        'average_price': round(price_stats['average_price'] or 0),
        'min_price': price_stats['min_price'] or 0,
        'max_price': price_stats['max_price'] or 0,
        'total_votes': total_votes,
        'average_rating': round(average_rating, 1),
        'message': '숙소 통계 정보입니다.'
    }, status=status.HTTP_200_OK)


# 인기 숙소 목록을 위한 함수형 API View
@api_view(['GET'])
def popular_accommodations(request):
    """
    인기 숙소 목록 조회 (평점 및 투표 수 기준)
    GET: 상위 5개 인기 숙소 정보
    URL: /api/accommodations/popular/

    Response:
    [
        {
            "id": 숙소ID,
            "name": "숙소명",
            "average_rating": 평균평점,
            "vote_count": 투표수
        }
    ]
    """

    # 투표 수와 평균 평점을 기준으로 인기 숙소 선정
    popular_accommodations = Accommodation.objects.annotate(
        vote_count=Count('votes'),
        avg_rating=Avg('votes__rating')
    ).filter(
        vote_count__gt=0  # 투표가 있는 숙소만
    ).order_by('-avg_rating', '-vote_count')[:5]  # 평점 순, 투표 수 순으로 상위 5개

    # 결과 데이터 생성
    result = []
    for accommodation in popular_accommodations:
        result.append({
            'id': accommodation.id,
            'name': accommodation.name,
            'location': accommodation.location,
            'price': accommodation.price,
            'average_rating': round(accommodation.avg_rating or 0, 1),
            'vote_count': accommodation.vote_count
        })

    # 인기 숙소 목록 응답
    return Response({
        'popular_accommodations': result,
        'message': f'상위 {len(result)}개 인기 숙소입니다.'
    }, status=status.HTTP_200_OK)