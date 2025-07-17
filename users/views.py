from django.shortcuts import render

# Create your views here.
# Django REST Framework의 기본 클래스들을 가져옴
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Django의 단축 함수들을 가져옴
from django.shortcuts import get_object_or_404

# 현재 앱의 모델과 serializers를 가져옴
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, UserLoginSerializer


# 모든 사용자 조회 및 새 사용자 생성을 위한 API View
class UserListCreateView(generics.ListCreateAPIView):
    """
    GET: 모든 사용자 목록 조회
    POST: 새로운 사용자 생성
    URL: /api/users/
    """

    # 조회할 데이터 쿼리셋 지정
    queryset = User.objects.all().order_by('name')  # 이름 순으로 정렬

    # GET 요청 시 사용할 serializer (사용자 정보 조회용)
    serializer_class = UserSerializer

    # HTTP 메서드별로 다른 serializer 사용하도록 설정
    def get_serializer_class(self):
        """
        HTTP 메서드에 따라 적절한 serializer 반환
        GET: 조회용 serializer
        POST: 생성용 serializer
        """
        if self.request.method == 'POST':
            return UserCreateSerializer  # 사용자 생성 시
        return UserSerializer  # 사용자 조회 시

    # POST 요청 처리 (사용자 생성)
    def perform_create(self, serializer):
        """
        사용자 생성 시 추가 로직 처리
        serializer: 유효성 검사를 통과한 serializer
        """
        # 사용자 생성 (serializer에서 '운태' 자동 관리자 처리됨)
        user = serializer.save()

        # 로그에 사용자 생성 기록
        print(f"새로운 사용자 생성: {user.name} (관리자: {user.is_admin})")


# 특정 사용자 조회, 수정, 삭제를 위한 API View
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: 특정 사용자 상세 정보 조회
    PUT/PATCH: 특정 사용자 정보 수정
    DELETE: 특정 사용자 삭제
    URL: /api/users/{id}/
    """

    # 조회할 데이터 쿼리셋 지정
    queryset = User.objects.all()

    # 사용할 serializer 지정
    serializer_class = UserSerializer

    # GET 요청 처리 (사용자 상세 조회)
    def get_object(self):
        """
        URL 파라미터로 전달된 ID에 해당하는 사용자 반환
        존재하지 않으면 404 에러 발생
        """
        user_id = self.kwargs.get('pk')  # URL에서 사용자 ID 추출
        return get_object_or_404(User, id=user_id)

    # DELETE 요청 처리 (사용자 삭제)
    def perform_destroy(self, instance):
        """
        사용자 삭제 시 추가 로직 처리
        instance: 삭제할 User 인스턴스
        """
        # 관리자는 삭제할 수 없도록 제한
        if instance.is_admin:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("관리자 계정은 삭제할 수 없습니다.")

        # 로그에 사용자 삭제 기록
        print(f"사용자 삭제: {instance.name}")

        # 실제 삭제 수행
        instance.delete()


# 사용자 로그인을 위한 함수형 API View
@api_view(['POST'])
def user_login(request):
    """
    사용자 로그인 처리
    POST: 이름으로 간단 로그인
    URL: /api/users/login/

    Request Body:
    {
        "name": "사용자이름"
    }

    Response:
    {
        "user": {사용자 정보},
        "message": "로그인 성공"
    }
    """

    # 요청 데이터 유효성 검사
    serializer = UserLoginSerializer(data=request.data)

    if serializer.is_valid():
        # 유효한 데이터면 사용자 찾기
        user_name = serializer.validated_data['name']

        try:
            # 이름으로 사용자 조회
            user = User.objects.get(name=user_name)

            # 사용자 정보를 JSON으로 변환
            user_data = UserSerializer(user).data

            # 로그인 성공 응답
            return Response({
                'user': user_data,
                'message': f'{user_name}님이 로그인했습니다.',
                'is_admin': user.is_admin
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            # 사용자가 존재하지 않으면 에러 응답
            return Response({
                'error': '해당 이름의 사용자가 존재하지 않습니다.'
            }, status=status.HTTP_404_NOT_FOUND)

    else:
        # 유효성 검사 실패 시 에러 응답
        return Response({
            'error': '잘못된 요청입니다.',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# 관리자 권한 확인을 위한 함수형 API View
@api_view(['GET'])
def check_admin(request, user_id):
    """
    특정 사용자의 관리자 권한 확인
    GET: 사용자 ID로 관리자 권한 확인
    URL: /api/users/{user_id}/check-admin/

    Response:
    {
        "user_id": 사용자ID,
        "name": "사용자이름",
        "is_admin": true/false
    }
    """

    try:
        # 사용자 ID로 사용자 조회
        user = User.objects.get(id=user_id)

        # 관리자 권한 정보 응답
        return Response({
            'user_id': user.id,
            'name': user.name,
            'is_admin': user.is_admin,
            'message': f'{user.name}님은 {"관리자" if user.is_admin else "일반 사용자"}입니다.'
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        # 사용자가 존재하지 않으면 에러 응답
        return Response({
            'error': '해당 사용자가 존재하지 않습니다.'
        }, status=status.HTTP_404_NOT_FOUND)


# 사용자 통계 정보를 위한 함수형 API View
@api_view(['GET'])
def user_stats(request):
    """
    사용자 통계 정보 조회
    GET: 전체 사용자 수, 관리자 수 등의 통계
    URL: /api/users/stats/

    Response:
    {
        "total_users": 전체_사용자_수,
        "admin_users": 관리자_수,
        "regular_users": 일반_사용자_수,
        "admin_list": [관리자_목록]
    }
    """

    # 전체 사용자 수 계산
    total_users = User.objects.count()

    # 관리자 수 계산
    admin_users = User.objects.filter(is_admin=True).count()

    # 일반 사용자 수 계산
    regular_users = total_users - admin_users

    # 관리자 목록 조회
    admin_list = User.objects.filter(is_admin=True).values('id', 'name')

    # 통계 정보 응답
    return Response({
        'total_users': total_users,
        'admin_users': admin_users,
        'regular_users': regular_users,
        'admin_list': list(admin_list),
        'message': '사용자 통계 정보입니다.'
    }, status=status.HTTP_200_OK)