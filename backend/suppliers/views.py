from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import SupplierProfile
from .serializers import SupplierProfileSerializer


class SupplierProfileView(APIView):
    """Create or update supplier profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current supplier profile"""
        if request.user.user_type != 'supplier':
            return Response({
                'error': 'Only suppliers can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.supplier_profile
            serializer = SupplierProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except SupplierProfile.DoesNotExist:
            return Response({
                'message': 'Profile not created yet'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        """Create supplier profile"""
        if request.user.user_type != 'supplier':
            return Response({
                'error': 'Only suppliers can create supplier profile'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if profile already exists
        if hasattr(request.user, 'supplier_profile'):
            return Response({
                'error': 'Profile already exists. Use PUT to update.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = SupplierProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({
                'message': 'Profile created successfully',
                'profile': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        """Update supplier profile"""
        if request.user.user_type != 'supplier':
            return Response({
                'error': 'Only suppliers can update supplier profile'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.supplier_profile
        except SupplierProfile.DoesNotExist:
            return Response({
                'error': 'Profile not found. Use POST to create.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SupplierProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
