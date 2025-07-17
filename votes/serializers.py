# Django REST Framework의 serializers 모듈을 가져옴
from rest_framework import serializers

# Django의 유틸리티 함수들을 가져옴
from django.utils import timezone
import datetime

# 현재 앱의 모델들을 가져옴
from .models import Vote, Comment

# 다른 앱의 serializers를 가져옴 (상호 참조)
from users.serializers import UserSerializer
from accommodations.serializers import AccommodationSerializer


# 투표 정보를 JSON으로 변환하는 기본 Serializer
class VoteSerializer(serializers.ModelSerializer):
    """
    투표 정보를 JSON 형태로 직렬화/역직렬화하는 클래스
    투표한 사용자, 숙소 정보, 평점 등을 포함
    """

    # 관련된 사용자 정보를 중첩해서 포함 (읽기 전용)
    user = UserSerializer(read_only=True)

    # 관련된 숙소 정보를 중첩해서 포함 (읽기 전용)
    accommodation = AccommodationSerializer(read_only=True)

    # 투표 시간을 상대적으로 표시하는 메서드
    time_since = serializers.SerializerMethodField()

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = Vote

        # JSON에 포함할 필드들 지정
        fields = [
            'id', 'user', 'accommodation', 'rating',
            'time_since', 'created_at', 'updated_at'
        ]

        # 수정할 수 없는 필드들 (읽기 전용)
        read_only_fields = ['id', 'created_at', 'updated_at']

    # 투표 시간을 "2분 전", "1시간 전" 형태로 표시하는 메서드
    def get_time_since(self, obj):
        """
        투표 시간을 상대적으로 표시하는 메서드
        obj: Vote 인스턴스
        """
        # 현재 시간 가져오기
        now = timezone.now()

        # 투표 시간과 현재 시간의 차이 계산
        diff = now - obj.created_at

        # 시간 차이에 따른 표시 방식 결정
        if diff.days > 0:
            return f"{diff.days}일 전"
        elif diff.seconds > 3600:  # 1시간 = 3600초
            hours = diff.seconds // 3600
            return f"{hours}시간 전"
        elif diff.seconds > 60:  # 1분 = 60초
            minutes = diff.seconds // 60
            return f"{minutes}분 전"
        else:
            return "방금 전"


# 새로운 투표 생성 시 사용하는 Serializer
class VoteCreateSerializer(serializers.ModelSerializer):
    """
    새로운 투표를 생성할 때 사용하는 클래스
    사용자가 숙소에 점수를 매길 때 사용
    """

    # 외래키 필드들을 ID로 받기 위한 필드 (입력용)
    user_id = serializers.IntegerField(help_text="투표하는 사용자의 ID")
    accommodation_id = serializers.IntegerField(help_text="투표 대상 숙소의 ID")

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = Vote

        # 클라이언트에서 받을 필드들 지정
        fields = ['user_id', 'accommodation_id', 'rating']

    # 사용자 ID 유효성 검사
    def validate_user_id(self, value):
        """
        사용자 ID가 유효한지 검사하는 메서드
        value: 클라이언트에서 입력한 사용자 ID
        """
        from users.models import User

        try:
            # 해당 ID의 사용자가 존재하는지 확인
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("존재하지 않는 사용자입니다.")

        # 유효한 ID면 그대로 반환
        return value

    # 숙소 ID 유효성 검사
    def validate_accommodation_id(self, value):
        """
        숙소 ID가 유효한지 검사하는 메서드
        value: 클라이언트에서 입력한 숙소 ID
        """
        from accommodations.models import Accommodation

        try:
            # 해당 ID의 숙소가 존재하는지 확인
            Accommodation.objects.get(id=value)
        except Accommodation.DoesNotExist:
            raise serializers.ValidationError("존재하지 않는 숙소입니다.")

        # 유효한 ID면 그대로 반환
        return value

    # 평점 유효성 검사
    def validate_rating(self, value):
        """
        평점이 유효한 범위인지 검사하는 메서드
        value: 클라이언트에서 입력한 평점
        """
        # 평점이 1~10 범위 내인지 확인
        if value < 1 or value > 10:
            raise serializers.ValidationError("평점은 1점에서 10점 사이여야 합니다.")

        # 유효한 평점이면 그대로 반환
        return value

    # 투표 생성 메서드 (오버라이드)
    def create(self, validated_data):
        """
        새로운 투표를 생성하는 메서드
        중복 투표 시 기존 투표를 업데이트
        validated_data: 유효성 검사를 통과한 데이터
        """
        # ID를 실제 객체로 변환
        user_id = validated_data.pop('user_id')
        accommodation_id = validated_data.pop('accommodation_id')

        from users.models import User
        from accommodations.models import Accommodation

        # ID로 실제 객체 가져오기
        user = User.objects.get(id=user_id)
        accommodation = Accommodation.objects.get(id=accommodation_id)

        # 기존 투표가 있으면 업데이트, 없으면 생성 (중복 투표 방지)
        vote, created = Vote.objects.update_or_create(
            user=user,
            accommodation=accommodation,
            defaults={'rating': validated_data['rating']}
        )

        # 생성/업데이트된 투표 반환
        return vote


