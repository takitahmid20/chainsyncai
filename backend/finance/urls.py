from django.urls import path
from .views import LoanSuggestionView, LoanHistoryView

urlpatterns = [
    path('loan/suggestion/', LoanSuggestionView.as_view(), name='loan_suggestion'),
    path('loan/history/', LoanHistoryView.as_view(), name='loan_history'),
]
