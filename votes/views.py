# Django REST Framework의 기본 클래스들을 가져옴
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Django의 단축 함수들을 가져옴
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count, Q

# 현재 앱의 모델과 serializers를 가져옴
from .models import Vote, Comment
from .serializers import (
    VoteSerializer,
    VoteCreateSerializer,
    CommentSerializer,
    CommentCreateSerializer,
    CommentUpdateSerializer
)

# 다른 앱의 모델들을 가져옴
from users.models import User
from accommodations.models import Accommodation


# =============================================================================
# 투표 관련 API Views
# =============================================================================

# 모든 투표 조회 및 새 투표 생성을 위한 API View
class VoteListCreateView(generics.ListCreateAPIView):
    """
    GET: 모든 투표 목록 조회
    POST: 새로운 투표 생성 (기존 투표 있으면 업데이트)
    URL: /api/votes/
    """

    # 조회할 데이터 쿼리셋 지정 (관련 데이터 미리 로드)
    queryset = Vote.objects.select_related(
        'user',  # 투표한 사용자 정보
        'accommodation'  # 투표 대상 숙소 정보
    ).order_by('-created_at')  # 최신 순으로 정렬

    # GET 요청 시 사용할 serializer
    serializer_class = VoteSerializer

    # HTTP 메서드별로 다른 serializer 사용하도록 설정
    def get_serializer_class(self):
        """
        HTTP 메서드에 따라 적절한 serializer 반환
        GET: 조회용 serializer (모든 정보 포함)
        POST: 생성용 serializer (입력 필드만)
        """
        if self.request.method == 'POST':
            return VoteCreateSerializer  # 투표 생성 시
        return VoteSerializer  # 투표 조회 시

    # GET 요청 처리 (투표 목록 조회)
    def get_queryset(self):
        """
        쿼리 파라미터에 따라 필터링된 투표 목록 반환
        지원되는 필터: 사용자, 숙소, 평점 범위
        """
        queryset = super().get_queryset()

        # 특정 사용자의 투표만 필터링
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # 특정 숙소의 투표만 필터링
        accommodation_id = self.request.query_params.get('accommodation_id', None)
        if accommodation_id:
            queryset = queryset.filter(accommodation_id=accommodation_id)

        # 평점 범위 필터링
        min_rating = self.request.query_params.get('min_rating', None)
        max_rating = self.request.query_params.get('max_rating', None)

        if min_rating:
            queryset = queryset.filter(rating__gte=min_rating)
        if max_rating:
            queryset = queryset.filter(rating__lte=max_rating)

        return queryset

    # POST 요청 처리 (투표 생성)
    def perform_create(self, serializer):
        """
        투표 생성 시 추가 로직 처리
        serializer: 유효성 검사를 통과한 serializer
        """
        # 투표 생성 또는 업데이트 (중복 투표 방지)
        vote = serializer.save()

        # 로그에 투표 기록
        print(f"투표 등록: {vote.user.name} -> {vote.accommodation.name} ({vote.rating}점)")


