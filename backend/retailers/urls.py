from django.urls import path
from .views import RetailerProfileView

urlpatterns = [
    path('profile/', RetailerProfileView.as_view(), name='retailer_profile'),
]
