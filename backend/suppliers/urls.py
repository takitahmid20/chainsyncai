from django.urls import path
from .views import SupplierProfileView

urlpatterns = [
    path('profile/', SupplierProfileView.as_view(), name='supplier_profile'),
]
