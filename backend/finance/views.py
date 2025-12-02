from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .loan_service import LoanSuggestionService
from .models import LoanInquiry
from .serializers import LoanSuggestionSerializer


class LoanSuggestionView(APIView):
    """
    Get personalized loan suggestions based on sales history
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get loan suggestion for authenticated retailer"""
        
        if request.user.user_type != 'retailer':
            return Response({
                'error': 'Only retailers can access loan suggestions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Generate loan suggestion
            service = LoanSuggestionService(request.user)
            result = service.generate_suggestion()
            
            # Track inquiry
            if result.get('eligible'):
                LoanInquiry.objects.create(retailer=request.user)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate loan suggestion: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoanHistoryView(APIView):
    """
    View loan suggestion history
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get loan inquiry history for retailer"""
        
        if request.user.user_type != 'retailer':
            return Response({
                'error': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        inquiries = LoanInquiry.objects.filter(
            retailer=request.user
        ).select_related('suggestion')[:10]
        
        history = []
        for inquiry in inquiries:
            if inquiry.suggestion:
                history.append({
                    'viewed_at': inquiry.viewed_at,
                    'suggested_amount': float(inquiry.suggestion.suggested_amount),
                    'credit_score': inquiry.suggestion.credit_score,
                    'risk_level': inquiry.suggestion.risk_level,
                })
        
        return Response({
            'total_inquiries': inquiries.count(),
            'history': history
        }, status=status.HTTP_200_OK)
