from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedUUIDModel

class Customer(TimeStampedUUIDModel):
    class ClientType(models.TextChoices):
        INDIVIDUAL = 'INDIVIDUAL', 'Individual / Residential'
        CORPORATE = 'CORPORATE', 'Corporate / Commercial'
        GOVERNMENT = 'GOVERNMENT', 'Government / Public'
        DEVELOPER = 'DEVELOPER', 'Real Estate Developer'

    class Status(models.TextChoices):
        LEAD = 'LEAD', 'Lead / Prospect'
        ACTIVE = 'ACTIVE', 'Active Client'
        INACTIVE = 'INACTIVE', 'Inactive'
        ARCHIVED = 'ARCHIVED', 'Archived'

    client_code = models.CharField(max_length=30, unique=True, db_index=True)
    full_name = models.CharField(max_length=150)
    company_name = models.CharField(max_length=150, blank=True, default='')
    client_type = models.CharField(max_length=30, choices=ClientType.choices, default=ClientType.INDIVIDUAL)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30)
    secondary_phone = models.CharField(max_length=30, blank=True, default='')
    billing_address = models.TextField(blank=True, default='')
    avatar = models.ImageField(upload_to='customers/avatars/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        company_str = f" ({self.company_name})" if self.company_name else ""
        return f"{self.client_code} - {self.full_name}{company_str}"


class CommunicationLog(TimeStampedUUIDModel):
    class CommunicationType(models.TextChoices):
        CALL = 'CALL', 'Phone Call'
        MEETING = 'MEETING', 'Studio Meeting'
        SITE_VISIT = 'SITE_VISIT', 'Site Visit'
        EMAIL = 'EMAIL', 'Email'
        WHATSAPP = 'WHATSAPP', 'WhatsApp Message'

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='communication_logs')
    logged_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='logged_communications')
    comm_type = models.CharField(max_length=20, choices=CommunicationType.choices, default=CommunicationType.CALL)
    subject = models.CharField(max_length=200)
    summary = models.TextField()
    follow_up_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.comm_type} with {self.customer.full_name} on {self.created_at.strftime('%Y-%m-%d')}"


class CustomerReview(TimeStampedUUIDModel):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='reviews')
    project_name = models.CharField(max_length=200, blank=True, default='')
    rating = models.PositiveSmallIntegerField(default=5)  # 1 to 5
    title = models.CharField(max_length=200)
    comment = models.TextField()
    is_featured = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.rating}★ by {self.customer.full_name} - {self.title}"

