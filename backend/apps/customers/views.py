from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Customer, CommunicationLog, CustomerReview
from .serializers import CustomerSerializer, CommunicationLogSerializer, CustomerReviewSerializer
from apps.common.permissions import IsAdminOrManager

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.prefetch_related('communication_logs', 'reviews').all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ['client_type', 'status']
    search_fields = ['full_name', 'company_name', 'client_code', 'email', 'phone']

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        customer = self.get_object()
        logs = customer.communication_logs.select_related('logged_by').order_by('-created_at')
        page = self.paginate_queryset(logs)
        if page is not None:
            serializer = CommunicationLogSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = CommunicationLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        customer = self.get_object()
        reviews = customer.reviews.all().order_by('-created_at')
        serializer = CustomerReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class CommunicationLogViewSet(viewsets.ModelViewSet):
    queryset = CommunicationLog.objects.select_related('customer', 'logged_by').all()
    serializer_class = CommunicationLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['customer', 'comm_type']
    search_fields = ['subject', 'summary']

    def perform_create(self, serializer):
        serializer.save(logged_by=self.request.user)


class CustomerReviewViewSet(viewsets.ModelViewSet):
    queryset = CustomerReview.objects.select_related('customer').all()
    serializer_class = CustomerReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['rating', 'is_featured', 'is_verified', 'customer']
    search_fields = ['title', 'comment', 'project_name']

