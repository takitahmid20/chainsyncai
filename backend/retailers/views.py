from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import RetailerProfile
from .serializers import RetailerProfileSerializer


class RetailerProfileView(APIView):
    """Create or update retailer profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current retailer profile"""
        if request.user.user_type != 'retailer':
            return Response({
                'error': 'Only retailers can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.retailer_profile
            serializer = RetailerProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except RetailerProfile.DoesNotExist:
            return Response({
                'message': 'Profile not created yet'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        """Create retailer profile"""
        if request.user.user_type != 'retailer':
            return Response({
                'error': 'Only retailers can create retailer profile'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if profile already exists
        if hasattr(request.user, 'retailer_profile'):
            return Response({
                'error': 'Profile already exists. Use PUT to update.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RetailerProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({
                'message': 'Profile created successfully',
                'profile': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        """Update retailer profile"""
        if request.user.user_type != 'retailer':
            return Response({
                'error': 'Only retailers can update retailer profile'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.retailer_profile
        except RetailerProfile.DoesNotExist:
            return Response({
                'error': 'Profile not found. Use POST to create.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = RetailerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
