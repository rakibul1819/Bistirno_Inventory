from rest_framework import serializers
from .models import Customer, CommunicationLog, CustomerReview

class CommunicationLogSerializer(serializers.ModelSerializer):
    logged_by_name = serializers.CharField(source='logged_by.get_full_name', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)

    class Meta:
        model = CommunicationLog
        fields = [
            'id', 'customer', 'customer_name', 'logged_by', 'logged_by_name',
            'comm_type', 'subject', 'summary', 'follow_up_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CustomerReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    company_name = serializers.CharField(source='customer.company_name', read_only=True)

    class Meta:
        model = CustomerReview
        fields = [
            'id', 'customer', 'customer_name', 'company_name', 'project_name',
            'rating', 'title', 'comment', 'is_featured', 'is_verified', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CustomerSerializer(serializers.ModelSerializer):
    recent_communications = serializers.SerializerMethodField()
    reviews_count = serializers.IntegerField(source='reviews.count', read_only=True)
    projects_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'client_code', 'full_name', 'company_name', 'client_type',
            'email', 'phone', 'secondary_phone', 'billing_address', 'avatar',
            'status', 'notes', 'reviews_count', 'projects_count',
            'recent_communications', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_recent_communications(self, obj):
        recent = obj.communication_logs.order_by('-created_at')[:3]
        return CommunicationLogSerializer(recent, many=True).data

    def get_projects_count(self, obj):
        # Connected to projects app via customer relation if available
        if hasattr(obj, 'projects'):
            return obj.projects.count()
        return 0

