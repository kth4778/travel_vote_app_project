# Django REST Framework의 serializers 모듈을 가져옴
from rest_framework import serializers

# 현재 앱의 User 모델을 가져옴
from .models import User


# 기본 User 정보를 JSON으로 변환하는 Serializer
class UserSerializer(serializers.ModelSerializer):
    """
    사용자 정보를 JSON 형태로 직렬화/역직렬화하는 클래스
    GET 요청 시 사용자 정보를 JSON으로 반환
    """

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = User

        # JSON에 포함할 필드들 지정
        fields = ['id', 'name', 'is_admin', 'created_at']

        # 수정할 수 없는 필드들 (읽기 전용 - Read Only)
        read_only_fields = ['id', 'created_at']


# 새로운 User 생성을 위한 Serializer
class UserCreateSerializer(serializers.ModelSerializer):
    """
    새로운 사용자를 생성할 때 사용하는 클래스
    POST 요청 시 JSON 데이터를 받아서 User 모델 인스턴스 생성
    """

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = User

        # 클라이언트에서 받을 필드들 지정
        fields = ['name', 'is_admin']

    # 사용자 생성 시 실행되는 메서드 (오버라이드)
    def create(self, validated_data):
        """
        새로운 사용자를 생성하는 메서드
        validated_data: 유효성 검사를 통과한 데이터
        """
        # '운태'라는 이름으로 가입하면 자동으로 관리자 권한 부여
        if validated_data.get('name') == '운태':
            validated_data['is_admin'] = True

        # 부모 클래스의 create 메서드 호출하여 실제 User 인스턴스 생성
        return super().create(validated_data)


# 사용자 로그인을 위한 Serializer
class UserLoginSerializer(serializers.Serializer):
    """
    사용자 로그인 시 사용하는 클래스
    이름만으로 간단 로그인 처리
    """

    # 이름 필드 (필수 입력)
    name = serializers.CharField(
        max_length=50,  # 최대 50자
        required=True,  # 필수 입력
        help_text="로그인할 사용자 이름"  # API 문서에 표시될 설명
    )

    # 입력된 이름이 실제 존재하는 사용자인지 검증하는 메서드
    def validate_name(self, value):
        """
        이름 필드의 유효성을 검사하는 메서드
        value: 클라이언트에서 입력한 이름
        """
        try:
            # 입력된 이름으로 사용자 찾기
            user = User.objects.get(name=value)
        except User.DoesNotExist:
            # 사용자가 존재하지 않으면 에러 발생
            raise serializers.ValidationError("해당 이름의 사용자가 존재하지 않습니다.")

        # 유효한 이름이면 그대로 반환
        return value