# 댓글 정보를 JSON으로 변환하는 기본 Serializer
class CommentSerializer(serializers.ModelSerializer):
    """
    댓글 정보를 JSON 형태로 직렬화/역직렬화하는 클래스
    댓글 작성자, 내용, 작성 시간 등을 포함
    """

    # 관련된 사용자 정보를 중첩해서 포함 (읽기 전용)
    user = UserSerializer(read_only=True)

    # 사용자 이름만 간단히 표시하는 필드
    user_name = serializers.CharField(source='user.name', read_only=True)

    # 댓글 작성 시간을 상대적으로 표시하는 메서드
    time_since = serializers.SerializerMethodField()

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = Comment

        # JSON에 포함할 필드들 지정
        fields = [
            'id', 'user', 'user_name', 'text',
            'time_since', 'created_at', 'updated_at'
        ]

        # 수정할 수 없는 필드들 (읽기 전용)
        read_only_fields = ['id', 'created_at', 'updated_at']

    # 댓글 작성 시간을 "2분 전", "1시간 전" 형태로 표시하는 메서드
    def get_time_since(self, obj):
        """
        댓글 작성 시간을 상대적으로 표시하는 메서드
        obj: Comment 인스턴스
        """
        # 현재 시간 가져오기
        now = timezone.now()

        # 댓글 작성 시간과 현재 시간의 차이 계산
        diff = now - obj.created_at

        # 시간 차이에 따른 표시 방식 결정
        if diff.days > 0:
            return f"{diff.days}일 전"
        elif diff.seconds > 3600:  # 1시간 = 3600초
            hours = diff.seconds // 3600
            return f"{hours}시간 전"
        elif diff.seconds > 60:  # 1분 = 60초
            minutes = diff.seconds // 60
            return f"{minutes}분 전"
        else:
            return "방금 전"


# 새로운 댓글 생성 시 사용하는 Serializer
class CommentCreateSerializer(serializers.ModelSerializer):
    """
    새로운 댓글을 생성할 때 사용하는 클래스
    사용자가 숙소에 댓글을 작성할 때 사용
    """

    # 외래키 필드들을 ID로 받기 위한 필드 (입력용)
    user_id = serializers.IntegerField(help_text="댓글 작성자의 ID")
    accommodation_id = serializers.IntegerField(help_text="댓글을 작성할 숙소의 ID")

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = Comment

        # 클라이언트에서 받을 필드들 지정
        fields = ['user_id', 'accommodation_id', 'text']

    # 댓글 내용 유효성 검사
    def validate_text(self, value):
        """
        댓글 내용이 유효한지 검사하는 메서드
        value: 클라이언트에서 입력한 댓글 내용
        """
        # 댓글 내용이 비어있지 않은지 확인
        if not value.strip():
            raise serializers.ValidationError("댓글 내용을 입력해주세요.")

        # 댓글 길이 제한 (500자 이하)
        if len(value) > 500:
            raise serializers.ValidationError("댓글은 500자 이하로 작성해주세요.")

        # 유효한 댓글이면 그대로 반환
        return value

    # 댓글 생성 메서드 (오버라이드)
    def create(self, validated_data):
        """
        새로운 댓글을 생성하는 메서드
        validated_data: 유효성 검사를 통과한 데이터
        """
        # ID를 실제 객체로 변환
        user_id = validated_data.pop('user_id')
        accommodation_id = validated_data.pop('accommodation_id')

        from users.models import User
        from accommodations.models import Accommodation

        # ID로 실제 객체 가져오기
        user = User.objects.get(id=user_id)
        accommodation = Accommodation.objects.get(id=accommodation_id)

        # 새로운 댓글 생성
        comment = Comment.objects.create(
            user=user,
            accommodation=accommodation,
            text=validated_data['text']
        )

        # 생성된 댓글 반환
        return comment


# 댓글 수정 시 사용하는 Serializer
class CommentUpdateSerializer(serializers.ModelSerializer):
    """
    기존 댓글을 수정할 때 사용하는 클래스
    댓글 작성자만 자신의 댓글을 수정할 수 있음
    """

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = Comment

        # 수정 가능한 필드들 지정 (내용만 수정 가능)
        fields = ['text']

    # 댓글 수정 권한 확인
    def validate(self, attrs):
        """
        댓글 수정 권한을 확인하는 메서드
        attrs: 수정하려는 데이터
        """
        # 현재 사용자 정보 가져오기 (context에서)
        request = self.context.get('request')
        if request and request.user:
            user_id = request.data.get('user_id')  # 클라이언트에서 전송한 사용자 ID

            # 댓글 작성자와 현재 사용자가 같은지 확인
            if self.instance.user.id != user_id:
                raise serializers.ValidationError("본인이 작성한 댓글만 수정할 수 있습니다.")

        # 유효한 수정 요청이면 그대로 반환
        return attrs