# Django REST Framework의 serializers 모듈을 가져옴
from rest_framework import serializers

# 현재 앱의 모델들을 가져옴
from .models import Accommodation, AccommodationImage


# 숙소 이미지 정보를 JSON으로 변환하는 Serializer
class AccommodationImageSerializer(serializers.ModelSerializer):
    """
    숙소 이미지 정보를 JSON 형태로 직렬화/역직렬화하는 클래스
    이미지 URL, 설명, 순서 등의 정보를 포함
    """

    # 이미지 URL을 절대 경로로 반환하는 메서드
    image_url = serializers.SerializerMethodField()

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = AccommodationImage

        # JSON에 포함할 필드들 지정
        fields = ['id', 'image', 'image_url', 'alt_text', 'order', 'created_at']

        # 수정할 수 없는 필드들 (읽기 전용)
        read_only_fields = ['id', 'created_at']

    # 이미지 URL을 완전한 경로로 반환하는 메서드
    def get_image_url(self, obj):
        """
        이미지 파일의 완전한 URL을 반환하는 메서드
        obj: AccommodationImage 인스턴스
        """
        # 요청 객체가 있고 이미지가 있는 경우
        if self.context.get('request') and obj.image:
            # 완전한 URL 생성 (http://localhost:8000/media/...)
            return self.context['request'].build_absolute_uri(obj.image.url)
        # 이미지가 없으면 None 반환
        return None


# 숙소 정보를 JSON으로 변환하는 기본 Serializer
class AccommodationSerializer(serializers.ModelSerializer):
    """
    숙소 정보를 JSON 형태로 직렬화/역직렬화하는 클래스
    숙소의 모든 정보와 관련된 이미지들, 평균 평점, 투표 수 포함
    """

    # 관련된 이미지들을 중첩해서 포함 (1:N 관계)
    images = AccommodationImageSerializer(many=True, read_only=True)

    # 계산된 속성들 (모델의 @property 메서드들)
    average_rating = serializers.ReadOnlyField()  # 평균 평점 (읽기 전용)
    vote_count = serializers.ReadOnlyField()  # 투표 수 (읽기 전용)

    # 가격을 원화 형태로 표시하는 메서드
    price_formatted = serializers.SerializerMethodField()

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = Accommodation

        # JSON에 포함할 필드들 지정
        fields = [
            'id', 'name', 'location', 'price', 'price_formatted',
            'description', 'check_in', 'check_out', 'amenities',
            'images', 'average_rating', 'vote_count',
            'created_at', 'updated_at'
        ]

        # 수정할 수 없는 필드들 (읽기 전용)
        read_only_fields = ['id', 'created_at', 'updated_at']

    # 가격을 한국 원화 형태로 포맷팅하는 메서드
    def get_price_formatted(self, obj):
        """
        가격을 '120,000원' 형태로 포맷팅하는 메서드
        obj: Accommodation 인스턴스
        """
        return f"{obj.price:,}원"


# 숙소 생성 시 사용하는 Serializer
class AccommodationCreateSerializer(serializers.ModelSerializer):
    """
    새로운 숙소를 생성할 때 사용하는 클래스
    관리자가 숙소 정보를 입력할 때 사용
    """

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = Accommodation

        # 클라이언트에서 받을 필드들 지정 (이미지는 별도 처리)
        fields = [
            'name', 'location', 'price', 'description',
            'check_in', 'check_out', 'amenities'
        ]

    # 편의시설 데이터 유효성 검사
    def validate_amenities(self, value):
        """
        편의시설 필드의 유효성을 검사하는 메서드
        value: 클라이언트에서 입력한 편의시설 리스트
        """
        # 허용되는 편의시설 목록
        allowed_amenities = ['wifi', 'parking', 'pool', 'restaurant', 'kitchen']

        # 입력된 편의시설이 허용 목록에 있는지 확인
        if value:
            for amenity in value:
                if amenity not in allowed_amenities:
                    raise serializers.ValidationError(
                        f"'{amenity}'는 허용되지 않는 편의시설입니다. "
                        f"허용 목록: {allowed_amenities}"
                    )

        # 유효한 데이터면 그대로 반환
        return value

    # 가격 데이터 유효성 검사
    def validate_price(self, value):
        """
        가격 필드의 유효성을 검사하는 메서드
        value: 클라이언트에서 입력한 가격
        """
        # 가격이 0보다 큰지 확인
        if value <= 0:
            raise serializers.ValidationError("가격은 0보다 큰 값이어야 합니다.")

        # 가격이 너무 높지 않은지 확인 (1천만원 이하)
        if value > 10000000:
            raise serializers.ValidationError("가격이 너무 높습니다. (최대 10,000,000원)")

        # 유효한 가격이면 그대로 반환
        return value


# 숙소 업데이트 시 사용하는 Serializer
class AccommodationUpdateSerializer(serializers.ModelSerializer):
    """
    기존 숙소 정보를 수정할 때 사용하는 클래스
    관리자가 숙소 정보를 수정할 때 사용
    """

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = Accommodation

        # 수정 가능한 필드들 지정
        fields = [
            'name', 'location', 'price', 'description',
            'check_in', 'check_out', 'amenities'
        ]

    # 부분 업데이트 허용 (일부 필드만 수정 가능)
    def update(self, instance, validated_data):
        """
        숙소 정보를 업데이트하는 메서드
        instance: 수정할 Accommodation 인스턴스
        validated_data: 유효성 검사를 통과한 새로운 데이터
        """
        # 각 필드별로 새로운 값이 있으면 업데이트, 없으면 기존 값 유지
        instance.name = validated_data.get('name', instance.name)
        instance.location = validated_data.get('location', instance.location)
        instance.price = validated_data.get('price', instance.price)
        instance.description = validated_data.get('description', instance.description)
        instance.check_in = validated_data.get('check_in', instance.check_in)
        instance.check_out = validated_data.get('check_out', instance.check_out)
        instance.amenities = validated_data.get('amenities', instance.amenities)

        # 변경사항을 데이터베이스에 저장
        instance.save()

        # 업데이트된 인스턴스 반환
        return instance


# 이미지 업로드 전용 Serializer
class AccommodationImageUploadSerializer(serializers.ModelSerializer):
    """
    숙소 이미지 업로드 시 사용하는 클래스
    관리자가 이미지를 업로드할 때 사용
    """

    # Serializer 설정을 위한 메타 클래스
    class Meta:
        # 연결할 모델 지정
        model = AccommodationImage

        # 업로드 시 필요한 필드들 지정
        fields = ['accommodation', 'image', 'alt_text', 'order']

    # 이미지 파일 유효성 검사
    def validate_image(self, value):
        """
        이미지 파일의 유효성을 검사하는 메서드
        value: 업로드된 이미지 파일
        """
        # 파일 크기 제한 (5MB)
        max_size = 5 * 1024 * 1024  # 5MB in bytes
        if value.size > max_size:
            raise serializers.ValidationError("이미지 파일은 5MB 이하여야 합니다.")

        # 파일 확장자 확인
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        file_extension = value.name.lower().split('.')[-1]
        if f'.{file_extension}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"지원되지 않는 파일 형식입니다. 허용 형식: {allowed_extensions}"
            )

        # 유효한 이미지면 그대로 반환
        return value