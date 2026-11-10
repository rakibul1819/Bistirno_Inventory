from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, CommunicationLogViewSet, CustomerReviewViewSet

app_name = 'customers'

router = DefaultRouter()
router.register(r'clients', CustomerViewSet, basename='customer')
router.register(r'communications', CommunicationLogViewSet, basename='communication')
router.register(r'reviews', CustomerReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]