# 특정 투표 조회, 수정, 삭제를 위한 API View
class VoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: 특정 투표 상세 정보 조회
    PUT/PATCH: 특정 투표 수정
    DELETE: 특정 투표 삭제
    URL: /api/votes/{id}/
    """

    # 조회할 데이터 쿼리셋 지정
    queryset = Vote.objects.select_related('user', 'accommodation')

    # 사용할 serializer 지정
    serializer_class = VoteSerializer

    # DELETE 요청 처리 (투표 삭제)
    def perform_destroy(self, instance):
        """
        투표 삭제 시 추가 로직 처리
        instance: 삭제할 Vote 인스턴스
        """
        # 로그에 투표 삭제 기록
        print(f"투표 삭제: {instance.user.name} -> {instance.accommodation.name}")

        # 실제 삭제 수행
        instance.delete()


# 특정 사용자의 투표 목록을 위한 API View
class UserVoteListView(generics.ListAPIView):
    """
    GET: 특정 사용자의 모든 투표 목록 조회
    URL: /api/users/{user_id}/votes/
    """

    # 사용할 serializer 지정
    serializer_class = VoteSerializer

    # 쿼리셋 동적 생성 (URL 파라미터 기반)
    def get_queryset(self):
        """
        URL 파라미터의 사용자 ID에 해당하는 투표들만 반환
        """
        user_id = self.kwargs.get('user_id')
        return Vote.objects.filter(user_id=user_id).select_related(
            'user', 'accommodation'
        ).order_by('-created_at')


# 특정 숙소의 투표 목록을 위한 API View
class AccommodationVoteListView(generics.ListAPIView):
    """
    GET: 특정 숙소의 모든 투표 목록 조회
    URL: /api/accommodations/{accommodation_id}/votes/
    """

    # 사용할 serializer 지정
    serializer_class = VoteSerializer

    # 쿼리셋 동적 생성 (URL 파라미터 기반)
    def get_queryset(self):
        """
        URL 파라미터의 숙소 ID에 해당하는 투표들만 반환
        """
        accommodation_id = self.kwargs.get('accommodation_id')
        return Vote.objects.filter(accommodation_id=accommodation_id).select_related(
            'user', 'accommodation'
        ).order_by('-created_at')


# =============================================================================
# 댓글 관련 API Views
# =============================================================================

# 모든 댓글 조회 및 새 댓글 생성을 위한 API View
class CommentListCreateView(generics.ListCreateAPIView):
    """
    GET: 모든 댓글 목록 조회
    POST: 새로운 댓글 생성
    URL: /api/comments/
    """

    # 조회할 데이터 쿼리셋 지정 (관련 데이터 미리 로드)
    queryset = Comment.objects.select_related(
        'user',  # 댓글 작성자 정보
        'accommodation'  # 댓글이 달린 숙소 정보
    ).order_by('-created_at')  # 최신 순으로 정렬

    # GET 요청 시 사용할 serializer
    serializer_class = CommentSerializer

    # HTTP 메서드별로 다른 serializer 사용하도록 설정
    def get_serializer_class(self):
        """
        HTTP 메서드에 따라 적절한 serializer 반환
        GET: 조회용 serializer (모든 정보 포함)
        POST: 생성용 serializer (입력 필드만)
        """
        if self.request.method == 'POST':
            return CommentCreateSerializer  # 댓글 생성 시
        return CommentSerializer  # 댓글 조회 시

    # GET 요청 처리 (댓글 목록 조회)
    def get_queryset(self):
        """
        쿼리 파라미터에 따라 필터링된 댓글 목록 반환
        지원되는 필터: 사용자, 숙소, 검색
        """
        queryset = super().get_queryset()

        # 특정 사용자의 댓글만 필터링
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # 특정 숙소의 댓글만 필터링
        accommodation_id = self.request.query_params.get('accommodation_id', None)
        if accommodation_id:
            queryset = queryset.filter(accommodation_id=accommodation_id)

        # 댓글 내용 검색
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(text__icontains=search)

        return queryset

    # POST 요청 처리 (댓글 생성)
    def perform_create(self, serializer):
        """
        댓글 생성 시 추가 로직 처리
        serializer: 유효성 검사를 통과한 serializer
        """
        # 댓글 생성
        comment = serializer.save()

        # 로그에 댓글 기록
        print(f"댓글 등록: {comment.user.name} -> {comment.accommodation.name}")


# 특정 댓글 조회, 수정, 삭제를 위한 API View
class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: 특정 댓글 상세 정보 조회
    PUT/PATCH: 특정 댓글 수정 (작성자만 가능)
    DELETE: 특정 댓글 삭제 (작성자만 가능)
    URL: /api/comments/{id}/
    """

    # 조회할 데이터 쿼리셋 지정
    queryset = Comment.objects.select_related('user', 'accommodation')

    # 기본 serializer 지정
    serializer_class = CommentSerializer

    # HTTP 메서드별로 다른 serializer 사용하도록 설정
    def get_serializer_class(self):
        """
        HTTP 메서드에 따라 적절한 serializer 반환
        GET: 조회용 serializer
        PUT/PATCH: 수정용 serializer
        """
        if self.request.method in ['PUT', 'PATCH']:
            return CommentUpdateSerializer  # 댓글 수정 시
        return CommentSerializer  # 댓글 조회 시

    # DELETE 요청 처리 (댓글 삭제)
    def perform_destroy(self, instance):
        """
        댓글 삭제 시 추가 로직 처리
        instance: 삭제할 Comment 인스턴스
        """
        # 로그에 댓글 삭제 기록
        print(f"댓글 삭제: {instance.user.name} -> {instance.accommodation.name}")

        # 실제 삭제 수행
        instance.delete()


# 특정 사용자의 댓글 목록을 위한 API View
class UserCommentListView(generics.ListAPIView):
    """
    GET: 특정 사용자의 모든 댓글 목록 조회
    URL: /api/users/{user_id}/comments/
    """

    # 사용할 serializer 지정
    serializer_class = CommentSerializer

    # 쿼리셋 동적 생성 (URL 파라미터 기반)
    def get_queryset(self):
        """
        URL 파라미터의 사용자 ID에 해당하는 댓글들만 반환
        """
        user_id = self.kwargs.get('user_id')
        return Comment.objects.filter(user_id=user_id).select_related(
            'user', 'accommodation'
        ).order_by('-created_at')


# 특정 숙소의 댓글 목록을 위한 API View
class AccommodationCommentListView(generics.ListAPIView):
    """
    GET: 특정 숙소의 모든 댓글 목록 조회
    URL: /api/accommodations/{accommodation_id}/comments/
    """

    # 사용할 serializer 지정
    serializer_class = CommentSerializer

    # 쿼리셋 동적 생성 (URL 파라미터 기반)
    def get_queryset(self):
        """
        URL 파라미터의 숙소 ID에 해당하는 댓글들만 반환
        """
        accommodation_id = self.kwargs.get('accommodation_id')
        return Comment.objects.filter(accommodation_id=accommodation_id).select_related(
            'user', 'accommodation'
        ).order_by('-created_at')


