from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .serializers import SignupSerializer, UserSerializer, LoginSerializer
from .utils import send_verification_email

User = get_user_model()


class SignupView(generics.CreateAPIView):
    """
    User signup endpoint
    
    Required fields:
    - email: Valid email address
    - password: Exactly 6 digits
    - user_type: Either 'retailer' or 'supplier'
    """
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Send verification email
            email_sent = send_verification_email(user, user.verification_token)
            
            if email_sent:
                return Response({
                    'message': 'Signup successful! Please check your email to verify your account.',
                    'email': user.email,
                    'user_type': user.user_type
                }, status=status.HTTP_201_CREATED)
            else:
                # User created but email failed
                return Response({
                    'message': 'Account created but verification email failed to send. Please contact support.',
                    'email': user.email,
                    'user_type': user.user_type
                }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    """
    Email verification endpoint
    
    Query parameter (GET):
    - token: Verification token from email
    
    Body parameter (POST):
    - token: Verification token
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        return self._verify_email(request)
    
    def post(self, request):
        return self._verify_email(request)
    
    def _verify_email(self, request):
        # Support both GET and POST
        token = request.query_params.get('token') or request.data.get('token')
        
        if not token:
            return Response({
                'error': 'Verification token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(verification_token=token)
            
            if user.is_verified:
                return Response({
                    'message': 'Email already verified. You can now login.'
                }, status=status.HTTP_200_OK)
            
            # Verify the user
            user.is_verified = True
            user.verification_token = None  # Clear token after verification
            user.save()
            
            return Response({
                'message': 'Email verified successfully! You can now login.',
                'email': user.email
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid or expired verification token'
            }, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationView(APIView):
    """
    Resend verification email
    
    Required field:
    - email: User's email address
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email.lower())
            
            if user.is_verified:
                return Response({
                    'message': 'Email already verified'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate new token and send email
            user.generate_verification_token()
            email_sent = send_verification_email(user, user.verification_token)
            
            if email_sent:
                return Response({
                    'message': 'Verification email sent successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to send verification email'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                user = User.objects.get(email=email.lower())
            except User.DoesNotExist:
                return Response({
                    'error': 'Invalid email or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if user is verified
            if not user.is_verified:
                return Response({
                    'error': 'Please verify your email before logging in',
                    'email': user.email
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check password
            if not user.check_password(password):
                return Response({
                    'error': 'Invalid email or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Check profile completion status
            profile_complete = False
            if user.user_type == 'retailer':
                profile_complete = hasattr(user, 'retailer_profile') and user.retailer_profile.is_profile_complete
            elif user.user_type == 'supplier':
                profile_complete = hasattr(user, 'supplier_profile') and user.supplier_profile.is_profile_complete
            
            return Response({
                'message': 'Login successful',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'email': user.email,
                    'user_type': user.user_type,
                    'is_profile_complete': profile_complete
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileStatusView(APIView):
    """Get current user's profile completion status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        profile_complete = False
        profile_data = None
        
        if user.user_type == 'retailer':
            if hasattr(user, 'retailer_profile'):
                profile = user.retailer_profile
                profile_complete = profile.is_profile_complete
                profile_data = {
                    'shop_name': profile.shop_name,
                    'owner_name': profile.owner_name,
                    'shop_address': profile.shop_address,
                    'business_category': profile.business_category,
                }
        elif user.user_type == 'supplier':
            if hasattr(user, 'supplier_profile'):
                profile = user.supplier_profile
                profile_complete = profile.is_profile_complete
                profile_data = {
                    'business_name': profile.business_name,
                    'supplier_type': profile.supplier_type,
                    'business_address': profile.business_address,
                    'main_product_category': profile.main_product_category,
                }
        
        return Response({
            'user_type': user.user_type,
            'is_profile_complete': profile_complete,
            'profile': profile_data
        }, status=status.HTTP_200_OK)
