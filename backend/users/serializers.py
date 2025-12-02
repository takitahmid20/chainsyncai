from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
import re

User = get_user_model()

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[
            RegexValidator(
                regex=r'^\d{6}$',
                message='Password must be exactly 6 digits',
            )
        ]
    )
    user_type = serializers.ChoiceField(choices=['retailer', 'supplier'])

    class Meta:
        model = User
        fields = ['email', 'password', 'user_type']

    def validate_email(self, value):
        """Validate email format"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists')
        
        # Basic email validation
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, value):
            raise serializers.ValidationError('Invalid email format')
        
        return value.lower()

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            user_type=validated_data['user_type']
        )
        # Generate verification token
        user.generate_verification_token()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'user_type', 'is_verified', 'created_at']
        read_only_fields = ['id', 'is_verified', 'created_at']


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