# =============================================================================
# 통계 및 분석 관련 함수형 API Views
# =============================================================================

# 투표 통계 정보를 위한 함수형 API View
@api_view(['GET'])
def vote_stats(request):
    """
    투표 통계 정보 조회
    GET: 전체 투표 수, 평균 평점, 평점 분포 등
    URL: /api/votes/stats/

    Response:
    {
        "total_votes": 전체_투표_수,
        "average_rating": 전체_평균_평점,
        "rating_distribution": {평점별_분포},
        "participation_rate": 참여율
    }
    """

    # 전체 투표 수 계산
    total_votes = Vote.objects.count()

    # 전체 평균 평점 계산
    average_rating = Vote.objects.aggregate(
        avg_rating=Avg('rating')
    )['avg_rating'] or 0

    # 평점 분포 계산 (1~10점 각각의 투표 수)
    rating_distribution = {}
    for rating in range(1, 11):
        count = Vote.objects.filter(rating=rating).count()
        rating_distribution[str(rating)] = count

    # 참여율 계산 (전체 사용자 수 대비 투표한 사용자 수)
    total_users = User.objects.count()
    voted_users = Vote.objects.values('user').distinct().count()
    participation_rate = (voted_users / total_users * 100) if total_users > 0 else 0

    # 통계 정보 응답
    return Response({
        'total_votes': total_votes,
        'average_rating': round(average_rating, 1),
        'rating_distribution': rating_distribution,
        'participation_rate': round(participation_rate, 1),
        'voted_users': voted_users,
        'total_users': total_users,
        'message': '투표 통계 정보입니다.'
    }, status=status.HTTP_200_OK)


# 댓글 통계 정보를 위한 함수형 API View
@api_view(['GET'])
def comment_stats(request):
    """
    댓글 통계 정보 조회
    GET: 전체 댓글 수, 숙소별 댓글 수, 활발한 사용자 등
    URL: /api/comments/stats/

    Response:
    {
        "total_comments": 전체_댓글_수,
        "average_comments_per_accommodation": 숙소당_평균_댓글_수,
        "most_active_users": [활발한_사용자_목록]
    }
    """

    # 전체 댓글 수 계산
    total_comments = Comment.objects.count()

    # 숙소당 평균 댓글 수 계산
    total_accommodations = Accommodation.objects.count()
    avg_comments_per_accommodation = (
        total_comments / total_accommodations
    ) if total_accommodations > 0 else 0

    # 가장 활발한 사용자 상위 5명 (댓글 수 기준)
    most_active_users = Comment.objects.values(
        'user__id', 'user__name'
    ).annotate(
        comment_count=Count('id')
    ).order_by('-comment_count')[:5]

    # 가장 댓글이 많은 숙소 상위 5개
    most_commented_accommodations = Comment.objects.values(
        'accommodation__id', 'accommodation__name'
    ).annotate(
        comment_count=Count('id')
    ).order_by('-comment_count')[:5]

    # 통계 정보 응답
    return Response({
        'total_comments': total_comments,
        'average_comments_per_accommodation': round(avg_comments_per_accommodation, 1),
        'most_active_users': list(most_active_users),
        'most_commented_accommodations': list(most_commented_accommodations),
        'message': '댓글 통계 정보입니다.'
    }, status=status.HTTP_200_OK)


# 특정 사용자의 투표 및 댓글 활동 요약을 위한 함수형 API View
@api_view(['GET'])
def user_activity_summary(request, user_id):
    """
    특정 사용자의 활동 요약 조회
    GET: 사용자의 투표 수, 댓글 수, 평균 평점 등
    URL: /api/users/{user_id}/activity/

    Response:
    {
        "user": {사용자_정보},
        "vote_count": 투표_수,
        "comment_count": 댓글_수,
        "average_rating": 평균_평점
    }
    """

    # 사용자 존재 확인
    user = get_object_or_404(User, id=user_id)

    # 사용자의 투표 수 계산
    vote_count = Vote.objects.filter(user=user).count()

    # 사용자의 댓글 수 계산
    comment_count = Comment.objects.filter(user=user).count()

    # 사용자의 평균 평점 계산
    average_rating = Vote.objects.filter(user=user).aggregate(
        avg_rating=Avg('rating')
    )['avg_rating'] or 0

    # 사용자가 투표한 숙소 목록
    voted_accommodations = Vote.objects.filter(user=user).values(
        'accommodation__id', 'accommodation__name', 'rating'
    ).order_by('-created_at')

    # 활동 요약 정보 응답
    return Response({
        'user': {
            'id': user.id,
            'name': user.name,
            'is_admin': user.is_admin
        },
        'vote_count': vote_count,
        'comment_count': comment_count,
        'average_rating': round(average_rating, 1),
        'voted_accommodations': list(voted_accommodations),
        'message': f'{user.name}님의 활동 요약입니다.'
    }, status=status.HTTP_200_OK)